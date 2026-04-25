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


class TimetableSerializer(serializers.Serializer):
    line = LineSerializer()
    schedules = serializers.ListField(child=serializers.DictField())
