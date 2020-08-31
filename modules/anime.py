import os, requests, json, feedparser, re, time

from components.database import Database
from components.logger import Logger

class Anime:
    def __init__(self, Networking=None, Watcher=None):
        self.dependencies = ["Networking", "Watcher"]
        self.capabilities = ["timed"]
        self.timing = {"unit": "minutes", "count":2}
        self.networking = Networking
        self.watcher = Watcher
 
        # other init stuff happens in startrun

    def getshows(self, number = 1):
        base = f"https://nyaa.si/?page=rss&q={self.publishchoice}+%2B+[1080p]&c=1_2&f=2"
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

            title, show, episode = self.cleantitle(entry["title"])
            link = entry["link"]
            if show in self.watchlist:
                sessiondict["command"] = "anime"
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
                self.logger(f"current: {show}")
                if animedict.get("lastshow", {"title":"show"})["title"] != show:
                    self.download(show, link)
                    ct = int(time.time())
                    self.maindict[show]["aired_at"] = ct
                    sessiondict["aired_at"] = ct
                    #targetlist = settings().checkavailability("computing")["resource"]
                    #if len(targetlist) == 0:
                    #Event().anime("aired")
                    idlist = self.networking.findtarget("greytest")
                    self.logger(f"REMOVE HARDCODED TARGET", "alert", "yellow")
                    category = "anime"
                    type = "latest"
                    artdict = {"cover": imagelink, "banner": bannerlink}
                    data = {"title":show, "lastep": episode, "art":artdict, "aired_at":ct}
                    metadata = {"status": 200}
                    res = self.networking.messagebuilder(category, type, data, metadata, "all")
                    Database().write("lastshow", sessiondict, "anime")

                    # publish the data
                    self.watcher().publish(self, data)
                x += 1
            else:
                number += 1
                x += 1
        Database().write("animedict", self.maindict, "anime")




    def cleantitle(self, title):
        pattern = "\[HorribleSubs\] (.*) - ([0-9]*) \[1080p\].mkv"
        res = re.search(pattern, title)
        show = res.group(1)
        episode = res.group(2)
        newtitle = f"{show} - {episode}.mkv"
        return newtitle, show, episode

    def getinfo(self, name):
        query = "query($title: String){Media (search: $title, type: ANIME){episodes, bannerImage, coverImage{extraLarge}}}" # this is graphQL, not REST
        variables = {'title': name}
        url = 'https://graphql.anilist.co'
        response = requests.post(url, json={'query': query, 'variables': variables})
        preurl = json.loads(response.text)["data"]["Media"]

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
        from bs4 import BeautifulSoup

        url = "https://horriblesubs.info/current-season/"
        html = requests.get(url)
        soup = BeautifulSoup(html.text, "html.parser")
        preshows = soup.find_all(class_="ind-show")
        showlist = []
        chosenlist = []
        for show in preshows:
            showlist.append(show.find("a")["title"])

        for i, show in enumerate(showlist):
            print("Show number {} is: {}".format(i + 1, show))
            interest = input("w to add {}".format(show))
            if interest == "w":
                chosenlist.append(show)
        result = self.dbobj.write("watchlist", chosenlist, "anime")

        return result

    def startrun(self):
        self.logger = Logger("Anime").logger
        self.dbobj = Database()
        prelist = self.dbobj.query("watchlist", "anime")
        if prelist["status"] == 200:
            self.watchlist = prelist["resource"]
        else:
            self.watchlist = self.findshows()

        self.publishchoice = "HorribleSubs"
        predict = self.dbobj.query("maindict", "anime")
        if predict["status"] == 200:
            self.maindict = predict["resource"]
        else:
            self.maindict = {}

        
        self.getshows()
