from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
import sisen.survey.models as models
from sisen.survey.permissions import IsStudent, IsProfessor, IsAdmin
from sisen.survey.exceptions import NotFound

@api_view(['GET'])
@permission_classes((IsAuthenticated,IsStudent|IsProfessor|IsAdmin))
def home_page_switcher(request, role, format=None):
    if request.user.groups.filter(name=role):
        return Response(reverse('%s_home' % role.lower(), request=request))
    elif role == 'Admin' and request.user.is_staff:
        return Response(reverse('admin_home', request=request))
    else:
        raise PermissionDenied({
            'message': ('Você não tem permissão para acessar o sistema.'
                        ' Entre em contato com o administrador.')})

def get_object_or_not_found(model, pk_value, message=None):
    try:
        return model.objects.get(pk=pk_value)
    except model.DoesNotExist:
        raise NotFound(message)
