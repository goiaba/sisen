from django.urls import path, re_path
from sisen.survey.views import main, student, professor, admin
from sisen.survey.views.institution import InstitutionViewSet
from sisen.survey.views.program import ProgramViewSet
from sisen.survey.views.professor import ProfessorViewSet
from sisen.survey.views.sclass import ClassViewSet
urlpatterns = [
    path(r'switcher/role/<slug:role>', main.home_page_switcher, name='home_page_switcher'),

    path(r'signup', student.register_student, name='register_student'),

    path(r'admin-view', admin.admin_home, name='admin_home'),
    path(r'professor-view', professor.professor_home, name='professor_home'),
    path(r'student-view', student.student_home, name='student_home'),
    path(r'study/<int:study_id>/answer', student.answer, name='answer'),
    path(r'study/<int:study_id>/process', student.process_answer, name='process_answer'),
    path(r'study/<int:study_id>/report', student.survey_report, name='survey_report'),

    path(r'institution', InstitutionViewSet.as_view({ 'get': 'list', 'post': 'create' }), name='institution'),
    path(r'institution/<int:institution_id>', InstitutionViewSet.as_view({ 'get': 'retrieve' }),
         name='institution_detail'),
    path(r'institution/<int:institution_id>/program', ProgramViewSet.as_view({ 'get': 'list', 'post': 'create' }),
         name='program'),
    path(r'institution/<int:institution_id>/program/<int:program_id>',
         ProgramViewSet.as_view({ 'get': 'retrieve' }), name='program_detail'),
    path(r'institution/<int:institution_id>/program/<int:program_id>/class',
         ClassViewSet.as_view({ 'get': 'find_by_institution_program', 'post': 'create' }), name='class'),
    path(r'institution/<int:institution_id>/program/<int:program_id>/class/<int:class_id>',
         ClassViewSet.as_view({ 'get': 'find_by_institution_program_class' }), name='class_detail'),
    path(r'institution/<int:institution_id>/program/<int:program_id>/professor',
         ProfessorViewSet.as_view({'get': 'find_by_institution_program', 'post': 'create'}), name='professor'),
    path(r'institution/<int:institution_id>/program/<int:program_id>/professor/<int:class_id>',
         ProfessorViewSet.as_view({'get': 'find_by_institution_program_professor'}), name='professor_detail'),

    path(r'class/<int:class_id>/study/<int:study_id>/synthetic-report', professor.survey_synthetic_report,
         name='survey_synthetic_report'),
    path(r'class/<int:class_id>/study/<int:study_id>/analytical-report', professor.survey_analytical_report,
         name='survey_analytical_report'),
    path(r'class', ClassViewSet.as_view({'get': 'find_all'}), name='class_all'),
    path(r'class/<int:class_id>/professor', ClassViewSet.as_view({'post': 'assign_professors'}),
         name='class_professors_assignment'),
    re_path(r'^class/(?P<class_ids>(\d+,?)+)', ClassViewSet.as_view({ 'delete': 'destroy', 'patch': 'partial_update' }),
            name='class_remove')
]
