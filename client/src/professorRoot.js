import { inject, Aurelia } from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

@inject(Aurelia)
export class ProfessorRoot {

  constructor(au) {
    this.aurelia = au;
  }

  configureRouter(config, router) {
    config.map([
      {
        route: 'home',
        name: 'home',
        moduleId: PLATFORM.moduleName('viewmodels/professor/home/home'),
        nav: true,
        title: 'Home'
      }
    ]);

    config.mapUnknownRoutes(instruction => {
      return PLATFORM.moduleName('viewmodels/professor/home/home');
    });

    this.router = router;
  }
}
