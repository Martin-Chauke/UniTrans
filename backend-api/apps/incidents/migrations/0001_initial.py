import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('trips', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Incident',
            fields=[
                ('incident_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('incident_type', models.CharField(
                    choices=[
                        ('delay', 'Delay'),
                        ('breakdown', 'Breakdown'),
                        ('accident', 'Accident'),
                        ('capacity', 'Capacity Exceeded'),
                        ('other', 'Other'),
                    ],
                    default='other',
                    max_length=20,
                )),
                ('description', models.TextField()),
                ('reported_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('resolved', models.BooleanField(default=False)),
                ('trip', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='incidents',
                    to='trips.trip',
                )),
            ],
            options={
                'verbose_name': 'Incident',
                'verbose_name_plural': 'Incidents',
                'db_table': 'incidents',
                'ordering': ['-reported_at'],
            },
        ),
    ]
