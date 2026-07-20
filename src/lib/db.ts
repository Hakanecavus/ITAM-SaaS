import { PrismaClient as MasterClient } from '../../prisma/client-master';
import { PrismaClient as TenantClient } from '../../prisma/client-tenant';
import fs from 'fs';
import path from 'path';

// Global master client instance
const globalForMaster = global as unknown as { masterPrisma: MasterClient };
export const masterDb = globalForMaster.masterPrisma || new MasterClient();
if (process.env.NODE_ENV !== 'production') globalForMaster.masterPrisma = masterDb;

// Tenant clients cache
const tenantClients: Record<string, TenantClient> = {};

export async function getTenantDb(subdomain: string): Promise<TenantClient> {
  if (tenantClients[subdomain]) {
    return tenantClients[subdomain];
  }

  // Check if tenant exists
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Determine the path to the sqlite DB
  // In production with postgres, this would be `postgres://user:pass@host/${tenant.dbName}`
  const dbPath = path.resolve(process.cwd(), 'prisma', `${tenant.dbName}.db`);
  const dbUrl = `file:${dbPath}`;

  const client = new TenantClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

  tenantClients[subdomain] = client;
  return client;
}

export async function provisionTenantDb(subdomain: string, dbName: string, email?: string, userName?: string, hashedPassword?: string) {
  // In PostgreSQL:
  // await masterDb.$executeRawUnsafe(`CREATE DATABASE ${dbName}`);
  
  // For local SQLite fallback, we just copy the placeholder DB
  const sourcePath = path.resolve(process.cwd(), 'prisma', 'tenant_placeholder.db');
  const targetPath = path.resolve(process.cwd(), 'prisma', `${dbName}.db`);

  if (!fs.existsSync(sourcePath)) {
     throw new Error(`Placeholder DB not found at ${sourcePath}`);
  }

  fs.copyFileSync(sourcePath, targetPath);

  // Seed default data
  const seedUrl = `file:../prisma/${dbName}.db`;
  const seedClient = new TenantClient({
    datasources: { db: { url: seedUrl } },
  });

  let createdUserId = null;

  try {
    await seedClient.assetCategory.createMany({
      data: [
        { name: 'Bilgisayar' },
        { name: 'Monitör' },
        { name: 'Yazıcı' },
        { name: 'Ağ Cihazı' },
        { name: 'Sunucu' },
        { name: 'Aksesuar' }
      ],
    });

    await seedClient.location.create({
      data: { name: 'Merkez Ofis' },
    });

    // If an initial user is provided, create the admin role and the user
    if (email && userName) {
      const adminRole = await seedClient.role.create({
        data: {
          name: 'Sistem Yöneticisi',
          description: 'Tüm yetkilere sahip kurucu rolü',
          permissions: JSON.stringify(['VIEW_DASHBOARD', 'VIEW_ASSETS', 'MANAGE_ASSETS', 'VIEW_USERS', 'MANAGE_USERS', 'VIEW_LICENSES', 'MANAGE_LICENSES', 'VIEW_CONSUMABLES', 'MANAGE_CONSUMABLES', 'MANAGE_ROLES', 'MANAGE_SETTINGS', 'VIEW_FINANCE', 'MANAGE_MAINTENANCE']),
          isDefault: true
        }
      });

      const user = await seedClient.user.create({
        data: {
          email,
          name: userName,
          canLogin: true,
          roleId: adminRole.id
        }
      });
      createdUserId = user.id;
    }

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await seedClient.$disconnect();
  }

  return { success: true, createdUserId };
}
