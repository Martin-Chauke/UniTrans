from rest_framework import serializers

from apps.trips.serializers import TripSerializer

from .models import Incident


class IncidentSerializer(serializers.ModelSerializer):
    trip_detail = TripSerializer(source='trip', read_only=True)
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    reported_by_driver_detail = serializers.SerializerMethodField(read_only=True)
    manager_response_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Incident
        fields = [
            'incident_id', 'name', 'incident_type', 'incident_type_display',
            'description', 'reported_at', 'resolved', 'trip', 'trip_detail',
            'show_on_manager_dashboard_alerts',
            'reported_by_driver', 'reported_by_driver_detail',
            'manager_response', 'manager_responded_at', 'manager_response_by',
            'manager_response_by_name',
        ]
        read_only_fields = [
            'incident_id', 'reported_at', 'show_on_manager_dashboard_alerts',
            'reported_by_driver', 'manager_response', 'manager_responded_at',
            'manager_response_by',
        ]

    def get_reported_by_driver_detail(self, obj):
        d = obj.reported_by_driver
        if d is None:
            return None
        return {
            'driver_id': d.driver_id,
            'name': f'{d.first_name} {d.last_name}',
            'email': d.email,
        }

    def get_manager_response_by_name(self, obj):
        u = obj.manager_response_by
        return u.name if u else None


class IncidentResolveSerializer(serializers.Serializer):
    resolved = serializers.BooleanField(default=True)


class IncidentManagerRespondSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=5000)


class DriverIncidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ['trip', 'name', 'incident_type', 'description']

    def validate_trip(self, trip):
        request = self.context['request']
        driver = getattr(request.user, 'driver_profile', None)
        if driver is None:
            raise serializers.ValidationError('Invalid driver account.')
        if driver.assigned_bus_id is None:
            raise serializers.ValidationError('No bus is assigned to your account.')
        if trip.bus_id != driver.assigned_bus_id:
            raise serializers.ValidationError('This trip is not on your assigned bus.')
        return trip

    def create(self, validated_data):
        driver = self.context['request'].user.driver_profile
        return Incident.objects.create(
            **validated_data,
            reported_by_driver=driver,
            show_on_manager_dashboard_alerts=True,
        )
