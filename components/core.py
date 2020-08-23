# core file that always runs. starts networking and module discovery
import threading, os, importlib
from components.database import Database
from components.networking import Networking
from components.tasks import Tasks
from time import sleep
class Core:
    def __init__(self):
        self.moduledict = {}
        self.tasker = Tasks()

    def discovermodules(self):
        # find modules
        base = os.getcwd()
        os.chdir("modules")
        filelist = os.listdir()
        os.chdir(base)
        filelist.remove("__pycache__")
        # import them
        for file in filelist:
            print(file)
            mod = importlib.import_module(f"modules.{file.split('.')[0]}")

            # read task data from them 
            name = file.split(".")[0].capitalize()

            # lets you access whatever is inside the class
            func = getattr(mod, name)()

            # list
            attrlist = dir(func)

            # actually access it.
            #dependencies = getattr(func, "dependencies")

            cleanlist = []
            for item in attrlist:
                if "__" not in item:
                    cleanlist.append(item)

            attrdict = {}
            for val in cleanlist:
                tmp = getattr(func, val)
                if type(tmp) == list or type(tmp) == dict:
                    attrdict[val] = tmp

            #print(attrdict)
            self.moduledict[name] = {"attr":attrdict, "func":func}


        # check dependencies
        removelist = []
        for item in self.moduledict:
            
            dependencies = self.moduledict[item]["attr"]["dependencies"]
            failedlist = [x for x in dependencies if x not in list(self.moduledict.keys())]
            print(failedlist)
            if len(failedlist) > 0:
                print(f"couldn't meet dependencies for {item}")
                print(item)
                removelist.append(item)
        for t in removelist:
            del self.moduledict[t]
        print(self.moduledict)



    def standard(self):
        # start networking

        # discover modules
        self.discovermodules()

        # start tasks
        for module in self.moduledict:
            timing = self.moduledict[module]["attr"]["timing"]
            print(timing)
            func = self.moduledict[module]["func"]
            self.tasker.createtask(getattr(func, "startrun"), timing["count"], timing["unit"])

        while True:
            self.tasker.runall()
            sleep(2)
        pass
