"""Create in-app notifications."""

from .models import Notification


def notify_driver_manager_update(driver, message: str) -> None:
    """Notify a driver when a transport manager updates their profile (requires portal user optional)."""
    if not message.strip():
        return
    Notification.objects.create(
        driver=driver,
        student=None,
        notification_type=Notification.NotificationType.MANAGER_DRIVER_UPDATE,
        message=message.strip()[:2000],
    )
