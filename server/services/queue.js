import Bull from 'bull';
import { sendEmail } from './email.js';
import logger from './logger.js';

let emailQueue;
let enabled = false;

try {
  emailQueue = new Bull('email', {
    redis: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  emailQueue.on('error', (err) => {
    if (err.message?.includes('ECONNREFUSED')) {
      if (enabled) {
        logger.warn('[Queue] Redis unavailable — email queue disabled, falling back to direct send');
        enabled = false;
      }
      return;
    }
    logger.error('[Queue] Error:', err);
  });

  emailQueue.on('ready', () => {
    enabled = true;
    logger.info('[Queue] Email queue ready');
  });

  emailQueue.process(async (job) => {
    const { to, subject, html, text } = job.data;
    await sendEmail({ to, subject, html, text });
  });

  emailQueue.isReady().then(() => {
    enabled = true;
    logger.info('[Queue] Email queue connected to Redis');
  }).catch(() => {
    logger.warn('[Queue] Redis not available — email queue disabled');
  });
} catch {
  logger.warn('[Queue] Redis/Bull setup failed — email queue disabled');
}

export const addEmailJob = async (data) => {
  if (enabled) {
    try {
      await emailQueue.add(data);
      return true;
    } catch {
      // fall through to direct send
    }
  }
  await sendEmail(data);
  return false;
};

export const getQueueStats = async () => {
  if (!enabled) return { enabled: false };
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
    ]);
    return { enabled: true, waiting, active, completed, failed };
  } catch {
    return { enabled: false };
  }
};

export { emailQueue, enabled };
