from django.contrib import admin

from .models import Subscription, SubscriptionHistory


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['subscription_id', 'student', 'line', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'line']
    search_fields = ['student__first_name', 'student__last_name', 'student__registration_number', 'line__name']
    ordering = ['-start_date']
    readonly_fields = ['subscription_id', 'start_date']

    actions = ['deactivate_subscriptions']

    def deactivate_subscriptions(self, request, queryset):
        for sub in queryset.filter(is_active=True):
            sub.deactivate()
        self.message_user(request, f'Deactivated {queryset.count()} subscription(s).')
    deactivate_subscriptions.short_description = 'Deactivate selected subscriptions'


@admin.register(SubscriptionHistory)
class SubscriptionHistoryAdmin(admin.ModelAdmin):
    list_display = ['subscription_history_id', 'student', 'old_line', 'new_line', 'change_date', 'reason']
    list_filter = ['old_line', 'new_line']
    search_fields = ['student__first_name', 'student__last_name', 'reason']
    ordering = ['-change_date']
    readonly_fields = ['subscription_history_id', 'change_date']
