from junction_config import JunctionConfiguration

class HistoryConfiguration:
    def __init__(self):
        #Initialising HistoryConfiguration with an empty dictionary
        self.savedConfigurations: dict[str, JunctionConfiguration] = {}  # {String: JunctionConfiguration}

    def saveConfiguration(self, name: str, configuration: JunctionConfiguration) -> None:
        #Saving a JunctionConfiguration object
        pass

    def getConfiguration(self, name: str) -> JunctionConfiguration:
        #Retrieving the object by name 
        pass

