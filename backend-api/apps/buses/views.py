from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.accounts.permissions import IsAdminOrManager

from .models import Bus, BusAssignment
from .serializers import BusAssignmentSerializer, BusSerializer


@extend_schema(tags=['buses'])
@extend_schema_view(
    list=extend_schema(summary='List all buses'),
    create=extend_schema(summary='Create a bus (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a bus'),
    update=extend_schema(summary='Update a bus (Manager only)'),
    partial_update=extend_schema(summary='Partial update a bus (Manager only)'),
    destroy=extend_schema(summary='Delete a bus (Manager only)'),
)
class BusViewSet(ModelViewSet):
    queryset = Bus.objects.select_related('driver').prefetch_related(
        'assignments__line',
    ).all().order_by('registration_number')
    serializer_class = BusSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


@extend_schema(tags=['buses'])
@extend_schema_view(
    list=extend_schema(
        summary='List all bus assignments — includes capacity warnings',
    ),
    create=extend_schema(summary='Create a bus assignment (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a bus assignment'),
    update=extend_schema(summary='Update a bus assignment (Manager only)'),
    partial_update=extend_schema(summary='Partial update a bus assignment (Manager only)'),
    destroy=extend_schema(summary='Delete a bus assignment (Manager only)'),
)
class BusAssignmentViewSet(ModelViewSet):
    queryset = BusAssignment.objects.select_related('bus', 'line').all().order_by('-start_date')
    serializer_class = BusAssignmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]
