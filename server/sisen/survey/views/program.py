from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.exceptions import NotFound
from sisen.survey.permissions import IsAdmin
from sisen.survey.serializers import ProgramSerializer
import sisen.survey.models as models
from sisen.survey.views.main import get_object_or_not_found

class ProgramViewSet(viewsets.ViewSet):

    def list(self, request, institution_id, format=None):
        institution = get_object_or_not_found(models.Institution, int(institution_id),
            'A instituição solicitada não existe (ID=%s)' % institution_id)
        return Response(ProgramSerializer(institution.programs.order_by('name'), many=True).data)

    def retrieve(self, request, institution_id, program_id, format=None):
        institution = get_object_or_not_found(models.Institution, institution_id,
            'A instituição solicitada não existe (ID=%s)' % institution_id)
        try:
            program = institution.programs.get(pk=program_id)
            return Response(ProgramSerializer(program).data)
        except models.Program.DoesNotExist:
            raise NotFound(
                ('O programa solicitado (ID=%i) não existe ou não está vinculado'
                 'à instituição') % program_id)

    @transaction.atomic
    def create(self, request, institution_id, format=None):
        institution = get_object_or_not_found(models.Institution, institution_id,
            'A instituição solicitada não existe (ID=%s)' % institution_id)
        new_program_data = request.data
        new_program_data.update({ 'institution': institution_id })
        serializer = ProgramSerializer(data=new_program_data)
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
