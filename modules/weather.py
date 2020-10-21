from components.logger import Logger

import requests, re, os, json, traceback, time
class Weather:
    def __init__(self, Database=None, Watcher=None):
        self.dependencies = {"tier":"standalone", "dependencies":["Database", "Watcher"]}
        self.capabilities = ["timed", "async"]
        self.timing = {"unit": "minutes", "count":10}
        self.datapath = f"data/modules/{self.__class__.__name__.lower()}"
        self.db = Database
        self.watcher = Watcher
        self.logger = Logger("Weather").logger

        # do not add init stuff


    def websetuptest(self): # here as a test
        # make request for info through whatever is registered as main(/current?) ui
        # wait for the answer without blocking the main thread
        # but pause the execution of the current program(through db query?)
        #asker = self.__class__.__name__
        questionlist = [{"type": "text", "question": "Where do you live?"}]
        
        self.logger("RELOAD PAGE NOW", "alert", "red")
        time.sleep(5)
        t = self.db.getfromuser(questionlist)
        self.logger(f"GOT USER RESULTS! - {t}", "info", "green")

    def getcurrentweather(self):
        if not self.watcher:
            self.watcher = self.db.membase["classes"]["Watcher"]
        title = self.db.query("city", "personalia")["resource"]
        apikey = self.db.query(["weather", "apikey"], "credentials")
        if str(apikey["status"])[:2] == "20":
            apikey = apikey["resource"]
        else:
            self.logger("Couldn't find apikey, or user didn't respond. Exiting.")
            exit() # TODO: only kill this job, and provide feedback through the ui
        coords = self.db.query("coordinates", "personalia") #"40.677748", "-73.906903"
        if coords["status"][:2] == "20": # check if success
            lat,lon = coords["resource"]
        else:
            self.logger("Couldn't find coordinates, or user didn't respond. Exiting.")
            exit() # TODO: only kill this job, and provide feedback through the ui
        baseurl = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={apikey}&units=metric"

        #TODO try-catch this HTTP request
        res = requests.get(baseurl).json()
        if len(res.keys()) == 2:
            # error occured, read message
            self.logger(f"Error: {res['cod']}", "alert", "red")
            self.logger(f"Message: {res['message']}", "alert", "red")

        try:
            timezone = res["timezone"]
            # maybe write to file

            # current weather
            curdict = {}
            cur = res["current"]
            dt = int(time.time()) # time of request, unix, utc
            temp = cur["temp"]
            sunrise = cur["sunrise"]
            sunset = cur["sunset"]
            clouds = cur["clouds"] # cloudiness in %
            rain = cur.get("rain", None)
            windspeed = cur["wind_speed"]
            icon = cur["weather"][0]["icon"]
            iconbase = "http://openweathermap.org/img/wn/"
            iconurl = iconbase + icon + "@2x.png"
            curdict = {"location": title, "time": dt, "temp":temp, "rain":rain, "sunrise":sunrise, "sunset":sunset, "clouds":clouds, "windspeed":windspeed, "iconurl":iconurl}
            # save it
            self.db.write("currentweather", curdict, "weather")
            # publish it
            self.watcher.publish(self, curdict)
            return {"status":200, "resource":curdict}
        except Exception as e:
            self.logger(e, "alert", "red")
            traceback.print_exc()
            return {"status":503, "resource": "something went wrong."}

    def startrun(self):
        """this is what gets called by main"""
        # init stuff..
        self.logger("running weather")
        #self.websetuptest()
        return self.getcurrentweather()
        
