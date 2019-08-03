import config from 'services/config';
import { inject } from 'aurelia-framework';
import AsyncHttpClient from 'services/async-http-client';

@inject(AsyncHttpClient)
export class ExternalMediaHandler {
  constructor(asyncHttpClient) {
    this.ahc = asyncHttpClient;
  }

  getExternalVideoLink(mediaId) {
    const videoId = config.externalMediaHandler.idMediaMap.video[mediaId];
    const url = this.ahc.parseUrl(config.externalMediaHandler.videoServerUrl, { 'videoId': videoId })
    return url;
  }

  getExternalAudioLink(mediaId) {
    const trackId = config.externalMediaHandler.idMediaMap.audio[mediaId];
    const url = this.ahc.parseUrl(config.externalMediaHandler.audioServerUrl, { 'trackId': trackId })
    return url;
  }

  externalAudioIFrameSrcSetter(modalId, iframeId) {
    $(`#${modalId}`).on('shown.bs.modal', (event) => {
      const targets = $(event.target).find(`[id^="${iframeId}"]`)
      for (let target of targets) {
        if (target.src === 'about:blank') {
          const mediaId = target.dataset && target.dataset.mediaid;
          if (mediaId) {
            $(event.target).find(`#${target.id}`).attr('src', this.getExternalAudioLink(mediaId));
          }
        }
      }
    });
  }
}
