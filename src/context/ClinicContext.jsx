import React, { createContext, useContext, useState, useEffect } from "react";
import { clinics } from "../data/clinics";

const ClinicContext = createContext(null);

export const ClinicProvider = ({ children }) => {
  const [activeClinicId, setActiveClinicId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = params.get("clinic");
    return saved && clinics[saved] ? saved : "devnayan";
  });

  const clinic = clinics[activeClinicId] || clinics["devnayan"];

  const setClinicId = (id) => {
    if (clinics[id]) {
      setActiveClinicId(id);
      const url = new URL(window.location.href);
      url.searchParams.set("clinic", id);
      window.history.pushState({}, "", url.toString());
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
