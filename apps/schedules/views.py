from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.accounts.permissions import IsAdminOrManager

from .models import Schedule
from .serializers import ScheduleSerializer


@extend_schema(tags=['schedules'])
@extend_schema_view(
    list=extend_schema(summary='List all schedules'),
    create=extend_schema(summary='Create a schedule (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a schedule'),
    update=extend_schema(summary='Update a schedule (Manager only)'),
    partial_update=extend_schema(summary='Partial update a schedule (Manager only)'),
    destroy=extend_schema(summary='Delete a schedule (Manager only)'),
)
class ScheduleViewSet(ModelViewSet):
    queryset = Schedule.objects.select_related('line').all().order_by('day_of_week', 'departure_time')
    serializer_class = ScheduleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]
