

class Link(object):
    def __init__(self, rel, uri, method='GET', icon=None):
        self.rel = rel
        self.uri = uri
        self.method = method
        self.icon = icon

    def __str__(self):
        return "[%s, %s, %s, %s]" % (self.rel, self.uri, self.method, self.icon)


class AvailableStudy(object):
    def __init__(self, acronym, description):
        self.acronym = acronym
        self.description = description
        self.links = []

    def __str__(self):
        return "(%s) %s: %s" % (self.acronym, self.description, self.links)


class SurveyAnswering(object):
    def __init__(self, questions, links):
        self.questions = questions
        self.links = links


class StudyOptionResult(object):
    def __init__(self, code, description, value):
        self.code = code
        self.description = description
        self.value = value


class StudyResult(object):
    def __init__(self, study, message, study_option_results, links):
        self.study = study
        self.message = message
        self.study_option_results = study_option_results
        self.links = links
