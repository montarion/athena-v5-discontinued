import json, schedule
from time import sleep

#from components.database import Database

def test():
    print("hi")

class Tasks:
    def __init__(self):
        pass

    def createtask(self, functarget, time, unit, argdict=None, tag="user task"):
        if not argdict:
            task = getattr(schedule.every(time), unit).do(functarget).tag(tag)
        else:
            task = getattr(schedule.every(time), unit).do(functarget, **argdict).tag(tag)
        return task

    def removetask(self, tag):
        schedule.clear(tag)

    def runall(self):
        schedule.run_pending()

    def runfirst(self):
        schedule.run_all()
