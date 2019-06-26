from django.db.models import Sum, F
import sisen.survey.dto as dto
import sisen.survey.models as models

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
    return { item['studyoption_id']: item['max_score'] for item in
        models.Question.objects.values(
            studyoption_id=F('study_option__id')
        ).annotate(
            max_score=Sum('answers__value')
        ).filter(
            study=study
        )
    }

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

def professor_synthetic_report(study, sclass):
    count_of_students_that_have_answered_study = models.StudentAnswer.objects \
        .values(student_count=F('student__id')) \
        .filter(student__sclass=sclass, study=study) \
        .distinct() \
        .count()
    sum_of_students_study_option_score = { item['studyoption_id']: item['score'] for item in
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
    study_option_dto_list = []
    for so in models.StudyOption.objects.filter(study=study):
        study_option_dto_list.append(
            dto.StudyOptionScore(
                so.code,
                so.description,
                _average_score(
                    so.id,
                    sum_of_students_study_option_score,
                    study_options_max_scores
                )
            )
        )
    study_dto = dto.StudyWithAverageStudyOptionByClass(study, study_option_dto_list)
    return dto.ProfessorSyntheticReport(study_dto, sclass)

def _multiply_max_scores_by_students_count(study, count):
    return { k: v * count for k, v in _get_study_options_max_scores(study).items() }

def _average_score(study_option_id, sum_dict, max_dict):
    return sum_dict.get(study_option_id, 0)/max_dict.get(study_option_id, 1)
