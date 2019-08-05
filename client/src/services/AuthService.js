import { Aurelia, inject, PLATFORM } from 'aurelia-framework';
import config from 'services/config';
import {EventAggregator} from 'aurelia-event-aggregator';
import { RefreshJwtToken } from 'services/messages';
import { Router } from 'aurelia-router';
import AsyncHttpClient from './async-http-client';

@inject(Aurelia, AsyncHttpClient, EventAggregator, Router)
export default class AuthService {

  session = null

  constructor(aurelia, asyncHttpClient, eventAggregator, router) {
    this.app = aurelia;
    this.ahc = asyncHttpClient;
    this.ea = eventAggregator;
    this.router = router;
    this.loadActiveSessionIfValid();
    let that = this;
    this.ahc.http.configure(http => {
      http.withInterceptor(
        new HttpAuthenticationInterceptor(that));
    });
  }

  login(username, password) {
    return new Promise((resolve, reject) => this.ahc
      .post(config.authTokenUrl, { username, password })
      .then((response) => response.content)
      .then((session) => {
        this.session = session;
        this.session.token = new JwtToken(this.session.token);
        this.storeSession();
        this.configJwtTokenRefresh();
        this.app.setRoot(PLATFORM.moduleName('viewmodels/app/app'));
        resolve(session);
      }).catch((error) => {
        reject(error);
      })
    );
  }

  logout() {
    this.sessionCleanUp();
    this.app.setRoot(PLATFORM.moduleName('shells/openRoot')).then(() => {
      this.router.navigate('login');
    });
  }

  isAuthenticated() {
    return this.session !== null;
  }

  can(permission) {
    return true; // why not?
  }

  getFirstName() {
    return this.session.user.first_name;
  }

  getRole() {
    return this.session.role;
  }

  hasMultipleRoles() {
    return this.session.user.groups.length > 1;
  }

  changeRole() {
    this.session.role = '';
    this.app.setRoot(PLATFORM.moduleName('viewmodels/app/app'));
  }

  setRole(role) {
    this.session.role = role;
    localStorage[config.tokenName] = JSON.stringify(this.session);
    this.setRoot();
  }

  loadActiveSessionIfValid() {
    const session = JSON.parse(localStorage[config.tokenName] || null);
    if (!session) return;
    session.token = new JwtToken(session.token.value);
    if (session.token.isValid()) {
      this.session = session;
      this.configJwtTokenRefresh();
    } else {
      this.logout();
    }
  }

  configJwtTokenRefresh() {
    this.startJwtTokenValidityObserver();
    this.subscribeToJwtTokenValidityObserver();
  }

  startJwtTokenValidityObserver() {
    this.jwtTokenValidtyInterval = setInterval(() => {
      if (!this.session.token.isValid()) {
        this.logout();
      } else if (this.session.token.isExpiringSoon()) {
        this.publishJwtTokenRefresh();
      }
    }, 1000);
  }

  subscribeToJwtTokenValidityObserver() {
    this.ea.subscribe(RefreshJwtToken, msg => {
      if (msg.refresh === true) {
        const requestPayload = {
          'token': this.session.token.value,
          'orig_iat': this.session.token.getOrigIat()
        };
        this.ahc.post(config.authTokenRefreshUrl, requestPayload)
          .then((response) => {
            console.log('New token arrived at ' + new Date());
            this.session.token = new JwtToken(response.content.token);
            this.storeSession();
          });
      }
    });
  }

  sessionCleanUp() {
    this.session = null;
    clearInterval(this.jwtTokenValidtyInterval);
    localStorage.clear();
  }

  storeSession() {
    localStorage[config.tokenName] = JSON.stringify(this.session);
  }


  publishJwtTokenRefresh() {
    this.ea.publish(new RefreshJwtToken(true));
  }

  setRoot() {
    var navigateToHome = () => {
      if (!this.router.currentInstruction || this.router.currentInstruction.config.route == '/login')
        this.router.navigate('home');
    };
    if (this.session.role === 'Student') {
      this.app.setRoot(PLATFORM.moduleName('shells/studentRoot')).then(navigateToHome);
    } else if (this.session.role === 'Professor') {
      this.app.setRoot(PLATFORM.moduleName('shells/professorRoot')).then(navigateToHome);
    } else if (this.session.role === 'Admin') {
      this.app.setRoot(PLATFORM.moduleName('shells/adminRoot')).then(navigateToHome);
    } else {
      console.error(`There is no available root for "${this.session.role}" role`);
    }
  }
}

class JwtToken {
  constructor(token) {
      this.value = token;
      const tokenPayload = this.getJwtTokenPayload();
      this.origIat = tokenPayload.orig_iat * 1000;
      this.expiration = tokenPayload.exp * 1000;
      this.expirationAsUT = new Date(this.expiration).getTime();
  }

  isValid() {
    return new Date(this.expiration) > new Date();
  }

  isExpiringSoon() {
    const now = new Date().getTime();
    return this.expirationAsUT > now && now > this.expirationAsUT - 5000;
  }

  getOrigIat() {
    return this.getOrigIat;
  }

  getValue() {
    return this.value;
  }

  getJwtTokenPayload() {
    if (!this.value) return null;
    const encodedTokenPayload = this.value.split(/\./)[1];
    return JSON.parse(window.atob(encodedTokenPayload));
  }
}

class HttpAuthenticationInterceptor {
  constructor(authService) {
      this.authService = authService;
  }

  request(message) {
    if (this.authService.session && this.authService.session.token &&
      this.authService.session.token.value) {
      message.headers.add(config.headerAuthParam, `JWT ${this.authService.session.token.value}`);
    }
    return message;
  }
}
