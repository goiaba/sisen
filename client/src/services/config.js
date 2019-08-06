export default {
	baseUrl: 'http://localhost:8000/api/v1',
	authTokenUrl: '/auth',
	authTokenRefreshUrl: '/auth-refresh',
  passwordResetRequestUrl: '/password-reset/',
  passwordResetConfirmUrl: '/password-reset/confirm/',
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
	headerAuthParam: 'Authorization',
  externalMediaHandler: {
    videoServerUrl: 'https://www.youtube.com/embed/${videoId}',
    audioServerUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
    idMediaMap: {
      audio: {
        PROFESSORES: '660105794',
        CINESTESICA_CORPORAL: '660103130',
        INTERPESSOAL: '660103676',
        INTRAPESSOAL: '660103811',
        LOGICA_MATEMATICA: '660102875',
        NATURALISTA: '660103511',
        RITMICA_MUSICAL: '660103028',
        VERBAL_LINGUISTICA: '660102785',
        VISUAL_ESPACIAL: '660102965'
      },
      video: {
        PROFESSORES: '242iG_ilems',
        CINESTESICA_CORPORAL: 'aI-H75V47oU',
        INTERPESSOAL: 'mRERzlcH0qc',
        INTRAPESSOAL: 'DKImzAkJHNs',
        LOGICA_MATEMATICA: 'xHt7__t19QU',
        NATURALISTA: 'BtBSd_XxyDU',
        RITMICA_MUSICAL: 'LDdo8lWQLwM',
        VERBAL_LINGUISTICA: 'Mv5PfswNa3Q',
        VISUAL_ESPACIAL: 'UDMsQzurqE8'
      }
    }
  }
};
