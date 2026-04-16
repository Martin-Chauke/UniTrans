from rest_framework import serializers

from apps.trips.serializers import TripSerializer

from .models import Incident


class IncidentSerializer(serializers.ModelSerializer):
    trip_detail = TripSerializer(source='trip', read_only=True)
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)

    class Meta:
        model = Incident
        fields = [
            'incident_id', 'name', 'incident_type', 'incident_type_display',
            'description', 'reported_at', 'resolved', 'trip', 'trip_detail',
        ]
        read_only_fields = ['incident_id', 'reported_at']


class IncidentResolveSerializer(serializers.Serializer):
    resolved = serializers.BooleanField(default=True)
