from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.accounts.models import Student
from apps.accounts.permissions import IsAdminOrManager
from apps.lines.models import Line

from .models import Subscription, SubscriptionHistory
from .serializers import (
    ChangeLineSerializer,
    SubscribeSerializer,
    SubscriptionHistorySerializer,
    SubscriptionSerializer,
)


@extend_schema(tags=['subscriptions'])
class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Subscribe student to a line',
        request=SubscribeSerializer,
        responses={
            201: SubscriptionSerializer,
            400: OpenApiResponse(description='Already subscribed or validation error'),
        },
    )
    def post(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({'detail': 'No student profile.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        line = Line.objects.get(pk=serializer.validated_data['line_id'])

        if Subscription.objects.filter(student=student, is_active=True).exists():
            return Response(
                {'detail': 'Student already has an active subscription. Use change-line to switch.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription = Subscription.objects.create(student=student, line=line)
        return Response(SubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['subscriptions'])
class ActiveSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Get current active subscription',
        responses={200: SubscriptionSerializer},
    )
    def get(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({'detail': 'No student profile.'}, status=status.HTTP_403_FORBIDDEN)

        subscription = student.subscriptions.filter(is_active=True).select_related('line').first()
        if not subscription:
            return Response({'detail': 'No active subscription.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SubscriptionSerializer(subscription).data)


@extend_schema(tags=['subscriptions'])
class ChangeLineView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Change student subscribed line — deactivates old, creates new, logs history',
        request=ChangeLineSerializer,
        responses={
            200: SubscriptionSerializer,
            400: OpenApiResponse(description='No active subscription or validation error'),
        },
    )
    def put(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({'detail': 'No student profile.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChangeLineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_line = Line.objects.get(pk=serializer.validated_data['new_line_id'])
        reason = serializer.validated_data.get('reason', '')

        old_subscription = student.subscriptions.filter(is_active=True).select_related('line').first()
        if not old_subscription:
            return Response({'detail': 'No active subscription to change.'}, status=status.HTTP_400_BAD_REQUEST)

        if old_subscription.line == new_line:
            return Response({'detail': 'Already subscribed to this line.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            old_line = old_subscription.line
            old_subscription.deactivate()
            new_subscription = Subscription.objects.create(student=student, line=new_line)
            SubscriptionHistory.log_change(
                student=student,
                old_line=old_line,
                new_line=new_line,
                reason=reason,
            )

        from apps.notifications.models import Notification

        Notification.objects.create(
            student=student,
            notification_type=Notification.NotificationType.LINE_CHANGE,
            message=f'Your subscription has been changed from {old_line.name} to {new_line.name}.',
        )
        who = f'{student.first_name} {student.last_name}'.strip()
        Notification.objects.create(
            student=student,
            notification_type=Notification.NotificationType.STUDENT_LINE_CHANGED,
            message=(
                f'From: {who} ({student.email}) — Requested line change from "{old_line.name}" '
                f'to "{new_line.name}".'
            ),
        )

        return Response(SubscriptionSerializer(new_subscription).data)


@extend_schema(tags=['subscriptions'])
class SubscriptionHistoryView(generics.ListAPIView):
    serializer_class = SubscriptionHistorySerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Get subscription change history for logged-in student')
    def get_queryset(self):
        try:
            student = self.request.user.student_profile
            return SubscriptionHistory.objects.filter(student=student).order_by('-change_date')
        except Exception:
            return SubscriptionHistory.objects.none()


@extend_schema(tags=['subscriptions'])
@extend_schema_view(
    list=extend_schema(summary='List all subscriptions (Manager only)'),
    retrieve=extend_schema(summary='Retrieve a subscription (Manager only)'),
)
class SubscriptionViewSet(ReadOnlyModelViewSet):
    queryset = Subscription.objects.select_related('student', 'line').all().order_by('-start_date')
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAdminOrManager]


@extend_schema(tags=['subscriptions'])
class ManagerAssignLineView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(
        summary='Assign or change a student\'s subscribed line (Manager only)',
        request=None,
        responses={
            201: SubscriptionSerializer,
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Student or line not found'),
        },
    )
    def post(self, request, student_id):
        student = get_object_or_404(Student, student_id=student_id)
        line_id = request.data.get('line_id')
        if not line_id:
            return Response({'detail': 'line_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        line = get_object_or_404(Line, pk=line_id)

        old_sub = student.subscriptions.filter(is_active=True).select_related('line').first()
        old_line = old_sub.line if old_sub else None

        if old_sub and old_sub.line == line:
            return Response({'detail': 'Student is already subscribed to this line.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            if old_sub:
                old_sub.deactivate()
            new_sub = Subscription.objects.create(student=student, line=line)
            if old_line:
                SubscriptionHistory.log_change(student=student, old_line=old_line, new_line=line)

        return Response(SubscriptionSerializer(new_sub).data, status=status.HTTP_201_CREATED)
