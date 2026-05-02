"""Bus assignment rules for drivers (one bus → one driver)."""

from rest_framework import serializers

from apps.accounts.models import Driver


def validate_driver_assigned_bus(bus, *, exclude_driver_id=None):
    """
    Ensure no other driver already uses this bus. Raises DRF ValidationError.
    """
    if bus is None:
        return
    qs = Driver.objects.filter(assigned_bus=bus)
    if exclude_driver_id is not None:
        qs = qs.exclude(driver_id=exclude_driver_id)
    other = qs.first()
    if other:
        raise serializers.ValidationError(
            f'This bus is already assigned to {other.first_name} {other.last_name} '
            f'(driver #{other.driver_id}). Unassign them first or pick another bus.'
        )
