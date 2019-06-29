import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import 'resources/datatable';

@inject(AuthService, AsyncHttpClient)
export class Result {
  constructor(authService, asyncHttpClient) {
    this.ahc = asyncHttpClient;
    this.authService = authService;
  }

  activate(params, routeConfig) {
    if (routeConfig.settings.result) {
      this.result = routeConfig.settings.result;
    } else {
      this.ahc.get(config.student.resultUrl, { 'studyId': params.studyId })
        .then((response) => response.content)
        .then((result) => {
          this.result = result;
         })
        .then(() => {
          if (!$.fn.dataTable.isDataTable('#resultTable')) {
            $('#resultTable').dataTable({
              paging: false, searching: false, info: false,
              order: [[1, 'desc']]
            });
          }
        });
    }
  }

  toHome() {
    this.authService.router.navigate('home');
  }
}
