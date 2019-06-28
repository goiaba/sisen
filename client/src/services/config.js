export default {
	baseUrl: 'http://localhost:8000/api/v1',
	authTokenUrl: '/auth',
	authTokenRefreshUrl: '/auth-refresh',
	entryPointUrl: '/survey/switcher/role/${role}',
  getInstitutionsUrl: '/survey/institution',
  getProgramsByInstitutionUrl: '/survey/institution/${institutionId}/program',
  getClassesByInstitutionAndProgramUrl: '/survey/institution/${institutionId}/program/${programId}/class',
	student: {
    signupUrl: '/survey/signup',
		answerUrl: '/survey/study/${studyId}/answer',
		resultUrl: '/survey/study/${studyId}/report',
    processAnswerUrl: '/survey/study/${studyId}/process'
  },
  professor: {
    syntheticReportUrl: '/survey/class/${classId}/study/${studyId}/synthetic-report',
    analyticalReportUrl: '/survey/class/${classId}/study/${studyId}/analytical-report'
  },
	tokenName: 'sisenAuth',
	headerAuthParam: 'Authorization'
};
