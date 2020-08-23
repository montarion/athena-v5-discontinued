import json, schedule
from time import sleep

#from components.database import Database

def test():
    print("hi")

class Tasks:
    def __init__(self):
        pass

    def createtask(self, functarget, time, unit, tag="user task"):
        task = getattr(schedule.every(time), unit).do(functarget).tag(tag)
        #if unit == "seconds":
        #    schedule.every(time).seconds.do(functarget)
        #if unit == "minutes":
        #    schedule.every(time).minutes.do(functarget)
        return task

    def removetask(self, tag):
        schedule.clear(tag)

    def runall(self):
        schedule.run_pending()
