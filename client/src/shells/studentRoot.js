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
        route: 'home',
        name: 'home',
        href: '#/home',
        moduleId: PLATFORM.moduleName('viewmodels/student/home/home'),
        nav: false,
        title: 'Home'
      },
      {
        route: 'answer/:studyId',
        name: 'answer',
        href: '#/answer/${studyId}',
        moduleId: PLATFORM.moduleName('viewmodels/student/answer/answer'),
        nav: false,
        title: 'Answer'
      },
      {
        route: 'result/:studyId',
        name: 'result',
        href: '#/result/${studyId}',
        moduleId: PLATFORM.moduleName('viewmodels/student/result/result'),
        nav: false,
        title: 'Result'
      }
    ]);

    config.mapUnknownRoutes(instruction => {
      return PLATFORM.moduleName('viewmodels/student/home/home');
    });

    this.router = router;
  }
}
