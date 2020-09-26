# core file that always runs. starts networking and module discovery
import threading, os, importlib, sys
from components.database import Database
from components.networking import Networking as nw
from components.tasks import Tasks
from components.logger import Logger
from components.watcher import Watcher as watcher
from time import sleep

#test
Networking = ""
Watcher = ""
class Core:
    def __init__(self):
        self.moduledict = {}
        self.tasker = Tasks()
        self.logger = Logger("Core").logger
        self.classobjdict = {}
        self.thismod = sys.modules[__name__] # to share networking

    def discovermodules(self):
        # find modules
        base = os.getcwd()
        os.chdir("modules")
        filelist = os.listdir()
        os.chdir(base)
        rmlist = ["__pycache__", "template.py", "output.txt", "PLAN"]
        for item in rmlist:
            if item in filelist:
                filelist.remove(item)
        

        # import them
        for file in filelist:
            mod = importlib.import_module(f"modules.{file.split('.')[0]}")

            # read task data from them 
            name = file.split(".")[0].capitalize()
            
            # lets you access whatever is inside the class
            classobj = getattr(mod, name)
            #print(classobj)
            # list
            attrlist = dir(classobj())
            #print(f"attrlist: {attrlist}")
           
            # actually access it.
            #dependencies = getattr(classobj, "dependencies")

            cleanlist = []
            for item in attrlist:
                if "__" not in item:
                    cleanlist.append(item)

            attrdict = {}
            for val in cleanlist:
                tmp = getattr(classobj(), val)
                if type(tmp) == list or type(tmp) == dict:
                    attrdict[val] = tmp

            #print(attrdict)
            self.moduledict[name] = {"attr":attrdict, "classobj":classobj}

        # check dependencies
        removelist = []
        tiereddepdict = {"user":{}, "preload":{}, "postuser":{}}
        #self.logger(list(self.moduledict.keys()), "debug", "yellow")
        for item in self.moduledict:
            
            tier = self.moduledict[item]["attr"]["dependencies"]["tier"]
            # TODO: use tier to seperate dependency loading into tiers, to mitigate intermodule dependency errors
            dependencies = self.moduledict[item]["attr"]["dependencies"]["dependencies"]
            self.logger(f"DEPENDENCIES: {dependencies}")
            coremodules = ["Networking", "Database", "Watcher"]
            failedlist = [x for x in dependencies if x not in coremodules and x not in list(self.moduledict.keys())]
            if len(failedlist) > 0:
                self.logger(f"couldn't meet dependencies for {item}")
                removelist.append(item)
        for t in removelist:
            del self.moduledict[t]

        # create simple name:class object, to pass to watcher
        for classname in self.moduledict:
            self.classobjdict[classname] = classobj
        self.logger(f"Running modules: {list(self.moduledict)}")
        self.logger("Discovery finished.")


    def standard(self):
        global Networking, Watcher
        # init database
        self.db = Database()

        # start networking
        Networking = nw(self.db)
        t1 = threading.Thread(target=Networking.startserving)
        t1.start()

        # test
        self.discovermodules()
        # start intermodule comms service
        self.logger(self.classobjdict)
        Watcher = watcher(self.classobjdict)
        
        # discover modules
        #self.discovermodules()
        
        # start tasks

        for module in self.moduledict:
            timing = self.moduledict[module]["attr"]["timing"]
            #dependencies = self.moduledict[module]["attr"]["dependencies"]
            #dependencies = {str(x):getattr(self.thismod, str(x))() for x in self.moduledict[module]["attr"]["dependencies"]}
            dependencies = {str(x):getattr(self.thismod, str(x)) for x in self.moduledict[module]["attr"]["dependencies"]["dependencies"]}
            classobj = self.moduledict[module]["classobj"]
            self.tasker.createtask(getattr(classobj(**dependencies), "startrun"), timing["count"], timing["unit"])

        self.tasker.runfirst()
        while True:
            self.tasker.runall()
            sleep(2)
        pass
