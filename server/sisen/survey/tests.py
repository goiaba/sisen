import os
import csv
import sys
import pprint
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth.models import User
from django.test import TestCase
import sisen.survey.models as models
from sisen.settings import BASE_DIR
from sisen.survey.views.student import register_student, process_answer

class StudentAnswerLoad():

    def student_answers_load(self):
        factory = APIRequestFactory()
        result = {}
        files = {
            1: os.path.join(BASE_DIR, '../documentation/EA_answers.csv'),
            2: os.path.join(BASE_DIR, '../documentation/IM_answers.csv')
        }
        for study_id, file in files.items():
            result.update({ study_id: { 'processed': [], 'not_processed': [] } })
            with open(file) as csvfile:
                for line in csv.reader(csvfile, quotechar='"'):
                    if len(line) == 83: #number of expected items per line
                        if not User.objects.filter(email__icontains=line[1]):
                            request = factory.post(
                                '/api/v1/survey/signup',
                                self._create_register_student_request(line),
                                format='json')
                            register_student(request)
                        user = User.objects.get(email__icontains=line[1])
                        request = factory.post(
                            '/api/v1/survey/study/%s/process' % study_id,
                            self._create_process_answer_request(line, study_id),
                            format='json')
                        force_authenticate(request, user=user)
                        response = process_answer(request, study_id)
                        if response.status_code == 200:
                            result.get(study_id).get('processed').append(line[1])
                        else:
                            result.get(study_id).get('not_processed').append(
                                '%s: %s' % (line[1], response.data.get('detail')))
                    else:
                        result.get(study_id).get('not_processed').append(
                            '%s: %s' % (line[1], 'Formato inválido da linha'))
        print('Carga finalizada')
        pprint.pprint(result)

    def _create_process_answer_request(self, line, study_id):
        answers = { 'answers': [] }
        question = 1 if study_id == 1 else 81
        for answer in line[3:]:
            answers['answers'].append(
                { 'question': question, 'answer': int(answer)+1 }
            )
            question += 1
        return answers

    def _create_register_student_request(self, line):
        # timestamp = line[0]
        email = line[1]
        sclass = self._get_class_by_description(line[2])
        student = {
            "class": sclass.id,
            "first_name": email[:30],
            "last_name": email[:30],
            "email": email,
            "password":"123"
        }
        return student

    def _get_class_by_description(self, sclass_description):
        return models.Class.objects.get(description=sclass_description)
