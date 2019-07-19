import { inject, NewInstance } from 'aurelia-framework';
import AuthService from 'services/AuthService';
import config from 'services/config';
import { observable } from 'aurelia-framework';
import {SimpleValidationRenderer} from 'resources/simple-validation-renderer';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {validationMessages} from 'aurelia-validation';
import { Router } from 'aurelia-router';

@inject(AuthService, Router, NewInstance.of(ValidationController))
export class SignUp {

  @observable selectedInstitution = '';
  @observable selectedProgram = '';

  constructor(authService, router, validationController) {
    this.authService = authService;
    this.router = router;
    this.validationController = validationController;
    this.validationController.addRenderer(new SimpleValidationRenderer());
    this.signUpObj = {};
    this.password_check = '';
    this.configureValidationRules();
  }

  configureValidationRules() {
    validationMessages['required'] = `\${$displayName} é um campo obrigatório`;
    ValidationRules.customRule(
      'passwordsMatch',
      (value, obj) => value === obj.signUpObj.password,
      'As senhas digitadas não conferem'
    );
    ValidationRules
      .ensure('selectedInstitution').displayName('Instituição').required()
      .ensure('selectedProgram').displayName('Programa').required()
      .ensure('password_check').displayName('Verificação de Senha').required()
        .then()
        .satisfiesRule('passwordsMatch')
      .on(this);
    ValidationRules
      .ensure('class').displayName('Turma').required()
      .ensure('first_name').displayName('Nome').required()
      .ensure('last_name').displayName('Sobrenome').required()
      .ensure('email').displayName('e-mail').required()
        .email()
        // .then()
        // .satisfiesRule('emailNotAlreadyRegistered')
      .ensure('password').displayName('Senha').required()
      .on(this.signUpObj);
  }

  activate() {
    this.authService.ahc.get(config.getInstitutionsUrl)
      .then((response) => response.content)
      .then((institutions) => {
        this.institutions = institutions;
        if (this.institutions.length === 1)
          this.selectedInstitution = this.institutions[0];
      });
  }

  selectedInstitutionChanged(newValue, oldValue) {
    if (!newValue) {
      this.programs = [];
      return;
    }
    const ids = { 'institutionId': newValue.id };
    this.authService.ahc.get(config.getProgramsByInstitutionUrl, ids)
      .then((response) => response.content)
      .then((programs) => {
        this.programs = programs;
        if (this.programs.length === 1)
          this.selectedProgram = this.programs[0];
      });
  }

  selectedProgramChanged(newValue, oldValue) {
    if (!newValue) {
      this.classes = [];
      return;
    }
    const ids = {
      'institutionId': this.selectedInstitution.id,
      'programId': newValue.id
    };
    this.authService.ahc.get(config.getClassesByInstitutionAndProgramUrl, ids)
      .then((response) => response.content)
      .then((classes) => {
        this.classes = classes;
        if (this.classes.length === 1)
          this.signUpObj.class = this.classes[0];
      });
  }

  signUp() {
    this.validationController.validate().then(result => {
      if(result.valid) {
        this.authService.ahc.post(config.student.signupUrl, this.signUpObj)
        .then((response) => response.content)
        .then((result) => {
          const loginRoute = this.router.routes.find((r) => r.name === 'login');
          if (loginRoute) loginRoute.settings.studentEmail = result.email;
          this.authService.ahc.messageHandler
            .renderMessage(
              'Registro efetuado com sucesso. Redirecionando para a página de login.', 'success')
            .then(() => this.toLogin());
        });
      }
    });
  }

  toLogin() {
    this.authService.router.navigate('login');
  }
}
