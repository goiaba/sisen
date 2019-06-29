import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import AvailableStudy from 'model/available-study';
import 'datatables.net';

@inject(AuthService, AsyncHttpClient)
export class Home {

  constructor(authService, asyncHttpClient) {
    this.studies = [];
    this.ahc = asyncHttpClient;
    this.authService = authService;
  }

  attached() {
    this.ahc.get(config.entryPointUrl, { 'role': this.authService.session.role })
      .then((response) => response.content)
      .then((url) => {
        this.ahc.get(url)
          .then((response) => response.content)
          .then((data) => {
            this.availableStudies = data.map((study) => AvailableStudy.toObject(study));
          })
          .then(() => {
            if (!$.fn.dataTable.isDataTable('#studyTable')) {
              $('#studyTable').dataTable({ paging: false, searching: false, info: false });
            }
          })
      });
  }

  addLink(study, link) {
    return study.links.filter((l) => l.rel === link).length > 0;
  }
}
