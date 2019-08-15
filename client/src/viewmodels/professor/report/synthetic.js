import { inject } from 'aurelia-framework';
import { CompositionTransaction } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import StudyReportSynthetic from 'model/study-report-synthetic';
import Classroom from 'model/classroom';
import { Router } from 'aurelia-router';
import Chart from 'chart.js';
import 'resources/datatable';

@inject(AuthService, AsyncHttpClient, Router, CompositionTransaction)
export class Synthetic {
  constructor(authService, asyncHttpClient, router, compositionTransaction) {
    // https://github.com/aurelia/framework/issues/367
    this.compositionTransactionNotifier = compositionTransaction.enlist();
    this.ahc = asyncHttpClient;
    this.authService = authService;
    this.router = router;
    this.chartType = 'bar';
    this.chartOptions = {
      scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
      }
    };

    this.chartData = {
      labels: [],
      datasets: [{
        backgroundColor: [
          "#3366cc","#dc3912","#ff9900","#109618","#990099","#0099c6",
          "#dd4477","#66aa00","#b82e2e","#316395","#994499","#22aa99",
          "#aaaa11","#6633cc","#e67300","#8b0707","#651067","#329262",
          "#5574a6","#3b3eac","#b77322","#16d620","#b91383","#f4359e",
          "#9c5935","#a9c413","#2a778d","#668d1c","#bea413","#0c5922",
          "#743411"
        ]
      }]
    };
  }

  activate(params, routeConfig) {
    this.studyId = params.studyId;
    this.classId = params.classId;
    this.ahc.get(config.professor.syntheticReportUrl, { 'studyId': this.studyId, 'classId': this.classId })
      .then((response) => response.content)
      .then((data) => {
        this.study = StudyReportSynthetic.toObject(data.study);
        this.classroom = Classroom.toObject(data.sclass);
        // build chart data
        this.chartData.labels = this.study.options.map((option) => option.description);
        this.chartData.datasets[0].data = this.study.options.map((option) => option.count);
        this.chartData.datasets[0].label = 'Quantidade de alunos por habilidade';
        // done loading data, allow the attached() hook to fire
        this.compositionTransactionNotifier.done();
      });
  }

  attached() {
    $('.table').DataTable({ order: [[1, 'desc']] });
  }

  setImageSrc() {
    this.imageFilename = `/assets/images/professors/${this.study.acronym}/characteristics.png`;
  }

  toHome() {
    this.authService.router.navigate('home');
  }
}
