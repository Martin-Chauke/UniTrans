from django.db import models

from apps.lines.models import Line


class Schedule(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    schedule_id = models.AutoField(primary_key=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    direction = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'schedules'
        verbose_name = 'Schedule'
        verbose_name_plural = 'Schedules'
        ordering = ['day_of_week', 'departure_time']

    def __str__(self):
        day_name = dict(self.DAY_CHOICES).get(self.day_of_week, str(self.day_of_week))
        return f'{self.line.name} — {day_name} {self.departure_time}'

    def is_valid(self):
        return self.departure_time < self.arrival_time

    def update_time(self, departure_time, arrival_time):
        self.departure_time = departure_time
        self.arrival_time = arrival_time
        self.save(update_fields=['departure_time', 'arrival_time'])
