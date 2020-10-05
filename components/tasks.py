import json, schedule, threading
from time import sleep
from components.logger import Logger
#from components.database import Database

def test():
    print("hi")

class Tasks:
    def __init__(self):
        self.logger = Logger("Core").logger


    def createtask(self, functarget, time, unit, argdict=None, tag="user task"):
        self.logger(f"Argdict: {argdict}", "debug", "red")
        if not argdict:
            #functarget = threading.Thread(target=prefunctarget)
            task = getattr(schedule.every(time), unit).do(functarget).tag(tag)
        else:
        # TODO: fix this shit
            #functarget = threading.Thread(target=prefunctarget, kwargs=argdict)
            task = getattr(schedule.every(time), unit).do(functarget, **argdict).tag(tag)
        return task

    def createthreadedtask(self, functarget, argdict={}):
        t = threading.Thread(target=functarget, kwargs=argdict)
        t.start()
        return t

    def removetask(self, tag):
        schedule.clear(tag)

    def runall(self):
        schedule.run_pending()

    def runfirst(self):
        schedule.run_all()
