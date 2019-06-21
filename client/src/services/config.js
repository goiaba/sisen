export default {
	baseUrl: 'http://localhost:8000/api/v1',
	authTokenUrl: '/auth',
	authTokenRefreshUrl: '/auth-refresh',
	entryPointUrl: '/survey/switcher/role/${role}',
	student: {
		answerUrl: '/survey/study/${studyId}/answer',
		resultUrl: '/survey/study/${studyId}/report',
    processAnswerUrl: '/survey/study/${studyId}/process'
	},
	tokenName: 'sisenAuth',
	headerAuthParam: 'Authorization'
};
