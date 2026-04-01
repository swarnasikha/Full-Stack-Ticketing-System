export const TICKET_STATUSES = [
  'PendingReview',
  'Evaluating',
  'Accepted',
  'Rejected',
  'Scheduled',
  'InProgress',
  'ServiceExecution',
  'ResolutionPending',
  'Resolved',
  'Closed',
];

export const STATUS_TRANSITIONS = {
  'PendingReview':     ['Evaluating'],
  'Evaluating':        ['Accepted', 'Rejected'],
  'Accepted':          ['Scheduled'],
  'Rejected':          [],
  'Scheduled':         ['InProgress'],
  'InProgress':        ['ServiceExecution'],
  'ServiceExecution':  ['ResolutionPending'],
  'ResolutionPending': ['Resolved'],
  'Resolved':          ['Closed'],
  'Closed':            [],
};

export const SERVICE_TYPES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Cleaning',
  'Painting',
  'AC Repair',
  'Pest Control',
  'General Maintenance',
  'Technical Support',
  'Feature Request',
  'Complaint',
];

export const STATUS_COLORS = {
  'PendingReview':     'status-pending',
  'Evaluating':        'status-evaluating',
  'Accepted':          'status-accepted',
  'Rejected':          'status-rejected',
  'Scheduled':         'status-scheduled',
  'InProgress':        'status-in-progress',
  'ServiceExecution':  'status-execution',
  'ResolutionPending': 'status-resolution',
  'Resolved':          'status-resolved',
  'Closed':            'status-closed',
};

export const STEPPER_STAGES = [
  { id: 'created', label: 'Created', statuses: ['pendingreview', 'created'] },
  { id: 'reviewed', label: 'Reviewed', statuses: ['evaluating'] },
  { id: 'accepted', label: 'Accepted/Assigned', statuses: ['accepted', 'assigned'] },
  { id: 'scheduled', label: 'Scheduled', statuses: ['scheduled'] },
  { id: 'inprogress', label: 'In Progress', statuses: ['inprogress', 'serviceexecution'] },
  { id: 'completed', label: 'Completed', statuses: ['resolutionpending', 'resolved', 'completed'] },
  { id: 'closed', label: 'Closed', statuses: ['closed'] },
];

export function getStepperIndex(statusString) {
  const norm = (statusString || '').toString().toLowerCase().replace(/[\s_.-]+/g, '');
  const index = STEPPER_STAGES.findIndex(s => s.statuses.includes(norm));
  return index; // Returns -1 if rejected or unknown
}