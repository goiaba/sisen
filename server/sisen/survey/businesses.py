from django.db.models import Sum, Max, F, FloatField
from functools import reduce
import sisen.survey.dto as dto
import sisen.survey.models as models

def process_answer(study, student):
    submit_datetime = student.student_answer_logs.get(study=study).submit_datetime
    return dto.StudyWithMessageAndStudentOptionScore(
        submit_datetime,
        study,
        '<font color="red">TODO: This html should be got from a .properties FILE</font>',
        _calculate_student_score_by_study(study, student),
        [])

def student_scores(study, student):
    return dto.StudentWithOptionScore(
        student.user,
        _calculate_student_score_by_study(study, student))

def professor_analytical_report(study, sclass):
    student_with_option_score_dict = _get_student_by_option_max_score_dict(study, sclass)

    study_option_dto_list = []
    for so in models.StudyOption.objects.filter(study=study):
        study_option_dto_list.append(
            dto.StudyOptionWithStudentScore(
                so,
                student_with_option_score_dict.get(so.code, [])
            )
        )
    study_dto = dto.StudyWithStudentStudyOptionScore(study, study_option_dto_list)
    return dto.ProfessorAnalyticalReport(study_dto, sclass)

def professor_synthetic_report(study, sclass):
    count_of_students_that_have_answered_study = models.StudentAnswer.objects \
        .values(student_count=F('student__id')) \
        .filter(student__sclass=sclass, study=study) \
        .distinct() \
        .count()
    sum_of_students_study_option_score = {
        item['studyoption_id']: item['score'] for item in
            models.StudentAnswer.objects.values(
                studyoption_id=F('question__study_option__id'),
            ).annotate(
                score=Sum('answer__value')
            ).filter(
                student__sclass=sclass,
                study=study
            )
    }
    study_options_max_scores = _multiply_max_scores_by_students_count(
        study,
        count_of_students_that_have_answered_study
    )
    student_with_option_score_dict = _get_student_by_option_max_score_dict(study, sclass)
    study_option_dto_list = []
    for so in models.StudyOption.objects.filter(study=study):
        study_option_dto_list.append(
            dto.StudyOptionScoreWithStudentCount(
                so.code,
                so.description,
                _average_score(
                    so.id,
                    sum_of_students_study_option_score,
                    study_options_max_scores
                ),
                len(student_with_option_score_dict.get(so.code, []))
            )
        )
    study_dto = dto.StudyWithAverageStudyOptionByClass(study, study_option_dto_list)
    return dto.ProfessorSyntheticReport(study_dto, sclass)

def _get_student_by_option_max_score_dict(study, sclass):
    student_with_option_score_dict = {}
    for student in sclass.students.all():
        student_with_option_score = student_scores(study, student)
        if student_with_option_score.scores:
            _add_or_update_list(student_with_option_score_dict,
                max(student_with_option_score.scores,
                    key=lambda score: score.value).code,
                student_with_option_score)
    return student_with_option_score_dict

def _add_or_update_list(d, k, v):
    c = d.get(k)
    if c: c.append(v)
    else: d[k] = [v]

def _calculate_student_score_by_study(study, student):
    # Creates a dict like { studyoption_id1: max_score1, ..., studyoption_idN: max_scoreN }
    max_score_by_option = _get_study_options_max_scores(study)
    student_total_value_by_option = models.StudentAnswer.objects.values(
        studyoption_id=F('question__study_option__id'),
        code=F('question__study_option__code'),
        description=F('question__study_option__description')
    ).annotate(
        score=Sum('answer__value')
    ).filter(
          student=student,
          study=study
    )
    scores = []
    for item in student_total_value_by_option:
        id = item.get('studyoption_id')
        code = item.get('code')
        description = item.get('description')
        score = item.get('score')
        percentual_score = score/max_score_by_option.get(id)
        scores.append(dto.StudyOptionScore(code, description, percentual_score))
    return scores

def _get_study_options_max_scores(study):
    q = models.Question.objects.filter(
        study=study
    ).values(
        'id', studyoption_id=F('study_option__id')
    ).annotate(
        max_score=Max('answers__value', output_field=FloatField())
    )
    # iterates over sq items and generates a dict of the form {studyoption_id: max_score, ...}. Starts with an empty
    # dict as accumulator and, for each item in sq, updates max_score in this accumulator summing the current item
    # value to the already calculated one.
    return reduce(lambda a, e:
                  {**a, **{e.get('studyoption_id'): a.get(e.get('studyoption_id'), 0) + e.get('max_score')}},
                  q, {})

def _multiply_max_scores_by_students_count(study, count):
    return { k: v * count for k, v in _get_study_options_max_scores(study).items() }

def _average_score(study_option_id, sum_dict, max_dict):
    return sum_dict.get(study_option_id, 0)/max_dict.get(study_option_id, 1)
