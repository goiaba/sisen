from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
from sisen.survey.dto import Link, AvailableClasses
import sisen.survey.businesses as business
from sisen.survey.exceptions import Conflict, NotFound
import sisen.survey.models as models
from sisen.survey.permissions import IsProfessor, IsTeachingClass
from sisen.survey.serializers import AvailableClassesSerializer, \
    ProfessorSyntheticReportSerializer, \
    ProfessorAnalyticalReportSerializer
from sisen.survey.views.main import get_object_or_not_found

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
