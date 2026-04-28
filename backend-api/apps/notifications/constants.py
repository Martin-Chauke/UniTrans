"""Notification types that are manager-facing only (stored with student FK for context)."""

# Student API and student dashboard must exclude these so unread counts and lists stay correct.
MANAGER_ONLY_NOTIFICATION_TYPES = frozenset({
    'student_report_submitted',
    'student_line_changed',
})
