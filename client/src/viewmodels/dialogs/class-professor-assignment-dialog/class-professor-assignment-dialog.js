import config from 'services/config';
import {inject, autoinject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import AuthService from 'services/AuthService';
import Professor from 'model/professor';
import 'bootstrap-select/dist/js/bootstrap-select.min.js';

@inject(AuthService, DialogController)
export class ClassProfessorAssignmentDialog {
  heading = 'Atribuição de Professores';

  constructor(authService, dialogController) {
    this.authService = authService;
    this.dialogController = dialogController;
    this.classroom = {};
    this.availableProfessors = [];
  }

  attached() {
    $('.selectpicker').selectpicker();
  }

  activate(model) {
    this.classroom = model;
    // returning a promise makes the execution of this method be awaited!
    return this.authService.ahc.get(config.admin.getProfessorsByInstitutionAndProgramUrl,
                                    {'institutionId': model.program.institution.id, 'programId': model.program.id})
      .then((response) => response.content)
      .then((professors) => {
        let professor_ids = model.professors.map(p => p.id);
        this.availableProfessors = Professor.toListObject(professors).filter(p => !professor_ids.includes(p.id));
      });
  }
}
