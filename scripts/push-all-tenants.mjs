import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const prismaDir = path.resolve(process.cwd(), 'prisma');
const files = fs.readdirSync(prismaDir);

const tenantDbs = files.filter(f => f.endsWith('.db') && f !== 'master.db');

for (const dbFile of tenantDbs) {
  console.log(`Pushing schema to ${dbFile}...`);
  const dbUrl = `file:./${dbFile}`;
  try {
    execSync(`npx prisma db push --schema=prisma/tenant.prisma`, {
      env: { ...process.env, TENANT_DATABASE_URL: dbUrl },
      stdio: 'inherit'
    });
    console.log(`Successfully pushed to ${dbFile}`);
  } catch (err) {
    console.error(`Failed to push to ${dbFile}`, err);
  }
}
