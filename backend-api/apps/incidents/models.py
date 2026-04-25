from django.db import models
from django.utils import timezone

from apps.trips.models import Trip


class Incident(models.Model):
    class IncidentType(models.TextChoices):
        DELAY = 'delay', 'Delay'
        BREAKDOWN = 'breakdown', 'Breakdown'
        ACCIDENT = 'accident', 'Accident'
        CAPACITY = 'capacity', 'Capacity Exceeded'
        OTHER = 'other', 'Other'

    incident_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    incident_type = models.CharField(max_length=20, choices=IncidentType.choices, default=IncidentType.OTHER)
    description = models.TextField()
    reported_at = models.DateTimeField(default=timezone.now)
    resolved = models.BooleanField(default=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='incidents')

    class Meta:
        db_table = 'incidents'
        verbose_name = 'Incident'
        verbose_name_plural = 'Incidents'
        ordering = ['-reported_at']

    def __str__(self):
        return f'[{self.incident_type}] {self.name} — Trip #{self.trip_id}'

    def report(self):
        self.save()

    def resolve(self):
        self.resolved = True
        self.save(update_fields=['resolved'])
