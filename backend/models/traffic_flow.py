class TrafficFlow:
    def __init__(self, name: str, flow_rates: dict[str, int], exit_distributions: dict[str, dict[str, int]]):
        self.name = name  # Name of the traffic flow
        self.flow_rates = flow_rates 
        self.exit_distributions = exit_distributions  # Nested Dictionary

    def validateFlowRates(self) -> bool:
        #Validate if flow rates are correct 
        pass

    def validateExitDistributions(self) -> bool:
        pass
