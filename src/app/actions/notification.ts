'use server';

import { getTenantDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getUserNotifications(subdomain: string) {
  const session = await requireAuth();
  const db = await getTenantDb(subdomain);

  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const unreadCount = await db.notification.count({
    where: { userId: session.userId, isRead: false }
  });

  return { notifications, unreadCount };
}

export async function markNotificationAsRead(subdomain: string, notificationId: string) {
  const session = await requireAuth();
  const db = await getTenantDb(subdomain);

  await db.notification.updateMany({
    where: { 
      id: notificationId,
      userId: session.userId
    },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function markAllNotificationsAsRead(subdomain: string) {
  const session = await requireAuth();
  const db = await getTenantDb(subdomain);

  await db.notification.updateMany({
    where: { 
      userId: session.userId,
      isRead: false
    },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function createNotification(
  subdomain: string,
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO',
  link?: string
) {
  const db = await getTenantDb(subdomain);

  await db.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      isRead: false
    }
  });

  revalidatePath('/', 'layout');
  return { success: true };
}
