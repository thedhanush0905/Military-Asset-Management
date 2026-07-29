import prisma = require("./shared/prisma/prisma.js");

async function main() {
  console.log("====================================================");
  console.log("PHASE 5 INTEGRATION END-TO-END VERIFICATION SUITE");
  console.log("====================================================");

  // Setup: Get baseline users
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" } });
  if (!admin) {
    console.error("Missing baseline ACTIVE admin user.");
    process.exit(1);
  }

  // --------------------------------------------------------------------
  // MODULE 14: PERSONNEL VERIFICATION
  // --------------------------------------------------------------------
  console.log("\n--- Verification: Module 14 - Personnel ---");
  const testSN = `SN-${Date.now().toString().slice(-6)}`;
  
  // 1. Create Profile
  const profile = await prisma.personnel.create({
    data: {
      serviceNumber: testSN,
      rank: "Maj.",
      firstName: "James",
      lastName: "Miller",
      status: "ACTIVE",
      email: `${testSN.toLowerCase()}@military.gov`,
      phone: "+1-555-9988",
    },
  });
  console.log(`✓ Personnel profile created: ${profile.rank} ${profile.firstName} ${profile.lastName} (SN: ${profile.serviceNumber})`);

  // 2. Read & Search Profile
  const readProfile = await prisma.personnel.findFirst({
    where: { serviceNumber: testSN },
  });
  if (readProfile) {
    console.log(`✓ Verified profile read query: rank equals ${readProfile.rank}`);
  } else {
    throw new Error("Failed to query personnel profile");
  }

  // 3. Update Rank
  const updatedProfile = await prisma.personnel.update({
    where: { id: profile.id },
    data: { rank: "Col.", status: "DEPLOYED" },
  });
  console.log(`✓ Personnel rank promoted: ${updatedProfile.rank} (status: ${updatedProfile.status})`);

  // --------------------------------------------------------------------
  // MODULE 15: SUPPLIERS VERIFICATION
  // --------------------------------------------------------------------
  console.log("\n--- Verification: Module 15 - Suppliers ---");
  const testCode = `NGC-${Date.now().toString().slice(-4)}`;

  // 1. Create Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: "Northrop Grumman Systems Corp",
      code: testCode,
      contactName: "Col. Thomas Miller",
      email: "procure@ngc.com",
      phone: "+1-555-1234",
      status: "ACTIVE",
    },
  });
  console.log(`✓ Supplier record created: ${supplier.name} (${supplier.code})`);

  // 2. Read & Update Supplier
  const updatedSupplier = await prisma.supplier.update({
    where: { id: supplier.id },
    data: { contactName: "Dr. Elizabeth Vance", status: "ACTIVE" },
  });
  console.log(`✓ Supplier contact updated: ${updatedSupplier.contactName}`);

  // --------------------------------------------------------------------
  // MODULE 16: ORGANIZATION UNITS VERIFICATION
  // --------------------------------------------------------------------
  console.log("\n--- Verification: Module 16 - Organization Units ---");
  const testOrgCode = `DIV-${Date.now().toString().slice(-4)}`;

  // 1. Create Organization Unit
  const unit = await prisma.organizationUnit.create({
    data: {
      name: "101st Airborne Division Node",
      code: testOrgCode,
      level: "DIVISION",
    },
  });
  console.log(`✓ Organization unit created: ${unit.name} (${unit.code})`);

  // 2. Update Unit
  const updatedUnit = await prisma.organizationUnit.update({
    where: { id: unit.id },
    data: { name: "101st Combat Assault Division" },
  });
  console.log(`✓ Organization unit updated: ${updatedUnit.name}`);

  // --------------------------------------------------------------------
  // MODULE 17: SYSTEM NOTIFICATIONS VERIFICATION
  // --------------------------------------------------------------------
  console.log("\n--- Verification: Module 17 - Notifications ---");
  
  // 1. Create Notification
  const notification = await prisma.notification.create({
    data: {
      userId: admin.id,
      title: "TACTICAL ALERT: DEPOT COMPROMISE CHECK",
      message: "Check the status of base perimeter inventory gates.",
      type: "SYSTEM",
      priority: "CRITICAL",
      isRead: false,
    },
  });
  console.log(`✓ Critical system notification registered for Admin: ${notification.title}`);

  // 2. Mark Notification as Read
  const readNotification = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true, readAt: new Date() },
  });
  console.log(`✓ Notification status updated: isRead = ${readNotification.isRead}`);

  // --------------------------------------------------------------------
  // MODULE 18: AUDIT LOGS VERIFICATION
  // --------------------------------------------------------------------
  console.log("\n--- Verification: Module 18 - Audit Logs ---");
  
  // 1. Log an action
  const audit = await prisma.auditLog.create({
    data: {
      userId: admin.id,
      performedByType: "USER",
      module: "AUTH",
      action: "LOGIN",
      entityType: "User",
      entityId: admin.id,
      result: "SUCCESS",
      ipAddress: "127.0.0.1",
      userAgent: "E2E Integration Agent",
    },
  });
  console.log(`✓ Audit log database entry recorded for Admin login: result = ${audit.result}`);

  // 2. Query Logs
  const loggedAudit = await prisma.auditLog.findUnique({
    where: { id: audit.id },
  });
  if (loggedAudit) {
    console.log(`✓ Verified audit log search query for module: ${loggedAudit.module}`);
  } else {
    throw new Error("Audit log entry not retrieved");
  }

  // --------------------------------------------------------------------
  // MODULE 20: SYSTEM CONFIGURATION VERIFICATION
  // --------------------------------------------------------------------
  console.log("\n--- Verification: Module 20 - System Configuration ---");
  const testConfigKey = `ALERT_COORD_${Date.now().toString().slice(-4)}`;

  // 1. Upsert config
  const config = await prisma.systemConfig.upsert({
    where: { key: testConfigKey },
    update: { value: "YELLOW" },
    create: { key: testConfigKey, value: "RED", description: "Tactical defense level key" },
  });
  console.log(`✓ System configuration upserted: ${config.key} = ${config.value}`);

  // 2. Deleting config
  const deletedConfig = await prisma.systemConfig.delete({
    where: { key: testConfigKey },
  });
  console.log(`✓ Destructive delete verification completed for: ${deletedConfig.key}`);

  // Cleanup: Delete tested profiles/suppliers/units/notifications/audits
  await prisma.personnel.delete({ where: { id: profile.id } });
  await prisma.supplier.delete({ where: { id: supplier.id } });
  await prisma.organizationUnit.delete({ where: { id: unit.id } });
  await prisma.notification.delete({ where: { id: notification.id } });
  await prisma.auditLog.delete({ where: { id: audit.id } });
  console.log("\n✓ Cleanup operations completed successfully.");

  console.log("\n====================================================");
  console.log("ALL E2E VERIFICATION SCENARIOS PASSED SUCCESSFULLY");
  console.log("====================================================");
}

main()
  .catch((e) => {
    console.error("\n❌ Verification Failed!");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
