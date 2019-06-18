import AuthService from 'services/AuthService';
import { PLATFORM } from 'aurelia-framework';

export function configure(aurelia) {
	aurelia.use
    .standardConfiguration()
    .developmentLogging()
		.plugin(PLATFORM.moduleName('aurelia-dialog'));

  aurelia.start().then(() => {
	  	var auth = aurelia.container.get(AuthService);
	    const root = PLATFORM.moduleName(auth.isAuthenticated() ? 'app' : 'login');
	    aurelia.setRoot(root);
  	});
}
