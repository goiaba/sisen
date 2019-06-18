import { Aurelia, inject, PLATFORM } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import AsyncHttpClient from './async-http-client';
import config from 'services/config';
import { RefreshJwtToken } from 'services/messages';

@inject(Aurelia, AsyncHttpClient, EventAggregator)
export default class AuthService {

	session = null

	constructor(aurelia, asyncHttpClient, eventAggregator) {
		this.app = aurelia;
		this.ahc = asyncHttpClient;
		this.ea = eventAggregator;
		this.loadActiveSessionIfValid();
	}

	login(username, password) {
		return new Promise((resolve, reject) => this.ahc
			.post(config.authTokenUrl, { username, password })
			.then((response) => response.content)
			.then((session) => {
				this.session = session;
				this.session.token = new JwtToken(this.session.token);
				this.storeSession();
				this.updateAuthInterceptor();
				this.configJwtTokenRefresh();
				this.app.setRoot(PLATFORM.moduleName('app'));
				resolve(session);
			}).catch((error) => {
				reject(error);
			})
		);
	}

	logout() {
		this.sessionCleanUp();
		this.app.setRoot(PLATFORM.moduleName('login'));
	}

	isAuthenticated() {
		return this.session !== null;
	}

	can(permission) {
		return true; // why not?
	}

	hasMultipleRoles() {
		return this.session.user.groups.length > 1;
	}

	changeRole() {
		this.session.role = '';
		this.app.setRoot(PLATFORM.moduleName('app'));
	}

	setRole(role) {
		this.session.role = role.toLowerCase();
		localStorage[config.tokenName] = JSON.stringify(this.session);
		this.setRoot();
	}

	loadActiveSessionIfValid() {
		const session = JSON.parse(localStorage[config.tokenName] || null);
		if (!session) return;
		session.token = new JwtToken(session.token.value);
		if (session.token.isValid()) {
			this.session = session;
			this.ahc.http.configure(http => {
				http.withInterceptor(
					new HttpAuthenticationInterceptor(this.session.token.value));
			});
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
						this.updateAuthInterceptor();
					});
			}
		});
	}

	sessionCleanUp() {
		this.session = null;
		clearInterval(this.jwtTokenValidtyInterval);
		this.updateAuthInterceptor();
		localStorage.clear();
	}

	storeSession() {
		localStorage[config.tokenName] = JSON.stringify(this.session);
	}

	updateAuthInterceptor() {
		this.ahc.http.configure(http => {
			const token = this.session && this.session.token.getValue() || null;
			http.withInterceptor(new HttpAuthenticationInterceptor(token));
		});
	}

	publishJwtTokenRefresh() {
		this.ea.publish(new RefreshJwtToken(true));
	}

	setRoot() {
		if (this.session.role === 'student') {
			this.app.setRoot(PLATFORM.moduleName('studentRoot'));
		} else if (this.session.role === 'professor') {
			this.app.setRoot(PLATFORM.moduleName('professorRoot'));
		} else if (this.session.role === 'admin') {
			this.app.setRoot(PLATFORM.moduleName('adminRoot'));
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
  constructor(token) {
      this.token = token;
  }

  request(message) {
    message.headers.add(config.headerAuthParam, `JWT ${this.token}`);
    return message;
  }
}
