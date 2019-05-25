from django.shortcuts import redirect
import sisen.survey.models as models
from sisen.survey.permissions import IsStudent, IsProfessor, IsAdmin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes((IsAuthenticated,IsStudent|IsProfessor|IsAdmin))
def home_page_switcher(request, format=None):
    user = request.user
    if user.is_staff:
        return redirect('admin_home')
    elif len(models.Student.objects.filter(user=user)):
        return redirect('student_home')
    elif len(models.Professor.objects.filter(user=user)):
        return redirect('professor_home')
    else:
        print('aqui')
        raise PermissionDenied({
            'message': ('Você não tem permissão para acessar o sistema.'
                        ' Entre em contato com o administrador.')})

def get_object_or_not_found(model, pk_value, message=None):
    try:
        return model.objects.get(pk=pk_value)
    except model.DoesNotExist:
        raise NotFound(message)
