from django.contrib import admin
from django.utils.html import format_html

from .models import Row, SeatAssignment, Trip


class SeatAssignmentInline(admin.TabularInline):
    model = SeatAssignment
    extra = 0
    fields = ['student', 'row', 'seat_number', 'assigned_at']
    readonly_fields = ['assigned_at']


class RowInline(admin.TabularInline):
    model = Row
    extra = 0
    fields = ['row_number', 'seat_count']


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['trip_id', 'line_name', 'bus', 'status_badge', 'actual_departure', 'actual_arrival']
    list_filter = ['status', 'schedule__line']
    search_fields = ['schedule__line__name', 'bus__registration_number']
    ordering = ['-trip_id']
    readonly_fields = ['trip_id', 'actual_departure', 'actual_arrival']
    inlines = [SeatAssignmentInline]

    def line_name(self, obj):
        return obj.schedule.line.name
    line_name.short_description = 'Line'

    def status_badge(self, obj):
        colors = {
            'scheduled': 'blue',
            'in_progress': 'green',
            'completed': 'gray',
            'cancelled': 'red',
        }
        color = colors.get(obj.status, 'black')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_status_display())
    status_badge.short_description = 'Status'

    actions = ['start_trips', 'end_trips', 'cancel_trips']

    def start_trips(self, request, queryset):
        for trip in queryset.filter(status=Trip.Status.SCHEDULED):
            trip.start_trip()
        self.message_user(request, 'Selected trips started.')
    start_trips.short_description = 'Start selected trips'

    def end_trips(self, request, queryset):
        for trip in queryset.filter(status=Trip.Status.IN_PROGRESS):
            trip.end_trip()
        self.message_user(request, 'Selected trips ended.')
    end_trips.short_description = 'End selected trips'

    def cancel_trips(self, request, queryset):
        queryset.update(status=Trip.Status.CANCELLED)
        self.message_user(request, 'Selected trips cancelled.')
    cancel_trips.short_description = 'Cancel selected trips'


@admin.register(Row)
class RowAdmin(admin.ModelAdmin):
    list_display = ['row_id', 'bus', 'row_number', 'seat_count']
    list_filter = ['bus']
    search_fields = ['bus__registration_number']
    ordering = ['bus', 'row_number']
    readonly_fields = ['row_id']


@admin.register(SeatAssignment)
class SeatAssignmentAdmin(admin.ModelAdmin):
    list_display = ['seat_assignment_id', 'student', 'trip', 'row', 'seat_number', 'assigned_at']
    list_filter = ['trip__status', 'trip__schedule__line']
    search_fields = ['student__first_name', 'student__last_name', 'student__registration_number']
    ordering = ['-assigned_at']
    readonly_fields = ['seat_assignment_id', 'assigned_at']

    actions = ['cancel_assignments']

    def cancel_assignments(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} seat assignment(s) cancelled.')
    cancel_assignments.short_description = 'Cancel selected seat assignments'
