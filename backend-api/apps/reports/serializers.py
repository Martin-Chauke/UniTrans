from rest_framework import serializers

from .models import StudentReport


class StudentReportSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    student_email = serializers.SerializerMethodField(read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = StudentReport
        fields = [
            'report_id', 'student', 'student_name', 'student_email',
            'report_type', 'report_type_display',
            'title', 'description',
            'status', 'status_display',
            'submitted_at', 'resolved_at',
        ]
        read_only_fields = ['report_id', 'student', 'submitted_at', 'resolved_at', 'status']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_student_email(self, obj):
        return obj.student.email


class StudentReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentReport
        fields = ['report_type', 'title', 'description']
