import { inject } from 'aurelia-framework';
import AuthService from 'services/AuthService';

@inject(AuthService)
export class Login {

  constructor(authService) {
    this.authService = authService;
  }

  activate() {
    this.username = 'student1';
    this.password = 'admin';
  }

  login() {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password);
    } else {
      this.error = 'Please enter a username and password.';
    }
  }
}
