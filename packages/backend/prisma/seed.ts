import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.agency.upsert({
    where: { code: "DEMO01" },
    update: {},
    create: {
      name: "Demo Agency",
      code: "DEMO01",
      email: "admin@demoagency.com",
      phone: "+919876543210",
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: {
      agencyId_email: { agencyId: agency.id, email: "admin@demoagency.com" },
    },
    update: {},
    create: {
      agencyId: agency.id,
      email: "admin@demoagency.com",
      phone: "+919876543210",
      passwordHash,
      name: "Admin User",
      role: Role.SUPER_ADMIN,
      department: null,
    },
  });

  await prisma.user.upsert({
    where: {
      agencyId_email: {
        agencyId: agency.id,
        email: "sales@demoagency.com",
      },
    },
    update: {},
    create: {
      agencyId: agency.id,
      email: "sales@demoagency.com",
      passwordHash,
      name: "Sales Manager",
      role: Role.SALES_MANAGER,
      department: "Sales",
    },
  });

  await prisma.user.upsert({
    where: {
      agencyId_email: { agencyId: agency.id, email: "ops@demoagency.com" },
    },
    update: {},
    create: {
      agencyId: agency.id,
      email: "ops@demoagency.com",
      passwordHash,
      name: "Ops Employee",
      role: Role.OPS_EMPLOYEE,
      department: "Operations",
    },
  });

  console.log("Seed complete: agency=%s, code=%s", agency.name, agency.code);
  console.log("Login: admin@demoagency.com / password123 / DEMO01");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
