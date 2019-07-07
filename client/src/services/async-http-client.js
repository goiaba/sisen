import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import config from 'services/config';
import MessageHandler from 'resources/message-handler';

import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginStatus} from './messages';

@inject(HttpClient, EventAggregator, MessageHandler)
export default class AsyncHttpClient {

  constructor(httpClient, ea, mh) {
    this.ea = ea;
    this.messageHandler = mh;
    this.http = httpClient;
    this.http.configure(http => {
			http.withBaseUrl(config.baseUrl);
      http.withInterceptor(new HttpErrorInterceptor());
		});
  }

  get(url, parameters = {}) {
    url = this.parseUrl(url, parameters);
    return new Promise((res, rej) => this.http.get(url)
      .then((response) => res(response))
      .catch((error) => {
        this.handleError(error);
        rej(error);
      }));
  }

  post(url, obj, parameters = {}) {
    url = this.parseUrl(url, parameters);
    return new Promise((res, rej) => this.http.post(url, obj)
      .then((response) => res(response))
      .catch((error) => {
        this.handleError(error);
        rej(error);
      }));
  }

  handleError(error) {
    let messages = [];
    if (error.responseType === 'json') {
      const responseJson = JSON.parse(error.response);
      if (responseJson.detail) {
        messages.push(responseJson.detail);
      } else if (responseJson.non_field_errors) {
        responseJson.non_field_errors.forEach((el) => messages.push(el));
      } else {
        Object.keys(responseJson).forEach((key) => messages.push(responseJson[key]));
      }
    } else if (error.message) {
      messages.push(error.message);
    } else if (error.statusCode === 404) {
      messages.push('O recurso requisitado não existe.');
    } else if (error.statusText) {
      messages.push(error.statusText);
    } else {
      messages.push('Ocorreu um erro ao processar a requisição.');
    }

    messages.forEach((el) => this.messageHandler.renderMessage(el, 'error'));
  }

  parseUrl(url, parameters) {
    for (var param of Object.keys(parameters)) {
      url = url.replace(new RegExp(`\\\$\\\{${param}\\\}`, "g"), parameters[param]);
    }
    return url;
  }
}

class HttpErrorInterceptor {
  responseError(error) {
    if (error.statusCode === 0) {
      throw new Error("Não foi possível conectar-se ao servidor.");
    }
    throw error;
  }
}
