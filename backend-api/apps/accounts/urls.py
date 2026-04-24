from django.urls import path

from .views import (
    CustomTokenRefreshView,
    DriverDetailView,
    DriverListView,
    LoginView,
    ManagerDashboardView,
    ManagerRegisterView,
    RegisterView,
    StudentDashboardView,
    StudentDetailView,
    StudentListView,
    StudentMeView,
)

auth_urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/manager/register/', ManagerRegisterView.as_view(), name='auth-manager-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
]

student_urlpatterns = [
    path('students/me/', StudentMeView.as_view(), name='student-me'),
    path('students/me/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('manager/dashboard/', ManagerDashboardView.as_view(), name='manager-dashboard'),
    path('manager/students/', StudentListView.as_view(), name='manager-student-list'),
    path('manager/students/<int:student_id>/', StudentDetailView.as_view(), name='manager-student-detail'),
    path('manager/drivers/', DriverListView.as_view(), name='manager-driver-list'),
    path('manager/drivers/<int:driver_id>/', DriverDetailView.as_view(), name='manager-driver-detail'),
]
