from traffic_flow import TrafficFlow 

class TrafficHandler:
    def __init__(self, connection: Connection):
        #Initialising TrafficHandler with a database connection
        self.connection = connection  
    
    #Saving a TrafficFlow object to the database
    def saveTrafficFlow(self, flow: TrafficFlow) -> None:
        pass

    def getTrafficFlow(self, name: str) -> TrafficFlow:
        pass

    def updateTrafficFlow(self, name: str, new_flow: TrafficFlow) -> None:
        pass

    def deleteTrafficFlow(self, name: str) -> None:
        pass


