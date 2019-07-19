import { inject, PLATFORM } from 'aurelia-framework';
import AuthService from 'services/AuthService';
@inject(AuthService)
export class Login {

  constructor(authService) {
    this.authService = authService;
  }

  login(form) {
    if (form.checkValidity()) {
      this.authService.login(this.email, this.password);
    } else {
      form.classList.add('was-validated');
    }
  }

  toSignUp() {
    this.authService.router.navigate('signup');
  }
}
