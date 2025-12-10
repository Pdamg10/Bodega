const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const BACKUP_DIR = path.join(__dirname, "../backups");
const DB_PATH = path.join(__dirname, "../bodega.sqlite");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a backup of the database
 * @param {string} createdBy - Username of who created the backup
 * @returns {Promise<object>} Backup info
 */
async function createBackup(createdBy = "system") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup_${timestamp}.sqlite`;
  const backupPath = path.join(BACKUP_DIR, filename);

  try {
    await copyFile(DB_PATH, backupPath);
    const stats = await stat(backupPath);

    return {
      filename,
      path: backupPath,
      size: stats.size,
      created_at: new Date(),
      created_by: createdBy,
    };
  } catch (error) {
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

/**
 * List all available backups
 * @returns {Promise<Array>} List of backups with metadata
 */
async function listBackups() {
  try {
    const files = await readdir(BACKUP_DIR);
    const backups = [];

    for (const file of files) {
      if (file.endsWith(".sqlite")) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await stat(filePath);
        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          created_at: stats.birthtime,
        });
      }
    }

    return backups.sort((a, b) => b.created_at - a.created_at);
  } catch (error) {
    throw new Error(`Failed to list backups: ${error.message}`);
  }
}

/**
 * Restore database from backup
 * @param {string} filename - Backup filename to restore
 * @returns {Promise<void>}
 */
async function restoreBackup(filename) {
  const backupPath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }

  try {
    // Create a safety backup before restoring
    await createBackup("pre-restore-safety");

    // Restore the backup
    await copyFile(backupPath, DB_PATH);

    return { message: "Database restored successfully" };
  } catch (error) {
    throw new Error(`Failed to restore backup: ${error.message}`);
  }
}

/**
 * Download backup file
 * @param {string} filename - Backup filename
 * @returns {string} Full path to backup file
 */
function getBackupPath(filename) {
  const backupPath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }

  return backupPath;
}

module.exports = {
  createBackup,
  listBackups,
  restoreBackup,
  getBackupPath,
};
