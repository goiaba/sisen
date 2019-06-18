from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    message = 'Apenas estudantes possuem permissão de acesso à esse recurso.'

    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Student')


class IsProfessor(BasePermission):
    message = 'Apenas professores possuem permissão de acesso à esse recurso.'

    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Professor')


class IsTeachingClass(BasePermission):
    message = 'Apenas professores lecionando para a turma possuem permissão de acesso à esse recurso.'

    def has_permission(self, request, view):
        class_id = view.kwargs.get('class_id')
        return class_id and request.user and request.user.professor.classes.filter(id=class_id).exists()

class IsAdmin(BasePermission):
    message = 'Apenas administradores possuem permissão de acesso à esse recurso.'

    def has_permission(self, request, view):
        return request.user and request.user.is_staff
