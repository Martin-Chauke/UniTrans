# Generated manually for driver portal

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0004_driver_user_and_driver_role'),
        ('incidents', '0002_incident_dashboard_alert_flag'),
    ]

    operations = [
        migrations.AddField(
            model_name='incident',
            name='manager_response',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='incident',
            name='manager_responded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='incident',
            name='manager_response_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='incident_responses',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='incident',
            name='reported_by_driver',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reported_incidents',
                to='accounts.driver',
            ),
        ),
    ]
