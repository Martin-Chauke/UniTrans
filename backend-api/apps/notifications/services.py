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


def notify_driver_incident_manager_reply(driver, incident_title: str, reply_text: str) -> None:
    """Notify the reporting driver when a manager posts or changes a reply on their incident."""
    body = (reply_text or '').strip()
    if not body:
        return
    title = (incident_title or 'Incident report').strip()[:200]
    Notification.objects.create(
        driver=driver,
        student=None,
        notification_type=Notification.NotificationType.MANAGER_DRIVER_UPDATE,
        message=f'Manager replied to your incident "{title}": {body}'[:2000],
    )


def notify_driver_incident_resolved(driver, incident_title: str) -> None:
    """Notify the reporting driver when their incident is marked resolved."""
    title = (incident_title or 'Your incident report').strip()[:200]
    Notification.objects.create(
        driver=driver,
        student=None,
        notification_type=Notification.NotificationType.REPORT_RESOLVED,
        message=f'Your incident report "{title}" has been marked resolved.',
    )
