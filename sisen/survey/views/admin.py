from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User, Group
from django.shortcuts import redirect
import sisen.survey.models as models
import sisen.survey.serializers as serializers
from sisen.survey.dto import Link, AvailableStudy, SurveyAnswering, StudyResult
import sisen.survey.businesses as business
from sisen.survey.exceptions import Conflict, NotFound
from sisen.survey.permissions import IsStudent, IsProfessor, IsAdmin
from sisen.survey.serializers import AvailableStudySerializer, SurveyAnsweringSerializer, StudentAnswerSerializer, StudyResultSerializer
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.reverse import reverse
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsAdmin))
def admin_home(request, format=None):
    return Response('Admin home is still under development, %s' % request.user.username)
