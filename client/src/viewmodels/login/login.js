import { inject, PLATFORM } from 'aurelia-framework';
import AuthService from 'services/AuthService';

@inject(AuthService)
export class Login {

  constructor(authService) {
    this.authService = authService;
  }

  activate() {
    this.email = 'student1@gmail.com';
    this.password = 'admin';
  }

  login() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password);
    } else {
      this.authService.ahc.messageHandler.renderMessage(
        'E-mail e senha são campos obrigatórios', 'error');
    }
  }

  toSignUp() {
    this.authService.router.navigate('signup');
  }
}
