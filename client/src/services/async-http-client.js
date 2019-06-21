import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import config from 'services/config';

import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginStatus} from './messages';

@inject(HttpClient, EventAggregator)
export default class AsyncHttpClient {

  constructor(httpClient, ea) {
    this.ea = ea;
    this.requestErrorMessage = null;
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
        this.setRequestErrorMessage(error);
        rej(error);
      }));
  }

  post(url, obj, parameters = {}) {
    url = this.parseUrl(url, parameters);
    return new Promise((res, rej) => this.http.post(url, obj)
      .then((response) => res(response))
      .catch((error) => {
        this.setRequestErrorMessage(error);
        rej(error);
      }));
  }

  setRequestErrorMessage(error) {
    if (error.message) {
      this.requestErrorMessage = error.message;
    } else if (error.response) {
      const response = JSON.parse(error.response);
      if (response.non_field_errors) {
        this.requestErrorMessage = response.non_field_errors[0];
      } else if (response.detail) {
        this.requestErrorMessage = response.detail;
      }
    }
    setTimeout(() => this.requestErrorMessage = '', 5000);
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
      throw new Error("Could not contact server");
    }
    if (error.statusCode === 401) {
      console.dir(error);
      throw new Error(JSON.parse(error.response).detail);
    }
    // if (error.statusCode === 404) {
    //   // do 404 handling here
    // }
    throw error;
  }
}
