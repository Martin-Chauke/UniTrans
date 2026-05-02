from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DriverIncidentDestroyView, DriverIncidentListCreateView, ManagerIncidentViewSet

router = DefaultRouter()
router.register(r'incidents', ManagerIncidentViewSet, basename='incident')
router.register(r'manager/incidents', ManagerIncidentViewSet, basename='manager-incident')

urlpatterns = [
    path(
        'drivers/me/incidents/<int:pk>/',
        DriverIncidentDestroyView.as_view(),
        name='driver-incident-detail',
    ),
    path('drivers/me/incidents/', DriverIncidentListCreateView.as_view(), name='driver-incidents'),
] + router.urls
