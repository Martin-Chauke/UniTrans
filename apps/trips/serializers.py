from rest_framework import serializers

from apps.accounts.serializers import StudentSerializer
from apps.buses.serializers import BusSerializer
from apps.schedules.serializers import ScheduleSerializer

from .models import Row, SeatAssignment, Trip


class RowSerializer(serializers.ModelSerializer):
    bus_registration = serializers.CharField(source='bus.registration_number', read_only=True)

    class Meta:
        model = Row
        fields = ['row_id', 'row_number', 'seat_count', 'bus', 'bus_registration']
        read_only_fields = ['row_id']


class TripSerializer(serializers.ModelSerializer):
    schedule_detail = ScheduleSerializer(source='schedule', read_only=True)
    bus_detail = BusSerializer(source='bus', read_only=True)
    delay_minutes = serializers.SerializerMethodField()
    line_name = serializers.CharField(source='schedule.line.name', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'trip_id', 'status', 'actual_departure', 'actual_arrival',
            'schedule', 'schedule_detail', 'bus', 'bus_detail',
            'line_name', 'delay_minutes',
        ]
        read_only_fields = ['trip_id', 'actual_departure', 'actual_arrival']

    def get_delay_minutes(self, obj):
        return obj.calculate_delay()


class TripWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['trip_id', 'schedule', 'bus', 'status']
        read_only_fields = ['trip_id']


class SeatAssignmentSerializer(serializers.ModelSerializer):
    student_detail = StudentSerializer(source='student', read_only=True)
    row_detail = RowSerializer(source='row', read_only=True)
    trip_detail = TripSerializer(source='trip', read_only=True)

    class Meta:
        model = SeatAssignment
        fields = [
            'seat_assignment_id', 'assigned_at', 'seat_number',
            'student', 'student_detail',
            'trip', 'trip_detail',
            'row', 'row_detail',
        ]
        read_only_fields = ['seat_assignment_id', 'assigned_at']

    def validate(self, attrs):
        trip = attrs.get('trip')
        row = attrs.get('row')
        seat_number = attrs.get('seat_number')
        student = attrs.get('student')

        if SeatAssignment.objects.filter(trip=trip, row=row, seat_number=seat_number).exists():
            raise serializers.ValidationError(
                f'Seat {seat_number} in Row {row.row_number} is already taken for this trip.'
            )
        if SeatAssignment.objects.filter(trip=trip, student=student).exists():
            raise serializers.ValidationError('Student already has a seat assigned for this trip.')

        if row.get_available_seats(trip) <= 0:
            raise serializers.ValidationError('No available seats in this row for the selected trip.')

        if not student.subscriptions.filter(is_active=True, line=trip.schedule.line).exists():
            raise serializers.ValidationError('Student is not subscribed to the line for this trip.')

        return attrs


class StudentSeatView(serializers.ModelSerializer):
    row_number = serializers.IntegerField(source='row.row_number')
    trip_id = serializers.IntegerField(source='trip.trip_id')
    trip_status = serializers.CharField(source='trip.status')
    line_name = serializers.CharField(source='trip.schedule.line.name')

    class Meta:
        model = SeatAssignment
        fields = ['seat_assignment_id', 'seat_number', 'row_number', 'trip_id', 'trip_status', 'line_name', 'assigned_at']
