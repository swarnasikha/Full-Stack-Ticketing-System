export const TICKET_STATUSES = [
  'Created',
  'Assigned',
  'Scheduled',
  'In Progress',
  'Completed',
  'Closed',
  'Cancelled'
];

export const STATUS_TRANSITIONS = {
  'Created': ['Assigned', 'Cancelled'],
  'Assigned': ['Scheduled', 'In Progress', 'Cancelled'],
  'Scheduled': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  'Completed': ['Closed'],
  'Closed': [],
  'Cancelled': []
};

export const SERVICE_TYPES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Cleaning',
  'Painting',
  'AC Repair',
  'Pest Control',
  'General Maintenance'
];

export const STATUS_COLORS = {
  'Created': 'status-created',
  'Assigned': 'status-assigned',
  'Scheduled': 'status-scheduled',
  'In Progress': 'status-in-progress',
  'Completed': 'status-completed',
  'Closed': 'status-closed',
  'Cancelled': 'status-cancelled'
};
