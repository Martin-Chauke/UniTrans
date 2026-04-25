from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'Admin', 'Admin'
        TRANSPORT_MANAGER = 'TransportManager', 'Transport Manager'

    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TRANSPORT_MANAGER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.name} ({self.role})'

    def login(self):
        return True

    def is_manager(self):
        return self.role == self.Role.TRANSPORT_MANAGER

    def is_admin(self):
        return self.role == self.Role.ADMIN


class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    registration_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    password = models.CharField(max_length=255)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.registration_number})'

    def get_active_subscription(self):
        return self.subscriptions.filter(is_active=True).first()

    def get_subscription_history(self):
        return self.subscription_histories.all()


class Driver(models.Model):
    driver_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    license_number = models.CharField(max_length=50, unique=True)
    assigned_bus = models.OneToOneField(
        'buses.Bus',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='driver',
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'drivers'
        verbose_name = 'Driver'
        verbose_name_plural = 'Drivers'

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.license_number})'
