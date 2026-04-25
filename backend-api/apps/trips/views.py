from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.accounts.permissions import IsAdminOrManager

from .models import Row, SeatAssignment, Trip
from .serializers import (
    RowSerializer,
    SeatAssignmentSerializer,
    StudentSeatView,
    TripSerializer,
    TripWriteSerializer,
)


@extend_schema(tags=['trips'])
@extend_schema_view(
    list=extend_schema(summary='List all trips'),
    create=extend_schema(summary='Create a trip (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a trip'),
    update=extend_schema(summary='Update a trip (Manager only)'),
    partial_update=extend_schema(summary='Partial update a trip (Manager only)'),
    destroy=extend_schema(summary='Delete a trip (Manager only)'),
)
class TripViewSet(ModelViewSet):
    queryset = Trip.objects.select_related('schedule__line', 'bus').all().order_by('-trip_id')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TripWriteSerializer
        return TripSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'start', 'end']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    @extend_schema(
        summary='Start a trip',
        tags=['trips'],
        responses={200: TripSerializer, 400: OpenApiResponse(description='Trip already started')},
    )
    @action(detail=True, methods=['post'], url_path='start')
    def start(self, request, pk=None):
        trip = self.get_object()
        if trip.status != Trip.Status.SCHEDULED:
            return Response(
                {'detail': f'Cannot start a trip with status "{trip.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        trip.start_trip()

        from apps.notifications.models import Notification
        seat_assignments = trip.seat_assignments.select_related('student')
        for sa in seat_assignments:
            Notification.objects.create(
                student=sa.student,
                notification_type='trip_started',
                message=f'Your trip on {trip.schedule.line.name} has started.',
            )

        return Response(TripSerializer(trip).data)

    @extend_schema(
        summary='End/complete a trip',
        tags=['trips'],
        responses={200: TripSerializer, 400: OpenApiResponse(description='Trip not in progress')},
    )
    @action(detail=True, methods=['post'], url_path='end')
    def end(self, request, pk=None):
        trip = self.get_object()
        if trip.status != Trip.Status.IN_PROGRESS:
            return Response(
                {'detail': f'Cannot end a trip with status "{trip.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        trip.end_trip()
        return Response(TripSerializer(trip).data)


@extend_schema(tags=['trips'])
@extend_schema_view(
    list=extend_schema(summary='List all rows'),
    create=extend_schema(summary='Create a row for a bus (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a row'),
    update=extend_schema(summary='Update a row (Manager only)'),
    partial_update=extend_schema(summary='Partial update a row (Manager only)'),
    destroy=extend_schema(summary='Delete a row (Manager only)'),
)
class RowViewSet(ModelViewSet):
    queryset = Row.objects.select_related('bus').all().order_by('bus', 'row_number')
    serializer_class = RowSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


@extend_schema(tags=['trips'])
@extend_schema_view(
    list=extend_schema(summary='List all seat assignments — includes conflict checking on create'),
    create=extend_schema(summary='Assign a student to a seat (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a seat assignment'),
    destroy=extend_schema(summary='Cancel a seat assignment (Manager only)'),
)
class SeatAssignmentViewSet(ModelViewSet):
    queryset = SeatAssignment.objects.select_related('student', 'trip__schedule__line', 'row__bus').all()
    serializer_class = SeatAssignmentSerializer
    http_method_names = ['get', 'post', 'delete']

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


@extend_schema(tags=['trips'])
class StudentSeatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Get the logged-in student\'s current seat assignment',
        responses={200: StudentSeatView},
    )
    def get(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({'detail': 'No student profile.'}, status=status.HTTP_403_FORBIDDEN)

        seat = SeatAssignment.objects.filter(
            student=student,
            trip__status=Trip.Status.IN_PROGRESS,
        ).select_related('trip__schedule__line', 'row').first()

        if not seat:
            seat = SeatAssignment.objects.filter(
                student=student,
                trip__status=Trip.Status.SCHEDULED,
            ).select_related('trip__schedule__line', 'row').order_by('-assigned_at').first()

        if not seat:
            return Response({'detail': 'No seat assignment found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(StudentSeatView(seat).data)
