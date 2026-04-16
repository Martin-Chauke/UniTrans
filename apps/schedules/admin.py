from django.contrib import admin

from .models import Schedule


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['schedule_id', 'line', 'day_of_week_display', 'departure_time', 'arrival_time', 'direction']
    list_filter = ['day_of_week', 'line']
    search_fields = ['line__name', 'direction']
    ordering = ['line', 'day_of_week', 'departure_time']
    readonly_fields = ['schedule_id']

    def day_of_week_display(self, obj):
        return obj.get_day_of_week_display()
    day_of_week_display.short_description = 'Day'
