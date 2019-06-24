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
    let message;
    if (error.responseType === 'json') {
      const responseJson = JSON.parse(error.response);
      if (responseJson.detail) {
        message = responseJson.detail;
      } else if (responseJson.non_field_errors) {
        message = '<ul>';
        for (let field_error of responseJson.non_field_errors) {
          message += `<li>${field_error}</li>`;
        }
        message += '</ul>';
      }
    } else if (error.message) {
      message = error.message;
    } else if (error.statusCode === 404) {
      message = 'O recurso requisitado não existe.';
    } else if (error.statusText) {
      message = error.statusText;
    } else {
      message = 'Ocorreu um erro ao processar a requisição.';
    }
    this.messageHandler.renderMessage(message, 'error');
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
      throw new Error("Não foi possível se conectar ao servidor");
    }
    throw error;
  }
}
