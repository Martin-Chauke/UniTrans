from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'notification_type', 'notification_type_display',
            'message', 'is_read', 'created_at', 'student',
        ]
        read_only_fields = ['notification_id', 'created_at', 'student']
