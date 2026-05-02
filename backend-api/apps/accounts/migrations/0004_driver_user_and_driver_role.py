# Generated manually for driver portal

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_add_student_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('Admin', 'Admin'),
                    ('TransportManager', 'Transport Manager'),
                    ('Student', 'Student'),
                    ('Driver', 'Driver'),
                ],
                default='TransportManager',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='driver',
            name='user',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='driver_profile',
                to='accounts.user',
            ),
        ),
    ]
