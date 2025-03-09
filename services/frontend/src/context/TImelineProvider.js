import React, { createContext, useContext, useEffect, useState } from "react";
import assetService from "../services/AssetService";

const TimelineContext = createContext(false);

export const TimelineProvider = ({ children, assetId, accessoryTypeId }) => {
    
    const [selectedEvent, setSelectedEvent ] = useState(null);

    return (
        <TimelineContext.Provider value={{ assetId, accessoryTypeId, selectedEvent, setSelectedEvent }}>
            {children}
        </TimelineContext.Provider>
    );
}

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};
