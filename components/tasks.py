import json, threading

#from apscheduler.schedulers.asyncio import AsyncScheduler as schedule
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger as trigger

from time import sleep
from components.logger import Logger
#from components.database import Database


class Tasks:
    def __init__(self, Database):
        self.logger = Logger("Tasks").logger
        self.db = Database
        self.schedule = BackgroundScheduler()

    def createtask(self, functarget, count, unit, tag="user task"):
        #task = getattr(schedule.every(count), unit).do(functarget).tag(tag)
        kwargs = {unit: count}
        task = self.schedule.add_job(functarget, trigger(**kwargs))
        return task

    def createthreadedtask(self, functarget, argdict={}):
        t = threading.Thread(target=functarget, kwargs=argdict)
        t.start()
        return t

    def pause(self, target):
        # check if target in membase. if so, stop execution
        taskdict = self.db.membase["taskdict"]
        self.logger(taskdict)
        self.logger(target)
        if target in taskdict:
            job = taskdict[target]["task"]
            job.pause()
            self.logger(f"Paused: {target}")

    def resume(self, target):
        taskdict = self.db.membase["taskdict"]
        if target in taskdict:
            job = taskdict[target]["task"]
            job.pause()
            self.logger(f"Resumed: {target}")

    def removetask(self, tag):
        self.schedule.clear(tag)

    def run(self):
        self.schedule.start()

