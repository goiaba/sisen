import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import AvailableStudy from 'model/available-study';

@inject(AuthService, AsyncHttpClient)
export class Home {

  constructor(authService, asyncHttpClient) {
    this.studies = [];
    this.ahc = asyncHttpClient;
    this.authService = authService;
  }

  attached() {
    this.ahc.get(config.entryPointUrl)
      .then((response) => response.content)
      .then((url) => {
        this.ahc.get(url)
          .then((response) => response.content)
          .then((data) => {
            this.availableStudies = data.map((study) => AvailableStudy.toObject(study));
            console.dir(this.availableStudies);
          });
      });
  }
}
