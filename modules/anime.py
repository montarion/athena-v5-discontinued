import os, requests, json, feedparser, re, time

from components.database import Database
from components.logger import Logger

class Anime:
    def __init__(self, Networking=None, Watcher=None):
        self.dependencies = {"tier": "user", "dependencies":["Networking", "Watcher"]}
        self.capabilities = ["timed"]
        self.timing = {"unit": "seconds", "count":20}
        self.networking = Networking
        # geen basics
        self.watcher = Watcher
        self.datapath = f"data/modules/{self.__class__.__name__.lower()}"
        self.retval = None
        # other init stuff happens in startrun

    def getshows(self, number = 1):
        base = f"https://nyaa.si/?page=rss&q={self.publishchoice}+%2B+[1080p]&c=1_2&f=0"
        feed = feedparser.parse(base)
        entries = feed.entries
        sessiondict = {}
        x = 0
        while x < number:
            try:
                entry = entries[x]
            except IndexError:
                self.logger(f"Tried index {x} and failed.")
                break
            try:
                title, show, episode = self.cleantitle(entry["title"])
            except:
                break
            link = entry["link"]
            if show in self.watchlist:
                self.logger(f"current: {show}")
                #sessiondict["command"] = "anime" #not sure what this is for
                sessiondict["title"] = show
                sessiondict["episode"] = episode
                if show not in self.maindict:
                    imagelink, bannerlink, maxepisodes = self.getinfo(show) #TODO add synopsis
                    self.maindict[show] = {"art":{}, "meta":{}}
                    self.maindict[show]["art"]["cover"] = imagelink
                    self.maindict[show]["art"]["banner"] = bannerlink
                    self.maindict[show]["meta"]["maxepisodes"] = maxepisodes
                sessiondict["art"] = {}
                sessiondict["art"]["cover"] = self.maindict[show]["art"]["cover"]
                sessiondict["art"]["banner"] = self.maindict[show]["art"]["banner"]

                self.maindict[show]["lastep"] = episode
                animedict = self.dbobj.gettable("anime")["resource"]
                lastshow = self.dbobj.query(["lastshow", "title"], "anime")["resource"]
                self.logger(lastshow, "alert", "yellow")
                #if animedict.get("lastshow", {"title":"show"})["title"] != show:
                if lastshow != show:
                    self.download(show, link)
                    ct = int(time.time())
                    self.maindict[show]["aired_at"] = ct
                    sessiondict["aired_at"] = ct
                    #targetlist = settings().checkavailability("computing")["resource"]
                    #if len(targetlist) == 0:
                    #Event().anime("aired")

                    # send the message - Just publish this and let someone else take care of it. example: "{type: "new show"} in metadata, for whoever is listening
                    #idlist = self.networking.findtarget("greytest")
                    #self.logger(f"REMOVE HARDCODED TARGET", "alert", "yellow")
                    category = "anime"
                    type = "latest"
                    artdict = sessiondict["art"]
                    data = {"title":show, "lastep": episode, "art":artdict, "aired_at":ct}
                    self.retval = data
                    metadata = {"status": 200}
                    #res = self.networking.messagebuilder(category, type, data, metadata, "all")
                    Database().write("lastshow", sessiondict, "anime")


                x += 1 else:
                number += 1
                x += 1
        Database().write("maindict", self.maindict, "anime")
        if self.retval:
            return self.retval



    def cleantitle(self, title):
        pattern = f"\[{self.publishchoice}\] (.*) - ([0-9]*).* .*\[1080p\].*.mkv"
        try:
            res = re.search(pattern, title)
            show = res.group(1)
            episode = res.group(2)
            newtitle = f"{show} - {episode}.mkv"
            return newtitle, show, episode
        except:
            self.logger(f"Failure to parse title: {title}", "alert", "red")
            exit(1)

    def getinfo(self, name):
        query = "query($title: String){Media (search: $title, type: ANIME){episodes, bannerImage, coverImage{extraLarge}}}" # this is graphQL, not REST
        variables = {'title': name}
        url = 'https://graphql.anilist.co'
        response = requests.post(url, json={'query': query, 'variables': variables})
        self.logger(response)
        preurl = json.loads(response.text)["data"]["Media"]

        self.logger(preurl, "debug", "red" )
        coverdict = preurl["coverImage"]
        bannerurl = preurl["bannerImage"]
        maxepisodes = preurl["episodes"]

        coverurl = coverdict[list(coverdict.keys())[0]]
        if bannerurl == None:
            bannerurl = coverurl

        return coverurl, bannerurl, maxepisodes

    def download(self, show, link):
        # check if folder exists:
        root = "/mnt/raspidisk/files/anime/"
        truepath = os.path.join(root, "\ ".join(show.split(" ")))
        check = os.path.isdir(truepath)
        if not check:
            self.logger("creating folder for {}".format(show), "debug")
            precommand = "sudo -H -u pi bash -c \""
            command = "mkdir {}".format(truepath)
            postcommand = "\""
            os.system(precommand + command + postcommand)
        else:
            self.logger("folder {} already existed".format(show), "debug")
        precommand = "sudo -H -u pi bash -c \""
        command = (precommand + r"deluge-console 'add -p {} {}'".format(truepath, link) + "\"")
        os.system(command)

    def findshows(self):
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from bs4 import BeautifulSoup

        url = "https://www.erai-raws.info/schedule/"
        chrome_opts = Options()
        chrome_opts.add_argument("--headless")
        chrome_opts.add_argument("--disable-gpu")
        chrome_opts.add_argument("--disable-extensions")
        chrome_opts.add_argument("--log-level=OFF")
        driver = webdriver.Chrome(options=chrome_opts)
        driver.get(url)
        sleep(6)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        preshows = soup.find_all("h6", "hhhh5")
        showlist = []
        chosenlist = []
        for show in preshows:
            showlist.append(''.join(show.find("a").contents).strip())

        for i, show in enumerate(showlist):
            print("Show number {} is: {}".format(i + 1, show))
            interest = input("w to add {}".format(show))
            if interest == "w":
                chosenlist.append(show)
        result = self.dbobj.write("watchlist", chosenlist, "anime")

        return chosenlist

    def startrun(self, number = 1):
        self.logger = Logger("Anime").logger
        self.dbobj = Database()
        self.publishchoice = "Erai-raws"
        prelist = self.dbobj.query("watchlist", "anime")
        if prelist["status"][:2] == "20":
            self.watchlist = prelist["resource"]
        else:
            self.watchlist = self.findshows()

        #self.publishchoice = "HorribleSubs"
        predict = self.dbobj.query("maindict", "anime")
        if predict["status"][:2] == "20":
            self.maindict = predict["resource"]
        else:
            self.maindict = {}

        result = self.getshows(number)
        if result:
            return result
