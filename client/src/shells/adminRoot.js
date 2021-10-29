import { inject, Aurelia } from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

@inject(Aurelia)
export class AdminRoot {

  constructor(au) {
    this.aurelia = au;
  }

  configureRouter(config, router) {
    config.map([
      {
        route: 'home',
        name: 'home',
        moduleId: PLATFORM.moduleName('viewmodels/admin/home/home'),
        nav: false,
        title: 'Home'
      },
      {
        route: 'class-management',
        name: 'class-management',
        moduleId: PLATFORM.moduleName('viewmodels/admin/class-management/class-management'),
        nav:false,
        title: 'Gerência de turmas'
      }
    ]);

    config.mapUnknownRoutes(instruction => {
      return PLATFORM.moduleName('viewmodels/admin/home/home');
    });

    this.router = router;
  }
}
