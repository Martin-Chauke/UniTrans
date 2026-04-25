from django.urls import path

from .views import (
    ManagerResolveStudentReportView,
    ManagerStudentReportsView,
    ReportsView,
    StudentMyReportsView,
    StudentReportCreateView,
)

urlpatterns = [
    # Manager system reports
    path('reports/', ReportsView.as_view(), name='reports'),
    path('manager/reports/', ReportsView.as_view(), name='manager-reports'),

    # Student submits a report
    path('student-reports/', StudentReportCreateView.as_view(), name='student-report-create'),
    # Student views own reports
    path('student-reports/my/', StudentMyReportsView.as_view(), name='student-report-my'),

    # Manager views / resolves student reports
    path('manager/student-reports/', ManagerStudentReportsView.as_view(), name='manager-student-reports'),
    path('manager/student-reports/<int:report_id>/resolve/', ManagerResolveStudentReportView.as_view(), name='manager-student-report-resolve'),
]
