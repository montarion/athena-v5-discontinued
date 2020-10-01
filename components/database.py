from ast import literal_eval as eval
from components.logger import Logger
import json, traceback

class Database:
    membase = {} # this is specific to the calling module
    def __init__(self, Networking=None):
        self.logger = Logger("DATABASE").logger
        self.db = ('data/db.json')
        self.table = "main"
        self.nw = Networking
        self.membase = Database.membase
        self.userresponse = {}

    def write(self, key, value, table=None):
        """Usage: Database().write("foo", {"foo":"bar"}, "test")"""
        #self.logger("Writing..")
        # fix datatypes
        key = json.loads(json.dumps(key))
        if type(key) != str:
            key = str(key)
        value = json.loads(json.dumps(value))

        if table:
            self.table = table

        #t = self.gettable(table)

        with open(self.db) as f:
            # get data
            fulldata = json.loads(f.read())


        tables = fulldata.keys()

        if table not in tables:
            fulldata[table] = {}

        data = json.loads(json.dumps(fulldata[table]))

        data[key] = value

            # save in proper form
        fulldata[table] = data
            #self.logger(f"new data: {data}", "debug", "blue")

            # write fulldata to dict
        with open(self.db, "w") as f:
            f.write(json.dumps(fulldata))


    def query(self, query, table=None):
        """Usage: Database().query("name", "test")"""
        if table:
            self.table = table

        try:
            with open(self.db) as f:
                fulldata = json.loads(f.read())

            data = fulldata[table]
            result = data[query]
            msg = {"status": 200, "resource":result}
            return msg
        except KeyError as e:
            res = {"status": 404, "resource": f"Query: \"{query}\" not found"}
            return res

    def remove(self, query, table=None):
        """NOT IMPLEMENTED"""
        #TODO: IMPLEMENT
        if table:
            self.table = self.db.table(table)

        with open(self.db) as f:
            # get data
            fulldata = json.loads(f.read())


        tables = fulldata.keys()
        if table not in tables:
            fulldata[table] = {}

        data = fulldata[table]

        # remove data
        del data[key]

        # save in proper form
        fulldata[table] = data

        # write fulldata to dict
        with open(self.db, "w") as f:
            f.write(json.dumps(fulldata))


    def gettable(self, table):
        """Usage: Database().gettable("table")"""

        with open(self.db) as f:
            fulldata = json.loads(f.read())

        try:
            table = fulldata[table]
            res = {"status": 200, "resource": table}
        except KeyError:
            res = {"status": 404, "resource": f"table: \"{table}\" not found"}
        #self.logger(res, "debug", "yellow")
        return res

    def getfromuser(self, asker, questionlist):
        ui_interfaces = self.membase["ui-interfaces"]
        self.logger(ui_interfaces, "alert", "green")
        # choose the best ui
        # hardcoded to website for now
        bestui = "Website"
        if bestui == "Website":
            bestuiuser = "website"
            # write down somewhere that website requires networking
            realquestionlist = {}
            self.logger(questionlist)
            for q in questionlist:
                realquestionlist[q["type"]] = q["question"]

            for q in realquestionlist:
                self.logger(realquestionlist[q])
                finq = {"asker":asker, "question":realquestionlist[q]}
                msg = {"category":"question", "type":"text", "data":finq,"metadata": {"copy":{"guid":"testguid"}}}


                self.logger(self.membase["classes"], "debug", "blue")
                # get network class
                networking = self.membase["classes"]["Networking"]
                # get watcher class
                watcher = self.membase["classes"]["Watcher"]

                # send to website

                ui_id = networking.findtarget(bestuiuser)
                self.logger(ui_id)

                # register yourself with watcher
                regdata = {"trigger":{"class":"Networking"}, "result":{"class": self, "function":"responsewait"}}
                watcher.register(regdata)

                # send message
                networking.regsend(msg, ui_id)

                # wait for your answer to come in
                while True:
                    if self.userresponse.get("category", None) == "answer":
                        if self.userresponse["metadata"].get("guid") == "testguid":

                            break
                del self.userresponse["metadata"]["guid"]
                return self.userresponse


    def responsewait(self, **args):
        self.userresponse = args
        self.logger(f"response arguments! - {args}")
