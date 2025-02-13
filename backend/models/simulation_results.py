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
    #Need the object to be converted to a dictionary for JSON storage
    
    #To convert SimulationResults object to dictionary
    def to_dict(self) -> dict:
        return {
            "average_wait_times" : self.averageWaitTimes,
            "max_wait_times" : self.maxWaitTimes,
            "max_queue_lengths" : self.maxQueueLengths,
            "efficiency_score" : self.efficiencyScore,
            "sustainability_score" : self.sustainabilityScore
        }

    #To recreate object from dictionary
    @staticmethod #from_dict() doesn't use self
    def from_dict(results: dict) -> 'SimulationResults':
        return SimulationResults(
            average_wait_times = results.get("average_wait_times", {}),
            max_wait_times = results.get("max_wait_times" , {}),
            max_queue_lengths = results.get("max_queue_lengths" ,{}),
            efficiency_score = results.get("efficiency_score", 0.0),
            sustainability_score = results.get("sustainability_score", 0.0)
        )

