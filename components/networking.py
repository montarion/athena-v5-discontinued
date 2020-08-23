import websockets, asyncio, json
from components.database import Database

class Networking:

    def __init__(self):
        self.memdatabase = Database("memory")
        self.database = Database()

        self.loop = asyncio.new_event_loop()

    async def runserver(self, websocket, path):
        data = await websocket.recv()
        msg = json.loads(data)
        print(msg)
        await self.msghandler(websocket, msg)

    def createid(self):
        curid = len(self.database.gettable("users"))
        newid = curid + 1
        return int(newid)

    def findtarget(self, query):
        pass

    async def send(self, message, targetid):
        socket = self.memdatabase.query("id", targetid, "networking")["socket"]
        await socket.send(message)

    async def msghandler(self, websocket, msg):
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
                self.memdatabase.update({"id": id, "socket": websocket}, "id", id, "networking")
                self.database.update({"id": id, "name": name}, "id", id, "users")
                returnmsg = json.dumps({"category":"admin", "type":"signinresponse", "data":{"id":id}})
                await self.send(returnmsg, id)

    def startserving(self):
        serveserver = websockets.server.serve(self.runserver, "0.0.0.0", 8765, loop=self.loop)
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(serveserver)
        print("waiting...")
        self.loop.run_forever()
