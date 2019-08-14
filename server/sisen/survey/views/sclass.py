from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.serializers import ClassSerializer
from sisen.survey.exceptions import NotFound
import sisen.survey.models as models
from sisen.survey.views.main import get_object_or_not_found

@api_view(['GET'])
@permission_classes([])
def list(request, institution_id, program_id, format=None):
    institution = get_object_or_not_found(models.Institution, institution_id,
        'A instituição solicitada não existe (ID=%i)' % institution_id)
    try:
        program = institution.programs.get(pk=program_id)
        return Response(ClassSerializer(
            program.classes.order_by('-year', '-semester', 'description'), many=True).data)
    except models.Program.DoesNotExist:
        raise NotFound(
            ('O programa solicitado (ID=%i) não existe ou não está vinculado'
             'à instituição') % program_id)

@api_view(['GET'])
@permission_classes([])
def detail(request, institution_id, program_id, class_id, format=None):
    institution = get_object_or_not_found(models.Institution, institution_id,
        'A instituição solicitada não existe (ID=%i)' % institution_id)
    try:
        program = institution.programs.get(pk=program_id)
    except models.Program.DoesNotExist:
        raise NotFound(
            ('O programa solicitado (ID=%i) não existe ou não está vinculado'
             'à instituição') % program_id)
    try:
        sclass = program.classes.get(pk=class_id)
        return Response(ClassSerializer(sclass).data)
    except models.Class.DoesNotExist:
        raise NotFound(
            ('A turma solicitada (ID=%i) não existe ou não está vinculada'
             'à instituição ou ao programa') % class_id)
