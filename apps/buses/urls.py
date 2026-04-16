from rest_framework.routers import DefaultRouter

from .views import BusAssignmentViewSet, BusViewSet

router = DefaultRouter()
router.register(r'buses', BusViewSet, basename='bus')
router.register(r'bus-assignments', BusAssignmentViewSet, basename='bus-assignment')
router.register(r'manager/buses', BusViewSet, basename='manager-bus')
router.register(r'manager/bus-assignments', BusAssignmentViewSet, basename='manager-bus-assignment')

urlpatterns = router.urls
