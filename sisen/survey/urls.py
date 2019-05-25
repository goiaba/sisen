from django.urls import path
from sisen.survey.views import main, student, professor, admin


urlpatterns = [
    path(r'', main.home_page_switcher, name='home_page_switcher'),

    path(r'student-view', student.student_home, name='student_home'),
    path(r'study/<int:study_id>/answer', student.answer, name='answer'),
    path(r'study/<int:study_id>/process', student.process_answer, name='process_answer'),
    path(r'study/<int:study_id>/report', student.survey_report, name='survey_report'),

    path(r'professor-view', professor.professor_home, name='professor_home'),
    # path(r'class/<int:class_id>/study/<int:study_id>/synthetic-report', views.survey_synthetic_result, name='survey_synthetic_report'),
    # path(r'class/<int:class_id>/study/<int:study_id>/analytical-report', views.survey_analytical_result, name='survey_analytical_report'),
    # path(r'class/<int:class_id>/study/<int:study_id>/export-synthetic-report', views.survey_synthetic_result, name='survey_export_synthetic_report'),
    # path(r'class/<int:class_id>/study/<int:study_id>/export-analytical-report', views.survey_analytical_result, name='survey_export_analytical_report'),

    path(r'admin-view', admin.admin_home, name='admin_home'),
]
