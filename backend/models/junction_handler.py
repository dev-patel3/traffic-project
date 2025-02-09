from sqlalchemy.engine.base import Connection  # SQLAlchemy connection 
from junction_config import JunctionConfiguration  

class JunctionHandler:
    def __init__(self, connection: Connection):
        self.connection = connection  

    #To save a JunctionConfiguration object
    def saveConfiguration(self, junctionConfig: JunctionConfiguration) -> None:
        pass

    def getTrafficFlow(self, name: str) -> JunctionConfiguration:
        pass

    def updateConfiguration(self, name: str, newConfig: JunctionConfiguration) -> None:
        pass

    def deleteTrafficFlow(self, name: str) -> None:
        pass
