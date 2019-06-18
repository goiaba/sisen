from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.permissions import IsAdmin

@api_view(['GET'])
@permission_classes((IsAuthenticated, IsAdmin))
def admin_home(request, format=None):
    return Response('Admin home is still under development, %s' % request.user.username)
