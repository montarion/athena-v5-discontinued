class Template:
    def __init__(self):
        self.dependencies = []
        self.capabilities = ["timed", "async"]
        self.timing = {"unit": "seconds", "count":2}

    def doStuff(self):
        print("Doing stuff...")
        

    def startrun(self):
        """this is what gets called by main"""
        self.doStuff()
        
