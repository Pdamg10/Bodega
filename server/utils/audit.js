const { AuditLog } = require("../models");

/**
 * Log an action to the audit trail
 * @param {object} data - Audit log data
 * @param {number|null} data.user_id - User ID
 * @param {string} data.username - Username
 * @param {string} data.action - Action type (CREATE, UPDATE, DELETE, etc.)
 * @param {string|null} data.table_name - Table name
 * @param {number|null} data.row_id - Row ID
 * @param {object|null} data.before_value - Previous state
 * @param {object|null} data.after_value - New state
 * @param {string|null} data.ip_address - IP address
 * @param {string|null} data.description - Description
 * @returns {Promise<AuditLog>}
 */
async function logAudit({
  user_id = null,
  username,
  action,
  table_name = null,
  row_id = null,
  before_value = null,
  after_value = null,
  ip_address = null,
  description = null,
}) {
  try {
    return await AuditLog.create({
      user_id,
      username,
      action,
      table_name,
      row_id,
      before_value: before_value ? JSON.stringify(before_value) : null,
      after_value: after_value ? JSON.stringify(after_value) : null,
      ip_address,
      description,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - we don't want audit logging to break the app
  }
}

/**
 * Middleware to log product changes
 */
function auditProductChange(action) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Log after successful operation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const username = req.user?.username || "unknown";
        const user_id = req.user?.id || null;
        const ip_address = req.ip || req.connection.remoteAddress;

        logAudit({
          user_id,
          username,
          action,
          table_name: "Products",
          row_id: data?.id || req.params?.id || null,
          before_value: req.originalProduct || null,
          after_value: data,
          ip_address,
          description: `${action} product ${data?.name || req.params?.id}`,
        });
      }

      return originalJson(data);
    };

    next();
  };
}

module.exports = {
  logAudit,
  auditProductChange,
};
