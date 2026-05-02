"""Normalize and validate driver/student-style phone numbers."""

import re

from django.core.exceptions import ValidationError


def normalize_phone(value):
    """
    Accept:
    - Without leading +: exactly 10 national digits (non-digits ignored), or 11 digits
      starting with 1 (NANP with trunk prefix) → stored as 10 digits.
    - With leading +: digits after + (non-digits ignored) must be 8–15 inclusive.
      +1 + 10 US digits (11 total after +) → stored as 10 digits. Otherwise stored as +<digits>.
    """
    if value is None:
        return ''
    s = str(value).strip()
    if not s:
        return ''

    if s.startswith('+'):
        digits = re.sub(r'\D', '', s[1:])
        n = len(digits)
        if n < 8 or n > 15:
            raise ValidationError(
                f'After "+", use 8–15 digits including country code (you entered {n} digit'
                f'{"s" if n != 1 else ""}).'
            )
        if digits.startswith('1') and len(digits) == 11:
            return digits[1:]
        return f'+{digits}'

    digits = re.sub(r'\D', '', s)
    nd = len(digits)
    if nd == 10:
        return digits
    if nd == 11 and digits.startswith('1'):
        return digits[1:]
    raise ValidationError(
        f'Without "+", use exactly 10 digits (you entered {nd}). '
        'Or start with + and enter 8–15 digits after + (country code counts toward that total).'
    )
