from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Driver, Student, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'role', 'is_active', 'date_joined']
        read_only_fields = ['user_id', 'date_joined']


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'student_id', 'registration_number', 'first_name',
            'last_name', 'email', 'phone',
        ]
        read_only_fields = ['student_id']


class StudentDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            'student_id', 'registration_number', 'first_name',
            'last_name', 'email', 'phone', 'user',
        ]
        read_only_fields = ['student_id']


class RegisterSerializer(serializers.Serializer):
    registration_number = serializers.CharField(max_length=50)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        if Student.objects.filter(email=value).exists():
            raise serializers.ValidationError('A student with this email already exists.')
        return value

    def validate_registration_number(self, value):
        if Student.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError('This registration number is already in use.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        # Students get a User account with the Admin role as a base;
        # their student context is determined by the linked Student profile.
        user = User.objects.create_user(
            email=validated_data['email'],
            name=f"{validated_data['first_name']} {validated_data['last_name']}",
            password=password,
            role=User.Role.ADMIN,
        )
        user.is_staff = False
        user.save(update_fields=['is_staff'])

        student = Student.objects.create(
            registration_number=validated_data['registration_number'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            password=password,
            user=user,
        )
        return student


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')
        attrs['user'] = user
        return attrs


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class DriverSerializer(serializers.ModelSerializer):
    assigned_bus_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Driver
        fields = [
            'driver_id', 'first_name', 'last_name', 'email', 'phone',
            'license_number', 'assigned_bus', 'assigned_bus_detail', 'is_active',
        ]
        read_only_fields = ['driver_id']

    def get_assigned_bus_detail(self, obj):
        if obj.assigned_bus:
            from apps.buses.serializers import BusSerializer
            return BusSerializer(obj.assigned_bus).data
        return None


class PatchedDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'license_number', 'assigned_bus', 'is_active',
        ]
