import React, { createContext, useContext, useState, useEffect } from "react";
import { clinics } from "../data/clinics";

const ClinicContext = createContext(null);

export const ClinicProvider = ({ children }) => {
  // Initialize state from LocalStorage, fallback to "devnayan"
  const [activeClinicId, setActiveClinicId] = useState(() => {
    const saved = localStorage.getItem("dentease.dashboard_clinic");
    return saved && clinics[saved] ? saved : "devnayan";
  });

  const clinic = clinics[activeClinicId] || clinics["devnayan"];

  const setClinicId = (id) => {
    if (clinics[id]) {
      setActiveClinicId(id);
      localStorage.setItem("dentease.dashboard_clinic", id);
    }
  };

  return (
    <ClinicContext.Provider value={{ clinic, activeClinicId, setClinicId, clinics }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
};
