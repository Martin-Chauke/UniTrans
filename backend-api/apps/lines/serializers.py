from rest_framework import serializers

from .models import Line, LineStation, Station


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['station_id', 'name', 'address', 'latitude', 'longitude']
        read_only_fields = ['station_id']


class LineStationSerializer(serializers.ModelSerializer):
    station = StationSerializer(read_only=True)
    station_id = serializers.PrimaryKeyRelatedField(
        queryset=Station.objects.all(), source='station', write_only=True
    )

    class Meta:
        model = LineStation
        fields = ['line_station_id', 'station', 'station_id', 'order_index']
        read_only_fields = ['line_station_id']


class LineSerializer(serializers.ModelSerializer):
    stations = LineStationSerializer(source='line_stations', many=True, read_only=True)

    class Meta:
        model = Line
        fields = ['line_id', 'name', 'description', 'stations']
        read_only_fields = ['line_id']


class LineWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Line
        fields = ['line_id', 'name', 'description']
        read_only_fields = ['line_id']


class DriverAssignedLineSerializer(serializers.ModelSerializer):
    """Driver portal: line with ordered stops and whether a bus–line assignment is active today."""

    stations = LineStationSerializer(source='line_stations', many=True, read_only=True)
    is_assignment_active = serializers.SerializerMethodField()

    class Meta:
        model = Line
        fields = ['line_id', 'name', 'description', 'stations', 'is_assignment_active']
        read_only_fields = ['line_id', 'name', 'description', 'stations', 'is_assignment_active']

    def get_is_assignment_active(self, obj):
        bus = self.context.get('driver_bus')
        if bus is None:
            return False
        from django.utils import timezone as dj_tz
        from django.db.models import Q as dq
        from apps.buses.models import BusAssignment

        today = dj_tz.now().date()
        return BusAssignment.objects.filter(
            bus=bus,
            line_id=obj.line_id,
            start_date__lte=today,
        ).filter(dq(end_date__isnull=True) | dq(end_date__gte=today)).exists()


class TimetableSerializer(serializers.Serializer):
    line = LineSerializer()
    schedules = serializers.ListField(child=serializers.DictField())
