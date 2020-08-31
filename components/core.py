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
        self.thismod = sys.modules[__name__] # to share networking

    def discovermodules(self):
        # find modules
        base = os.getcwd()
        os.chdir("modules")
        filelist = os.listdir()
        os.chdir(base)
        rmlist = ["__pycache__", "template.py", "output.txt"]
        for item in rmlist:
            if item in filelist:
                filelist.remove(item)
        

        # import them
        for file in filelist:
            #self.logger(file)
            mod = importlib.import_module(f"modules.{file.split('.')[0]}")

            # read task data from them 
            name = file.split(".")[0].capitalize()

            # lets you access whatever is inside the class
            func = getattr(mod, name)

            # list
            attrlist = dir(func())

            # actually access it.
            #dependencies = getattr(func, "dependencies")

            cleanlist = []
            for item in attrlist:
                if "__" not in item:
                    cleanlist.append(item)

            attrdict = {}
            for val in cleanlist:
                tmp = getattr(func(), val)
                if type(tmp) == list or type(tmp) == dict:
                    attrdict[val] = tmp

            #print(attrdict)
            self.moduledict[name] = {"attr":attrdict, "func":func}
            #self.logger(f"Starting modules: {list(self.moduledict.keys())}")

        # check dependencies
        removelist = []
        for item in self.moduledict:
            
            dependencies = self.moduledict[item]["attr"]["dependencies"]
            self.logger(f"DEPENDENCIES: {dependencies}")
            coremodules = ["Networking", "Database", "Watcher"]
            failedlist = [x for x in dependencies if x not in coremodules and x not in list(self.moduledict.keys())]
            if len(failedlist) > 0:
                self.logger(f"couldn't meet dependencies for {item}")
                removelist.append(item)
        for t in removelist:
            del self.moduledict[t]
        self.logger(f"Starting modules: {list(self.moduledict)}")
        self.logger("Discovery finished.")


    def standard(self):
        global Networking, Watcher
        # init database
        self.db = Database()

        # start networking
        Networking = nw(self.db)
        self.logger(Networking, "debug", "yellow")
        t1 = threading.Thread(target=Networking.startserving)
        t1.start()

        # start intermodule comms service
        Watcher = watcher()
        
        # discover modules
        self.discovermodules()

        # start tasks

        for module in self.moduledict:
            timing = self.moduledict[module]["attr"]["timing"]
            #dependencies = self.moduledict[module]["attr"]["dependencies"]
            #dependencies = {str(x):getattr(self.thismod, str(x))() for x in self.moduledict[module]["attr"]["dependencies"]}
            dependencies = {str(x):getattr(self.thismod, str(x)) for x in self.moduledict[module]["attr"]["dependencies"]}
            self.logger(Networking)
            self.logger(dependencies)
            func = self.moduledict[module]["func"]
            self.logger(func)
            self.tasker.createtask(getattr(func(**dependencies), "startrun"), timing["count"], timing["unit"])

        self.tasker.runfirst()
        while True:
            self.tasker.runall()
            sleep(2)
        pass
