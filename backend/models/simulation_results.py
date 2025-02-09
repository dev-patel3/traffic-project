class SimulationResults:
    def __init__(self, 
                 average_wait_times: dict[str, float], 
                 max_wait_times: dict[str, int], 
                 max_queue_lengths: dict[str, int], 
                 efficiency_score: float, 
                 sustainability_score: float):
        
        self.averageWaitTimes = average_wait_times  
        self.maxWaitTimes = max_wait_times  
        self.maxQueueLengths = max_queue_lengths  
        self.efficiencyScore = efficiency_score  
        self.sustainabilityScore = sustainability_score  

    #To save SimulationResults to a database/file
    #Need the object to be converted to a dictionary 
    
    #To convert object to dictionary
    def to_dict(self) -> dict:
        pass

    #To recreate object from dictionary
    @staticmethod #from_dict() doesn't use self
    def from_dict(data: dict) -> 'SimulationResults':
        pass

