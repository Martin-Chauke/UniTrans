from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('lines', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('schedule_id', models.AutoField(primary_key=True, serialize=False)),
                ('day_of_week', models.IntegerField(choices=[
                    (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
                    (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
                ])),
                ('departure_time', models.TimeField()),
                ('arrival_time', models.TimeField()),
                ('direction', models.CharField(blank=True, max_length=50)),
                ('line', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='schedules',
                    to='lines.line',
                )),
            ],
            options={
                'verbose_name': 'Schedule',
                'verbose_name_plural': 'Schedules',
                'db_table': 'schedules',
                'ordering': ['day_of_week', 'departure_time'],
            },
        ),
    ]
