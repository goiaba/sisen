import { inject } from 'aurelia-framework';
import { CompositionTransaction } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import StudyReportAnalytical from 'model/study-report-analytical';
import Classroom from 'model/classroom';
import { Router } from 'aurelia-router';
import 'resources/datatable';

@inject(AuthService, AsyncHttpClient, Router, CompositionTransaction)
export class Synthetic {
  constructor(authService, asyncHttpClient, router, compositionTransaction) {
    // https://github.com/aurelia/framework/issues/367
    this.compositionTransactionNotifier = compositionTransaction.enlist();
    this.ahc = asyncHttpClient;
    this.authService = authService;
    this.router = router;
  }

  activate(params, routeConfig) {
    this.studyId = params.studyId;
    this.classId = params.classId;
    this.ahc.get(config.professor.analyticalReportUrl, { 'studyId': this.studyId, 'classId': this.classId })
      .then((response) => response.content)
      .then((data) => {
        this.study = StudyReportAnalytical.toObject(data.study);
        this.classroom = Classroom.toObject(data.sclass);
        // needed to guarantee students options are printed on the same columnOrder
        // as study options
        this.columnOrder = this.study.options.map((option) => option.code);
        this.compositionTransactionNotifier.done();
      });
  }

  attached() {
    $('.table').DataTable({
      columnDefs: [
        { targets: 0, visible: false },
        { targets: 1, orderable: false }
      ],
      order: [[0, 'asc']],
      rowGroup: { dataSrc: 0 }
    });
  }

  toHome() {
    this.authService.router.navigate('home');
  }
}
