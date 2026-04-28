from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import ExtractHour, TruncMonth
from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Student
from apps.accounts.permissions import IsAdminOrManager
from apps.buses.models import Bus, BusAssignment
from apps.incidents.models import Incident
from apps.lines.models import Line
from apps.subscriptions.models import Subscription, SubscriptionHistory
from apps.trips.models import SeatAssignment, Trip

from apps.notifications.models import Notification

from .models import StudentReport
from .serializers import StudentReportCreateSerializer, StudentReportSerializer


@extend_schema(tags=['reports'])
class ReportsView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(
        summary='Generate system reports — capacity per line, seat occupancy, bus usage (Manager only)',
        responses={200: None},
    )
    def get(self, request):
        # Students per line
        lines = Line.objects.annotate(
            active_subscriptions=Count(
                'subscriptions', filter=Q(subscriptions__is_active=True)
            )
        ).values('line_id', 'name', 'active_subscriptions')

        # Bus capacity vs subscriptions per line
        capacity_report = []
        for line in Line.objects.all():
            active_subs = Subscription.objects.filter(line=line, is_active=True).count()
            active_assignment = BusAssignment.objects.filter(
                line=line,
            ).select_related('bus').order_by('-start_date').first()
            bus_capacity = active_assignment.bus.capacity if active_assignment else 0
            occupancy_pct = round((active_subs / bus_capacity * 100), 1) if bus_capacity > 0 else None
            capacity_report.append({
                'line_id': line.line_id,
                'line_name': line.name,
                'active_subscriptions': active_subs,
                'bus_capacity': bus_capacity,
                'occupancy_percent': occupancy_pct,
                'status': (
                    'exceeded' if occupancy_pct and occupancy_pct > 100
                    else 'near_full' if occupancy_pct and occupancy_pct >= 90
                    else 'normal'
                ),
            })

        # Bus usage report
        bus_usage = []
        for bus in Bus.objects.all():
            total_trips = bus.trips.count()
            completed_trips = bus.trips.filter(status=Trip.Status.COMPLETED).count()
            active_assignment = bus.assignments.filter(end_date__isnull=True).select_related('line').first()
            bus_usage.append({
                'bus_id': bus.bus_id,
                'registration_number': bus.registration_number,
                'model': bus.model,
                'capacity': bus.capacity,
                'status': bus.status,
                'total_trips': total_trips,
                'completed_trips': completed_trips,
                'assigned_line': active_assignment.line.name if active_assignment else None,
            })

        # Seat occupancy per trip
        trip_occupancy = []
        for trip in Trip.objects.filter(status__in=[Trip.Status.IN_PROGRESS, Trip.Status.SCHEDULED]).select_related('schedule__line', 'bus'):
            assigned_seats = SeatAssignment.objects.filter(trip=trip).count()
            bus_capacity = trip.bus.capacity
            trip_occupancy.append({
                'trip_id': trip.trip_id,
                'line': trip.schedule.line.name,
                'status': trip.status,
                'assigned_seats': assigned_seats,
                'bus_capacity': bus_capacity,
                'occupancy_percent': round(assigned_seats / bus_capacity * 100, 1) if bus_capacity > 0 else None,
            })

        # Incident summary
        incident_summary = {
            'total': Incident.objects.count(),
            'open': Incident.objects.filter(resolved=False).count(),
            'resolved': Incident.objects.filter(resolved=True).count(),
            'by_type': list(
                Incident.objects.values('incident_type').annotate(count=Count('incident_id'))
            ),
        }

        # ── Subscription trend — new subscriptions per month (last 6 months) ──
        six_months_ago = timezone.now().date() - timedelta(days=182)
        sub_trend_qs = (
            Subscription.objects
            .filter(start_date__gte=six_months_ago)
            .annotate(month=TruncMonth('start_date'))
            .values('month')
            .annotate(count=Count('subscription_id'))
            .order_by('month')
        )
        subscription_trend = [
            {
                'month': entry['month'].strftime('%b %Y'),
                'subscriptions': entry['count'],
            }
            for entry in sub_trend_qs
        ]

        # ── Line-change funnel — SubscriptionHistory by month (last 6 months) ──
        # Three logical stages derived from the single SubscriptionHistory table:
        # submitted = all change records; reviewed = ~80 % proxy; completed = all
        # (No pending/rejected states in model, so we show actual counts per month.)
        change_trend_qs = (
            SubscriptionHistory.objects
            .filter(change_date__gte=timezone.now() - timedelta(days=182))
            .annotate(month=TruncMonth('change_date'))
            .values('month')
            .annotate(count=Count('subscription_history_id'))
            .order_by('month')
        )
        total_changes = SubscriptionHistory.objects.count()
        line_change_funnel = [
            {'stage': 'Submitted',  'value': total_changes},
            {'stage': 'Processed',  'value': total_changes},
            {'stage': 'Completed',  'value': total_changes},
        ]
        line_change_by_month = [
            {'month': entry['month'].strftime('%b %Y'), 'changes': entry['count']}
            for entry in change_trend_qs
        ]

        # ── Station density — active subscriptions per station ──
        from apps.lines.models import LineStation, Station
        station_density = []
        for station in Station.objects.all():
            line_ids = LineStation.objects.filter(station=station).values_list('line_id', flat=True)
            count = Subscription.objects.filter(line_id__in=line_ids, is_active=True).count()
            station_density.append({
                'station': station.name,
                'station_id': station.station_id,
                'active_subscriptions': count,
                # bubble size driven by subscription count
                'bubble_size': max(count * 10, 5),
            })
        station_density.sort(key=lambda x: x['active_subscriptions'], reverse=True)

        # ── Peak boarding hours — SeatAssignment.assigned_at grouped by hour ──
        peak_hours_qs = (
            SeatAssignment.objects
            .annotate(hour=ExtractHour('assigned_at'))
            .values('hour')
            .annotate(count=Count('seat_assignment_id'))
            .order_by('hour')
        )
        # Build all 24 hours (zero-fill gaps)
        hour_map = {entry['hour']: entry['count'] for entry in peak_hours_qs}
        peak_boarding_hours = [
            {'hour': f'{h:02d}:00', 'boardings': hour_map.get(h, 0)}
            for h in range(6, 22)   # show 06:00 – 21:00 (typical operational window)
        ]

        return Response({
            'capacity_per_line': capacity_report,
            'bus_usage': bus_usage,
            'trip_occupancy': trip_occupancy,
            'incident_summary': incident_summary,
            'totals': {
                'total_students': Student.objects.count(),
                'total_lines': Line.objects.count(),
                'total_buses': Bus.objects.count(),
                'active_subscriptions': Subscription.objects.filter(is_active=True).count(),
            },
            # ── Statistics additions ──
            'subscription_trend': subscription_trend,
            'line_change_funnel': line_change_funnel,
            'line_change_by_month': line_change_by_month,
            'station_density': station_density,
            'peak_boarding_hours': peak_boarding_hours,
        })


@extend_schema(tags=['reports'])
class StudentReportCreateView(APIView):
    """Students submit a new report (delay, incident, inquiry, other)."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Submit a student report',
        request=StudentReportCreateSerializer,
        responses={
            201: StudentReportSerializer,
            403: OpenApiResponse(description='No student profile linked to account'),
        },
    )
    def post(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({'detail': 'No student profile found.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(student=student)
        who = f'{student.first_name} {student.last_name}'.strip()
        Notification.objects.create(
            student=student,
            notification_type=Notification.NotificationType.STUDENT_REPORT_SUBMITTED,
            message=(
                f'From: {who} ({student.email}) — New student report [{report.get_report_type_display()}]: '
                f'"{report.title}". Review in Pending Alerts.'
            ),
        )
        return Response(StudentReportSerializer(report).data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['reports'])
class StudentMyReportsView(generics.ListAPIView):
    """Returns the logged-in student's own reports."""
    serializer_class = StudentReportSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List the student's own submitted reports")
    def get_queryset(self):
        try:
            student = self.request.user.student_profile
            return StudentReport.objects.filter(student=student).order_by('-submitted_at')
        except Exception:
            return StudentReport.objects.none()


@extend_schema(tags=['reports'])
@extend_schema_view(
    get=extend_schema(summary='List all student reports (Manager only)'),
)
class ManagerStudentReportsView(generics.ListAPIView):
    """Manager sees all student-submitted reports."""
    serializer_class = StudentReportSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        qs = StudentReport.objects.select_related('student').order_by('-submitted_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


@extend_schema(tags=['reports'])
class ManagerResolveStudentReportView(APIView):
    """Manager marks a student report as resolved."""
    permission_classes = [IsAdminOrManager]

    @extend_schema(
        summary='Resolve a student report (Manager only)',
        responses={200: StudentReportSerializer, 404: OpenApiResponse(description='Not found')},
    )
    def patch(self, request, report_id):
        try:
            report = StudentReport.objects.select_related('student').get(pk=report_id)
        except StudentReport.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        report.status = StudentReport.Status.RESOLVED
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'resolved_at'])
        Notification.objects.create(
            student=report.student,
            notification_type=Notification.NotificationType.REPORT_RESOLVED,
            message=(
                f'Your request or issue regarding report "{report.title}" has been resolved.'
            ),
        )
        return Response(StudentReportSerializer(report).data)
