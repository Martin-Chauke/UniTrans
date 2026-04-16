from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Station',
            fields=[
                ('station_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=150)),
                ('address', models.CharField(max_length=255)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Station',
                'verbose_name_plural': 'Stations',
                'db_table': 'stations',
            },
        ),
        migrations.CreateModel(
            name='Line',
            fields=[
                ('line_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
            ],
            options={
                'verbose_name': 'Line',
                'verbose_name_plural': 'Lines',
                'db_table': 'lines',
            },
        ),
        migrations.CreateModel(
            name='LineStation',
            fields=[
                ('line_station_id', models.AutoField(primary_key=True, serialize=False)),
                ('order_index', models.PositiveIntegerField()),
                ('line', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='line_stations',
                    to='lines.line',
                )),
                ('station', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='line_stations',
                    to='lines.station',
                )),
            ],
            options={
                'verbose_name': 'Line Station',
                'verbose_name_plural': 'Line Stations',
                'db_table': 'line_stations',
                'ordering': ['order_index'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='linestation',
            unique_together={('line', 'station')},
        ),
    ]
