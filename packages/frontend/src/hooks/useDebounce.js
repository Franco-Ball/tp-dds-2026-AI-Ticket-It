import { useState, useEffect } from "react";

/**
 * Hook useDebounce: Retrasa la actualización del valor para evitar llamadas
 * excesivas a la API ante cada pulsación de tecla (Patrón de Sincronismo - Clase 10).
 *
 * @param {any} value - Valor que cambia frecuentemente (ej: texto del buscador)
 * @param {number} delayMs - Tiempo de espera en milisegundos (default 350ms)
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delayMs = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
