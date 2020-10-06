import json, schedule, threading
from time import sleep
from components.logger import Logger
#from components.database import Database


class Tasks:
    def __init__(self, Database):
        self.logger = Logger("Tasks").logger
        self.db = Database

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

    def pause(self, target):
        # check if target in membase. if so, stop execution
        if "target" in self.db.membase["taskdict"]:
            self.logger(f"Paused: {target}")
            self.removetask(target)

    def resume(self, target):
        if "target" in self.db.membase["taskdict"]:
            type = self.db.membase["taskdict"][target].get("type", "basic")
            if type != "basic":
                return False # make that an actual error
            if "timing" in self.db.membase["taskdict"][target]:
                timing = self.db.membase["taskdict"][target]["timing"]
            else:
                timing = {"unit": "minutes", "count": 5}
            taskobj = self.db.membase["taskdict"][target]["taskobj"]
            time = timing["unit"]
            unit = timing["minutes"]
            getattr(schedule.every(time), unit).do(taskobj).tag(target).run()
            self.logger(f"Resumed: {target}")

    def removetask(self, tag):
        schedule.clear(tag)

    def runall(self):
        schedule.run_pending()

    def runfirst(self):
        schedule.run_all()
