from django.contrib import admin
from django.utils.html import format_html

from .models import Bus, BusAssignment


class BusAssignmentInline(admin.TabularInline):
    model = BusAssignment
    extra = 0
    fields = ['line', 'start_date', 'end_date', 'notes']
    readonly_fields = []


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_id', 'registration_number', 'model', 'capacity', 'status_badge']
    list_filter = ['status']
    search_fields = ['registration_number', 'model']
    ordering = ['registration_number']
    readonly_fields = ['bus_id']
    inlines = [BusAssignmentInline]

    def status_badge(self, obj):
        colors = {
            'available': 'green',
            'in_service': 'blue',
            'maintenance': 'orange',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    actions = ['mark_available', 'mark_maintenance']

    def mark_available(self, request, queryset):
        queryset.update(status=Bus.Status.AVAILABLE)
        self.message_user(request, f'{queryset.count()} bus(es) marked as available.')
    mark_available.short_description = 'Mark selected buses as Available'

    def mark_maintenance(self, request, queryset):
        queryset.update(status=Bus.Status.MAINTENANCE)
        self.message_user(request, f'{queryset.count()} bus(es) marked as Maintenance.')
    mark_maintenance.short_description = 'Mark selected buses as Maintenance'


@admin.register(BusAssignment)
class BusAssignmentAdmin(admin.ModelAdmin):
    list_display = ['bus_assignment_id', 'bus', 'line', 'start_date', 'end_date', 'active_status']
    list_filter = ['line', 'start_date']
    search_fields = ['bus__registration_number', 'line__name']
    ordering = ['-start_date']
    readonly_fields = ['bus_assignment_id']

    def active_status(self, obj):
        is_active = obj.is_active()
        color = 'green' if is_active else 'gray'
        label = 'Active' if is_active else 'Inactive'
        return format_html('<span style="color: {};">{}</span>', color, label)
    active_status.short_description = 'Active'

    actions = ['end_assignments']

    def end_assignments(self, request, queryset):
        for assignment in queryset:
            assignment.end_assignment()
        self.message_user(request, f'{queryset.count()} assignment(s) ended.')
    end_assignments.short_description = 'End selected assignments'
