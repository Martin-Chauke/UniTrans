"""Lines tied to a driver's assigned bus (active assignments + lines on trips for that bus)."""

from django.db.models import Prefetch, Q
from django.utils import timezone

from apps.buses.models import BusAssignment
from apps.lines.models import Line, LineStation
from apps.trips.models import Trip


def lines_queryset_for_driver_bus(driver):
    """Lines the driver may reference for incidents (active assignment window + lines on trips)."""
    bus = driver.assigned_bus
    if bus is None:
        return Line.objects.none()
    today = timezone.now().date()
    active_ba = BusAssignment.objects.filter(bus=bus, start_date__lte=today).filter(
        Q(end_date__isnull=True) | Q(end_date__gte=today),
    )
    from_trips = Trip.objects.filter(bus=bus).values_list('schedule__line_id', flat=True).distinct()
    from_assignments = active_ba.values_list('line_id', flat=True).distinct()
    line_ids = set(from_trips) | set(from_assignments)
    if not line_ids:
        return Line.objects.none()
    return Line.objects.filter(line_id__in=line_ids).order_by('name')


def all_line_ids_for_driver_bus(bus):
    """Union of every line ever assigned to the bus plus lines appearing on trips."""
    from_assignments = BusAssignment.objects.filter(bus=bus).values_list('line_id', flat=True).distinct()
    from_trips = Trip.objects.filter(bus=bus).values_list('schedule__line_id', flat=True).distinct()
    return set(from_assignments) | set(from_trips)


def lines_queryset_all_assigned_for_driver_bus(driver):
    """All lines tied to the bus (any assignment history or trips), with stations prefetched."""
    bus = driver.assigned_bus
    if bus is None:
        return Line.objects.none()
    line_ids = all_line_ids_for_driver_bus(bus)
    if not line_ids:
        return Line.objects.none()
    return (
        Line.objects.filter(line_id__in=line_ids)
        .prefetch_related(
            Prefetch(
                'line_stations',
                queryset=LineStation.objects.select_related('station').order_by('order_index'),
            ),
        )
        .order_by('name')
    )