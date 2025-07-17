/**
 * Simple logger that writes to a "Logs" sheet in the spreadsheet
 */
const Logger = {
  /**
   * Logs a message with timestamp to the Logs sheet
   * @param {string} level - Log level (INFO, ERROR, SUCCESS)
   * @param {string} message - Message to log
   * @param {Object} [data] - Optional data object to log
   */
  log(level, message, data = null) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
      let logSheet = ss.getSheetByName('Logs');
      
      // Create Logs sheet if it doesn't exist
      if (!logSheet) {
        logSheet = ss.insertSheet('Logs');
        logSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Message', 'Data']]);
        logSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      }
      
      const timestamp = new Date();
      const dataStr = data ? JSON.stringify(data) : '';
      
      logSheet.appendRow([timestamp, level, message, dataStr]);
      
      // Also log to console
      console.log(`[${level}] ${message}`, data || '');
      
    } catch (error) {
      console.error('Logger error:', error.message);
    }
  },
  
  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {Object} [data] - Optional data
   */
  info(message, data) {
    this.log('INFO', message, data);
  },
  
  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} [data] - Optional error data
   */
  error(message, data) {
    this.log('ERROR', message, data);
  },
  
  /**
   * Log success message
   * @param {string} message - Success message
   * @param {Object} [data] - Optional data
   */
  success(message, data) {
    this.log('SUCCESS', message, data);
  }
};