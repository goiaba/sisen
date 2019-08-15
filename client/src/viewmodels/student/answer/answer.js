import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import { Router } from 'aurelia-router';

@inject(AuthService, AsyncHttpClient, Router)
export class Answer {

  constructor(authService, asyncHttpClient, router) {
    this.questions = [];
    this.answers = [];
    this.ahc = asyncHttpClient;
    this.authService = authService;
    this.router = router;
  }

  activate(params, routeConfig) {
    this.studyId = params.studyId;
    this.ahc.get(config.student.answerUrl, { 'studyId': this.studyId })
      .then((response) => response.content)
      .then((data) => {
        this.description = data.description;
        this.questions = data.questions.sort((f, s) => f.position - s.position);
      });
  }

  sortAnswers(answers) {
    return answers.sort((f, s) => s.value - f.value);
  }

  submit(form) {
    if (form.checkValidity()) {
      const payload = { 'answers': this.answers };
      const studyId = { 'studyId': this.studyId };
      this.ahc.post(config.student.processAnswerUrl, payload, studyId)
        .then((response) => response.content)
        .then((result) => {
          const resultRoute = this.router.routes.find((r) => r.name === 'result');
          if (resultRoute) resultRoute.settings.result = result;
          this.authService.ahc.messageHandler
            .renderMessage('Questionário enviado com sucesso.' +
                           ' Redirecionando para a página de resultado.', 'success')
            .then(() => this.router.navigateToRoute('result', { 'studyId': this.studyId }));
        });
    } else {
      form.classList.add('was-validated');
      this.authService.ahc.messageHandler.renderMessage(
        'As questões em destaque não foram respondidas.' +
        ' Por favor, responda-as e tente enviar o' +
        ' questionário novamente.', 'warn');
    }
  }

  toHome() {
    this.authService.router.navigate('home');
  }

}
