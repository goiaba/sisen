import {inject, autoinject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import AuthService from 'services/AuthService';

@inject(AuthService, DialogController)
export class RoleChooserDialog {
  selectedRole = '';
  availableRoles = [];

  constructor(authService, dialogController) {
    this.authService = authService;
    this.dialogController = dialogController;
  }

  activate(selectedRole) {
    this.selectedRole = selectedRole;
    this.availableRoles = this.authService.session.user.groups || [];
  }
}
