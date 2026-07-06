const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');
const NotificationLog = require('../models/NotificationLog');
const logger = require('./logger');

// Environment variables should be set in .env
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  }
});

let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  logger.error('Twilio initialization failed', { error });
}

/**
 * Queue a notification to be sent by the background worker
 */
const queueNotification = async (options) => {
  try {
    await NotificationLog.create({
      user: options.user,
      type: options.type, // 'email', 'sms', 'whatsapp'
      recipient: options.recipient,
      subject: options.subject,
      body: options.body,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Failed to queue notification', { error, options });
  }
};

/**
 * Send an email notification immediately
 */
const sendEmail = async (logEntry) => {
  try {
    await transporter.sendMail({
      from: `"Satyam Printing Press" <${process.env.FROM_EMAIL || 'noreply@satyampress.com'}>`,
      to: logEntry.recipient,
      subject: logEntry.subject,
      html: logEntry.body
    });
    return true;
  } catch (error) {
    logger.error('Email send failed', { error: error.message, recipient: logEntry.recipient });
    throw error;
  }
};

/**
 * Send an SMS via Twilio
 */
const sendSMS = async (logEntry) => {
  if (!twilioClient) throw new Error('Twilio not configured');
  try {
    await twilioClient.messages.create({
      body: logEntry.body,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: logEntry.recipient
    });
    return true;
  } catch (error) {
    logger.error('SMS send failed', { error: error.message, recipient: logEntry.recipient });
    throw error;
  }
};

/**
 * Send a WhatsApp message via Twilio
 */
const sendWhatsApp = async (logEntry) => {
  if (!twilioClient) throw new Error('Twilio not configured');
  try {
    // Twilio WhatsApp numbers require a 'whatsapp:' prefix
    const to = logEntry.recipient.startsWith('whatsapp:') ? logEntry.recipient : `whatsapp:${logEntry.recipient}`;
    const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    
    await twilioClient.messages.create({
      body: logEntry.body,
      from: from,
      to: to
    });
    return true;
  } catch (error) {
    logger.error('WhatsApp send failed', { error: error.message, recipient: logEntry.recipient });
    throw error;
  }
};

/**
 * Process pending and failed notifications
 */
const processNotifications = async () => {
  // Find pending or failed messages that haven't exhausted retries
  const logs = await NotificationLog.find({
    status: { $in: ['pending', 'failed'] },
    retryCount: { $lt: 3 }
  }).limit(50); // Process in batches

  for (const log of logs) {
    try {
      let success = false;
      if (log.type === 'email') {
        success = await sendEmail(log);
      } else if (log.type === 'sms') {
        success = await sendSMS(log);
      } else if (log.type === 'whatsapp') {
        success = await sendWhatsApp(log);
      }

      if (success) {
        log.status = 'sent';
        log.errorDetails = '';
        await log.save();
      }
    } catch (error) {
      log.status = 'failed';
      log.retryCount += 1;
      log.errorDetails = error.message;
      await log.save();
    }
  }
};

// Start background worker (runs every 5 minutes)
const startWorker = () => {
  cron.schedule('*/5 * * * *', () => {
    processNotifications();
  });
  logger.info('Notification worker started');
};

module.exports = {
  queueNotification,
  startWorker
};
