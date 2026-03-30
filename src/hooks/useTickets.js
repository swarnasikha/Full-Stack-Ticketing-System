import { useState, useEffect } from 'react';
import { subscribeToTickets } from '../services/ticketService';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTickets((data) => {
      setTickets(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { tickets, loading };
}
