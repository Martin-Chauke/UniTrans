from rest_framework.routers import DefaultRouter

from .views import LineViewSet, StationViewSet

router = DefaultRouter()
router.register(r'lines', LineViewSet, basename='line')
router.register(r'stations', StationViewSet, basename='station')
router.register(r'manager/lines', LineViewSet, basename='manager-line')
router.register(r'manager/stations', StationViewSet, basename='manager-station')

urlpatterns = router.urls
