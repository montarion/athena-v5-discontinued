from tinydb import TinyDB, Query
from tinydb.storages import MemoryStorage
from ast import literal_eval as eval

class Database:
    def __init__(self, storage="json"):
        if storage == "json":
            self.db = TinyDB('data/db.json')
        else:
            #logger("using in-memory database")
            self.db = TinyDB(storage=MemoryStorage)
        self.table = self.db.table("main")

    def write(self, data, table=None):
        """Usage: Database().write({"name": "apple"}, "test")"""

        if table:
            self.table = self.db.table(table)

        id = self.table.insert(data)
        return id

    def update(self, data, field, query, table=None):
        """Usage: Database().update({"name": "apple", "completed": True},"name", "apple", "test")"""
        if table:
            self.table = self.db.table(table)

        if type(query) != int:
            id = self.table.upsert(data, Query()[field] == query)
        else:
            if self.table.contains(doc_id=query):
                # already have an id, so update
                id = self.table.update(data, doc_ids=[query])
            else:
                # else insert
                id = self.table.insert(data)
        return id

    def query(self, field, query, table=None):
        """Usage: Database().query("name", "apple", "test")"""
        if table:
            self.table = self.db.table(table)

        Object = Query()
        result = self.table.search(Object[field] == query)
        if len(result) == 1:
            return result[0]
        return result

    def remove(self, query, table=None):
        """NOT IMPLEMENTED"""
        #TODO: IMPLEMENT
        if table:
            self.table = self.db.table(table)

    def gettable(self, tablequery):
        realtable = self.db.table(tablequery)
        return realtable
