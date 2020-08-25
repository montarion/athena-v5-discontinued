from components.logger import Logger

class Template:
    def __init__(self):
        self.dependencies = []
        self.capabilities = ["timed", "async"]
        self.timing = {"unit": "seconds", "count":2}
        # do not add init stuff

    def doStuff(self):
        self.logger("Doing stuff...")
        

    def startrun(self):
        """this is what gets called by main"""
        # init stuff..
        self.logger = Logger("TEMPLATE").logger
        self.doStuff()
        
