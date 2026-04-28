from rest_framework import serializers

from apps.lines.serializers import LineSerializer

from .models import Bus, BusAssignment


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ['bus_id', 'registration_number', 'model', 'capacity', 'status']
        read_only_fields = ['bus_id']


class BusAssignmentSerializer(serializers.ModelSerializer):
    bus_detail = BusSerializer(source='bus', read_only=True)
    line_detail = LineSerializer(source='line', read_only=True)
    is_active = serializers.SerializerMethodField()
    capacity_warning = serializers.SerializerMethodField()

    class Meta:
        model = BusAssignment
        fields = [
            'bus_assignment_id', 'bus', 'bus_detail', 'line', 'line_detail',
            'start_date', 'end_date', 'notes', 'is_active', 'capacity_warning',
        ]
        read_only_fields = ['bus_assignment_id']

    def get_is_active(self, obj):
        return obj.is_active()

    def get_capacity_warning(self, obj):
        """Line load vs bus capacity; always returns counts for UI. warning=True if over or near (90%+)."""
        student_count = obj.line.subscriptions.filter(is_active=True).count()
        bus_capacity = obj.bus.capacity
        base = {
            'student_count': student_count,
            'bus_capacity': bus_capacity,
            'warning': False,
            'message': None,
        }
        if student_count > bus_capacity:
            return {
                **base,
                'warning': True,
                'message': f'Capacity exceeded: {student_count} students, bus capacity {bus_capacity}',
            }
        if bus_capacity > 0 and student_count >= bus_capacity * 0.9:
            return {
                **base,
                'warning': True,
                'message': f'Near capacity: {student_count}/{bus_capacity} students',
            }
        return base
