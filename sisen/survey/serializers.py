from rest_framework import serializers
import sisen.survey.models as models


class LinkSerializer(serializers.Serializer):
    rel = serializers.CharField()
    uri = serializers.CharField()
    method = serializers.CharField(max_length=10, default='GET')
    icon = serializers.CharField()


class AvailableStudySerializer(serializers.Serializer):
    acronym = serializers.CharField(max_length=2)
    description = serializers.CharField(max_length=100)
    links = LinkSerializer(many=True)


class AnswerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.Answer
        fields = ('id', 'value', 'text')


class QuestionSerializer(serializers.HyperlinkedModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = models.Question
        fields = ('id', 'position', 'text', 'answers')


class SurveyAnsweringSerializer(serializers.Serializer):
    questions = QuestionSerializer(many=True)
    links = LinkSerializer(many=True)


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StudentAnswer
        fields = '__all__'


class StudyOptionResultSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=100)
    value = serializers.FloatField(min_value=0, max_value=100)


class StudyResultSerializer(serializers.Serializer):
    study = serializers.CharField()
    message = serializers.CharField()
    study_option_results = StudyOptionResultSerializer(many=True)
    links = LinkSerializer(many=True)
