"""Normalize and validate driver/student-style phone numbers."""

import re

from django.core.exceptions import ValidationError


def normalize_phone(value):
    """
    Accept:
    - 10 digits (US local, no country code)
    - 11 digits starting with 1 (US with leading 1, no +)
    - +1 and 10 US digits (normalized to 10 digits stored)
    - International: + then country code and national number (8–15 digits total after +)
    Returns stored string: 10 digits for North American, or '+' + digits for other regions.
    """
    if value is None:
        return ''
    s = str(value).strip()
    if not s:
        return ''

    if s.startswith('+'):
        digits = re.sub(r'\D', '', s[1:])
        if not (8 <= len(digits) <= 15):
            raise ValidationError(
                'International numbers must use + followed by 8–15 digits (country code + number).'
            )
        if digits.startswith('1') and len(digits) == 11:
            return digits[1:]
        return f'+{digits}'

    digits = re.sub(r'\D', '', s)
    if len(digits) == 10:
        return digits
    if len(digits) == 11 and digits.startswith('1'):
        return digits[1:]

    raise ValidationError(
        'Enter a 10-digit phone number, or include country code (e.g. +1 for US, +44 for UK).'
    )
