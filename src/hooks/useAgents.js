import { useState, useEffect } from 'react';
import { subscribeToAgents } from '../services/agentService';

export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAgents((data) => {
      setAgents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { agents, loading };
}
