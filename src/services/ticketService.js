import {
  collection, doc, onSnapshot, updateDoc, addDoc, getDoc,
  query, orderBy, serverTimestamp, Timestamp, limit, arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

const ticketsRef = collection(db, 'tickets');

/** Subscribe to tickets in real-time, fetching `limitAmount` or ALL if null */
export function subscribeToTickets(callback, limitAmount = 150) {
  const q = limitAmount !== null
    ? query(ticketsRef, orderBy('createdAt', 'desc'), limit(limitAmount))
    : query(ticketsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt:  d.data().createdAt?.toDate?.()  || null,
      updatedAt:  d.data().updatedAt?.toDate?.()  || null,
      scheduledAt: d.data().scheduledAt?.toDate?.() || null,
    }));
    callback(tickets);
  });
}

/** Strict validation helper method for advancing status */
export async function transitionTicket(ticketId, expectedStatuses, targetStatus, additionalFields = {}) {
  const ref = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) throw new Error('Ticket not found.');
  
  const currentStatus = snap.data().status || 'PendingReview';
  const normCurrent = currentStatus.toString().toLowerCase().replace(/[\s_.-]+/g, '');
  
  const allowed = expectedStatuses.map(s => s.toLowerCase().replace(/[\s_.-]+/g, ''));
  if (!allowed.includes(normCurrent)) {
    throw new Error(`Invalid transition. Cannot move from ${currentStatus} to ${targetStatus}`);
  }
  
  const payload = {
    status: targetStatus,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({
      status: targetStatus,
      timestamp: Timestamp.now(),
    }),
    ...additionalFields
  };
  
  await updateDoc(ref, payload);
}

/** Generic status update (used for manual overrides, still logged) */
export async function updateTicketStatus(ticketId, status) {
  const ref = doc(db, 'tickets', ticketId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({ status, timestamp: Timestamp.now() })
  });
}

// ── Strict Flow Action Handlers ───────────────────────────────

export async function startEvaluation(ticketId) {
  await transitionTicket(ticketId, ['pendingreview', 'created', 'open', 'pending'], 'Evaluating');
}

export async function acceptTicket(ticketId, agentId) {
  if (!agentId) throw new Error("Agent assignment required to accept ticket.");
  await transitionTicket(ticketId, ['evaluating'], 'Accepted', { assignedAgentId: agentId });
}

export async function rejectTicket(ticketId) {
  await transitionTicket(ticketId, ['evaluating'], 'Rejected');
}

export async function scheduleTicket(ticketId, scheduledDate) {
  await transitionTicket(ticketId, ['accepted', 'assigned'], 'Scheduled', {
    scheduledAt: Timestamp.fromDate(new Date(scheduledDate))
  });
}

export async function dispatchTicket(ticketId) {
  await transitionTicket(ticketId, ['scheduled'], 'InProgress');
}

export async function markServiceExecution(ticketId) {
  await transitionTicket(ticketId, ['inprogress'], 'ServiceExecution');
}

export async function markResolutionPending(ticketId) {
  await transitionTicket(ticketId, ['serviceexecution', 'inprogress'], 'ResolutionPending');
}

export async function resolveTicket(ticketId) {
  await transitionTicket(ticketId, ['resolutionpending', 'resolved', 'completed'], 'Closed');
}

export async function assignAgent(ticketId, agentId) {
  await updateDoc(doc(db, 'tickets', ticketId), {
    assignedAgentId: agentId,
    updatedAt: serverTimestamp(),
  });
}