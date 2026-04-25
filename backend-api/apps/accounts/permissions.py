from rest_framework.permissions import BasePermission

from .models import User


class IsTransportManager(BasePermission):
    """Allows access only to Transport Manager users."""

    message = 'Only Transport Managers can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.TRANSPORT_MANAGER
        )


class IsAdminOrManager(BasePermission):
    """Allows access to Admin or Transport Manager users (not students)."""

    message = 'Only Admin or Transport Managers can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in [User.Role.ADMIN, User.Role.TRANSPORT_MANAGER]
        )


class IsStudent(BasePermission):
    """Allows access only to users who are linked to a Student profile."""

    message = 'Only students can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == User.Role.STUDENT
                or hasattr(request.user, 'student_profile')
            )
        )
