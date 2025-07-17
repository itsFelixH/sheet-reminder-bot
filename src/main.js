/**
 * Checks Google Sheet for tasks due today and sends email reminders
 * Runs daily via time-based trigger at 8 AM
 * @throws {Error} If sheet not found or other configuration issues
 */
function sendDailyReminders() {
  const { spreadsheetId, sheetName, dateColumn, actionColumn, startRow } = CONFIG;
  
  Logger.info('Starting daily reminder check');
  
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
      
      const rowDateFormatted = Utilities.formatDate(date, tz, "yyyy-MM-dd");
      
      if (rowDateFormatted === todayFormatted) {
        actions.push(action);
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
}