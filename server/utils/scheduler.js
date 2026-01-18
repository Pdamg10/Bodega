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
    console.log("Los respaldos automáticos están deshabilitados");
    return;
  }

  console.log(`Programador de respaldos iniciado. Cron: ${schedule}`);

  cron.schedule(schedule, async () => {
    try {
      console.log("Ejecutando respaldo programado...");
      const backup = await createBackup("system-auto");
      console.log(`Respaldo automático creado: ${backup.filename}`);

      // Clean old backups (retention policy)
      const retention = await cleanOldBackups(30, 90);
      console.log(
        `Retención: ${retention.deleted} respaldos antiguos eliminados, ${retention.remaining} restantes`
      );
    } catch (error) {
      console.error("Falló el respaldo programado:", error.message);
    }
  });
}

module.exports = { startBackupScheduler };
