# Driver-reported incidents: optional trip, optional line (at least one required).

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lines', '0001_initial'),
        ('incidents', '0003_incident_driver_report_manager_response'),
    ]

    operations = [
        migrations.AddField(
            model_name='incident',
            name='line',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='incidents',
                to='lines.line',
            ),
        ),
        migrations.AlterField(
            model_name='incident',
            name='trip',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='incidents',
                to='trips.trip',
            ),
        ),
        migrations.AddConstraint(
            model_name='incident',
            constraint=models.CheckConstraint(
                condition=models.Q(('trip__isnull', False))
                | models.Q(('line__isnull', False)),
                name='incident_trip_or_line_required',
            ),
        ),
    ]
