import { inject, Aurelia } from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

@inject(Aurelia)
export class OpenRoot {

  constructor(au) {
    this.aurelia = au;
  }

  configureRouter(config, router) {
    config.map([
      {
        route: 'home',
        name: 'home',
        moduleId: PLATFORM.moduleName('viewmodels/professor/home/home'),
        nav: false,
        title: 'Home'
      },
      {
        route: 'report/class/:classId/study/:studyId/synthetic',
        name: 'answer',
        href: '#/report/class/${classId}/study/${studyId}/synthetic',
        moduleId: PLATFORM.moduleName('viewmodels/professor/report/synthetic'),
        nav: false,
        title: 'Synthetic'
      },{
        route: 'report/class/:classId/study/:studyId/analytical',
        name: 'answer',
        href: '#/report/class/${classroomId}/study/${studyId}/analytical',
        moduleId: PLATFORM.moduleName('viewmodels/professor/report/analytical'),
        nav: false,
        title: 'Analytical'
      }
    ]);

    config.mapUnknownRoutes(instruction => {
      return PLATFORM.moduleName('viewmodels/professor/home/home');
    });

    this.router = router;
  }
}
