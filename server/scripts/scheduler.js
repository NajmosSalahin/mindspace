import cron from 'node-cron';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { sendEventReminderEmail } from '../services/email.js';

export const startReminderScheduler = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Checking events for 24-hour reminders...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

      const events = await Event.find({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'published',
        isDeleted: false,
      });

      for (const event of events) {
        const tickets = await Ticket.find({
          eventId: event._id,
          status: 'active',
        }).populate('userId', 'email name');

        const sentTo = new Set();
        for (const ticket of tickets) {
          const email = ticket.userId?.email;
          const name = ticket.userId?.name;
          if (email && !sentTo.has(email)) {
            sentTo.add(email);
            try {
              await sendEventReminderEmail(
                email,
                name || 'Attendee',
                event.title,
                event.date.toDateString(),
                event.startTime,
                `${event.venue}, ${event.city}`
              );
            } catch (err) {
              console.error(`[Scheduler] Failed reminder email to ${email}:`, err.message);
            }
          }
        }
        console.log(`[Scheduler] Sent ${sentTo.size} reminders for "${event.title}"`);
      }

      console.log(`[Scheduler] Done — processed ${events.length} events`);
    } catch (error) {
      console.error('[Scheduler] Error:', error.message);
    }
  });

  console.log('[Scheduler] Reminder cron job started (runs daily at 8 AM)');
};
