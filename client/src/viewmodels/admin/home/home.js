import { inject } from 'aurelia-framework';
import AuthService from 'services/AuthService';

@inject(AuthService)
export class Home {
  constructor(authService) {
    this.authService = authService;
  }
}
