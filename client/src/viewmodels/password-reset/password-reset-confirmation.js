import { inject, NewInstance } from 'aurelia-framework';
import AuthService from 'services/AuthService';
import config from 'services/config';
import { observable } from 'aurelia-framework';
import {SimpleValidationRenderer} from 'resources/simple-validation-renderer';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {validationMessages} from 'aurelia-validation';
import { Router } from 'aurelia-router';

@inject(AuthService, Router, NewInstance.of(ValidationController))
export class PasswordReset {

  constructor(authService, router, validationController) {
    this.authService = authService;
    this.router = router;
    this.validationController = validationController;
    this.validationController.addRenderer(new SimpleValidationRenderer());
    this.passwordReset = {};
    this.password_check = '';
    this.configureValidationRules();
  }

  configureValidationRules() {
    validationMessages['required'] = `\${$displayName} é um campo obrigatório`;
    ValidationRules.customRule(
      'passwordsMatch',
      (value, obj) => value === obj.passwordReset.password,
      'As senhas digitadas não conferem'
    );
    ValidationRules
      .ensure('password_check').displayName('Verificação de Senha').required()
        .then()
        .satisfiesRule('passwordsMatch')
      .on(this);
    ValidationRules
      .ensure('password').displayName('Senha').required()
      .on(this.passwordReset);
  }

  activate(params, routeConfig) {
    if (params && params.token) {
      this.passwordReset.token = params.token;
    } else {

    }
  }

  resetPassword() {
    this.validationController.validate().then(result => {
      if(result.valid) {
        this.authService.ahc.post(config.passwordResetConfirmUrl, this.passwordReset)
        .then((response) => {
          const status = response.content.status;
          if (status === 'OK') {
            this.authService.ahc.messageHandler.renderMessage(
              'Senha alterada com sucesso. Redirecionando para a página de login.', 'success'
            ).then(() => this.toLogin());
          } else {
            this.authService.ahc.messageHandler.renderMessage(
              'Ocorreu uma falha durante a solicitação de alteração da sua senha.' +
              ' Por favor, entre em contato com o administrador.', 'error');
          }
        });
      }
    });
  }

  toLogin() {
    this.authService.router.navigate('login');
  }
}
