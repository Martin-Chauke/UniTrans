from django.db import models
from django.utils import timezone

from apps.accounts.models import Student


class StudentReport(models.Model):
    class ReportType(models.TextChoices):
        DELAY = 'delay', 'Delay'
        INCIDENT = 'incident', 'Incident'
        INQUIRY = 'inquiry', 'General Inquiry'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        REVIEWED = 'reviewed', 'Reviewed'
        RESOLVED = 'resolved', 'Resolved'

    report_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=ReportType.choices, default=ReportType.OTHER)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    submitted_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'student_reports'
        verbose_name = 'Student Report'
        verbose_name_plural = 'Student Reports'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'[{self.report_type}] {self.title} — {self.student}'
