from rest_framework import serializers

from apps.lines.serializers import LineSerializer

from .models import Subscription, SubscriptionHistory


class SubscriptionSerializer(serializers.ModelSerializer):
    line_detail = LineSerializer(source='line', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'subscription_id', 'student', 'student_name', 'line', 'line_detail',
            'start_date', 'end_date', 'is_active',
        ]
        read_only_fields = ['subscription_id', 'is_active', 'start_date', 'end_date']

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'


class SubscribeSerializer(serializers.Serializer):
    line_id = serializers.IntegerField()

    def validate_line_id(self, value):
        from apps.lines.models import Line
        if not Line.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Line not found.')
        return value


class ChangeLineSerializer(serializers.Serializer):
    new_line_id = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_new_line_id(self, value):
        from apps.lines.models import Line
        if not Line.objects.filter(pk=value).exists():
            raise serializers.ValidationError('New line not found.')
        return value


class SubscriptionHistorySerializer(serializers.ModelSerializer):
    old_line_name = serializers.CharField(source='old_line.name', read_only=True, default=None)
    new_line_name = serializers.CharField(source='new_line.name', read_only=True, default=None)

    class Meta:
        model = SubscriptionHistory
        fields = [
            'subscription_history_id', 'change_date', 'reason',
            'student', 'old_line', 'old_line_name', 'new_line', 'new_line_name',
        ]
        read_only_fields = ['subscription_history_id', 'change_date']
