import { inject, Aurelia } from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

@inject(Aurelia)
export class StudentRoot {

  constructor(au) {
    this.aurelia = au;
  }

  configureRouter(config, router) {
    config.map([
      {
        route: 'login',
        name: 'login',
        href: '#/login',
        moduleId: PLATFORM.moduleName('viewmodels/login/login'),
        nav: false,
        title: 'Login'
      },
    ]);

    config.mapUnknownRoutes(instruction => {
      return PLATFORM.moduleName('viewmodels/login/login');
    });

    this.router = router;
  }
}
