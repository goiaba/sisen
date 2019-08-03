import { inject } from 'aurelia-framework';
import ComposeStudyDetail from './compose-study-detail';
import {ExternalMediaHandler} from 'resources/external-media-handler';

@inject(ExternalMediaHandler)
export class IMContent extends ComposeStudyDetail {
  constructor(externalMediaHandler) {
    const numberOfMainStudyOptionsToShow = 3;
    super(numberOfMainStudyOptionsToShow);
    this.eMH = externalMediaHandler;
  }

  attached() {
    this.eMH.externalAudioIFrameSrcSetter('audioGeneralInfoModal', 'audio-iframe-');
  }
}
