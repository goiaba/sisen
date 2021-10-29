from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.permissions import IsAdmin
from sisen.survey.serializers import InstitutionSerializer
import sisen.survey.models as models
from sisen.survey.views.main import get_object_or_not_found

class InstitutionViewSet(viewsets.ViewSet):

    def list(self, request, format=None):
        serializer = InstitutionSerializer(models.Institution.objects.all().order_by('name'), many=True)
        return Response(serializer.data)

    def retrieve(self, request, institution_id, format=None):
        institution = get_object_or_not_found(models.Institution, int(institution_id),
            'A instituição solicitada não existe (ID=%s)' % institution_id)
        return Response(InstitutionSerializer(institution).data)

    @transaction.atomic
    def create(self, request, format=None):
        new_institution_data = request.data
        serializer = InstitutionSerializer(data=new_institution_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = []
        else:
            permission_classes = [IsAuthenticated, IsAdmin]
        return [permission() for permission in permission_classes]
