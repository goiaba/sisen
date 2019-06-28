import AuthService from 'services/AuthService';
import { Router } from 'aurelia-router';
import { PLATFORM } from 'aurelia-framework';

export function configure(aurelia) {
	aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .globalResources('styles/styles.css')
		.plugin(PLATFORM.moduleName('aurelia-dialog'))
    .plugin(PLATFORM.moduleName('aurelia-validation'));

  aurelia.start().then(() => {
	  	var auth = aurelia.container.get(AuthService);
      if (auth.isAuthenticated()) {
        aurelia.setRoot(PLATFORM.moduleName('viewmodels/app/app'));
      } else {
        aurelia.setRoot(PLATFORM.moduleName('shells/openRoot')).then(() => {
          const router = aurelia.container.get(Router);
          router.navigate('login');
        });
      }
  	});
}
