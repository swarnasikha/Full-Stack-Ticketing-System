import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const feedbackRef = collection(db, 'feedback');

/** Subscribe to all feedback in real-time */
export function subscribeFeedback(callback, onError) {
  const q = query(feedbackRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const feedbacks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || null,
      }));
      callback(feedbacks);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
