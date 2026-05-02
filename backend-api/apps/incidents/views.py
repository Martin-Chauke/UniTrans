from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.accounts.models import Student
from apps.accounts.permissions import IsAdminOrManager, IsDriver
from apps.notifications.models import Notification
from apps.trips.models import Trip

from .models import Incident
from .serializers import (
    DriverIncidentCreateSerializer,
    IncidentManagerRespondSerializer,
    IncidentResolveSerializer,
    IncidentSerializer,
)


@extend_schema(tags=['incidents'])
@extend_schema_view(
    list=extend_schema(summary='List all incidents (Manager only)'),
    create=extend_schema(summary='Report an incident (Manager only)'),
    retrieve=extend_schema(summary='Retrieve an incident (Manager only)'),
    update=extend_schema(summary='Update an incident (Manager only)'),
    partial_update=extend_schema(summary='Partial update an incident (Manager only)'),
    destroy=extend_schema(summary='Delete an incident (Manager only)'),
)
class ManagerIncidentViewSet(ModelViewSet):
    queryset = Incident.objects.select_related(
        'trip__schedule__line', 'reported_by_driver', 'manager_response_by',
    ).all().order_by('-reported_at')
    serializer_class = IncidentSerializer
    permission_classes = [IsAdminOrManager]

    def perform_create(self, serializer):
        incident = serializer.save()
        if incident.reported_by_driver_id is not None:
            return
        trip = Trip.objects.select_related('schedule__line').get(pk=incident.trip_id)
        line = trip.schedule.line
        trip_ref = f'TRP{trip.trip_id:03d}'
        line_name = line.name

        students_on_line = Student.objects.filter(
            subscriptions__line=line,
            subscriptions__is_active=True,
        ).distinct()

        message = (
            f'Incident reported on line "{line_name}" for trip {trip_ref}: {incident.name}.'
        )
        for student in students_on_line:
            Notification.objects.create(
                student=student,
                notification_type='incident',
                message=message,
            )

    @extend_schema(
        summary='Resolve an incident',
        tags=['incidents'],
        request=IncidentResolveSerializer,
        responses={
            200: IncidentSerializer,
            404: OpenApiResponse(description='Incident not found'),
        },
    )
    @action(detail=True, methods=['patch'], url_path='resolve')
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.resolve()
        return Response(IncidentSerializer(incident).data)

    @extend_schema(
        summary='Respond to driver-reported incident',
        tags=['incidents'],
        request=IncidentManagerRespondSerializer,
        responses={
            200: IncidentSerializer,
            404: OpenApiResponse(description='Incident not found'),
        },
    )
    @action(detail=True, methods=['patch'], url_path='respond')
    def respond(self, request, pk=None):
        ser = IncidentManagerRespondSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        incident = self.get_object()
        incident.manager_response = ser.validated_data['message']
        incident.manager_responded_at = timezone.now()
        incident.manager_response_by = request.user
        incident.save(
            update_fields=['manager_response', 'manager_responded_at', 'manager_response_by'],
        )
        return Response(IncidentSerializer(incident).data)


@extend_schema(tags=['incidents'])
@extend_schema_view(
    get=extend_schema(summary='List incidents I reported'),
    post=extend_schema(summary='Report an incident on my assigned bus'),
)
class DriverIncidentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsDriver]

    def get_queryset(self):
        return Incident.objects.filter(
            reported_by_driver=self.request.user.driver_profile,
        ).select_related(
            'trip__schedule__line', 'reported_by_driver', 'manager_response_by',
        ).order_by('-reported_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DriverIncidentCreateSerializer
        return IncidentSerializer
