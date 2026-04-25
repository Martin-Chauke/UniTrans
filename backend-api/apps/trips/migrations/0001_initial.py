import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('buses', '0001_initial'),
        ('schedules', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('trip_id', models.AutoField(primary_key=True, serialize=False)),
                ('actual_departure', models.DateTimeField(blank=True, null=True)),
                ('actual_arrival', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(
                    choices=[
                        ('scheduled', 'Scheduled'),
                        ('in_progress', 'In Progress'),
                        ('completed', 'Completed'),
                        ('cancelled', 'Cancelled'),
                    ],
                    default='scheduled',
                    max_length=20,
                )),
                ('schedule', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='trips',
                    to='schedules.schedule',
                )),
                ('bus', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='trips',
                    to='buses.bus',
                )),
            ],
            options={
                'verbose_name': 'Trip',
                'verbose_name_plural': 'Trips',
                'db_table': 'trips',
                'ordering': ['-actual_departure'],
            },
        ),
        migrations.CreateModel(
            name='Row',
            fields=[
                ('row_id', models.AutoField(primary_key=True, serialize=False)),
                ('row_number', models.PositiveIntegerField()),
                ('seat_count', models.PositiveIntegerField()),
                ('bus', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='rows',
                    to='buses.bus',
                )),
            ],
            options={
                'verbose_name': 'Row',
                'verbose_name_plural': 'Rows',
                'db_table': 'rows',
                'ordering': ['row_number'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='row',
            unique_together={('bus', 'row_number')},
        ),
        migrations.CreateModel(
            name='SeatAssignment',
            fields=[
                ('seat_assignment_id', models.AutoField(primary_key=True, serialize=False)),
                ('assigned_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('seat_number', models.PositiveIntegerField()),
                ('student', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='seat_assignments',
                    to='accounts.student',
                )),
                ('trip', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='seat_assignments',
                    to='trips.trip',
                )),
                ('row', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='seat_assignments',
                    to='trips.row',
                )),
            ],
            options={
                'verbose_name': 'Seat Assignment',
                'verbose_name_plural': 'Seat Assignments',
                'db_table': 'seat_assignments',
                'ordering': ['-assigned_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='seatassignment',
            unique_together={('trip', 'row', 'seat_number')},
        ),
    ]
