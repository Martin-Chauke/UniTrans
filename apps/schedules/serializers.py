from rest_framework import serializers

from apps.lines.serializers import LineSerializer

from .models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    line_name = serializers.CharField(source='line.name', read_only=True)
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Schedule
        fields = [
            'schedule_id', 'line', 'line_name', 'day_of_week',
            'day_of_week_display', 'departure_time', 'arrival_time', 'direction',
        ]
        read_only_fields = ['schedule_id']
