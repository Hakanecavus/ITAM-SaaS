import nodemailer from 'nodemailer';
import { getTenantDb } from '@/lib/db';

export async function getTransporter(subdomain: string) {
  const db = await getTenantDb(subdomain);
  const settings = await db.tenantSetting.findMany({
    where: {
      key: {
        in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
      }
    }
  });

  const config = {
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_FROM: ''
  };

  settings.forEach(s => {
    if (s.key in config) {
      (config as any)[s.key] = s.value;
    }
  });

  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    throw new Error('SMTP ayarları eksik. Lütfen Ayarlar > E-Posta(SMTP) bölümünü doldurun.');
  }

  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: parseInt(config.SMTP_PORT || '587', 10),
    secure: config.SMTP_SECURE === 'true',
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  return { transporter, from: config.SMTP_FROM || config.SMTP_USER };
}

export async function sendEmail(subdomain: string, to: string, subject: string, html: string) {
  try {
    const { transporter, from } = await getTransporter(subdomain);

    const info = await transporter.sendMail({
      from: `"${subdomain.toUpperCase()} ITAM" <${from}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
