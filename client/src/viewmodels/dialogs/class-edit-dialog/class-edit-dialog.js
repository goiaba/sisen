import {inject, observable} from 'aurelia-framework';
import config from 'services/config';
import {DialogController} from 'aurelia-dialog';
import AuthService from 'services/AuthService';
import Institution from 'model/institution';
import Program from 'model/program';
import Classroom from 'model/classroom';

@inject(AuthService, DialogController)
export class ClassEditDialog {
  heading = 'Gerenciar Turma';
  @observable selectedInstitution;
  @observable selectedProgram;

  constructor(authService, dialogController) {
    this.authService = authService;
    this.dialogController = dialogController;
    this.classroom = {};
  }

  attached() {
    $('.selectpicker').selectpicker();
  }

  activate(classroom) {
    this.authService.ahc.get(config.getInstitutionsUrl)
      .then((response) => response.content)
      .then((institutions) => {
        this.institutions = Institution.toListObject(institutions);
        if (classroom && classroom.program && classroom.program.institution) {
          this.heading = 'Alterar Turma';
          this.classroom = classroom;
          const institution = this.institutions.find((el) => el.id === classroom.program.institution.id);
          this.selectedInstitution = institution ? institution : null;
        } else if (this.institutions.length === 1) {
          this.heading = 'Criar Turma';
          this.selectedInstitution = this.institutions[0];
        }
      });
  }

  selectedInstitutionChanged(newValue, oldValue) {
    if (!newValue) {
      this.programs = [];
      return;
    }
    const ids = { 'institutionId': newValue.id };
    this.authService.ahc.get(config.getProgramsByInstitutionUrl, ids)
      .then((response) => response.content)
      .then((programs) => {
        this.programs = Program.toListObject(programs);
        if (this.classroom && this.classroom.program) {
          const program = this.programs.find((el) => el.id === this.classroom.program.id);
          this.selectedProgram = program ? program : null;
        } else if (this.programs.length === 1) {
          this.selectedProgram = this.programs[0];
        }
      });
  }

  selectedProgramChanged(newValue, oldValue) {
    if (newValue && newValue !== oldValue) {
      this.classroom.institution_id = newValue.institution.id;
      this.classroom.program_id = newValue.id;
    }
  }

  canDeactivate(result) {
    if (!result.wasCancelled) {
      const form = $('#classEditForm')[0];
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
      }
    }
  }
}
