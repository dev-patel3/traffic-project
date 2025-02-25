import React from 'react';
import { Stage, Layer, Rect, Line, Group, Text } from 'react-konva';
import './JunctionVisualization.css';
// Note: You'll need to install react-konva and konva:
// npm install react-konva konva

const JunctionVisualization = ({ junctionConfig }) => {
  // Constants for visualization
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 800;
  const LANE_WIDTH = 50;
  const ROAD_LENGTH = 300;
  const JUNCTION_CENTER_X = CANVAS_WIDTH / 2;
  const JUNCTION_CENTER_Y = CANVAS_HEIGHT / 2;
  
  // Get maximum number of lanes for junction size calculation
  const maxLanes = Math.max(
    junctionConfig?.northbound?.num_lanes || 1,
    junctionConfig?.southbound?.num_lanes || 1,
    junctionConfig?.eastbound?.num_lanes || 1,
    junctionConfig?.westbound?.num_lanes || 1
  );
  
  // Junction center size will be based on maximum lanes
  const JUNCTION_SIZE = maxLanes * LANE_WIDTH;

  // Direction calculations
  const getRoadPosition = (direction, laneNumber, totalLanes) => {
    const junctionHalfSize = JUNCTION_SIZE / 2;
    const offset = (laneNumber - (totalLanes / 2) + 0.5) * LANE_WIDTH;
    
    switch(direction) {
      case 'northbound':
        return {
          x: JUNCTION_CENTER_X + offset,
          y: JUNCTION_CENTER_Y - junctionHalfSize,
          endX: JUNCTION_CENTER_X + offset,
          endY: JUNCTION_CENTER_Y - junctionHalfSize - ROAD_LENGTH,
          rotation: 0
        };
      case 'southbound':
        return {
          x: JUNCTION_CENTER_X - offset,
          y: JUNCTION_CENTER_Y + junctionHalfSize,
          endX: JUNCTION_CENTER_X - offset,
          endY: JUNCTION_CENTER_Y + junctionHalfSize + ROAD_LENGTH,
          rotation: 180
        };
      case 'eastbound':
        return {
          x: JUNCTION_CENTER_X + junctionHalfSize,
          y: JUNCTION_CENTER_Y - offset,
          endX: JUNCTION_CENTER_X + junctionHalfSize + ROAD_LENGTH,
          endY: JUNCTION_CENTER_Y - offset,
          rotation: 90
        };
      case 'westbound':
        return {
          x: JUNCTION_CENTER_X - junctionHalfSize,
          y: JUNCTION_CENTER_Y + offset,
          endX: JUNCTION_CENTER_X - junctionHalfSize - ROAD_LENGTH,
          endY: JUNCTION_CENTER_Y + offset,
          rotation: 270
        };
      default:
        return { x: 0, y: 0, endX: 0, endY: 0, rotation: 0 };
    }
  };

  // Helper function to draw lanes for a direction
  const drawLanes = (direction) => {
    if (!junctionConfig) return [];
    
    const config = junctionConfig[direction];
    if (!config) return [];
    
    const numLanes = config.num_lanes || 1;
    const hasLeftTurn = config.enable_left_turn_lane || false;
    const hasBusCycle = config.enable_bus_cycle_lane || false;
    // Check if pedestrian crossing is enabled either by explicit flag or by having duration and requests
    const hasPedestrianCrossing = config.pedestrian_crossing_enabled || 
      (config.pedestrian_crossing_duration > 0 && config.pedestrian_crossing_requests_per_hour > 0);
    
    const lanes = [];
    let laneCount = numLanes;
    
    if (hasLeftTurn) laneCount += 1;
    if (hasBusCycle) laneCount += 1;
    
    for (let i = 0; i < laneCount; i++) {
      const isLeftTurnLane = hasLeftTurn && i === 0;
      const isBusCycleLane = hasBusCycle && (hasLeftTurn ? i === 1 : i === 0);
      const isRegularLane = !isLeftTurnLane && !isBusCycleLane;
      
      let laneColor = "#333"; // Regular lane color
      if (isLeftTurnLane) laneColor = "#444"; // Left turn lane
      if (isBusCycleLane) {
        laneColor = config.transport_type === 'bus' ? "#5a6b8c" : "#7fad71"; // Bus or Cycle lane
      }
      
      const pos = getRoadPosition(direction, i, laneCount);
      
      lanes.push(
        <Group key={`${direction}-lane-${i}`}>
          {/* Lane */}
          <Rect
            x={direction === 'eastbound' || direction === 'westbound' ? 
               Math.min(pos.x, pos.endX) : pos.x - LANE_WIDTH/2}
            y={direction === 'northbound' || direction === 'southbound' ? 
               Math.min(pos.y, pos.endY) : pos.y - LANE_WIDTH/2}
            width={direction === 'eastbound' || direction === 'westbound' ? 
                  Math.abs(pos.endX - pos.x) : LANE_WIDTH}
            height={direction === 'northbound' || direction === 'southbound' ? 
                   Math.abs(pos.endY - pos.y) : LANE_WIDTH}
            fill={laneColor}
            stroke="white"
            strokeWidth={1}
          />
          
          {/* Lane markings */}
          {isRegularLane && drawLaneMarkings(direction, pos)}
          
          {/* Left turn arrows */}
          {isLeftTurnLane && drawLeftTurnArrow(direction, pos)}
          
          {/* Bus/Cycle lane markings */}
          {isBusCycleLane && (
            <Text
              x={direction === 'northbound' || direction === 'southbound' ? 
                 pos.x - 15 : pos.x - 60}
              y={direction === 'northbound' || direction === 'southbound' ? 
                 pos.y - 100 : pos.y - 10}
              text={config.transport_type === 'bus' ? "BUS" : "BIKE"}
              fill="white"
              fontSize={12}
              fontStyle="bold"
            />
          )}
          
          {/* Pedestrian Crossing - temporarily removed
          {(config.pedestrian_crossing_enabled || 
            (config.pedestrian_crossing_duration > 0 && config.pedestrian_crossing_requests_per_hour > 0)) && 
            drawPedestrianCrossing(direction, pos, laneCount)} */}
        </Group>
      );
    }
    
    return lanes;
  };

  const drawLaneMarkings = (direction, pos) => {
    const markingLength = 20;
    const markingSpacing = 40;
    const markingCount = Math.floor(ROAD_LENGTH / markingSpacing);
    const markings = [];
    
    for (let i = 1; i < markingCount; i++) {
      let x1, y1, x2, y2;
      
      switch(direction) {
        case 'northbound':
          x1 = pos.x;
          y1 = pos.y - i * markingSpacing;
          x2 = pos.x;
          y2 = y1 - markingLength;
          break;
        case 'southbound':
          x1 = pos.x;
          y1 = pos.y + i * markingSpacing;
          x2 = pos.x;
          y2 = y1 + markingLength;
          break;
        case 'eastbound':
          x1 = pos.x + i * markingSpacing;
          y1 = pos.y;
          x2 = x1 + markingLength;
          y2 = pos.y;
          break;
        case 'westbound':
          x1 = pos.x - i * markingSpacing;
          y1 = pos.y;
          x2 = x1 - markingLength;
          y2 = pos.y;
          break;
        default:
          continue;
      }
      
      markings.push(
        <Line
          key={`${direction}-marking-${i}`}
          points={[x1, y1, x2, y2]}
          stroke="white"
          strokeWidth={3}
          dash={[15, 15]}
        />
      );
    }
    
    return markings;
  };

  const drawLeftTurnArrow = (direction, pos) => {
    const arrowSize = 15;
    let x, y, rotation;
    
    switch(direction) {
      case 'northbound':
        x = pos.x;
        y = pos.y - 50;
        rotation = -90;
        break;
      case 'southbound':
        x = pos.x;
        y = pos.y + 50;
        rotation = 90;
        break;
      case 'eastbound':
        x = pos.x + 50;
        y = pos.y;
        rotation = 180;
        break;
      case 'westbound':
        x = pos.x - 50;
        y = pos.y;
        rotation = 0;
        break;
      default:
        x = 0;
        y = 0;
        rotation = 0;
    }
    
    return (
      <Group x={x} y={y} rotation={rotation}>
        <Line
          points={[-arrowSize, -arrowSize, 0, 0, -arrowSize, arrowSize]}
          stroke="white"
          strokeWidth={3}
        />
        <Line
          points={[0, 0, -arrowSize * 2.5, 0]}
          stroke="white"
          strokeWidth={3}
        />
      </Group>
    );
  };

  const drawPedestrianCrossing = (direction, pos, laneCount) => {
    const stripWidth = 10;
    const stripSpacing = 5;
    let x1, y1, x2, y2, stripsCount;
    
    switch(direction) {
      case 'northbound':
        x1 = pos.x - LANE_WIDTH * 1.5;
        y1 = pos.y - 20;
        x2 = pos.x + LANE_WIDTH * (laneCount - 0.5);
        y2 = pos.y - 20;
        stripsCount = Math.floor((x2 - x1) / (stripWidth + stripSpacing));
        break;
      case 'southbound':
        x1 = pos.x - LANE_WIDTH * (laneCount - 0.5);
        y1 = pos.y + 20;
        x2 = pos.x + LANE_WIDTH * 1.5;
        y2 = pos.y + 20;
        stripsCount = Math.floor((x2 - x1) / (stripWidth + stripSpacing));
        break;
      case 'eastbound':
        x1 = pos.x + 20;
        y1 = pos.y - LANE_WIDTH * (laneCount - 0.5);
        x2 = pos.x + 20;
        y2 = pos.y + LANE_WIDTH * 1.5;
        stripsCount = Math.floor((y2 - y1) / (stripWidth + stripSpacing));
        break;
      case 'westbound':
        x1 = pos.x - 20;
        y1 = pos.y - LANE_WIDTH * 1.5;
        x2 = pos.x - 20;
        y2 = pos.y + LANE_WIDTH * (laneCount - 0.5);
        stripsCount = Math.floor((y2 - y1) / (stripWidth + stripSpacing));
        break;
      default:
        return null;
    }
    
    const crossing = [];
    
    for (let i = 0; i < stripsCount; i++) {
      if (direction === 'northbound' || direction === 'southbound') {
        crossing.push(
          <Rect
            key={`${direction}-crossing-${i}`}
            x={x1 + i * (stripWidth + stripSpacing)}
            y={y1 - stripWidth / 2}
            width={stripWidth}
            height={stripWidth * 3}
            fill="white"
          />
        );
      } else {
        crossing.push(
          <Rect
            key={`${direction}-crossing-${i}`}
            x={x1 - stripWidth / 2}
            y={y1 + i * (stripWidth + stripSpacing)}
            width={stripWidth * 3}
            height={stripWidth}
            fill="white"
          />
        );
      }
    }
    
    return crossing;
  };

  // Draw junction box
  const drawJunctionBox = () => {
    return (
      <Rect
        x={JUNCTION_CENTER_X - JUNCTION_SIZE / 2}
        y={JUNCTION_CENTER_Y - JUNCTION_SIZE / 2}
        width={JUNCTION_SIZE}
        height={JUNCTION_SIZE}
        fill="#555"
        stroke="yellow"
        strokeWidth={2}
        dash={[20, 10]}
      />
    );
  };

  // Draw grass areas
  const drawGrassAreas = () => {
    const grassColor = "#4a7c3a";
    const grassAreas = [];
    
    // Top-left corner
    grassAreas.push(
      <Rect
        key="grass-top-left"
        x={0}
        y={0}
        width={JUNCTION_CENTER_X - JUNCTION_SIZE / 2}
        height={JUNCTION_CENTER_Y - JUNCTION_SIZE / 2}
        fill={grassColor}
      />
    );
    
    // Top-right corner
    grassAreas.push(
      <Rect
        key="grass-top-right"
        x={JUNCTION_CENTER_X + JUNCTION_SIZE / 2}
        y={0}
        width={CANVAS_WIDTH - (JUNCTION_CENTER_X + JUNCTION_SIZE / 2)}
        height={JUNCTION_CENTER_Y - JUNCTION_SIZE / 2}
        fill={grassColor}
      />
    );
    
    // Bottom-left corner
    grassAreas.push(
      <Rect
        key="grass-bottom-left"
        x={0}
        y={JUNCTION_CENTER_Y + JUNCTION_SIZE / 2}
        width={JUNCTION_CENTER_X - JUNCTION_SIZE / 2}
        height={CANVAS_HEIGHT - (JUNCTION_CENTER_Y + JUNCTION_SIZE / 2)}
        fill={grassColor}
      />
    );
    
    // Bottom-right corner
    grassAreas.push(
      <Rect
        key="grass-bottom-right"
        x={JUNCTION_CENTER_X + JUNCTION_SIZE / 2}
        y={JUNCTION_CENTER_Y + JUNCTION_SIZE / 2}
        width={CANVAS_WIDTH - (JUNCTION_CENTER_X + JUNCTION_SIZE / 2)}
        height={CANVAS_HEIGHT - (JUNCTION_CENTER_Y + JUNCTION_SIZE / 2)}
        fill={grassColor}
      />
    );
    
    return grassAreas;
  };

  // Draw sidewalks/pavements
  const drawSidewalks = () => {
    const pavementColor = "#bbb";
    const pavementWidth = 30;
    const sidewalks = [];
    
    // Sidewalk borders - horizontal roads
    sidewalks.push(
      <Rect
        key="sidewalk-north-top"
        x={JUNCTION_CENTER_X - JUNCTION_SIZE / 2}
        y={0}
        width={JUNCTION_SIZE}
        height={JUNCTION_CENTER_Y - JUNCTION_SIZE / 2 - pavementWidth}
        fill={pavementColor}
      />
    );
    
    sidewalks.push(
      <Rect
        key="sidewalk-south-bottom"
        x={JUNCTION_CENTER_X - JUNCTION_SIZE / 2}
        y={JUNCTION_CENTER_Y + JUNCTION_SIZE / 2 + pavementWidth}
        width={JUNCTION_SIZE}
        height={CANVAS_HEIGHT - (JUNCTION_CENTER_Y + JUNCTION_SIZE / 2 + pavementWidth)}
        fill={pavementColor}
      />
    );
    
    // Sidewalk borders - vertical roads
    sidewalks.push(
      <Rect
        key="sidewalk-west-left"
        x={0}
        y={JUNCTION_CENTER_Y - JUNCTION_SIZE / 2}
        width={JUNCTION_CENTER_X - JUNCTION_SIZE / 2 - pavementWidth}
        height={JUNCTION_SIZE}
        fill={pavementColor}
      />
    );
    
    sidewalks.push(
      <Rect
        key="sidewalk-east-right"
        x={JUNCTION_CENTER_X + JUNCTION_SIZE / 2 + pavementWidth}
        y={JUNCTION_CENTER_Y - JUNCTION_SIZE / 2}
        width={CANVAS_WIDTH - (JUNCTION_CENTER_X + JUNCTION_SIZE / 2 + pavementWidth)}
        height={JUNCTION_SIZE}
        fill={pavementColor}
      />
    );
    
    return sidewalks;
  };

  if (!junctionConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No junction configuration available</p>
      </div>
    );
  }

  return (
    <div className="junction-visualization-container">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {/* Background Layer */}
        <Layer>
          <Rect 
            x={0} 
            y={0} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT} 
            fill="#777" // Road background
          />
          {drawGrassAreas()}
          {drawSidewalks()}
        </Layer>
        
        {/* Roads Layer */}
        <Layer>
          {drawJunctionBox()}
          {drawLanes('northbound')}
          {drawLanes('southbound')}
          {drawLanes('eastbound')}
          {drawLanes('westbound')}
        </Layer>
      </Stage>
    </div>
  );
};

export default JunctionVisualization;