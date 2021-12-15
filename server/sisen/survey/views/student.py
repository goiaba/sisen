from django.contrib.auth.models import Group
from django.db import transaction
from django.db.models import F, Sum
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse

import sisen.survey.businesses as business
import sisen.survey.models as models
from sisen.survey.dto import Link, AvailableStudy, SurveyAnswering
from sisen.survey.exceptions import Conflict, NotFound
from sisen.survey.permissions import IsStudent
from sisen.survey.serializers import AvailableStudySerializer, SurveyAnsweringSerializer, StudentAnswerSerializer, \
    StudyWithMessageAndStudentOptionScoreSerializer
from sisen.survey.serializers import UserSerializer, StudentSerializer
from sisen.survey.views.main import get_object_or_not_found


@api_view(['POST'])
@transaction.atomic
@permission_classes([])
@authentication_classes([])
def register_student(request, format=None):
    try:
        class_id = request.data.pop('class')
    except KeyError:
        raise NotFound('O id da turma do aluno sendo cadastrado é obrigatório.')
    sclass = get_object_or_not_found(models.Class, class_id, 'A turma enviada não existe (ID=%s)' % class_id)
    serializer = UserSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    student_group = Group.objects.get(name='Student')
    student_group.user_set.add(user)
    student = models.Student(user=user, sclass=sclass)
    student.save()
    return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsStudent))
def student_home(request, format=None):
    student = request.user.student
    available_studies = models.Study.objects.all()
    answered_studies = set(map(lambda e: e.study, models.StudentAnswer.objects.filter(student=student)))
    studies = []
    for study in available_studies:
        study_dto = AvailableStudy(study, [])
        study_dto.links.append(Link('self', reverse('student_home', request=request)))
        if study in answered_studies:
            study_dto.links.append(Link('result', reverse('survey_report', args=[study.id], request=request)))
        else:
            study_dto.links.append(Link('answer', reverse('answer', args=[study.id], request=request)))
        studies.append(study_dto)
    return Response(AvailableStudySerializer(studies, many=True, context={'student': student}).data)


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsStudent))
def answer(request, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id,
        'O estudo solicitado não existe (ID=%i)' % study_id)
    student = request.user.student
    study_not_answered_or_error(student, study)

    survey_answering = SurveyAnswering(study.description, study.questions.all(), [])
    survey_answering.links.append(Link('self', reverse('answer', args=[study_id], request=request)))
    survey_answering.links.append(Link('home', reverse('student_home', request=request)))
    survey_answering.links.append(Link('process', reverse('process_answer', args=[study_id], request=request), 'POST'))
    return Response(SurveyAnsweringSerializer(survey_answering).data)


@api_view(['POST'])
@transaction.atomic
@permission_classes((IsAuthenticated, IsStudent))
def process_answer(request, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id,
        'O estudo solicitado não existe (ID=%i)' % study_id)
    student = request.user.student
    study_not_answered_or_error(student, study)

    answers = list(filter(lambda e: e != None, request.data.get('answers', [])))
    validate_answers(study, answers)
    for answer in answers:
        answer.update({ 'study': study.id, 'student': student.id })
    serializer = StudentAnswerSerializer(data=answers, many=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()
    models.StudentAnswerLog(student=student, study=study).save()
    return redirect('survey_report', study_id=study.id)


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsStudent))
def survey_report(request, study_id, format=None):
    study = get_object_or_not_found(models.Study, study_id,
        'O estudo solicitado não existe (ID=%i)' % study_id)
    student = request.user.student
    study_answered_or_error(student, study)

    study_option_scores = business.process_answer(study, student)
    study_option_scores.links.append(Link('self', reverse('survey_report', args=[study.id], request=request)))
    study_option_scores.links.append(Link('home', reverse('student_home', request=request)))
    return Response(StudyWithMessageAndStudentOptionScoreSerializer(study_option_scores).data)


def study_not_answered_or_error(student, study):
    if models.StudentAnswer.objects.filter(student=student, study=study).exists():
        raise Conflict('O estudo \'%s\' já foi respondido' % study.description)


def study_answered_or_error(student, study):
    if not models.StudentAnswer.objects.filter(student=student, study=study).exists():
        raise Conflict('O estudo \'%s\' ainda não foi respondido' % study.description)


def validate_answers(study, answers):
    # TODO: Should also validate the answers of each question?
    expected = set(map(lambda s: s.id, study.questions.all()))
    received = set(map(lambda s: s.get('question'), answers))
    if len(expected - received) != 0:
        raise Conflict('Todas as questões do estudo devem ser respondidas')
