import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import AvailableClassroomStudy from 'model/available-classroom-study';
import 'resources/datatable';

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
            this.availableClassroomStudies = data.map((classStudy) => AvailableClassroomStudy.toObject(classStudy));
          })
          .then((data) => {
            $('.table').DataTable();
          });
      });
  }

}
