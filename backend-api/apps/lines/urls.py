from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LineStationViewSet, LineViewSet, StationViewSet

router = DefaultRouter()
router.register(r'lines', LineViewSet, basename='line')
router.register(r'stations', StationViewSet, basename='station')
router.register(r'manager/lines', LineViewSet, basename='manager-line')
router.register(r'manager/stations', StationViewSet, basename='manager-station')

line_stations_router = DefaultRouter()
line_stations_router.register(r'stations', LineStationViewSet, basename='line-station')

manager_line_stations_router = DefaultRouter()
manager_line_stations_router.register(r'stations', LineStationViewSet, basename='manager-line-station')

urlpatterns = router.urls + [
    path('lines/<int:line_pk>/', include(line_stations_router.urls)),
    path('manager/lines/<int:line_pk>/', include(manager_line_stations_router.urls)),
]
