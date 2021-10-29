import {inject, autoinject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import AuthService from 'services/AuthService';

@inject(AuthService, DialogController)
export class ClassRemovalDialog {
  heading = 'Gerência de Turma';

  constructor(authService, dialogController) {
    this.authService = authService;
    this.dialogController = dialogController;
  }

  activate(classes) {
    this.classesToRemove = classes;
  }
}
