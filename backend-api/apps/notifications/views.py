from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.accounts.permissions import IsAdminOrManager

from .models import Notification
from .serializers import NotificationSerializer


@extend_schema(tags=['notifications'])
@extend_schema_view(
    list=extend_schema(
        summary='List notifications — filter by type or read status',
        parameters=[
            OpenApiParameter(
                name='filter',
                description='Filter notifications: all (default), unread, incidents, warnings, assignments',
                required=False,
                type=str,
                enum=['all', 'unread', 'incidents', 'warnings', 'assignments'],
            ),
        ],
    ),
    retrieve=extend_schema(summary='Retrieve a notification'),
    destroy=extend_schema(summary='Delete a notification'),
)
class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'patch', 'delete']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            student = user.student_profile
            queryset = Notification.objects.filter(student=student).order_by('-created_at')
        except Exception:
            # Manager sees all notifications
            queryset = Notification.objects.all().order_by('-created_at')

        filter_param = self.request.query_params.get('filter', 'all')
        if filter_param == 'unread':
            queryset = queryset.filter(is_read=False)
        elif filter_param == 'incidents':
            queryset = queryset.filter(notification_type='incident')
        elif filter_param == 'warnings':
            queryset = queryset.filter(notification_type__in=['capacity_warning', 'assignment_conflict'])
        elif filter_param == 'assignments':
            queryset = queryset.filter(notification_type__in=['seat_assigned', 'line_change'])

        return queryset

    @extend_schema(
        summary='Mark a notification as read',
        tags=['notifications'],
        responses={200: NotificationSerializer},
    )
    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_read()
        return Response(NotificationSerializer(notification).data)

    @extend_schema(
        summary='Mark all notifications as read',
        tags=['notifications'],
        responses={200: OpenApiResponse(description='All notifications marked as read')},
    )
    @action(detail=False, methods=['patch'], url_path='read-all')
    def mark_all_read(self, request):
        queryset = self.get_queryset().filter(is_read=False)
        count = queryset.count()
        queryset.update(is_read=True)
        return Response({'detail': f'{count} notification(s) marked as read.'})
