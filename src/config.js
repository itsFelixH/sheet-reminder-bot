/**
 * Configuration for Sheet Reminder Bot
 * @typedef {Object} Config
 * @property {string} spreadsheetId - Google Sheet ID from the URL
 * @property {string} sheetName - Name of the sheet tab to read from
 * @property {number} dateColumn - Column number for dates (1 = Column A)
 * @property {number} actionColumn - Column number for actions (2 = Column B)
 * @property {number} startRow - First row with data (2 = skip header row)
 */
const CONFIG = {
  spreadsheetId: "1Rmh1Jci1w6Syw31p3Wkfzuf4mPSfaebVpZvgnGZnhG4",
  sheetName: "Reminder",
  dateColumn: 1,
  actionColumn: 2,
  startRow: 2
};