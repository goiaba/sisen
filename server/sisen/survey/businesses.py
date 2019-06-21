from django.db.models import Sum, F
from sisen.survey.dto import StudyWithMessageAndStudentOptionScore, StudyOptionScore, StudentWithOptionScore
import sisen.survey.models as models

def _calculate_student_score_by_study(study, student):
    # Creates a dict like { studyoption_id1: max_score1, ..., studyoption_idN: max_scoreN }
    total_value_by_option = { item['studyoption_id']: item['max_score'] for item in
        models.Question.objects.values(
            studyoption_id=F('study_option__id')
        ).annotate(
            max_score=Sum('answers__value')
        ).filter(
            study=study
        )
    }
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
        percentual_score = "{:.0%}".format(score/total_value_by_option.get(id))
        scores.append(StudyOptionScore(code, description, percentual_score))
    return scores

def process_answer(study, student):
    submit_datetime = student.student_answer_logs.get(study=study).submit_datetime
    return StudyWithMessageAndStudentOptionScore(
        submit_datetime.strftime('%d/%m/%Y - %H:%M:%S'),
        study,
        'TODO: GET MESSAGE FROM .properties FILE',
        _calculate_student_score_by_study(study, student),
        [])

def student_scores(study, student):
    return StudentWithOptionScore(
        student.user,
        _calculate_student_score_by_study(study, student))
