from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path, reverse_lazy
from django.views.generic import RedirectView
from sisen.survey import views
from sisen.survey.views.main import delete_reset_token
from rest_framework import routers
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_jwt.views import refresh_jwt_token
from rest_framework_jwt.views import verify_jwt_token

urlpatterns = [
    path('', RedirectView.as_view(url=reverse_lazy('home_page_switcher'))),
    path('api/v1/password-reset/invalidate-token/<str:token>', delete_reset_token, name='invalidate_token'),
    path('api/v1/password-reset/', include('django_rest_passwordreset.urls', namespace='password-reset')),
    path('api/v1/auth', obtain_jwt_token),
    path('api/v1/auth-refresh', refresh_jwt_token),
    path('api/v1/auth-verify', verify_jwt_token),
    path('api/v1/survey/', include('sisen.survey.urls'), name='survey'),
    path('admin/', admin.site.urls, name='admin'),
]
