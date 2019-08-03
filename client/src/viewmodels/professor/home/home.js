import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import AvailableClassroomStudy from 'model/available-classroom-study';
import {ExternalMediaHandler} from 'resources/external-media-handler';
import 'resources/datatable';

@inject(AuthService, AsyncHttpClient, ExternalMediaHandler)
export class Home {

  constructor(authService, asyncHttpClient, externalMediaHandler) {
    this.imageFilename = '';
    this.ahc = asyncHttpClient;
    this.authService = authService;
    this.eMH = externalMediaHandler;
  }

  active() {
  }

  attached() {
    this.eMH.externalAudioIFrameSrcSetter('audioGeneralInfoModal', 'audio-iframe');
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

  setEAImageSrc(studyOptionCode) {
    this.imageFilename = `/assets/images/professors/EA/${studyOptionCode}.png`;
  }
}
