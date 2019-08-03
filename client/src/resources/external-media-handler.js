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
}
