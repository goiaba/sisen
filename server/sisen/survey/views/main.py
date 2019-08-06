import os
from django.conf import settings
from django.dispatch import receiver
from django.template.loader import render_to_string
from django_rest_passwordreset.models import ResetPasswordToken
from django_rest_passwordreset.signals import reset_password_token_created
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
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

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    context = {
        'current_user': reset_password_token.user,
        'reset_password_url': "{}?token={}".format(
            settings.CLIENT_RESET_PASSWORD_CONFIRMATION_URL,
            reset_password_token.key),
        'invalidate_token_url': reverse(
            'invalidate_token',
            args=[reset_password_token.key], request=instance.request)
    }
    email_html_message = render_to_string('email/reset_password.html', context)
    email_plaintext_message = render_to_string('email/reset_password.txt', context)

    message = Mail(
        from_email='programeict2019@gmail.com',
        to_emails=reset_password_token.user.email,
        subject='Sisen - Solicitação de alteração de senha',
        plain_text_content=email_plaintext_message,
        html_content=email_html_message)

    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
    except Exception as e:
        print("Ocorreu um erro ao tentar enviar"
              " email de recuperação de senha"
              " para o usuário %s" % reset_password_token.user)
        print(e)

@api_view(['GET'])
@permission_classes([])
def delete_reset_token(request, token, format=None):
    ResetPasswordToken.objects.filter(key=token).delete()
    return Response("Token invalidado com sucesso.")

def get_object_or_not_found(model, pk_value, message=None):
    try:
        return model.objects.get(pk=pk_value)
    except model.DoesNotExist:
        raise NotFound(message)
