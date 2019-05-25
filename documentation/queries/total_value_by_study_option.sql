-- Pontuaçao maxima por opçao de estudo
select q.study_option_id,
       sum(value)
  from survey_answer a,
       survey_answer_questions qa,
       survey_question q
 where a.id = qa.answer_id
   and q.id = qa.question_id
   and q.study_id=1
group by q.study_option_id;

--print(models.Question.objects.values(s_option_id=F('study_option__id')).annotate(total=Sum('answers__value')).filter(study__id=1).query)

SELECT "survey_question"."study_option_id" AS "s_option_id",
        SUM("survey_answer"."value") AS "total"
   FROM "survey_question"
         LEFT OUTER JOIN "survey_answer_questions" ON ("survey_question"."id" = "survey_answer_questions"."question_id")
         LEFT OUTER JOIN "survey_answer" ON ("survey_answer_questions"."answer_id" = "survey_answer"."id")
   WHERE "survey_question"."study_id" = 1
GROUP BY "survey_question"."study_option_id"
