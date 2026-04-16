from rest_framework.routers import DefaultRouter

from .views import ScheduleViewSet

router = DefaultRouter()
router.register(r'schedules', ScheduleViewSet, basename='schedule')
router.register(r'manager/schedules', ScheduleViewSet, basename='manager-schedule')

urlpatterns = router.urls
