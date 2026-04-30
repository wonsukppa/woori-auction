import { useState, useEffect, useCallback } from 'react';
import { AuctionProperty } from '../types/auction';

export const useAuctionData = () => {
  const [properties, setProperties] = useState<AuctionProperty[]>([]);
  const [activeProperty, setActiveProperty] = useState<AuctionProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProperties(data);
        // Set first property as active by default if none selected
        if (!activeProperty) {
          setActiveProperty(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch auction data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeProperty]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    properties,
    activeProperty,
    setActiveProperty,
    isLoading,
    refresh: fetchData
  };
};
