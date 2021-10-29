from django.db import transaction
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
from sisen.survey.dto import Link, AvailableClasses
from sisen.survey.exceptions import NotFound
from sisen.survey.permissions import IsAdmin
from sisen.survey.permissions import IsProfessor
from sisen.survey.permissions import IsTeachingClass
from sisen.survey.serializers import ProfessorSerializer
from sisen.survey.serializers import AvailableClassesSerializer
from sisen.survey.views.main import get_object_or_not_found
import sisen.survey.businesses as business
import sisen.survey.models as models


class ProfessorViewSet(viewsets.ViewSet):

    def find_all(self, request, format=None):
        return Response(ProfessorSerializer(
            models.Professor.objects.all().order_by('user__first_name', 'user__last_name'),
            many=True).data)

    def find_by_institution_program(self, request, institution_id, program_id, format=None):
        institution, program = self.get_institution_program_or_not_found(
            institution_id, program_id)
        return Response(ProfessorSerializer(
            program.professors.order_by('user__first_name', 'user__last_name'),
            many=True).data)

    def find_by_institution_program_professor(self, request, institution_id, program_id, professor_id, format=None):
        institution, program = self.get_institution_program_or_not_found(
            institution_id, program_id)
        try:
            return Response(ProfessorSerializer(
                program.professors.get(pk=professor_id)).data)
        except models.Professor.DoesNotExist:
            raise NotFound(
                ('O professor solicitado (ID=%i) não existe ou não está vinculado'
                 'ao programa') % program_id)

    @transaction.atomic
    def create(self, request, institution_id, program_id, format=None):
        institution, program = self.get_institution_program_or_not_found(
            institution_id, program_id)
        new_professor_data = request.data
        # new_professor_data.update({ 'institution': institution_id })
        serializer = ProfessorSerializer(data=new_professor_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_institution_program_or_not_found(self, institution_id, program_id):
        institution = get_object_or_not_found(models.Institution, institution_id,
            'A instituição solicitada não existe (ID=%s)' % institution_id)
        try:
            program = institution.programs.get(pk=program_id)
            return institution, program
        except models.Program.DoesNotExist:
            raise NotFound(
                ('O programa solicitado (ID=%i) não existe ou não está vinculado'
                 'à instituição') % program_id)

    def get_permissions(self):
        if self.action in ['find_all', 'find_by_institution_program_professor']:
            permission_classes = []
        else:
            permission_classes = [IsAuthenticated, IsAdmin]
        return [permission() for permission in permission_classes]


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsProfessor))
def professor_home(request, format=None):
    classes = []
    for sclass in request.user.professor.classes.all():
        total_students = len(sclass.students.all())
        for study in models.Study.objects.all():
            already_answered = len(
                models.StudentAnswer.objects \
                    .values('student_id') \
                    .filter(study=study, student__sclass=sclass) \
                    .distinct())
            available_classes_dto = AvailableClasses(sclass, study,
                total_students, already_answered, [])
            available_classes_dto.links.append(
                Link('synthetic-report', reverse(
                    'survey_synthetic_report',
                    args=[sclass.id, study.id],
                    request=request)))
            available_classes_dto.links.append(
                Link('analytical-report', reverse(
                    'survey_analytical_report',
                    args=[sclass.id, study.id],
                    request=request)))
            classes.append(available_classes_dto)
    return Response(AvailableClassesSerializer(classes, many=True).data)

@api_view(['GET'])
@permission_classes((IsAuthenticated, IsProfessor, IsTeachingClass))
def survey_synthetic_report(request, class_id, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id, 'O estudo não existe (ID=%i)' % study_id)
    sclass = get_object_or_not_found(models.Class, class_id, 'A turma não existe (ID=%i)' % class_id)
    return Response(ProfessorSyntheticReportSerializer(
        business.professor_synthetic_report(study, sclass)).data)

@api_view(['GET'])
@permission_classes((IsAuthenticated, IsProfessor, IsTeachingClass))
def survey_analytical_report(request, class_id, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id, 'O estudo não existe (ID=%i)' % study_id)
    sclass = get_object_or_not_found(models.Class, class_id, 'A turma não existe (ID=%i)' % class_id)
    return Response(ProfessorAnalyticalReportSerializer(
        business.professor_analytical_report(study, sclass)).data)
