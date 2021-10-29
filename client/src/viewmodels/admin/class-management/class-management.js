import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import { DialogService } from 'aurelia-dialog';
import Classroom from 'model/classroom';
import Professor from 'model/professor';
import { ClassRemovalDialog } from 'viewmodels/dialogs/class-removal-dialog/class-removal-dialog';
import { ClassEditDialog } from 'viewmodels/dialogs/class-edit-dialog/class-edit-dialog';
import { ClassProfessorAssignmentDialog } from 'viewmodels/dialogs/class-professor-assignment-dialog/class-professor-assignment-dialog';
import 'resources/datatable';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-select/js/dataTables.select.min.js';

@inject(AuthService, AsyncHttpClient, DialogService)
export class ClassManagement {

  constructor(authService, asyncHttpClient, dialogService) {
    this.ahc = asyncHttpClient;
    this.authService = authService;
    this.dialogService = dialogService;
  }

  activate() {
    const that = this;
    this.ahc.get(config.admin.getClassesUrl)
      .then((response) => response.content)
      .then((classes) => {
        this.datatable = $('.table').DataTable({
          data: Classroom.toListObject(classes),
          rowId: "id",
          columns: [
            { data: "program.institution.id" },
            { data: "program.id" },
            { data: "id" },
            { data: "professors" },
            { data: "program.institution.initials", title: "Instituição" },
            { data: "program.name", title: "Programa" },
            { data: "description", title: "Turma" },
            { data: "semester", title: "Semestre" },
            { data: "year", title: "Ano" },
            {
              data: null,
              title: "Ações",
              searchable: false,
              sortable: false,
              className: "not-selectable",
              defaultContent:
                "<a class=\"btn btn-light btn-sm btn-edit\"><span class=\"oi oi-pencil\" title=\"Editar Turma\" aria-hidden=\"true\"></span></a>&nbsp;" +
                "<a class=\"btn btn-light btn-sm btn-assign\"><span class=\"oi oi-wrench\" title=\"Atribuir Professor\" aria-hidden=\"true\"></span></a>"
            }
          ],
          order: [[5, "asc"], [8, "desc"], [7, "desc"], [6, "asc"]],
          columnDefs: [{ targets: [0, 1, 2, 3], visible: false, searchable: false }],
          select: true,
          buttons: [
            {
              text: 'Nova Turma',
              action: function() {
                that.dialogService.open({ viewModel: ClassEditDialog, model: null, lock: true }).whenClosed(response => {
                  if (!response.wasCancelled) {
                    const classroom = response.output;
                    const params = {
                      'institutionId': classroom.institution_id,
                      'programId': classroom.program_id
                    }
                    that.ahc.post(config.admin.createClassUrl, classroom, params)
                      .then((response) => response.content)
                      .then((newClass) => {
                        this.row.add(Classroom.toObject(newClass)).draw();
                        that.ahc.messageHandler.renderMessage('Nova turma cadastrada com sucesso.', 'info');

                      });
                  }
                });
              }
            },
            {
              text: 'Remover Selecionados',
              action: function() {
                const selectedRows = this.rows({ selected: true }).data().toArray();
                if (selectedRows.length > 0) {
                  const selectedClassrooms = selectedRows.map((row) => Classroom.toObject(row));
                  that.dialogService.open({ viewModel: ClassRemovalDialog, model: selectedClassrooms, lock: true }).whenClosed(response => {
                    if (!response.wasCancelled) {
                      const classIds = selectedRows.map((row) => row.id);
                      that.ahc.delete(config.admin.deleteClassUrl, { 'classIds': classIds })
                        .then(() => this.rows({ selected: true }).remove().draw());
                    }
                  });
                } else {
                  that.ahc.messageHandler.renderMessage('Selecione as turmas que deseja remover.', 'info');
                }
              }
            }
          ]
        })
      });
  }

  attached() {
    $('.table tbody').on('click', '.btn-edit', (e) => {
      const row = this.datatable.row($(e.target).parents('tr'));
      const classroom = row.data();
      this.dialogService.open({ viewModel: ClassEditDialog, model: classroom, lock: true }).whenClosed(dialog => {
        if (!dialog.wasCancelled) {
          this.authService.ahc.patch(config.admin.updateClassUrl, dialog.output, { 'classId':  dialog.output.id })
            .then((response) => {
              row.data(Classroom.toObject(dialog.output)).draw();
              this.authService.ahc.messageHandler.renderMessage(
                'Dados da turma atualizados com sucesso.', 'success');
            });
        }
      });
      e.stopPropagation();
    });
    $('.table tbody').on( 'click', '.btn-assign', (e) => {
      console.log('opening assign dialog');
      const row = this.datatable.row($(e.target).parents('tr'));
      this.dialogService.open({viewModel: ClassProfessorAssignmentDialog, model: row.data(), lock: true}).whenClosed(dialog => {
        if (!dialog.wasCancelled) {
          const updatedClassroom = dialog.output;
           this.authService.ahc.post(config.admin.updateClassProfessorAssignmentUrl, updatedClassroom.professors,
                                     {'classId':  updatedClassroom.id})
             .then((response) => response.content)
             .then((classroom) => {
               row.data(Classroom.toObject(classroom)).draw();
               this.authService.ahc.messageHandler.renderMessage(
                 'Alteração da atribuição de professores efetuada com sucesso.', 'success');
             });
        }
      });
      e.stopPropagation();
    });
  }
}
