from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.accounts.permissions import IsAdminOrManager

from .models import Incident
from .serializers import IncidentResolveSerializer, IncidentSerializer


@extend_schema(tags=['incidents'])
@extend_schema_view(
    list=extend_schema(summary='List all incidents (Manager only)'),
    create=extend_schema(summary='Report an incident (Manager only)'),
    retrieve=extend_schema(summary='Retrieve an incident (Manager only)'),
    update=extend_schema(summary='Update an incident (Manager only)'),
    partial_update=extend_schema(summary='Partial update an incident (Manager only)'),
    destroy=extend_schema(summary='Delete an incident (Manager only)'),
)
class IncidentViewSet(ModelViewSet):
    queryset = Incident.objects.select_related('trip__schedule__line').all().order_by('-reported_at')
    serializer_class = IncidentSerializer
    permission_classes = [IsAdminOrManager]

    def perform_create(self, serializer):
        incident = serializer.save()
        # Notify students affected by the incident's trip
        trip = incident.trip
        affected_students = trip.seat_assignments.select_related('student').values_list('student', flat=True)
        from apps.accounts.models import Student
        from apps.notifications.models import Notification
        for student in Student.objects.filter(pk__in=affected_students):
            Notification.objects.create(
                student=student,
                notification_type='incident',
                message=f'Incident reported on your trip ({trip.schedule.line.name}): {incident.name}',
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
