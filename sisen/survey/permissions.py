from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.groups.filter(name='Student'):
            print('returning True')
            return True
        print('returning False')
        return False


class IsProfessor(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Professor')


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
