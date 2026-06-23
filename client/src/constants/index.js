export const CATEGORIES = [
  { name: 'Tech', icon: 'Monitor' },
  { name: 'Music', icon: 'Music' },
  { name: 'Sports', icon: 'Trophy' },
  { name: 'Business', icon: 'Briefcase' },
  { name: 'Education', icon: 'BookOpen' },
  { name: 'Gaming', icon: 'Gamepad2' },
  { name: 'Workshop', icon: 'Wrench' },
  { name: 'Other', icon: 'Calendar' },
];

export const ROLES = {
  USER: 'user',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
  GUEST: 'guest',
};

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const TICKET_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const CITIES = [
  'New York', 'San Francisco', 'London', 'Berlin',
  'Tokyo', 'Sydney', 'Toronto', 'Mumbai', 'Dubai', 'Paris',
];
