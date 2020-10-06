from components.logger import Logger

import requests, re, os, json, traceback, time
class Weather:
    def __init__(self, Database=None, Watcher=None):
        self.dependencies = {"tier":"standalone", "dependencies":["Database", "Watcher"]}
        self.capabilities = ["timed", "async"]
        self.timing = {"unit": "minutes", "count":10}
        print(Database)
        self.db = Database
        self.watcher = Watcher
        # do not add init stuff

    def doStuff(self):
        self.logger("Doing stuff...")
        # get openweatherAPI creds
    


    def websetuptest(self):
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
        title = self.db.query("city", "personalia")["resource"]
        apikey = self.db.query(["weather", "apikey"], "credentials")
        if str(apikey["status"])[0] == "2":
            apikey = apikey["resource"]
        else:
            self.logger("Couldn't find apikey, or user didn't respond. Exiting.")
            exit()
        lat,lon = "40.677748", "-73.906903"

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
        self.logger = Logger("Weather").logger
        self.logger("running weather")
        self.websetuptest()
        return self.getcurrentweather()
        
