from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.serializers import InstitutionSerializer
import sisen.survey.models as models
from sisen.survey.views.main import get_object_or_not_found

@api_view(['GET'])
@permission_classes([])
def list(request, format=None):
    return Response(InstitutionSerializer(
        models.Institution.objects.all().order_by('name'), many=True).data)

@api_view(['GET'])
@permission_classes([])
def detail(request, institution_id, format=None):
    institution = get_object_or_not_found(models.Institution, institution_id,
        'A instituição solicitada não existe (ID=%i)' % institution_id)
    return Response(InstitutionSerializer(institution).data)
