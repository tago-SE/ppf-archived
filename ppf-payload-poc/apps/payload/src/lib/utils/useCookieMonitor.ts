import { useEffect, useState } from "react";

export const useCookieMonitor = (cookieName: string, interval = 1000) => {
    const [cookieValue, setCookieValue] = useState("");
  
    useEffect(() => {
      const getCookie = () => {
        const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
        return match ? match[2] : "";
      };
  
      let lastValue = getCookie();
      setCookieValue(lastValue);
  
      const checkCookie = () => {
        const currentValue = getCookie();
        if (currentValue !== lastValue) {
          setCookieValue(currentValue);
          lastValue = currentValue;
        }
      };
  
      const intervalId = setInterval(checkCookie, interval);
  
      return () => clearInterval(intervalId);
    }, [cookieName, interval]);
  
    return cookieValue;
}