from components.logger import Logger

import requests, re, os, json, traceback, time
class Weather:
    def __init__(self, Database=None):
        self.dependencies = {"tier":"standalone", "dependencies":["Database"]}
        self.capabilities = ["timed", "async"]
        self.timing = {"unit": "minutes", "count":10}

        self.db = Database
        # do not add init stuff

    def doStuff(self):
        self.logger("Doing stuff...")
        # get openweatherAPI creds
        
    def getcurrentweather(self):
        title = "CITYNAME"
        apikey = "APIKEY"
        lat, lon = "0.00", "1.11"
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

            return {"status":200, "resource":curdict}
        except Exception as e:
            #self.logger(e, "alert", "red")
            traceback.print_exc()
            return {"status":503, "resource": "something went wrong."}

    def startrun(self):
        """this is what gets called by main"""
        # init stuff..
        self.logger = Logger("Weather").logger
        self.getcurrentweather()
        
