from django.contrib.auth.models import User
from rest_framework import serializers
import sisen.survey.models as models


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
     )

    def to_representation(self, instance):
        """Add Admin to groups if is_staff is True"""
        ret = super().to_representation(instance)
        if instance.is_staff:
            ret['groups'].append('Admin')
        return ret

    def to_internal_value(self, data):
        """Remove 'Admin' from groups if it exists"""
        try:
            data.get('user', {}).get('groups', []).remove('Admin')
        except ValueError:
            pass
        return super().to_internal_value(data)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('email'),
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'))
        return user

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'groups', 'password')
        extra_kwargs = {
            'email': {'error_messages': {'invalid': 'O e-mail digitado não é válido.'}},
            'first_name': {'error_messages': {'max_length': 'Nome não pode ultrapassar {max_length} caracteres.'}},
            'last_name': {'error_messages': {'max_length': 'Sobrenome não pode ultrapassar {max_length} caracteres.'}},
            'password': {'write_only': True}
        }


class LinkSerializer(serializers.Serializer):
    rel = serializers.CharField()
    uri = serializers.CharField()
    method = serializers.CharField(max_length=10, default='GET')
    icon = serializers.CharField()


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Answer
        fields = ('id', 'value', 'text')


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = models.Question
        fields = ('id', 'position', 'text', 'answers')


class StudySerializer(serializers.ModelSerializer):
    answered = serializers.SerializerMethodField()

    class Meta:
        model = models.Study
        fields = ('id', 'acronym', 'description', 'answered')

    def get_answered(self, obj):
        student = self.context.get('student')
        return models.StudentAnswer.objects.filter(
            student=student,
            study=obj
        ).exists() if student else None

    def to_representation(self, instance):
        """Remove 'answered' if 'student' not in context"""
        ret = super().to_representation(instance)
        if not self.context.get('student'):
            ret.answered = None;
        return ret


class AvailableStudySerializer(serializers.Serializer):
    study = StudySerializer()
    links = LinkSerializer(many=True)


class SurveyAnsweringSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=50)
    questions = QuestionSerializer(many=True)
    links = LinkSerializer(many=True)


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StudentAnswer
        fields = '__all__'


class StudyOptionScoreSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=100)
    value = serializers.FloatField()


class StudyWithMessageAndStudentOptionScoreSerializer(serializers.Serializer):
    submit_datetime = serializers.CharField(max_length=19)
    study = StudySerializer()
    message = serializers.CharField()
    study_option_scores = StudyOptionScoreSerializer(many=True)
    links = LinkSerializer(many=True)


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Institution
        fields = ('id', 'name', 'initials')


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Program
        exclude = ('institution',)


class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Class
        exclude = ('program',)


class AvailableClassesSerializer(serializers.Serializer):
    sclass = ClassSerializer()
    study = StudySerializer()
    total_students = serializers.IntegerField(min_value=0)
    total_answered = serializers.IntegerField(min_value=0)
    links = LinkSerializer(many=True)


class StudentSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    sclass = ClassSerializer(read_only=True)

    class Meta:
        model = models.Student
        fields = ('id', 'email', 'first_name', 'last_name', 'sclass')

################### Student's Synthetic Report Serializers ###################

class StudyOptionSerialiser(serializers.ModelSerializer):
    class Meta:
        model = models.StudyOption
        fields = ('code', 'description')


class StudyWithOptionSerializer(StudySerializer):
    options = StudyOptionSerialiser(many=True)
    class Meta:
        model = StudySerializer.Meta.model
        fields = StudySerializer.Meta.fields + ('options',)


class StudentWithOptionScoreSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    scores = StudyOptionScoreSerializer(many=True)
    class Meta:
        model = models.Student
        fields = ('email', 'first_name', 'last_name', 'scores')


################### Professor's Synthetic Report Serializers ###################

class StudyOptionScoreWithStudentCountSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=100)
    value = serializers.FloatField()
    count = serializers.FloatField()


class StudyWithAverageStudyOptionByClassSerializer(serializers.Serializer):
    acronym = serializers.CharField(max_length=2)
    description = serializers.CharField(max_length=100)
    options = StudyOptionScoreWithStudentCountSerializer(many=True)


class ProfessorSyntheticReportSerializer(serializers.Serializer):
    study = StudyWithAverageStudyOptionByClassSerializer()
    sclass = ClassSerializer()


################### Professor's Analytical Report Serializers ###################

class StudyOptionWithStudentScoreSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=100)
    students = StudentWithOptionScoreSerializer(many=True)


class StudyWithStudentStudyOptionScoreSerializer(serializers.Serializer):
    acronym = serializers.CharField(max_length=2)
    description = serializers.CharField(max_length=100)
    options = StudyOptionWithStudentScoreSerializer(many=True)


class ProfessorAnalyticalReportSerializer(serializers.Serializer):
    study = StudyWithStudentStudyOptionScoreSerializer()
    sclass = ClassSerializer()
