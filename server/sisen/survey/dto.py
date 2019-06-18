

class Link(object):
    def __init__(self, rel, uri, method='GET', icon=None):
        self.rel = rel
        self.uri = uri
        self.method = method
        self.icon = icon

    def __str__(self):
        return "[%s, %s, %s, %s]" % (self.rel, self.uri, self.method, self.icon)


class AvailableStudy(object):
    def __init__(self, study, links):
        self.study = study
        self.links = links


class SurveyAnswering(object):
    def __init__(self, questions, links):
        self.questions = questions
        self.links = links


class StudyOptionScore(object):
    def __init__(self, code, description, value):
        self.code = code
        self.description = description
        self.value = value


class StudyWithMessageAndStudentOptionScore(object):
    def __init__(self, study, message, study_option_scores, links):
        self.study = study
        self.message = message
        self.study_option_scores = study_option_scores
        self.links = links


class AvailableClasses(object):
    def __init__(self, sclass, study, total_students, total_answered, links):
        self.sclass = sclass
        self.study = study
        self.total_students = total_students
        self.total_answered = total_answered
        self.links = links


class StudentWithOptionScore(object):
    def __init__(self, user, scores):
        self.user = user
        self.scores = scores


class SyntheticReport(object):
    def __init__(self, sclass, study, students):
        self.sclass = sclass
        self.study = study
        self.students = students
