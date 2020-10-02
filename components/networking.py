import websockets, asyncio, json
from components.logger import Logger
from time import sleep
class Networking:

    def __init__(self, database=None):
        self.db = database
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
                self.logger("Reset error", "alert", "red")
                sleep(2)
            except Exception as e2:
                # use re for error parsing
                if "1001" in str(e2):
                    #self.logger(f"Error: {str(e2)}", "alert", "red")
                    await websocket.close()
                    self.logger("closed.")
                    data = ""
                else:
                    self.logger(str(e2))
                    sleep(3)

    def createid(self): 
        table = self.db.gettable("users") 
        if table["status"] == 200:
            curid = len(table)
            newid = curid + 1
            return int(newid)
        else:
            return table

    def findtarget(self, query):
        idlist = []
        self.logger(f"searching for {query}", "debug")
        res = self.db.gettable("users")
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
            #socket = self.db.query(targetid, "networking")["socket"]
            socket = self.db.membase[targetid]["socket"]
            if type(message) == dict:
                message = json.dumps(message)
            await socket.send(message)
            returnmsg["success"].append(targetid)

        return returnmsg

    async def msghandler(self, websocket, msg):
        if not self.watcher_loaded:
            self.watcher = self.db.membase["classes"]["Watcher"]
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
                self.db.membase[id] = {"socket": websocket}
                self.db.write(id, {"id":id, "name": name}, "users")
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
                self.db.membase[id] = {"socket": websocket}
                self.db.write(id, {"id":id, "name": name}, "users")
                returnmsg = json.dumps({"category":"admin", "type":"signinresponse", "data":{"id":id}})

                await websocket.send(returnmsg)

        if category == "weather":
            if type == "current":
                self.logger("got request for weather")
                curdict = self.db.query("currentweather", "weather")
                
                if curdict["status"] == 200:
                    data = curdict["resource"]
                    msg = self.messagebuilder(category, type, data)
                    await websocket.send(msg)
                else:
                    returnmsg = {"status":404, "message":"couldn't find current weather"}
                    await websocket.send(json.dumps(returnmsg))



        # maybe only do this bit if there's a flag set in membase, for security
        self.watcher.publish(self, msg)

    def messagebuilder(self, category, msgtype, data={}, metadata={}, target=None):
        msg = json.dumps({"category":category, "type":msgtype, "data":data, "metadata":metadata})
        if not target:
            return msg
        else:
            if target == "all":
                idlist = list(self.db.membase.keys())
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
