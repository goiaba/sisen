from django.db import models
from django.contrib.auth.models import User
from django.core import validators


class Study(models.Model):
    acronym = models.CharField(unique=True, max_length=2)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.description


class StudyOption(models.Model):
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    study = models.ForeignKey(Study, on_delete=models.PROTECT, related_name='options')

    def __str__(self):
        return "%s: %s" % (self.study, self.description)

    class Meta:
       unique_together = ("study", "code")


class Question(models.Model):
    study = models.ForeignKey(Study, on_delete=models.PROTECT, related_name='questions')
    study_option = models.ForeignKey(StudyOption, on_delete=models.PROTECT, related_name='questions')
    position = models.PositiveSmallIntegerField(validators=[
        validators.MinValueValidator(1, 'A posição da questão precisa ser maior ou igual a %(limit_value)')
    ])
    text = models.CharField(max_length=2000)

    def __str__(self):
        return "%s - %s" % (self.position, self.text)

    class Meta:
       unique_together = ("study", "study_option", "position")


class Answer(models.Model):
    value = models.IntegerField()
    text = models.CharField(max_length=100)
    questions = models.ManyToManyField(Question, related_name='answers')

    def __str__(self):
        return self.text

    class Meta:
       unique_together = ("value", "text")


class Institution(models.Model):
    name = models.CharField(max_length=300, unique=True)
    initials = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return "%s (%s)" % (self.name, self.initials)


class Program(models.Model):
    name = models.CharField(max_length=100)
    institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='programs')

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ("name", "institution")


class Class(models.Model):
    code = models.CharField(max_length=50)
    description = models.CharField(max_length=50)
    semester = models.PositiveSmallIntegerField(validators=[
        validators.MinValueValidator(1, 'Semestre %(limit_value) é o menor valor possível'),
        validators.MaxValueValidator(2, 'Semestre %(limit_value) é o maior valor possível')
    ])
    year = models.PositiveSmallIntegerField(validators=[
        validators.MinValueValidator(2018, '%(limit_value) é o menor ano passado suportado'),
        validators.MaxValueValidator(2050, '%(limit_value) é o maior ano futuro suportado')
    ])
    program = models.ForeignKey(Program, on_delete=models.PROTECT, related_name='classes')

    def __str__(self):
        return self.description

    class Meta:
        unique_together = ("program", "code", "year", "semester")


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT)
    sclass = models.ForeignKey(Class, on_delete=models.PROTECT, related_name='students')

    def __str__(self):
        return "%s: %s %s, %s" % (self.user.email, self.user.first_name, self.user.last_name, self.sclass)


class Professor(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT)
    classes = models.ManyToManyField(Class, related_name='professors')
    programs = models.ManyToManyField(Program, related_name='professors')

    def __str__(self):
        return "%s: %s %s, %s" % (self.user.email, self.user.first_name, self.user.last_name, self.classes)


class StudentAnswer(models.Model):
    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name='student_answers')
    study = models.ForeignKey(Study, on_delete=models.PROTECT, related_name='student_answers')
    question = models.ForeignKey(Question, on_delete=models.PROTECT, related_name='student_answers')
    answer = models.ForeignKey(Answer, on_delete=models.PROTECT, related_name='student_answers')

    def __str__(self):
        return "%s: (%i, %i, %i)" % (self.student.user.email, self.study.id, self.question.id, self.answer.id)

    class Meta:
       unique_together = ("student", "study", "question")

class StudentAnswerLog(models.Model):
    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name='student_answer_logs')
    study = models.ForeignKey(Study, on_delete=models.PROTECT, related_name='student_answer_logs')
    submit_datetime = models.DateTimeField(auto_now_add=True, null=False)

    class Meta:
        unique_together = ("student", "study")
