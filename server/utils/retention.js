const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

const BACKUP_DIR = path.join(__dirname, "../backups");

/**
 * Clean old backups based on retention policy
 * @param {number} maxBackups - Maximum number of backups to keep (default: 30)
 * @param {number} maxAgeDays - Maximum age in days (default: 90)
 */
async function cleanOldBackups(maxBackups = 30, maxAgeDays = 90) {
  try {
    const files = await readdir(BACKUP_DIR);
    const backups = [];

    // Get all backup files with metadata
    for (const file of files) {
      if (file.endsWith(".sqlite")) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await stat(filePath);
        backups.push({
          filename: file,
          path: filePath,
          created: stats.birthtime,
          age: (Date.now() - stats.birthtime.getTime()) / (1000 * 60 * 60 * 24), // days
        });
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => b.created - a.created);

    const toDelete = [];

    // Delete backups beyond maxBackups count
    if (backups.length > maxBackups) {
      toDelete.push(...backups.slice(maxBackups));
    }

    // Delete backups older than maxAgeDays
    for (const backup of backups) {
      if (backup.age > maxAgeDays && !toDelete.includes(backup)) {
        toDelete.push(backup);
      }
    }

    // Perform deletions
    for (const backup of toDelete) {
      await unlink(backup.path);
      console.log(
        `Respaldo antiguo eliminado: ${backup.filename} (edad: ${backup.age.toFixed(
          1
        )} días)`
      );
    }

    return {
      total: backups.length,
      deleted: toDelete.length,
      remaining: backups.length - toDelete.length,
    };
  } catch (error) {
    console.error("Error al limpiar respaldos antiguos:", error);
    throw error;
  }
}

module.exports = { cleanOldBackups };
