from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('lines', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bus',
            fields=[
                ('bus_id', models.AutoField(primary_key=True, serialize=False)),
                ('registration_number', models.CharField(max_length=50, unique=True)),
                ('model', models.CharField(max_length=100)),
                ('capacity', models.PositiveIntegerField()),
                ('status', models.CharField(
                    choices=[
                        ('available', 'Available'),
                        ('in_service', 'In Service'),
                        ('maintenance', 'Maintenance'),
                    ],
                    default='available',
                    max_length=20,
                )),
            ],
            options={
                'verbose_name': 'Bus',
                'verbose_name_plural': 'Buses',
                'db_table': 'buses',
            },
        ),
        migrations.CreateModel(
            name='BusAssignment',
            fields=[
                ('bus_assignment_id', models.AutoField(primary_key=True, serialize=False)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('bus', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='assignments',
                    to='buses.bus',
                )),
                ('line', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='bus_assignments',
                    to='lines.line',
                )),
            ],
            options={
                'verbose_name': 'Bus Assignment',
                'verbose_name_plural': 'Bus Assignments',
                'db_table': 'bus_assignments',
                'ordering': ['-start_date'],
            },
        ),
    ]
