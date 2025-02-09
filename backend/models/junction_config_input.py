from junction_config import JunctionConfiguration 

class JunctionConfigurationInput:
    def __init__(self, name: str, junctionConfig: JunctionConfiguration):
        self.name = name  
        self.junctionConfig = junctionConfig  
        self.errors = "" 

    def validateConfiguration(self) -> None:
        pass

    def saveConfiguration(self) -> None:
        pass

