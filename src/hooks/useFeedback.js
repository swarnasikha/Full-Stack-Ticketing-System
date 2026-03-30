import { useState, useEffect } from 'react';
import { subscribeFeedback } from '../services/feedbackService';

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeFeedback((data) => {
      setFeedbacks(Array.isArray(data) ? data : []);
      setLoading(false);
    }, (error) => {
      console.error('Feedback subscription error:', error);
      setFeedbacks([]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { feedbacks: feedbacks ?? [], loading };
}
