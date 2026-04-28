from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    student_name = serializers.SerializerMethodField(read_only=True)
    student_email = serializers.SerializerMethodField(read_only=True)
    student_registration_number = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'notification_type', 'notification_type_display',
            'message', 'is_read', 'created_at', 'student',
            'student_name', 'student_email', 'student_registration_number',
        ]
        read_only_fields = ['notification_id', 'created_at', 'student']

    def get_student_name(self, obj):
        s = obj.student
        return f'{s.first_name} {s.last_name}'.strip()

    def get_student_email(self, obj):
        return obj.student.email

    def get_student_registration_number(self, obj):
        return obj.student.registration_number
