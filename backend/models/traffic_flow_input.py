from traffic_flow import TrafficFlow

class TrafficFlowInput:
    def __init__(self, name: str, traffic_flow: 'TrafficFlow'):
        self.name = name  
        self.trafficFlow = traffic_flow  
        self.errors: str = ""  

    def validateFlowRates(self) -> bool:
        pass

    #To save traffic flow after validation
    def saveTrafficFlow(self) -> bool:
        pass
