# Plaintext portal password for manager reference (mirrors Student.password).

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_driver_user_and_driver_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='password',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
