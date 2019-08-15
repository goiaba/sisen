import { inject } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { RoleChooserDialog } from 'viewmodels/dialogs/role-chooser-dialog/role-chooser-dialog';
import AuthService from 'services/AuthService';

@inject(AuthService, DialogService)
export class App {
  constructor(authService, dialogService) {
  	this.auth = authService;
    this.dialogService = dialogService;
  }

  attached() {
    this.setRoleAndNavigateToRoot();
  }

  setRoleAndNavigateToRoot() {
    if (!this.auth.session.role) {
      const availableGroups = this.auth.session.user.groups;
      if (availableGroups.length === 1) {
        const role = availableGroups[0]
        console.log(`"${role}" was the only available role and was automatically chosen.`);
        this.auth.setRole(role);
      } else if (availableGroups.length > 1) {
        console.log('Will popup the role chooser modal.')
        this.showDialog();
      } else {
        this.auth.ahc.messageHandler
          .renderMessage(
            'Não existe papel associado ao usuário. A sessão será encerrada.', 'error')
          .then(() => this.auth.logout());
      }
    } else {
      console.log(`Role "${this.auth.session.role}" already in use.`);
      this.auth.setRoot();
    }
  }

  showDialog() {
    this.dialogService.open({ viewModel: RoleChooserDialog, model: null, keyboard: false }).whenClosed(response => {
        if (!response.wasCancelled) {
          const role = response.output;
          this.auth.setRole(role);
        } else {
          console.log('error choosing role.');
        }
      });
  }
}
