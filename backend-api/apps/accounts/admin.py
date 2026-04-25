from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Student, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'name']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name',)}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'password1', 'password2'),
        }),
    )
    readonly_fields = ['date_joined', 'last_login']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'registration_number', 'first_name', 'last_name', 'email', 'phone']
    list_filter = []
    search_fields = ['registration_number', 'first_name', 'last_name', 'email']
    ordering = ['last_name', 'first_name']
    readonly_fields = ['student_id']
    fieldsets = (
        ('Identity', {'fields': ('student_id', 'registration_number')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Account', {'fields': ('user',)}),
    )
