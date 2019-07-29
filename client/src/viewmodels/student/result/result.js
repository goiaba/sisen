import { inject } from 'aurelia-framework';
import { CompositionTransaction } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import Chart from 'chart.js';
import 'resources/datatable';

@inject(AuthService, AsyncHttpClient, CompositionTransaction)
export class Result {
  constructor(authService, asyncHttpClient, compositionTransaction) {
    // https://github.com/aurelia/framework/issues/367
    this.compositionTransactionNotifier = compositionTransaction.enlist();
    this.ahc = asyncHttpClient;
    this.authService = authService;
    this.result = {};
    this.chartType = 'bar';
    this.chartOptions = {
      responsive: true,
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
    let resultPromise = null;
    if (routeConfig && routeConfig.settings.result) {
      resultPromise = new Promise((resolve) => {
        this.result = routeConfig.settings.result;
        resolve();
      });
    } else {
      resultPromise = this.ahc.get(config.student.resultUrl, { 'studyId': params.studyId })
        .then((response) => this.result = response.content);
    }
    resultPromise.then(() => {
      // build chart data
      this.chartData.labels = this.result.study_option_scores.map((option) => {return option.description});
      this.chartData.datasets[0].data = this.result.study_option_scores.map((option) => {return option.value * 100});
      this.chartData.datasets[0].label = this.result.study.description;
      // done loading data, allow the attached() hook to fire
      this.compositionTransactionNotifier.done();
    });
  }

  attached() {
    $('.table').DataTable({ paging: false, searching: false, info: false, buttons: [], order: [[1, 'desc']] });
  }

  toHome() {
    this.authService.router.navigate('home');
  }
}
