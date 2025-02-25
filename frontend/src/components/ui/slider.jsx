import React, { useState, useEffect, useRef } from 'react';
import { cn } from "../../lib/utils";

const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100, 
  step = 1, 
  defaultValue = [0], 
  value,
  onValueChange,
  disabled = false,
  ...props 
}, ref) => {
  const [localValue, setLocalValue] = useState(value || defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

  // Update local value when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const calculateValue = (clientX) => {
    if (!trackRef.current) return localValue[0];

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.min(
      Math.max((clientX - rect.left) / rect.width, 0),
      1
    );
    
    let newValue = min + percentage * (max - min);
    
    // Apply step
    newValue = Math.round(newValue / step) * step;
    
    // Ensure value stays within bounds
    newValue = Math.min(Math.max(newValue, min), max);
    
    return newValue;
  };

  const handleMouseDown = (e) => {
    if (disabled) return;
    
    setIsDragging(true);
    const newValue = calculateValue(e.clientX);
    const newValues = [newValue];
    
    setLocalValue(newValues);
    if (onValueChange) onValueChange(newValues);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;
    
    const newValue = calculateValue(e.clientX);
    const newValues = [newValue];
    
    setLocalValue(newValues);
    if (onValueChange) onValueChange(newValues);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Calculate the percentage of the thumb position
  const percentage = ((localValue[0] - min) / (max - min)) * 100;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full h-6 flex items-center cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Track background */}
      <div
        ref={trackRef}
        className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        {/* Filled part of track */}
        <div 
          className="h-full bg-gray-800 rounded-full" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      
      {/* Thumb */}
      <div 
        className={cn(
          "absolute h-5 w-5 rounded-full bg-white border-2 border-gray-800 transform -translate-y-1/2 -translate-x-1/2 top-1/2 shadow",
          isDragging && "scale-110"
        )}
        style={{ left: `${percentage}%` }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };