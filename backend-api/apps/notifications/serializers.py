from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    student_name = serializers.SerializerMethodField(read_only=True)
    student_email = serializers.SerializerMethodField(read_only=True)
    student_registration_number = serializers.SerializerMethodField(read_only=True)
    driver_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'notification_type', 'notification_type_display',
            'message', 'is_read', 'created_at', 'student', 'driver',
            'student_name', 'student_email', 'student_registration_number',
            'driver_name',
        ]
        read_only_fields = ['notification_id', 'created_at', 'student', 'driver']

    def get_student_name(self, obj):
        if obj.student_id:
            s = obj.student
            return f'{s.first_name} {s.last_name}'.strip()
        return None

    def get_student_email(self, obj):
        if obj.student_id:
            return obj.student.email
        return None

    def get_student_registration_number(self, obj):
        if obj.student_id:
            return obj.student.registration_number
        return None

    def get_driver_name(self, obj):
        if obj.driver_id:
            d = obj.driver
            return f'{d.first_name} {d.last_name}'.strip()
        return None
