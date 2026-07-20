const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, 'prisma');
const files = fs.readdirSync(prismaDir);

for (const file of files) {
  if (file.startsWith('tenant_') && file.endsWith('.db')) {
    const dbPath = `file:${file}`;
    console.log(`Migrating ${dbPath}...`);
    try {
      execSync(`npx prisma db push --schema prisma/tenant.prisma`, {
        env: { ...process.env, TENANT_DATABASE_URL: dbPath },
        stdio: 'inherit'
      });
    } catch (e) {
      console.error(`Failed to migrate ${file}`);
    }
  }
}
