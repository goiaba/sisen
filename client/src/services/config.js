export default {
	baseUrl: 'http://localhost:8000/api/v1',
	authTokenUrl: '/auth',
	authTokenRefreshUrl: '/auth-refresh',
	entryPointUrl: '/survey/',
	student: {
		answerUrl: '/survey/study/${studyId}/answer',
		resultUrl: '/survey/study/${studyId}/report'
	},
	tokenName: 'sisenAuth',
	headerAuthParam: 'Authorization'
};
