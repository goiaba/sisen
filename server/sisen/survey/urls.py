from django.urls import path
from sisen.survey.views import main, student, professor, admin, institution, program, sclass

urlpatterns = [
    path(r'switcher/role/<slug:role>', main.home_page_switcher, name='home_page_switcher'),

    path(r'signup', student.register_student, name='register_student'),

    path(r'student-view', student.student_home, name='student_home'),
    path(r'study/<int:study_id>/answer', student.answer, name='answer'),
    path(r'study/<int:study_id>/process', student.process_answer, name='process_answer'),
    path(r'study/<int:study_id>/report', student.survey_report, name='survey_report'),

    path(r'professor-view', professor.professor_home, name='professor_home'),
    path(r'class/<int:class_id>/study/<int:study_id>/synthetic-report', professor.survey_synthetic_report, name='survey_synthetic_report'),
    path(r'class/<int:class_id>/study/<int:study_id>/analytical-report', professor.survey_analytical_report, name='survey_analytical_report'),

    path(r'institution', institution.list, name='list_institution'),
    path(r'institution/<int:institution_id>', institution.detail, name='institution_detail'),
    path(r'institution/<int:institution_id>/program', program.list, name='list_program'),
    path(r'institution/<int:institution_id>/program/<int:program_id>', program.detail, name='program_detail'),
    path(r'institution/<int:institution_id>/program/<int:program_id>/class', sclass.list, name='list_class'),
    path(r'institution/<int:institution_id>/program/<int:program_id>/class/<int:class_id>', sclass.detail, name='class_detail'),

    path(r'admin-view', admin.admin_home, name='admin_home'),
]
