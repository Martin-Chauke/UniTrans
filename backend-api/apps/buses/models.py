from django.db import models

from apps.lines.models import Line


class Bus(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        IN_SERVICE = 'in_service', 'In Service'
        MAINTENANCE = 'maintenance', 'Maintenance'

    bus_id = models.AutoField(primary_key=True)
    registration_number = models.CharField(max_length=50, unique=True)
    model = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    class Meta:
        db_table = 'buses'
        verbose_name = 'Bus'
        verbose_name_plural = 'Buses'

    def __str__(self):
        return f'{self.registration_number} ({self.model})'

    def is_available(self):
        return self.status == self.Status.AVAILABLE

    def update_status(self, status):
        self.status = status
        self.save(update_fields=['status'])

    def get_capacity(self):
        return self.capacity


class BusAssignment(models.Model):
    bus_assignment_id = models.AutoField(primary_key=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='assignments')
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='bus_assignments')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'bus_assignments'
        verbose_name = 'Bus Assignment'
        verbose_name_plural = 'Bus Assignments'
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.bus} → {self.line} (from {self.start_date})'

    def assign(self, bus, line):
        self.bus = bus
        self.line = line
        self.save()

    def end_assignment(self):
        from django.utils import timezone
        self.end_date = timezone.now().date()
        self.save(update_fields=['end_date'])

    def is_active(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.start_date <= today and (self.end_date is None or self.end_date >= today)
