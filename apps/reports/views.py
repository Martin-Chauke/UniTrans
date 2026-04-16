from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Student
from apps.accounts.permissions import IsAdminOrManager
from apps.buses.models import Bus, BusAssignment
from apps.incidents.models import Incident
from apps.lines.models import Line
from apps.subscriptions.models import Subscription
from apps.trips.models import SeatAssignment, Trip


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
        })
