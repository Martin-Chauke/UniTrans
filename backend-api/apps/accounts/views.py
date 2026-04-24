from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import Driver, Student, User
from .permissions import IsAdminOrManager
from .serializers import (
    DriverSerializer,
    LoginSerializer,
    ManagerRegisterSerializer,
    PatchedDriverSerializer,
    RegisterSerializer,
    StudentDetailSerializer,
    StudentSerializer,
    TokenResponseSerializer,
    UserSerializer,
)


@extend_schema(tags=['auth'])
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Register a new student',
        request=RegisterSerializer,
        responses={
            201: StudentSerializer,
            400: OpenApiResponse(description='Validation errors'),
        },
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['auth'])
class ManagerRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Register a new transport manager account',
        request=ManagerRegisterSerializer,
        responses={
            201: TokenResponseSerializer,
            400: OpenApiResponse(description='Validation errors'),
        },
    )
    def post(self, request):
        serializer = ManagerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


@extend_schema(tags=['auth'])
class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Login and obtain JWT tokens',
        request=LoginSerializer,
        responses={
            200: TokenResponseSerializer,
            400: OpenApiResponse(description='Invalid credentials'),
        },
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


@extend_schema(tags=['auth'], summary='Refresh JWT access token')
class CustomTokenRefreshView(TokenRefreshView):
    pass


@extend_schema(tags=['accounts'])
class StudentMeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Get own student profile',
        responses={200: StudentDetailSerializer},
    )
    def get(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'detail': 'No student profile found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentDetailSerializer(student).data)

    @extend_schema(
        summary='Update own student profile',
        request=StudentSerializer,
        responses={200: StudentSerializer},
    )
    def put(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'detail': 'No student profile found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentSerializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@extend_schema(tags=['accounts'])
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Student dashboard — active subscription, recent seat, unread notifications count',
        responses={200: None},
    )
    def get(self, request):
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'detail': 'No student profile found.'}, status=status.HTTP_404_NOT_FOUND)

        active_sub = student.subscriptions.filter(is_active=True).first()
        unread_count = student.notifications.filter(is_read=False).count()
        seat = student.seat_assignments.select_related('trip', 'row').filter(
            trip__status='in_progress'
        ).first()

        recent_notifications = student.notifications.order_by('-created_at')[:5]
        from apps.notifications.serializers import NotificationSerializer
        notifications_data = NotificationSerializer(recent_notifications, many=True).data

        return Response({
            'student': StudentSerializer(student).data,
            'active_subscription': {
                'line_id': active_sub.line_id if active_sub else None,
                'line_name': active_sub.line.name if active_sub else None,
            } if active_sub else None,
            'current_seat': {
                'row_number': seat.row.row_number if seat else None,
                'seat_number': seat.seat_number if seat else None,
                'trip_id': seat.trip_id if seat else None,
            } if seat else None,
            'unread_notifications': unread_count,
            'recent_activity': notifications_data,
        })


@extend_schema(tags=['accounts'])
class ManagerDashboardView(APIView):
    permission_classes = [IsAdminOrManager]

    @extend_schema(
        summary='Manager dashboard — system overview stats and alerts',
        responses={200: None},
    )
    def get(self, request):
        from apps.buses.models import Bus, BusAssignment
        from apps.incidents.models import Incident
        from apps.lines.models import Line
        from apps.trips.models import Trip

        total_students = Student.objects.count()
        total_lines = Line.objects.count()
        active_trips = Trip.objects.filter(status='in_progress').count()
        available_buses = Bus.objects.filter(status='available').count()
        open_incidents = Incident.objects.filter(resolved=False).count()
        total_drivers = Driver.objects.count()

        unresolved_incidents = Incident.objects.filter(resolved=False).order_by('-reported_at')[:5]
        from apps.incidents.serializers import IncidentSerializer
        incidents_data = IncidentSerializer(unresolved_incidents, many=True).data

        return Response({
            'stats': {
                'total_students': total_students,
                'total_lines': total_lines,
                'active_trips': active_trips,
                'available_buses': available_buses,
                'open_incidents': open_incidents,
                'total_drivers': total_drivers,
            },
            'system_alerts': incidents_data,
        })


@extend_schema(tags=['accounts'])
@extend_schema_view(
    get=extend_schema(summary='List all students (Manager only)'),
)
class StudentListView(generics.ListAPIView):
    queryset = Student.objects.all().order_by('last_name', 'first_name')
    serializer_class = StudentDetailSerializer
    permission_classes = [IsAdminOrManager]


@extend_schema(tags=['accounts'])
@extend_schema_view(
    get=extend_schema(summary='Retrieve student detail (Manager only)'),
    put=extend_schema(summary='Update student (Manager only)'),
    patch=extend_schema(summary='Partial update student (Manager only)'),
    delete=extend_schema(summary='Delete student (Manager only)'),
)
class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentDetailSerializer
    permission_classes = [IsAdminOrManager]
    lookup_field = 'student_id'


@extend_schema(tags=['accounts'])
@extend_schema_view(
    get=extend_schema(summary='List all drivers (Manager only)'),
    post=extend_schema(summary='Create a driver (Manager only)'),
)
class DriverListView(generics.ListCreateAPIView):
    queryset = Driver.objects.select_related('assigned_bus').all().order_by('last_name', 'first_name')
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrManager]


@extend_schema(tags=['accounts'])
@extend_schema_view(
    get=extend_schema(summary='Retrieve driver detail (Manager only)'),
    put=extend_schema(summary='Update driver (Manager only)'),
    patch=extend_schema(summary='Partial update driver (Manager only)'),
    delete=extend_schema(summary='Delete driver (Manager only)'),
)
class DriverDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Driver.objects.select_related('assigned_bus').all()
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrManager]
    lookup_field = 'driver_id'
