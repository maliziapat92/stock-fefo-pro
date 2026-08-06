import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {

  const [nombreAlertes, setNombreAlertes] = useState(0);

  return (
    <AlertContext.Provider
      value={{
        nombreAlertes,
        setNombreAlertes
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertes() {
  return useContext(AlertContext);
}
