from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.accounts.permissions import IsAdminOrManager

from .models import Line, LineStation, Station
from .serializers import (
    LineSerializer,
    LineStationSerializer,
    LineWriteSerializer,
    StationSerializer,
    TimetableSerializer,
)


@extend_schema(tags=['lines'])
@extend_schema_view(
    list=extend_schema(summary='List all stations'),
    create=extend_schema(summary='Create a station (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a station'),
    update=extend_schema(summary='Update a station (Manager only)'),
    partial_update=extend_schema(summary='Partial update a station (Manager only)'),
    destroy=extend_schema(summary='Delete a station (Manager only)'),
)
class StationViewSet(ModelViewSet):
    queryset = Station.objects.all().order_by('name')
    serializer_class = StationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


@extend_schema(tags=['lines'])
@extend_schema_view(
    list=extend_schema(summary='List all lines'),
    create=extend_schema(summary='Create a line (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a line with stations'),
    update=extend_schema(summary='Update a line (Manager only)'),
    partial_update=extend_schema(summary='Partial update a line (Manager only)'),
    destroy=extend_schema(summary='Delete a line (Manager only)'),
)
class LineViewSet(ModelViewSet):
    queryset = Line.objects.prefetch_related('line_stations__station').all().order_by('name')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LineWriteSerializer
        return LineSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    @extend_schema(
        summary='View timetable for a line (schedules with trips)',
        tags=['lines'],
        responses={200: TimetableSerializer},
    )
    @action(detail=True, methods=['get'], url_path='timetable')
    def timetable(self, request, pk=None):
        line = self.get_object()
        schedules = line.schedules.all().order_by('day_of_week', 'departure_time')
        schedule_data = []
        for schedule in schedules:
            schedule_data.append({
                'schedule_id': schedule.schedule_id,
                'day_of_week': schedule.day_of_week,
                'departure_time': str(schedule.departure_time),
                'arrival_time': str(schedule.arrival_time),
                'direction': schedule.direction,
            })
        return Response({
            'line': LineSerializer(line).data,
            'schedules': schedule_data,
        })


@extend_schema(tags=['lines'])
@extend_schema_view(
    list=extend_schema(summary='List stations on a line'),
    create=extend_schema(summary='Add a station to a line (Manager only)'),
    destroy=extend_schema(summary='Remove a station from a line (Manager only)'),
)
class LineStationViewSet(ModelViewSet):
    serializer_class = LineStationSerializer
    http_method_names = ['get', 'post', 'delete', 'patch']

    def get_queryset(self):
        return LineStation.objects.filter(
            line_id=self.kwargs['line_pk']
        ).select_related('station').order_by('order_index')

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'partial_update']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(line_id=self.kwargs['line_pk'])
