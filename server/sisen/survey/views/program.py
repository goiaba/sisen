from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.serializers import ProgramSerializer
from sisen.survey.exceptions import NotFound
import sisen.survey.models as models
from sisen.survey.views.main import get_object_or_not_found

@api_view(['GET'])
@permission_classes([])
def list(request, institution_id, format=None):
    institution = get_object_or_not_found(models.Institution, institution_id,
        'A instituição solicitada não existe (ID=%i)' % institution_id)
    return Response(ProgramSerializer(
        institution.programs.order_by('name'), many=True).data)

@api_view(['GET'])
@permission_classes([])
def detail(request, institution_id, program_id, format=None):
    institution = get_object_or_not_found(models.Institution, institution_id,
        'A instituição solicitada não existe (ID=%i)' % institution_id)
    try:
        program = institution.programs.get(pk=program_id)
        return Response(ProgramSerializer(program).data)
    except models.Program.DoesNotExist:
        raise NotFound(
            ('O programa solicitado (ID=%i) não existe ou não está vinculado'
             'à instituição') % program_id)
