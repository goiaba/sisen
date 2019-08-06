import { inject } from 'aurelia-framework';
import AuthService from 'services/AuthService';
import config from 'services/config';
import { Router } from 'aurelia-router';

@inject(AuthService, Router)
export class PasswordResetRequest {

  constructor(authService, router) {
    this.authService = authService;
    this.router = router;
    this.passwordResetRequest = {};
  }

  activate(params, routeConfig) {

  }

  attached() {
    $('#request').on('hidden.bs.collapse', () =>
      $('#response-message').collapse('show'));
  }

  requestPasswordReset(form) {
    if (form.checkValidity()) {
      this.passwordResetRequest.clientViewUrl = this.router.routes.find((r) => r.name === 'password-reset-confirmation').href;
      this.authService.ahc.post(config.passwordResetRequestUrl, this.passwordResetRequest)
      .then((response) => {
        const status = response.content.status;
        if (status === 'OK') {
          $('#request').collapse('hide');
        } else {
          this.authService.ahc.messageHandler.renderMessage(
            'Ocorreu uma falha durante a solicitação de alteração da sua senha.' +
            ' Por favor, entre em contato com o administrador.', 'error');
        }
      });
    } else {
      form.classList.add('was-validated');
    }
  }

  toLogin() {
    this.authService.router.navigate('login');
  }
}
