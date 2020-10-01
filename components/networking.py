import websockets, asyncio, json
from components.logger import Logger

class Networking:

    def __init__(self, database=None):
        self.database = database
        self.loop = asyncio.new_event_loop()
        self.logger = Logger("Networking").logger
        self.watcher_loaded = False

    async def runserver(self, websocket, path):
        while True:
            try:
                data = await websocket.recv()
                msg = json.loads(data)
                await self.msghandler(websocket, msg)
            except ConnectionResetError as e1:
                pass
            except Exception as e2:
                # use re for error parsing
                if "1001" in str(e2):
                    #self.logger(f"Error: {str(e2)}", "alert", "red")
                    await websocket.close()
                    #self.logger("closed.")
                    data = ""
                    

    def createid(self): 
        table = self.database.gettable("users") 
        if table["status"] == 200:
            curid = len(table)
            newid = curid + 1
            return int(newid)
        else:
            return table

    def findtarget(self, query):
        idlist = []
        self.logger(f"searching for {query}", "debug")
        res = self.database.gettable("users")
        for key in res["resource"]:
            dic = res["resource"]
            searchres = query in dic[key].values()
            if searchres:
                idlist.append(dic[key]["id"])
        return idlist

    def regsend(self, message, targetidlist):
        loop = asyncio.new_event_loop()
        loop.run_until_complete(self.send(message, targetidlist))

    async def send(self, message, targetidlist):
        returnmsg = {"success": [], "failure": []}
        for targetid in targetidlist:
            #socket = self.database.query(targetid, "networking")["socket"]
            socket = self.database.membase[targetid]["socket"]
            if type(message) == dict:
                message = json.dumps(message)
            await socket.send(message)
            returnmsg["success"].append(targetid)

        return returnmsg

    async def msghandler(self, websocket, msg):
        if not self.watcher_loaded:
            self.watcher = self.database.membase["classes"]["Watcher"]
            self.watcher_loaded = True
        category = msg["category"]
        type = msg["type"]
        data = msg.get("data", {})
        metadata = msg.get("metadata", {})

        if category == "admin":
            if type == "signin":
                name = data["name"]
                print("received signin")
                print(data.keys())
                if "id" in data.keys():
                    id = data["id"]
                    print(f"already has id: {id}")
                else:
                    #create new id
                    id = self.createid()
                self.database.membase[id] = {"socket": websocket}
                self.database.write(id, {"id":id, "name": name}, "users")
                returnmsg = json.dumps({"category":"admin", "type":"signinresponse", "data":{"id":id}})
                await self.send(returnmsg, [id])
        if category == "test":
            self.logger("got test message", "debug", "yellow")
            if type == "web":
                self.logger("got web message")
                self.logger(msg)

                id = self.createid()
                self.logger(id)
                name = "website"
                self.database.membase[id] = {"socket": websocket}
                self.database.write(id, {"id":id, "name": name}, "users")
                returnmsg = json.dumps({"category":"admin", "type":"signinresponse", "data":{"id":id}})

                await websocket.send(returnmsg)
        self.watcher.publish(self, {msg})
    def messagebuilder(self, category, msgtype, data={}, metadata={}, target="all"):
        msg = json.dumps({"category":category, "type":msgtype, "data":data, "metadata":metadata})
        if target == "all":
            idlist = list(self.database.membase.keys())
        if type(target) == list:
            idlist = target
        elif type(target) == int:
            idlist = [target]

        result = {"success": [], "failure": []}

        for id in idlist:
            result = asyncio.get_event_loop().run_until_complete(self.send(msg, idlist))
        return result

    def startserving(self):
        self.logger("starting")
        asyncio.set_event_loop(self.loop)
        serveserver = websockets.server.serve(self.runserver, "0.0.0.0", 8000, loop=self.loop)
        #asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(serveserver)
        self.logger("waiting...")
        self.loop.run_forever()
