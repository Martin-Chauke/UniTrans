from django.db import models
from django.utils import timezone

from apps.accounts.models import Student
from apps.buses.models import Bus
from apps.schedules.models import Schedule


class Trip(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    trip_id = models.AutoField(primary_key=True)
    actual_departure = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='trips')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')

    class Meta:
        db_table = 'trips'
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
        ordering = ['-actual_departure']

    def __str__(self):
        return f'Trip #{self.trip_id} — {self.schedule.line.name} [{self.status}]'

    def start_trip(self):
        self.status = self.Status.IN_PROGRESS
        self.actual_departure = timezone.now()
        self.save(update_fields=['status', 'actual_departure'])

    def end_trip(self):
        self.status = self.Status.COMPLETED
        self.actual_arrival = timezone.now()
        self.save(update_fields=['status', 'actual_arrival'])

    def calculate_delay(self):
        if self.actual_departure and self.schedule:
            scheduled_dt = self.actual_departure.replace(
                hour=self.schedule.departure_time.hour,
                minute=self.schedule.departure_time.minute,
                second=0, microsecond=0,
            )
            delta = self.actual_departure - scheduled_dt
            return max(0, int(delta.total_seconds() / 60))
        return 0

    def update_status(self, status):
        self.status = status
        self.save(update_fields=['status'])


class Row(models.Model):
    row_id = models.AutoField(primary_key=True)
    row_number = models.PositiveIntegerField()
    seat_count = models.PositiveIntegerField()
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='rows')

    class Meta:
        db_table = 'rows'
        verbose_name = 'Row'
        verbose_name_plural = 'Rows'
        unique_together = ('bus', 'row_number')
        ordering = ['row_number']

    def __str__(self):
        return f'Row {self.row_number} (Bus: {self.bus.registration_number})'

    def get_available_seats(self, trip):
        occupied = SeatAssignment.objects.filter(row=self, trip=trip).count()
        return self.seat_count - occupied


class SeatAssignment(models.Model):
    seat_assignment_id = models.AutoField(primary_key=True)
    assigned_at = models.DateTimeField(default=timezone.now)
    seat_number = models.PositiveIntegerField()
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='seat_assignments')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='seat_assignments')
    row = models.ForeignKey(Row, on_delete=models.CASCADE, related_name='seat_assignments')

    class Meta:
        db_table = 'seat_assignments'
        verbose_name = 'Seat Assignment'
        verbose_name_plural = 'Seat Assignments'
        unique_together = ('trip', 'row', 'seat_number')
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.student} — Row {self.row.row_number} Seat {self.seat_number} (Trip #{self.trip_id})'

    @classmethod
    def assign_seat(cls, student, trip, row, seat_number):
        if cls.objects.filter(trip=trip, row=row, seat_number=seat_number).exists():
            raise ValueError(f'Seat {seat_number} in Row {row.row_number} is already taken for this trip.')
        if cls.objects.filter(trip=trip, student=student).exists():
            raise ValueError('Student already has a seat assigned for this trip.')
        return cls.objects.create(student=student, trip=trip, row=row, seat_number=seat_number)

    def cancel_assignment(self):
        self.delete()
