'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createTicket(subdomain: string, data: {
  title: string;
  description: string;
  priority: string;
  assetId?: string;
  userId: string;
}) {
  try {
    const db = await getTenantDb(subdomain);
    const ticket = await db.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'OPEN',
        assetId: data.assetId || null,
        createdById: data.userId,
      },
    });

    revalidatePath(`/tenant/${subdomain}/my-tickets`);
    revalidatePath(`/tenant/${subdomain}/tickets`);
    return { success: true, ticket };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: 'Talep oluşturulurken bir hata oluştu.' };
  }
}

export async function updateTicketStatus(subdomain: string, ticketId: string, status: string, assignedToId?: string) {
  try {
    const db = await getTenantDb(subdomain);
    const dataToUpdate: any = { status };
    if (assignedToId !== undefined) {
      dataToUpdate.assignedToId = assignedToId || null;
    }

    const ticket = await db.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
    });

    revalidatePath(`/tenant/${subdomain}/tickets`);
    revalidatePath(`/tenant/${subdomain}/tickets/${ticketId}`);
    revalidatePath(`/tenant/${subdomain}/my-tickets`);
    return { success: true, ticket };
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { success: false, error: 'Talep güncellenirken bir hata oluştu.' };
  }
}

export async function addTicketComment(subdomain: string, ticketId: string, userId: string, content: string, isInternal: boolean = false) {
  try {
    const db = await getTenantDb(subdomain);
    const comment = await db.ticketComment.create({
      data: {
        ticketId,
        userId,
        content,
        isInternal,
      },
    });

    revalidatePath(`/tenant/${subdomain}/tickets/${ticketId}`);
    return { success: true, comment };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Yorum eklenirken bir hata oluştu.' };
  }
}
