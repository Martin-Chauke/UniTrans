from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import RowViewSet, SeatAssignmentViewSet, StudentSeatAPIView, TripViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'rows', RowViewSet, basename='row')
router.register(r'seat-assignments', SeatAssignmentViewSet, basename='seat-assignment')
router.register(r'manager/trips', TripViewSet, basename='manager-trip')
router.register(r'manager/seat-assignments', SeatAssignmentViewSet, basename='manager-seat-assignment')

urlpatterns = router.urls + [
    path('students/me/seat/', StudentSeatAPIView.as_view(), name='student-seat'),
]
