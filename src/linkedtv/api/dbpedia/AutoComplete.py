from subprocess import Popen, PIPE
import simplejson

"""
Wrapper class for DBPedia Spotlight

extra info: https://github.com/dbpedia/lookup
"""

class AutoComplete():
    def __init__(self):
        self.DBPEDIA_ENDPOINT = 'http://lookup.dbpedia.org/api/search.asmx/PrefixSearch'
        self.DBPEDIA_MAPPING = {"what": ["Animal", "Mammal", "BiologicalDatabase", "Disease", "EurovisionSongContestEntry", "Gnetophytes", "GolfLeague", "GrandPrix", "LaunchPad", "Locomotive", "MixedMartialArtsEvent", "MotorcycleRacingLeague", "PersonFunction", "PoloLeague", "SnookerWorldRanking", "SoccerLeague", "SoftballLeague", "Spacecraft", "VideogamesLeague", "Species", "AcademicJournal", "Activity", "Album", "AmericanFootballLeague", "Amphibian", "Arachnid", "Archaea", "Artwork", "Asteroid", "AustralianFootballLeague", "AutoRacingLeague", "Automobile", "AutomobileEngine", "Award", "BaseballLeague", "BasketballLeague", "Beverage", "Biomolecule", "Bird", "BodyOfWater", "Bone", "Book", "BowlingLeague", "BoxingLeague", "Brain", "Bridge", "CanadianFootballLeague", "CelestialBody", "ChemicalCompound", "ChemicalElement", "ChemicalSubstance", "ClubMoss", "ComicBook", "Conifer", "Constellation", "CricketLeague", "Crustacean", "CurlingLeague", "Currency", "Cycad", "CyclingLeague", "Database", "Decoration", "Drug", "Eukaryote", "Event", "Fern", "FieldHockeyLeague", "Film", "FilmFestival", "Fish", "Flag", "FloweringPlant", "Food", "FootballMatch", "FormulaOneRacing", "Fungus", "Galaxy", "Game", "Gene", "GeneLocation", "Ginkgo", "GivenName", "GovernmentType", "Grape", "GreenAlga", "HandballLeague", "HumanGene", "HumanGeneLocation", "IceHockeyLeague", "Ideology", "Infrastructure", "InlineHockeyLeague", "Instrument", "LacrosseLeague", "Language", "LegalCase", "Legislature", "Letter", "Lymph", "MeanOfTransportation", "Mineral", "MixedMartialArtsLeague", "Monument", "Moss", "MouseGene", "MouseGeneLocation", "Muscle", "MusicFestival", "MusicGenre", "Name", "Nerve", "OlympicResult", "Olympics", "PaintballLeague", "Plant", "Play", "PowerStation", "ProgrammingLanguage", "Project", "Protein", "PublicTransitSystem", "Race", "RadioControlledRacingLeague", "Reptile", "ResearchProject", "RugbyLeague", "Sales", "SambaSchool", "Ship", "SoccerClubSeason", "SoccerLeagueSeason", "SoccerTournament", "Software", "Song", "SpaceMission", "SpaceShuttle", "SpeedwayLeague", "SpeedwayTeam", "Sport", "SportsEvent", "SportsLeague", "SportsTeamSeason", "Surname", "Tax", "TelevisionEpisode", "TelevisionSeason", "TennisLeague", "TennisTournament", "TopicalConcept", "Unknown", "Vein", "VideoGame", ""], "who": ["Ambassador", "Journalist", "Artist", "Writer", "Actor", "Agent", "AmericanFootballPlayer", "AmericanFootballTeam", "Architect", "Astronaut", "AustralianRulesFootballPlayer", "BadmintonPlayer", "Band", "BaseballPlayer", "BaseballTeam", "BasketballPlayer", "BasketballTeam", "Boxer", "BritishRoyalty", "BroadcastNetwork", "Broadcaster", "BullFighter", "CanadianFootballPlayer", "CanadianFootballTeam", "Cardinal", "Celebrity", "Chancellor", "ChessPlayer", "ChristianPatriarch", "College", "CollegeCoach", "ComicsCharacter", "ComicsCreator", "Company", "Congressman", "Cricketer", "Cyclist", "Deputy", "FictionalCharacter", "FigureSkater", "FormulaOneRacer", "GaelicGamesPlayer", "GeopoliticalOrganisation", "GovernmentAgency", "HockeyTeam", "IceHockeyPlayer", "Judge", "LawFirm", "Library", "Lieutenant", "Magazine", "MartialArtist", "Mayor", "MemberOfParliament", "MilitaryPerson", "MilitaryUnit", "Model", "MusicalArtist", "NationalCollegiateAthleticAssociationAthlete", "NascarDriver", "NationalSoccerClub", "Newspaper", "Non-ProfitOrganisation", "OfficeHolder", "Organisation", "OrganisationMember", "Person", "Philosopher", "PlayboyPlaymate", "PokerPlayer", "PolishKing", "PoliticalParty", "Politician", "Pope", "President", "Priest", "RadioStation", "RecordLabel", "Referee", "RugbyClub", "RugbyPlayer", "Saint", "Scientist", "Senator", "SnookerChamp", "SnookerPlayer", "SoccerClub", "SoccerManager", "SoccerPlayer", "SportsTeam", "SportsTeamMember", "Swimmer", "TeamMember", "TelevisionStation", "TennisPlayer", "TradeUnion", "University", "VicePresident", "VicePrimeMinister"], "where": ["AdministrativeRegion", "Restaurant", "Skyscraper", "RoadTunnel", "WineRegion", "ArchitecturalStructure", "Arena", "Atoll", "Canal", "Cave", "City", "Continent", "Convention", "HistoricBuilding", "HistoricPlace", "Hospital", "Hotel", "Lake", "Lighthouse", "LunarCrater", "Mountain", "MountainPass", "MountainRange", "NaturalPlace", "Park", "Place", "PopulatedPlace", "ProtectedArea", "RailwayLine", "RailwayTunnel", "ReligiousBuilding", "River", "Road", "RoadJunction", "RouteOfTransportation", "School", "Settlement", "ShoppingMall", "SiteOfSpecialScientificInterest", "SkiArea", "SpaceStation", "Stadium", "Station", "SupremeCourtOfTheUnitedStatesCase", "Theatre", "Town", "Tunnel", "Valley", ""]}
        self.DBPEDIA_ONTOLOGY_PF = 'http://dbpedia.org/ontology/'
        
    def autoComplete(self, prefix, queryClass = '', maxHits = 10):        
        url = '%s?QueryClass=%s&MaxHits=%d&QueryString=%s' % (self.DBPEDIA_ENDPOINT, queryClass, maxHits, prefix.replace(' ', '+'))        
        cmd_arr = []
        cmd_arr.append('curl')
        cmd_arr.append('-X')
        cmd_arr.append('GET')
        cmd_arr.append(url)
        cmd_arr.append('-H')
        cmd_arr.append('Accept: application/json')        
        p1 = Popen(cmd_arr, stdout=PIPE)
        output = p1.communicate()[0]
        data = simplejson.loads(output)
        options = []     
        classes = None                
        for res in data['results']:
            DBPediaClass = 'unknown'
            classes = res['classes']
            for c in classes:
                DBPediaClass = self.getDBPediaMapping(c)
                if DBPediaClass != 'unknown':
                    options.append({'label' : '%s|%s|%s' % (res['label'], c['uri'][len(self.DBPEDIA_ONTOLOGY_PF):], DBPediaClass),
                                    'value' : res['uri']})
                    break
            if len(classes) == 0:
                options.append({'label' : '%s|%s|%s' % (res['label'], 'Thing', 'unknown'),
                                'value' : res['uri']})
        return options
            
    def getDBPediaMapping(self, DBPediaClass):
        className = DBPediaClass['uri']
        if className.find(self.DBPEDIA_ONTOLOGY_PF) == -1:
            return 'unknown'
        else:
            className = className[len(self.DBPEDIA_ONTOLOGY_PF):]
            for k in self.DBPEDIA_MAPPING.keys():
                if className in self.DBPEDIA_MAPPING[k]:
                    return k    
        return 'unknown'
        
