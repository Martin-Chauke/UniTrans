import datetime

from django.db import models
from django.utils import timezone

from apps.accounts.models import Student
from apps.lines.models import Line


class Subscription(models.Model):
    subscription_id = models.AutoField(primary_key=True)
    start_date = models.DateField(default=datetime.date.today)
    end_date = models.DateField(null=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subscriptions')
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='subscriptions')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.student} → {self.line} (active={self.is_active})'

    def activate(self):
        self.is_active = True
        self.save(update_fields=['is_active'])

    def deactivate(self):
        self.is_active = False
        self.end_date = timezone.now().date()
        self.save(update_fields=['is_active', 'end_date'])

    def is_valid(self):
        today = timezone.now().date()
        return self.is_active and (self.end_date is None or self.end_date >= today)


class SubscriptionHistory(models.Model):
    subscription_history_id = models.AutoField(primary_key=True)
    change_date = models.DateTimeField(default=timezone.now)
    reason = models.CharField(max_length=255, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subscription_histories')
    old_line = models.ForeignKey(
        Line, on_delete=models.SET_NULL, null=True, blank=True, related_name='old_subscriptions'
    )
    new_line = models.ForeignKey(
        Line, on_delete=models.SET_NULL, null=True, blank=True, related_name='new_subscriptions'
    )

    class Meta:
        db_table = 'subscription_histories'
        verbose_name = 'Subscription History'
        verbose_name_plural = 'Subscription Histories'
        ordering = ['-change_date']

    def __str__(self):
        return f'{self.student} changed line on {self.change_date:%Y-%m-%d}'

    @classmethod
    def log_change(cls, student, old_line, new_line, reason=''):
        return cls.objects.create(
            student=student,
            old_line=old_line,
            new_line=new_line,
            reason=reason,
        )
