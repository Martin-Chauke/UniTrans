import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('notification_id', models.AutoField(primary_key=True, serialize=False)),
                ('notification_type', models.CharField(
                    choices=[
                        ('trip_started', 'Trip Started'),
                        ('trip_delay', 'Trip Delay'),
                        ('seat_assigned', 'Seat Assigned'),
                        ('line_change', 'Line Change'),
                        ('incident', 'Incident'),
                        ('assignment_conflict', 'Assignment Conflict'),
                        ('capacity_warning', 'Capacity Warning'),
                        ('general', 'General'),
                    ],
                    default='general',
                    max_length=30,
                )),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('student', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='notifications',
                    to='accounts.student',
                )),
            ],
            options={
                'verbose_name': 'Notification',
                'verbose_name_plural': 'Notifications',
                'db_table': 'notifications',
                'ordering': ['-created_at'],
            },
        ),
    ]
