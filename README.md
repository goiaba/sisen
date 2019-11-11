# sisen
Sistema de suporte ao ensino

# Server (backend)

### Environment configuration
```
python3 -m pip install virtualenvwrapper
#Follow further configuration instructions before running the next command: https://virtualenvwrapper.readthedocs.io/en/latest/install.html
mkvirtualenv sisen-venv
cd sisen/server
pip install -r requirements.txt
python manage.py migrate
```

### Steps to run
```
cd sisen/server
workon sisen-venv
python manage.py runserver
```

### Generating auth token
In order to be allowed to access the API a client must first retrieve a JWT token. This can be achieved in many ways. One of then is listed bellow:

`curl -X POST -H "Content-Type: application/json" -d '{"username": "admin1", "password": "admin"}' http://localhost:8000/api/v1/auth`

### Refreshing expired auth token
In case a client receives a token expired message in response to a request, (s)he must get a new token. Bellow is an example:

`curl -X POST -H "Content-Type: application/json" -d '{"username": "admin1", "password": "admin"}' http://localhost:8000/api/v1/auth-refresh`

### How it (should) work
In possession of a JWT token a client can start navigating the API making a first request to `GET /`. It's imperative to pass the token in the header of this and each consecutive request (`Authorization: JWT <token>`). The client will then be automatically redirected to the view (s)he has permission to access (or will get a 403 - Forbidden response). A list of links in the payload will show all the possible actions to be performed at that point.

# Client (frontend)

### Steps to run
```
cd sisen/client
npm i
npm link aurelia-cli
au run --watch
```
