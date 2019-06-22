import { inject } from 'aurelia-framework';
import AuthService from 'services/AuthService';
import config from 'services/config';
import { observable } from 'aurelia-framework';

@inject(AuthService)
export class SignUp {

  @observable selectedInstitution = '';
  @observable selectedProgram = '';

  constructor(authService) {
    this.authService = authService;
  }

  activate() {
    this.authService.ahc.get(config.getInstitutionsUrl)
      .then((response) => response.content)
      .then((institutions) => this.institutions = institutions);
    this.signUpObj = {
      'first_name': 'Bruno',
      'last_name': 'Correa',
      'email': 'brunogmc@gmail.com',
      'password': '123',
      'password_check': '123',
      'class': 1
    }
  }

  selectedInstitutionChanged(newValue, oldValue) {
    if (!newValue) {
      this.programs = [];
      return;
    }
    const ids = { 'institutionId': newValue.id };
    this.authService.ahc.get(config.getProgramsByInstitutionUrl, ids)
      .then((response) => response.content)
      .then((programs) => this.programs = programs);
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
      .then((classes) => this.classes = classes);
  }

  signUp() {
    this.authService.ahc.post(config.student.signupUrl, this.signUpObj)
      .then(() => this.login());
  }

  login() {
    this.authService.router.navigate('login');
  }
}
