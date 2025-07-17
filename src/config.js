/**
 * Configuration for Sheet Reminder Bot
 * @typedef {Object} Config
 * @property {string} spreadsheetId - Google Sheet ID from the URL
 * @property {string} sheetName - Name of the sheet tab to read from
 * @property {number} dateColumn - Column number for dates (1 = Column A)
 * @property {number} actionColumn - Column number for actions (2 = Column B)
 * @property {number} priorityColumn - Column number for priority (3 = Column C, optional)
 * @property {number} timeColumn - Column number for specific times (4 = Column D, optional)
 * @property {number} startRow - First row with data (2 = skip header row)
 * @property {number} reminderHour - Hour to send daily reminders (0-23)
 * @property {number} advanceDays - Days before due date to send advance reminders (0 = disabled)
 */
const CONFIG = {
  spreadsheetId: "1Rmh1Jci1w6Syw31p3Wkfzuf4mPSfaebVpZvgnGZnhG4",
  sheetName: "Reminder",
  dateColumn: 1,
  actionColumn: 2,
  priorityColumn: 3, // Optional: High/Medium/Low or leave empty
  timeColumn: 4, // Optional: specific times like "14:30" or "2:30 PM"
  startRow: 2,
  reminderHour: 8,
  advanceDays: 1 // Send reminders 1 day before due date (0 = disabled)
};