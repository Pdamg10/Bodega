const cron = require("node-cron");
const { createBackup } = require("../utils/backup");
const { cleanOldBackups } = require("../utils/retention");

/**
 * Start automatic backup scheduler
 */
function startBackupScheduler() {
  const schedule = process.env.BACKUP_SCHEDULE || "0 2 * * *"; // Default: daily at 2 AM
  const enabled = process.env.AUTO_BACKUP_ENABLED === "true";

  if (!enabled) {
    console.log("Automatic backups are disabled");
    return;
  }

  console.log(`Automatic backup scheduler started. Schedule: ${schedule}`);

  cron.schedule(schedule, async () => {
    try {
      console.log("Running scheduled backup...");
      const backup = await createBackup("system-auto");
      console.log(`Automatic backup created: ${backup.filename}`);

      // Clean old backups (retention policy)
      const retention = await cleanOldBackups(30, 90);
      console.log(
        `Retention: ${retention.deleted} old backups deleted, ${retention.remaining} remaining`
      );
    } catch (error) {
      console.error("Scheduled backup failed:", error.message);
    }
  });
}

module.exports = { startBackupScheduler };
