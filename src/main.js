function sendDailyReminders() {
  // Configuration
  const sheetName = "Sheet1";
  const dateColumn = 1;
  const actionColumn = 2;
  const startRow = 2;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const data = sheet.getRange(startRow, dateColumn, sheet.getLastRow() - startRow + 1, 2).getValues();
    const today = new Date();
    const tz = ss.getSpreadsheetTimeZone();
    
    const todayFormatted = Utilities.formatDate(today, tz, "yyyy-MM-dd");
    let actions = [];

    data.forEach((row, index) => {
      const [date, action] = row;
      
      // Skip empty rows
      if (!date || !action) return; 
      
      // Format row date same as today
      const rowDateFormatted = Utilities.formatDate(date, tz, "yyyy-MM-dd");
      
      if (rowDateFormatted === todayFormatted) {
        actions.push(`• ${action}`);
      }
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
      console.log(`Reminder email sent with ${actions.length} items`);
    } else {
      console.log("No actions found for today");
    }
  } catch (error) {
    console.error("Error: " + error.message);
  }
}

// Create daily trigger
function createDailyTrigger() {
  ScriptApp.newTrigger('sendDailyReminders')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
}