from flask import Flask, render_template
from flask_sockets import Sockets

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

import os


from components.logger import Logger

class Website:
    def __init__(self, Networking=None, Watcher=None, Database=None):
        self.dependencies = {"tier": "user", "dependencies":["Networking", "Watcher", "Database"]}
        self.capabilities = ["ui", "input", "blocking"]
        #self.timing = {"unit": "minutes", "count":2}
        self.networking = Networking
        self.watcher = Watcher
        self.db = Database

        self.logger = Logger("Website").logger

        self.basefolder = os.path.abspath("data/modules/website/")

        # other init stuff happens in startrun

    def startrun(self):
        staticfolder = os.path.join(self.basefolder, "static")
        tmpfolder = os.path.join(self.basefolder, "templates")
        self.app = Flask(__name__, static_folder=staticfolder, template_folder=tmpfolder)
        self.socket = Sockets(self.app)

        self.logger("website is running")

        @self.app.route("/")
        def hello():
            return render_template("index.html")

        server = pywsgi.WSGIServer(('0.0.0.0', 8080), self.app, handler_class=WebSocketHandler)
        server.serve_forever()
