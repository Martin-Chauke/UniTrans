from django.contrib import admin
from django.utils.html import format_html

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'notification_id',
        'recipient',
        'notification_type',
        'short_message',
        'is_read_badge',
        'created_at',
    ]
    list_filter = ['notification_type', 'is_read']
    search_fields = [
        'student__first_name',
        'student__last_name',
        'driver__first_name',
        'driver__last_name',
        'message',
    ]
    ordering = ['-created_at']
    readonly_fields = ['notification_id', 'created_at']

    def recipient(self, obj):
        if obj.student_id:
            return f'Student: {obj.student}'
        if obj.driver_id:
            return f'Driver: {obj.driver}'
        return '—'

    recipient.short_description = 'Recipient'

    def short_message(self, obj):
        return obj.message[:60] + '...' if len(obj.message) > 60 else obj.message
    short_message.short_description = 'Message'

    def is_read_badge(self, obj):
        if obj.is_read:
            return format_html('<span style="color: gray;">Read</span>')
        return format_html('<span style="color: blue; font-weight: bold;">Unread</span>')
    is_read_badge.short_description = 'Status'

    actions = ['mark_read', 'mark_unread']

    def mark_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} notification(s) marked as read.')
    mark_read.short_description = 'Mark as Read'

    def mark_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f'{queryset.count()} notification(s) marked as unread.')
    mark_unread.short_description = 'Mark as Unread'
