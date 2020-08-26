from ast import literal_eval as eval
from components.logger import Logger
import json, traceback

class Database:
    membase = {} # this is specific to the calling module
    def __init__(self):
        self.logger = Logger("DATABASE").logger
        self.db = ('data/db.json')
        self.table = "main"

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

        #self.logger(f"value exists: {value in data.values()}", "debug", "blue")
        #self.logger(f"data: {data}", "debug", "blue")
        #self.logger(f"old key is of type: {type(list(data.keys())[0])}", "debug", "blue")
        #self.logger(f"new key is of type: {type(key)}", "debug", "blue")
        #self.logger(f"key in list of old keys: {key in data.keys()}", "debug", "blue")
        #if key not in data.keys():
            #self.logger("writing data..")
            # change data
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

    
