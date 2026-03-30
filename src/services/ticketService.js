import {
  collection, doc, onSnapshot, updateDoc, addDoc, deleteDoc,
  query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const ticketsRef = collection(db, 'tickets');

/** Subscribe to all tickets in real-time ordered by creation date */
export function subscribeToTickets(callback) {
  const q = query(ticketsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || null,
      updatedAt: d.data().updatedAt?.toDate?.() || null,
      scheduledAt: d.data().scheduledAt?.toDate?.() || null,
    }));
    callback(tickets);
  });
}

/** Update ticket status */
export async function updateTicketStatus(ticketId, status) {
  await updateDoc(doc(db, 'tickets', ticketId), {
    status,
    updatedAt: serverTimestamp()
  });
}

/** Assign agent to ticket */
export async function assignAgent(ticketId, agentId) {
  await updateDoc(doc(db, 'tickets', ticketId), {
    assignedAgentId: agentId,
    status: 'Assigned',
    updatedAt: serverTimestamp()
  });
}

/** Schedule a ticket */
export async function scheduleTicket(ticketId, scheduledDate) {
  await updateDoc(doc(db, 'tickets', ticketId), {
    scheduledAt: Timestamp.fromDate(new Date(scheduledDate)),
    status: 'Scheduled',
    updatedAt: serverTimestamp()
  });
}
