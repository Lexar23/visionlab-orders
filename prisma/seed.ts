
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  // Users for the 4 roles
  const users = [
    { email: "admin@vistracker.com", password: passwordHash, role: Role.ADMIN },
    { email: "calidad@vistracker.com", password: passwordHash, role: Role.CALIDAD },
    { email: "produccion@vistracker.com", password: passwordHash, role: Role.PRODUCCION },
    { email: "gerencia@vistracker.com", password: passwordHash, role: Role.GERENCIA },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { role: userData.role, password: passwordHash },
      create: userData,
    });
  }

  // Basic settings
  const branches = ["Sucursal Norte", "Sucursal Sur", "Sucursal Central"];
  const owners = ["Producción", "Calidad", "Teñido", "Gerencia"];

  for (const name of branches) {
    await prisma.branch.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const name of owners) {
    await prisma.taskOwner.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("✅ Seed data inserted with the 4 specific roles");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
