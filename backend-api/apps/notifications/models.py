from django.db import models
from django.utils import timezone

from apps.accounts.models import Student


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TRIP_STARTED = 'trip_started', 'Trip Started'
        TRIP_DELAY = 'trip_delay', 'Trip Delay'
        SEAT_ASSIGNED = 'seat_assigned', 'Seat Assigned'
        LINE_CHANGE = 'line_change', 'Line Change'
        INCIDENT = 'incident', 'Incident'
        ASSIGNMENT_CONFLICT = 'assignment_conflict', 'Assignment Conflict'
        CAPACITY_WARNING = 'capacity_warning', 'Capacity Warning'
        GENERAL = 'general', 'General'
        STUDENT_REPORT_SUBMITTED = 'student_report_submitted', 'Student Report Submitted'
        STUDENT_LINE_CHANGED = 'student_line_changed', 'Student Line Changed'
        REPORT_RESOLVED = 'report_resolved', 'Report Resolved'

    notification_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(
        max_length=30, choices=NotificationType.choices, default=NotificationType.GENERAL
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.notification_type}] → {self.student} (read={self.is_read})'

    def mark_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])
