from django.db import transaction
from django.db.models.deletion import ProtectedError
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sisen.survey.exceptions import NotFound, Conflict
from sisen.survey.permissions import IsAdmin
from sisen.survey.serializers import ClassSerializer, ClassWithProfessorsSerializer, ProfessorSerializer
import sisen.survey.models as models


class ClassViewSet(viewsets.ViewSet):

    def find_all(self, request, format=None):
        return Response(ClassWithProfessorsSerializer(models.Class.objects.all(), many=True).data)

    def find_by_institution_program(self, request, institution_id, program_id, format=None):
        return Response(ClassWithProfessorsSerializer(
            models.Class.objects.filter(
                program__id=program_id,
                program__institution__id=institution_id
            ).order_by('-year', '-semester', 'description'), many=True
        ).data)

    def find_by_institution_program_class(self, request, institution_id, program_id, class_id, format=None):
        try:
            return Response(ClassWithProfessorsSerializer(
                models.Class.objects.get(
                    pk=class_id,
                    program__id=program_id,
                    program__institution__id=institution_id)
                )
            .data)
        except models.Class.DoesNotExist:
            raise NotFound('A turma não existe ou não está vinculada ao programa/instituição.')

    def find_by_id(self, request, class_id, format=None):
        try:
            return Response(ClassWithProfessorsSerializer(models.Class.objects.get(pk=class_id)).data)
        except models.Class.DoesNotExist:
            raise NotFound('A turma não existe.')

    @transaction.atomic
    def create(self, request, institution_id, program_id, format=None):
        try:
            program = models.Program.objects.get(pk=program_id, institution__id=institution_id)
        except models.Program.DoesNotExist:
            raise NotFound('O programa não existe ou não está vinculado a essa instituição.')
        new_class_data = request.data
        serializer = ClassWithProfessorsSerializer(data=new_class_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def partial_update(self, request, class_ids, format=None):
        try:
            sclass = models.Class.objects.get(pk=class_ids)
        except models.Class.DoesNotExist:
            raise NotFound('A turma informada não existe.')
        serializer = ClassSerializer(sclass, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def destroy(self, request, class_ids, format=None):
        try:
            class_ids = list(map(lambda e: int(e), class_ids.split(',')))
        except ValueError:
            Response({'detail': 'Formato inválido dos identificadores de turma a serem removidos.'},
                     status=status.HTTP_400_BAD_REQUEST)

        protected_classes = []
        for class_id in class_ids:
            try:
                models.Class.objects.filter(id=class_id).delete()
            except ProtectedError as e:
                protected_classes.append(e.protected_objects[0].sclass.description)
        if protected_classes:
            message = ('Nenhuma turma foi removida. Para remoção,'
                ' selecione apenas turmas que não possuam estudantes'
                ' vinculados. Turmas que causaram a falha: "%s".') % '", "'.join(protected_classes)
            raise Conflict(message)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @transaction.atomic
    def assign_professors(self, request, class_id, format=None):
        try:
            sclass = models.Class.objects.get(pk=class_id)
        except models.Class.DoesNotExist:
            raise NotFound('A turma não existe.')
        serializer = ProfessorSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        new_professors_list = list(map(lambda e: e['user'].professor, serializer.validated_data))
        sclass.professors.remove(*list(set(sclass.professors.all()) - set(new_professors_list)))
        sclass.professors.add(*new_professors_list)
        return Response(ClassWithProfessorsSerializer(sclass).data, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        if self.action in ['find_all', 'find_by_institution_program', 'find_by_institution_program_class']:
            permission_classes = []
        else:
            permission_classes = [IsAuthenticated, IsAdmin]
        return [permission() for permission in permission_classes]
