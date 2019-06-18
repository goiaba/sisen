// import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.css';
import { inject } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { RoleChooserDialog } from 'viewmodels/role-chooser-dialog/role-chooser-dialog';
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
      } else {
        console.log('Will popup the role chooser modal.')
        this.showDialog();
      }
    } else {
      console.log(`Role "${this.auth.session.role}" already in use.`);
      this.auth.setRoot();
    }
  }

  showDialog() {
    this.dialogService.open({ viewModel: RoleChooserDialog, model: null, lock: true }).whenClosed(response => {
        if (!response.wasCancelled) {
          const role = response.output;
          this.auth.setRole(role);
        } else {
          console.log('error choosing role.');
        }
      });
  }
}

export class ToJSONValueConverter {
  toView(obj) {
    if (obj) {
      return JSON.stringify(obj, null, 2)
    }
  }
}
