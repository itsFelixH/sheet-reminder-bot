/**
 * Checks Google Sheet for tasks due today and sends email reminders
 * Runs daily via time-based trigger at 8 AM
 * @throws {Error} If sheet not found or other configuration issues
 */
function sendDailyReminders() {
  const { spreadsheetId, sheetName, dateColumn, actionColumn, startRow } = CONFIG;
  
  Logger.info('Starting daily reminder check');
  
  // Configuration validation
  if (!validateConfiguration()) {
    Logger.error('Configuration validation failed');
    return;
  }
  
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const data = sheet.getRange(startRow, dateColumn, sheet.getLastRow() - startRow + 1, 2).getValues();
    const today = new Date();
    const tz = ss.getSpreadsheetTimeZone();
    
    const todayFormatted = Utilities.formatDate(today, tz, "yyyy-MM-dd");
    let actions = [];
    let totalRows = 0;
    let emptyRows = 0;

    data.forEach((row, index) => {
      const [date, action] = row;
      totalRows++;
      
      if (!date || !action) {
        emptyRows++;
        return;
      }
      
      // Skip invalid dates gracefully
      try {
        const rowDateFormatted = Utilities.formatDate(date, tz, "yyyy-MM-dd");
        
        if (rowDateFormatted === todayFormatted) {
          actions.push(action);
        }
      } catch (dateError) {
        Logger.error(`Invalid date in row ${startRow + index}`, {
          date: date,
          action: action,
          error: dateError.message
        });
      }
    });

    Logger.info('Sheet scan completed', {
      totalRows,
      emptyRows,
      tasksFound: actions.length,
      date: todayFormatted
    });

    if (actions.length > 0) {
      const emailBody = `
        <h2>📅 Scheduled Actions for Today (${todayFormatted})</h2>
        <ul>${actions.map(action => `<li>${action}</li>`).join('')}</ul>
        <p><i>Source: ${ss.getName()} - ${sheetName}</i></p>
      `;
      
      MailApp.sendEmail({
        to: Session.getActiveUser().getEmail(),
        subject: `Action Reminder: ${actions.length} task(s) due today`,
        htmlBody: emailBody
      });
      Logger.success('Reminder email sent', {
        taskCount: actions.length,
        tasks: actions
      });
    } else {
      Logger.info('No tasks due today');
    }
  } catch (error) {
    Logger.error('Daily reminder failed', {
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Validates configuration settings before running reminders
 * @returns {boolean} True if configuration is valid
 */
function validateConfiguration() {
  const { spreadsheetId, sheetName, dateColumn, actionColumn, startRow } = CONFIG;
  
  if (!spreadsheetId || spreadsheetId === 'YOUR_SHEET_ID_HERE') {
    Logger.error('Invalid spreadsheet ID in config');
    return false;
  }
  
  if (!sheetName) {
    Logger.error('Sheet name not configured');
    return false;
  }
  
  if (dateColumn < 1 || actionColumn < 1 || startRow < 1) {
    Logger.error('Invalid column or row numbers in config');
    return false;
  }
  
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.error(`Sheet "${sheetName}" not found in spreadsheet`);
      return false;
    }
    
    const maxColumn = Math.max(dateColumn, actionColumn);
    if (sheet.getLastColumn() < maxColumn) {
      Logger.error(`Sheet only has ${sheet.getLastColumn()} columns, need at least ${maxColumn}`);
      return false;
    }
    
    Logger.info('Configuration validation passed');
    return true;
    
  } catch (error) {
    Logger.error('Cannot access spreadsheet', { error: error.message });
    return false;
  }
}

/**
 * Creates a daily time-based trigger to run sendDailyReminders at 8 AM
 * Run this function once manually to set up automatic daily emails
 * @throws {Error} If trigger creation fails
 */
function createDailyTrigger() {
  ScriptApp.newTrigger('sendDailyReminders')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  
  Logger.success('Daily trigger created - emails will be sent at 8 AM');
}