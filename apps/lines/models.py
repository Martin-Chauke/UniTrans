from django.db import models


class Station(models.Model):
    station_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'stations'
        verbose_name = 'Station'
        verbose_name_plural = 'Stations'

    def __str__(self):
        return self.name

    def get_lines(self):
        return Line.objects.filter(line_stations__station=self)


class Line(models.Model):
    line_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'lines'
        verbose_name = 'Line'
        verbose_name_plural = 'Lines'

    def __str__(self):
        return self.name

    def add_station(self, station, order):
        LineStation.objects.create(line=self, station=station, order_index=order)

    def remove_station(self, station):
        LineStation.objects.filter(line=self, station=station).delete()

    def get_schedules(self):
        return self.schedules.all()


class LineStation(models.Model):
    line_station_id = models.AutoField(primary_key=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='line_stations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='line_stations')
    order_index = models.PositiveIntegerField()

    class Meta:
        db_table = 'line_stations'
        verbose_name = 'Line Station'
        verbose_name_plural = 'Line Stations'
        unique_together = ('line', 'station')
        ordering = ['order_index']

    def __str__(self):
        return f'{self.line.name} → {self.station.name} (#{self.order_index})'

    def set_order(self, index):
        self.order_index = index
        self.save(update_fields=['order_index'])
