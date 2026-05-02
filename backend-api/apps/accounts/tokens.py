from rest_framework_simplejwt.tokens import AccessToken

from apps.accounts.models import User


class CustomAccessToken(AccessToken):
    """
    Extends the default access token to embed role, name, and email
    so the frontend can read user info directly from the JWT payload
    without an extra API call.
    """

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token['role'] = user.role
        token['name'] = user.name
        token['email'] = user.email
        if user.role == User.Role.DRIVER:
            driver = getattr(user, 'driver_profile', None)
            if driver is not None:
                token['driver_id'] = driver.driver_id
        return token
