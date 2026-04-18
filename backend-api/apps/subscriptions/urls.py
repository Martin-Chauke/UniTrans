from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ActiveSubscriptionView,
    ChangeLineView,
    SubscribeView,
    SubscriptionHistoryView,
    SubscriptionViewSet,
)

router = DefaultRouter()
router.register(r'manager/subscriptions', SubscriptionViewSet, basename='manager-subscription')

urlpatterns = router.urls + [
    path('subscriptions/', SubscribeView.as_view(), name='subscription-subscribe'),
    path('subscriptions/active/', ActiveSubscriptionView.as_view(), name='subscription-active'),
    path('subscriptions/change-line/', ChangeLineView.as_view(), name='subscription-change-line'),
    path('subscriptions/history/', SubscriptionHistoryView.as_view(), name='subscription-history'),
]
