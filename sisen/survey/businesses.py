from django.db.models import Sum, F
from sisen.survey.dto import StudyResult, StudyOptionResult
import sisen.survey.models as models

def process_answer(study, student):
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
    results = []
    for item in student_total_value_by_option:
        id = item.get('studyoption_id')
        code = item.get('code')
        description = item.get('description')
        score = item.get('score')
        percentual_score = score/total_value_by_option.get(id)
        results.append(StudyOptionResult(code, description, percentual_score))
    return StudyResult(study.id, 'message', results, [])
