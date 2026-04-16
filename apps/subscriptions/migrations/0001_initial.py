import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('lines', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('subscription_id', models.AutoField(primary_key=True, serialize=False)),
                ('start_date', models.DateField(default=django.utils.timezone.now)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('student', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='subscriptions',
                    to='accounts.student',
                )),
                ('line', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='subscriptions',
                    to='lines.line',
                )),
            ],
            options={
                'verbose_name': 'Subscription',
                'verbose_name_plural': 'Subscriptions',
                'db_table': 'subscriptions',
                'ordering': ['-start_date'],
            },
        ),
        migrations.CreateModel(
            name='SubscriptionHistory',
            fields=[
                ('subscription_history_id', models.AutoField(primary_key=True, serialize=False)),
                ('change_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('reason', models.CharField(blank=True, max_length=255)),
                ('student', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='subscription_histories',
                    to='accounts.student',
                )),
                ('old_line', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='old_subscriptions',
                    to='lines.line',
                )),
                ('new_line', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='new_subscriptions',
                    to='lines.line',
                )),
            ],
            options={
                'verbose_name': 'Subscription History',
                'verbose_name_plural': 'Subscription Histories',
                'db_table': 'subscription_histories',
                'ordering': ['-change_date'],
            },
        ),
    ]
