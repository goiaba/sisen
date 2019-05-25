from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User, Group
from django.shortcuts import redirect
import sisen.survey.models as models
import sisen.survey.serializers as serializers
from sisen.survey.dto import Link, AvailableStudy, SurveyAnswering, StudyResult
import sisen.survey.businesses as business
from sisen.survey.exceptions import Conflict, NotFound
from sisen.survey.permissions import IsStudent
from sisen.survey.serializers import AvailableStudySerializer, SurveyAnsweringSerializer, StudentAnswerSerializer, StudyResultSerializer
from sisen.survey.views.main import get_object_or_not_found
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.reverse import reverse
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes((IsAuthenticated, IsStudent))
def student_home(request, format=None):
    student = request.user.student
    available_studies = models.Study.objects.all()
    answered_studies = set(map(lambda e: e.study, models.StudentAnswer.objects.filter(student=student)))
    studies = []
    for study in available_studies:
        study_dto = AvailableStudy(study.acronym, study.description)
        study_dto.links.append(Link('self', reverse('student_home', request=request)))
        if study in answered_studies:
            study_dto.links.append(Link('result', reverse('survey_report', args=[study.id], request=request)))
        else:
            study_dto.links.append(Link('answer', reverse('answer', args=[study.id], request=request)))
        studies.append(study_dto)
    return Response(AvailableStudySerializer(studies, many=True).data)

@api_view(['GET'])
@permission_classes((IsAuthenticated, IsStudent))
def answer(request, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id,
        'O estudo solicitado não existe (ID=%i)' % study_id)
    student = request.user.student
    study_not_answered_or_error(student, study)

    survey_answering = SurveyAnswering(study.questions.all(), [])
    survey_answering.links.append(Link('self', reverse('answer', args=[study_id], request=request)))
    survey_answering.links.append(Link('home', reverse('student_home', request=request)))
    survey_answering.links.append(Link('process', reverse('process_answer', args=[study_id], request=request), 'POST'))
    return Response(SurveyAnsweringSerializer(survey_answering).data)

@api_view(['POST'])
@permission_classes((IsAuthenticated, IsStudent))
def process_answer(request, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id,
        'O estudo solicitado não existe (ID=%i)' % study_id)
    student = request.user.student
    study_not_answered_or_error(student, study)

    answers = request.data.get('answers', [])
    for answer in answers:
        answer.update({ 'study': study.id, 'student': student.id })
    serializer = StudentAnswerSerializer(data=answers, many=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()
    return redirect('survey_report', study_id=study.id)

@api_view(['GET'])
@permission_classes((IsAuthenticated, IsStudent))
def survey_report(request, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id,
        'O estudo solicitado não existe (ID=%i)' % study_id)
    student = request.user.student
    study_answered_or_error(student, study)

    study_result = business.process_answer(study, student)
    study_result.links.append(Link('self', reverse('survey_report', args=[study.id], request=request)))
    study_result.links.append(Link('home', reverse('student_home', request=request)))
    return Response(StudyResultSerializer(study_result).data)


def study_not_answered_or_error(student, study):
    if models.StudentAnswer.objects.filter(student=student, study=study).exists():
        raise Conflict('O estudo \'%s\' já foi respondido.' % study.description)

def study_answered_or_error(student, study):
    if not models.StudentAnswer.objects.filter(student=student, study=study).exists():
        raise Conflict('O estudo \'%s\' ainda não foi respondido.' % study.description)
