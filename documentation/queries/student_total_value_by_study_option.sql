-- Pontuaçao do estudante
select so.id,
       so.description,
       sum(a.value)
  from survey_studentanswer sa,
       survey_question q,
       survey_answer a,
       survey_studyoption so
 where sa.question_id = q.id
   and sa.answer_id = a.id
   and q.study_option_id = so.id
group by so.code;

--print(models.StudentAnswer.objects.values(x=F('question__study_option__id'), y=F('question__study_option__description')).annotate(sum=Sum('answer__value')).filter(student__id=1,study__id=1).query)

  SELECT "survey_question"."study_option_id" AS "x",
         "survey_studyoption"."description" AS "y",
         SUM("survey_answer"."value") AS "sum"
    FROM "survey_studentanswer"
         INNER JOIN "survey_question" ON ("survey_studentanswer"."question_id" = "survey_question"."id")
         INNER JOIN "survey_studyoption" ON ("survey_question"."study_option_id" = "survey_studyoption"."id")
         INNER JOIN "survey_answer" ON ("survey_studentanswer"."answer_id" = "survey_answer"."id")
   WHERE ("survey_studentanswer"."student_id" = 1
     AND "survey_studentanswer"."study_id" = 1)
GROUP BY "survey_question"."study_option_id",
         "survey_studyoption"."description";
