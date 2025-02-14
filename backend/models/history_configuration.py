from models.junction_config import JunctionConfiguration

class HistoryConfiguration:
    def __init__(self):
        #Initialising HistoryConfiguration with an empty dictionary
        self.savedConfigurations: dict[str, JunctionConfiguration] = {}  # {String: JunctionConfiguration}

    def saveConfiguration(self, name: str, configuration: JunctionConfiguration) -> None:
        #Saving a JunctionConfiguration object
        pass

    def getConfiguration(self, name: str) -> JunctionConfiguration:
        #Retrieving the object by name
        #returns none if the configuration doesn't exist
        return self.savedConfigurations.get(name, None)

    def deleteConfiguration(self, name: str) -> bool:
        if name in self.savedConfigurations:
            del self.savedConfigurations[name]
            self.save_to_file()
            return True
        return False

    

    
        

