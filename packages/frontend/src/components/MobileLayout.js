import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";
import BottomBar from "./BottomBar";

export default function MobileLayout({ children }) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    }

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mobile-canvas-wrapper">
      <div className="mobile-device-shell">
        {/* Barra superior de estado móvil simulada */}
        <div className="mobile-status-bar">
          <span className="status-time">{currentTime || "12:00"}</span>
          <div className="status-notch">
            <div className="notch-speaker"></div>
            <div className="notch-camera"></div>
          </div>
          <div className="status-icons">
            <Signal size={13} strokeWidth={2.5} />
            <Wifi size={13} strokeWidth={2.5} />
            <Battery size={15} strokeWidth={2.5} />
          </div>
        </div>

        {/* Contenido principal scrollable */}
        <main className="mobile-content-area">{children}</main>

        {/* Barra de navegación inferior móvil */}
        <BottomBar />

        {/* Indicador de barra inferior tipo iOS */}
        <div className="mobile-home-indicator">
          <div className="home-bar"></div>
        </div>
      </div>
    </div>
  );
}
