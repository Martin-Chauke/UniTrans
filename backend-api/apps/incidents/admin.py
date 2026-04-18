from django.contrib import admin
from django.utils.html import format_html

from .models import Incident


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['incident_id', 'name', 'incident_type', 'trip', 'reported_at', 'resolved_badge']
    list_filter = ['incident_type', 'resolved', 'trip__schedule__line']
    search_fields = ['name', 'description', 'trip__schedule__line__name']
    ordering = ['-reported_at']
    readonly_fields = ['incident_id', 'reported_at']

    def resolved_badge(self, obj):
        if obj.resolved:
            return format_html('<span style="color: green; font-weight: bold;">Resolved</span>')
        return format_html('<span style="color: red; font-weight: bold;">Open</span>')
    resolved_badge.short_description = 'Status'

    actions = ['mark_resolved', 'mark_unresolved']

    def mark_resolved(self, request, queryset):
        queryset.update(resolved=True)
        self.message_user(request, f'{queryset.count()} incident(s) marked as resolved.')
    mark_resolved.short_description = 'Mark as Resolved'

    def mark_unresolved(self, request, queryset):
        queryset.update(resolved=False)
        self.message_user(request, f'{queryset.count()} incident(s) marked as unresolved.')
    mark_unresolved.short_description = 'Mark as Unresolved'
