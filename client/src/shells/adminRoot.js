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
        nav: true,
        title: 'Home'
      }
    ]);

    config.mapUnknownRoutes(instruction => {
      return PLATFORM.moduleName('viewmodels/admin/home/home');
    });

    this.router = router;
  }
}
