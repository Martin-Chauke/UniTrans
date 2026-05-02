from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.lines.models import Line
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
    show_on_manager_dashboard_alerts = models.BooleanField(
        default=False,
        help_text='If true, unresolved incident may appear in manager dashboard Pending Alerts.',
    )
    trip = models.ForeignKey(
        Trip,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='incidents',
    )
    line = models.ForeignKey(
        Line,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='incidents',
    )
    reported_by_driver = models.ForeignKey(
        'accounts.Driver',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reported_incidents',
    )
    manager_response = models.TextField(blank=True, default='')
    manager_responded_at = models.DateTimeField(null=True, blank=True)
    manager_response_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incident_responses',
    )

    class Meta:
        db_table = 'incidents'
        verbose_name = 'Incident'
        verbose_name_plural = 'Incidents'
        ordering = ['-reported_at']

    def __str__(self):
        if self.trip_id:
            return f'[{self.incident_type}] {self.name} — Trip #{self.trip_id}'
        if self.line_id:
            return f'[{self.incident_type}] {self.name} — Line: {self.line.name}'
        return f'[{self.incident_type}] {self.name}'

    def report(self):
        self.save()

    def resolve(self):
        self.resolved = True
        self.save(update_fields=['resolved'])
