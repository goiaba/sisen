from rest_framework.exceptions import APIException

class Conflict(APIException):
    code = 'conflict'
    status_code = 409
    detail = 'Conflict'

    def __init__(self, detail):
        Conflict.detail = detail

class NotFound(APIException):
    code = 'not_found'
    status_code = 404
    detail = 'Not Found'

    def __init__(self, detail):
        if detail:
            NotFound.detail = detail
