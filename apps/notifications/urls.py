from rest_framework.routers import DefaultRouter

from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'manager/notifications', NotificationViewSet, basename='manager-notification')

urlpatterns = router.urls
