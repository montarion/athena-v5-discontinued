import redis, json, threading
from components.logger import Logger
from time import sleep

class Watcher:
    def __init__(self, classobjdict):
        self.logger = Logger("Watcher").logger
        self.r = redis.Redis(host='localhost', port=6379, db=0)
        self.p = self.r.pubsub(ignore_subscribe_messages=True)
        self.classobjdict = classobjdict

        self.listenstop = False
        self.subscriptions = []
        self.classdict = {}
        self.funcdict = {}
        self.triggerdict = {}

    def startlisten(self):
        for x in self.subscriptions:
            self.p.subscribe(x)
        self.listenstop = False # allow execution
        if len(self.subscriptions) > 0:
            threading.Thread(target=self.listen).start()
            self.logger("started")
        else:
            self.logger("no subscriptions yet")

    def listen(self):
        while True:
            msg = self.p.get_message()
            if msg:
                channel = msg["channel"].decode()
                data = msg["data"].decode()
                try:
                    data = json.loads(data)
                except Exception as e:
                    self.logger(e)
                self.logger(f"Got message for: {channel}")
                self.logger(f"Message: {data}")
                if channel in self.funcdict.keys():
                    channeldict = self.funcdict[channel]
                    trigger = channeldict["trigger"]["returnvalue"]
                    #self.logger(trigger)
                    #self.logger(data.keys())
                    if trigger in data.keys():

                        returnvalue = data[trigger]
                        # execute function
                        exec_class = channeldict["result"]["class"]
                        exec_func = channeldict["result"]["function"]
                        args = channeldict["result"]["args"]
                        #self.logger(f"full args: {args}")
                        for key, val in args.items():
                            args[key] = data[val]
                        sleep(2)
                        t = getattr(exec_class, exec_func)(**args)
                        self.logger(t)
            if self.listenstop:
                self.logger("Stopped listening for published messages.", "debug", "yellow")
                break
        
    def getclass(self, classname):
        if classname in self.classobjdict:
            return self.classobjdict[classname]
        else:
            return self


    def execute(self, classname, funcname=None):
        # skip
        if type(classname) == str:
            classobj = self.getclass(classname)
            if type(classobj) != class:
                return "Class not found"
        else:
            classobj = classname

        # do things with class object
        pass

    def register(self, regdata):
        """
            Registers function to be ran when a specific other function is run/published
            Usage: regdata = {'trigger':{'class':'foo', 'returnvalue':'title'}, 
                             'result':{'class':Bar(), 'function':'funcname', 'args':{'foo':'bar'}}

            trigger[class] is name of the class you want updates from.
            result[class] is class object(self in a class) that you want to call when triggered
            arg keys must match the name of the parameter.
            publish a message like this: r.publish("foo", json.dumps({"bar":"argument content"})
            to publish a message, see the publish function.
        """
        name = regdata["trigger"]["class"]
        self.subscriptions.append(name)

        tmpdict = regdata
        self.funcdict[name] = tmpdict

        self.triggerdict[name] = regdata["trigger"]
        self.logger(f"subscribed to: {self.subscriptions}")
        self.listenstop = True

        self.startlisten()

    def publish(self, classinstance, data):
        """
            Allows every class to publish without importing redis.
            Usage: Watcher().publish(Foo() / "Foo", {"bar": "argumentcontent"}
            Note: using the class so that you can pass "self" from within the module.
                if using a string, that string must equal the name of the class of the result you registered earlier
        """
        if type(classinstance) != str:
            name = classinstance.__class__.__name__
        else:
            name = classinstance
        #self.logger(name)
        if type(data) == dict:
            data = json.dumps(data)
        self.r.publish(name, data)
        self.logger(f"published: {name}")
