import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../ui/card';

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card className="p-6 shadow-sm bg-white">
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                This system is designed to help you determine the most effective junction configurations for specific user-defined traffic flows. The system allows users to analyse different junction configurations and evaluate their efficiency by considering key performance indicators such as wait times and queue lengths. The objective is to assist in optimising junction design to improve traffic flow and be sustainable (encouraging the use of public transport and pedestrian friendly crossings).
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Traffic Data Input</h2>
              <p className="text-gray-600 mb-6">
                You will first be guided through the process of inputting traffic data; the system requires users to input traffic flow data for each direction at the junction. Users must enter the number of vehicles per hour for northbound, southbound, eastbound, and westbound directions. The values entered must be whole numbers within the range of 0 to 2000 vehicles per hour. The user must specify the exit direction of vehicles from each incoming flow, ensuring the sum of exit traffic equals the corresponding incoming traffic. The user must also provide a unique name to be assigned to the traffic flow.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Junction Configuration</h2>
              <p className="text-gray-600 mb-6">
                You will then be allowed to create a junction configuration, entering the following parameters: number of lanes per direction (which must be between one and five), the presence of a left-turn lane, a dedicated bus or cycle lane, pedestrian crossings, and priority levels for traffic flow. Each configuration must adhere to specific constraints, such as ensuring only one dedicated lane per direction and defining pedestrian crossing durations between 10 and 120 seconds. Priority values must be assigned uniquely to each direction, ranging from 0 (no priority) to 4 (highest priority), with multiple directions allowed to have a priority of 0. Additionally, lane merging isn't allowed, meaning that the number of lanes exiting one direction must equal the maximum number of lanes entering from a different direction heading into those lanes.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Simulation and Evaluation</h2>
              <p className="text-gray-600 mb-6">
                Once the required parameters are entered, users can initiate a simulation to evaluate the efficiency of their junction configuration. The system generates key performance indicators, including the average and maximum wait times per direction, maximum queue length per direction, and both efficiency and sustainability scores. These scores are represented as a percentage and provides a comparative metric to assess the effectiveness of different junction designs.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Can junction configurations be modified after running a simulation?</h3>
                  <p className="text-gray-600">Yes, this can be done by accessing the saved configurations page and making adjustments as needed.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">How can I compare junctions?</h3>
                  <p className="text-gray-600">You can save multiple configurations and review their corresponding efficiency scores.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  For additional assistance, users can contact the support team at{' '}
                  <a href="mailto:example@email.com" className="text-blue-600 hover:text-blue-800">
                    example@email.com
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;