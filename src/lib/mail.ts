import nodemailer from 'nodemailer';
import { getSmtpSettings } from '@/app/actions/settings';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  subdomain: string;
}

export async function sendMail({ to, subject, html, subdomain }: SendMailOptions) {
  try {
    const config = await getSmtpSettings(subdomain);

    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
      console.warn(`[${subdomain}] SMTP ayarları eksik. E-posta gönderilemedi:`, to);
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT || '587'),
      secure: config.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"ITAM" <${config.SMTP_FROM || config.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[${subdomain}] Message sent: %s`, info.messageId);
    return true;
  } catch (error) {
    console.error(`[${subdomain}] Error sending email:`, error);
    return false;
  }
}

export async function sendActionEmail(
  subdomain: string, 
  actionType: string, 
  userEmail: string, 
  userName: string, 
  assetName: string, 
  assetTag: string, 
  companyName: string, 
  returnDate?: Date | null
) {
  const { getEmailRules, getEmailTemplates } = await import('@/app/actions/settings');
  
  const rules = await getEmailRules(subdomain);
  const templates = await getEmailTemplates(subdomain);

  const rule = rules[actionType];
  
  // Kural yoksa veya aktif değilse mail atma
  if (!rule || !rule.isEnabled || !rule.templateId) {
    return false;
  }

  // Belirtilen şablonu bul
  const template = templates.find(t => t.id === rule.templateId);
  if (!template) {
    console.warn(`[${subdomain}] ${actionType} için atanan şablon (${rule.templateId}) bulunamadı.`);
    return false;
  }

  const actionLink = `https://${subdomain.toLowerCase()}.itam.com/my-assets`;
  const formattedReturnDate = returnDate ? returnDate.toLocaleDateString('tr-TR') : '';

  // Replacer function
  const compileTemplate = (text: string) => {
    return text
      .replace(/\{\{userName\}\}/g, userName)
      .replace(/\{\{assetName\}\}/g, assetName)
      .replace(/\{\{assetTag\}\}/g, assetTag)
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\{\{returnDate\}\}/g, formattedReturnDate)
      .replace(/\{\{actionLink\}\}/g, actionLink);
  };

  const subject = compileTemplate(template.subject);
  const html = compileTemplate(template.body);

  return sendMail({ to: userEmail, subject, html, subdomain });
}
