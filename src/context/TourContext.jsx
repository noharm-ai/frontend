import React, { createContext, useContext, useState } from "react";

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [tutorialMode, setTutorialMode] = useState(false);

  const toggleTutorialMode = () => setTutorialMode((prev) => !prev);

  return (
    <TourContext.Provider value={{ tutorialMode, toggleTutorialMode }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
