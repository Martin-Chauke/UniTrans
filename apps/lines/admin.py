from django.contrib import admin

from .models import Line, LineStation, Station


class LineStationInline(admin.TabularInline):
    model = LineStation
    extra = 1
    fields = ['station', 'order_index']
    ordering = ['order_index']


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ['station_id', 'name', 'address', 'latitude', 'longitude']
    search_fields = ['name', 'address']
    ordering = ['name']
    readonly_fields = ['station_id']


@admin.register(Line)
class LineAdmin(admin.ModelAdmin):
    list_display = ['line_id', 'name', 'description', 'station_count']
    search_fields = ['name']
    ordering = ['name']
    readonly_fields = ['line_id']
    inlines = [LineStationInline]

    def station_count(self, obj):
        return obj.line_stations.count()
    station_count.short_description = 'Stations'


@admin.register(LineStation)
class LineStationAdmin(admin.ModelAdmin):
    list_display = ['line_station_id', 'line', 'station', 'order_index']
    list_filter = ['line']
    search_fields = ['line__name', 'station__name']
    ordering = ['line', 'order_index']
