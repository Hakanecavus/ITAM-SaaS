import { NextResponse } from 'next/server';
import { masterDb, getTenantDb } from '@/lib/db';

// This endpoint should ideally be protected by a cron secret (e.g. Vercel Cron Secret)
// For now, we will allow it to be called directly or you can add a secret header check.

export async function GET(req: Request) {
  try {
    const tenants = await masterDb.tenant.findMany();
    let totalAlertsGenerated = 0;

    for (const tenant of tenants) {
      const db = await getTenantDb(tenant.subdomain);

      // Find users with MANAGE_SYSTEM or MANAGE_ASSETS permissions to send alerts to
      // For simplicity, we send to users who are ADMINs (or you can filter by permissions)
      const adminUsers = await db.user.findMany({
        where: {
          role: { name: 'Sistem Yöneticisi' }
        }
      });

      if (adminUsers.length === 0) continue;

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 1. Warranty expiring
      const expiringWarranties = await db.asset.findMany({
        where: {
          warrantyEnd: { lte: thirtyDaysFromNow, gte: new Date() },
          status: { notIn: ['Hurda', 'Kayıp'] }
        }
      });

      for (const asset of expiringWarranties) {
        const link = `/assets/${asset.id}`;
        // Check if we already notified in the last 7 days
        const recentNotif = await db.notification.findFirst({
          where: { link, createdAt: { gte: sevenDaysAgo } }
        });

        if (!recentNotif) {
          for (const admin of adminUsers) {
            await db.notification.create({
              data: {
                userId: admin.id,
                title: 'Garanti Süresi Yaklaşıyor',
                message: `${asset.brandModel} (${asset.demiRbasNo}) cihazının garantisi yakında bitiyor.`,
                type: 'WARNING',
                link
              }
            });
            totalAlertsGenerated++;
          }
        }
      }

      // 2. Expiring Licenses
      const expiringLicenses = await db.license.findMany({
        where: {
          expirationDate: { lte: thirtyDaysFromNow, gte: new Date() }
        }
      });

      for (const license of expiringLicenses) {
        const link = `/licenses/${license.id}`;
        const recentNotif = await db.notification.findFirst({
          where: { link, createdAt: { gte: sevenDaysAgo } }
        });

        if (!recentNotif) {
          for (const admin of adminUsers) {
            await db.notification.create({
              data: {
                userId: admin.id,
                title: 'Lisans Süresi Yaklaşıyor',
                message: `${license.name} lisansının süresi yakında doluyor.`,
                type: 'WARNING',
                link
              }
            });
            totalAlertsGenerated++;
          }
        }
      }

      // 3. Low Consumables
      const lowConsumables = await db.consumable.findMany({
        // Cannot use field comparison in Prisma where directly easily without queryRaw
        // So we fetch all and filter in JS if necessary, but actually we can check if quantity <= minQuantity if we fetch all.
        // Or if minQuantity is a known value. Let's fetch all and filter since it's a cron.
      });

      const criticalConsumables = lowConsumables.filter(c => c.quantity <= c.minQuantity);

      for (const item of criticalConsumables) {
        const link = `/consumables/${item.id}`;
        const recentNotif = await db.notification.findFirst({
          where: { link, createdAt: { gte: sevenDaysAgo } }
        });

        if (!recentNotif) {
          for (const admin of adminUsers) {
            await db.notification.create({
              data: {
                userId: admin.id,
                title: 'Sarf Malzemesi Kritik Seviyede',
                message: `${item.name} stoğu kritik seviyeye (${item.quantity} adet) düştü.`,
                type: 'ERROR',
                link
              }
            });
            totalAlertsGenerated++;
          }
        }
      }

      // 4. Send Reminder Emails for Unread Notifications
      // "Eğer bir kişi uzun bir süre bildirimlerine bakmadıysa da hatırlatma maili gönderelim"
      // Check for notifications older than 3 days that are still unread.
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const unreadOldNotifications = await db.notification.findMany({
        where: {
          isRead: false,
          emailSent: false,
          createdAt: { lte: threeDaysAgo },
        }
      });

      if (unreadOldNotifications.length > 0) {
        // Group by user
        const notificationsByUser = unreadOldNotifications.reduce((acc, notif) => {
          if (!acc[notif.userId]) acc[notif.userId] = { count: 0, notifIds: [] };
          acc[notif.userId].count++;
          acc[notif.userId].notifIds.push(notif.id);
          return acc;
        }, {} as Record<string, { count: number; notifIds: string[] }>);

        const { sendEmail } = await import('@/lib/email');

        for (const userId in notificationsByUser) {
          const userObj = notificationsByUser[userId];
          const user = await db.user.findUnique({ where: { id: userId } });
          
          if (user) {
            const subject = 'Okunmamış ITAM Bildirimleriniz Var';
            const html = `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2>Merhaba ${user.name},</h2>
                <p>ITAM sisteminde incelemeniz gereken <strong>${userObj.count} adet</strong> okunmamış bildiriminiz bulunmaktadır.</p>
                <p>Lütfen en kısa sürede sisteme giriş yaparak bildirimlerinizi kontrol ediniz.</p>
                <br/>
                <a href="http://${tenant.subdomain}.localhost:3000/dashboard" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Sisteme Git
                </a>
                <br/><br/>
                <hr style="border: none; border-top: 1px solid #eaeaea;" />
                <small style="color: #888;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</small>
              </div>
            `;

            const emailResult = await sendEmail(tenant.subdomain, user.email, subject, html);
            
            if (emailResult.success) {
              // Mark these notifications as emailSent = true
              await db.notification.updateMany({
                where: { id: { in: userObj.notifIds } },
                data: { emailSent: true }
              });
              console.log(`Reminder email successfully sent to ${user.email} for ${userObj.count} notifications.`);
            } else {
              console.error(`Failed to send reminder email to ${user.email}: ${emailResult.error}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: `Cron executed. Generated ${totalAlertsGenerated} alerts.` });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
