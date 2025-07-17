/**
 * Checks Google Sheet for tasks due today and sends email reminders
 * Runs daily via time-based trigger at 8 AM
 * @throws {Error} If sheet not found or other configuration issues
 */
function sendDailyReminders() {
  const { spreadsheetId, sheetName, dateColumn, actionColumn, priorityColumn, timeColumn, startRow, advanceDays } = CONFIG;
  
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

    const numColumns = Math.max(2, priorityColumn || 0, timeColumn || 0) - dateColumn + 1;
    const data = sheet.getRange(startRow, dateColumn, sheet.getLastRow() - startRow + 1, numColumns).getValues();
    const today = new Date();
    const tz = ss.getSpreadsheetTimeZone();
    
    const todayFormatted = Utilities.formatDate(today, tz, "yyyy-MM-dd");
    const advanceDate = new Date(today.getTime() + (advanceDays * 24 * 60 * 60 * 1000));
    const advanceDateFormatted = Utilities.formatDate(advanceDate, tz, "yyyy-MM-dd");
    
    let todayTasks = { high: [], medium: [], low: [] };
    let advanceTasks = { high: [], medium: [], low: [] };
    let totalRows = 0;
    let emptyRows = 0;

    data.forEach((row, index) => {
      const date = row[0];
      const action = row[1];
      const priority = priorityColumn ? row[priorityColumn - dateColumn] : null;
      const time = timeColumn ? row[timeColumn - dateColumn] : null;
      
      totalRows++;
      
      if (!date || !action) {
        emptyRows++;
        return;
      }
      
      try {
        const rowDateFormatted = Utilities.formatDate(date, tz, "yyyy-MM-dd");
        const taskPriority = getPriority(priority);
        const taskWithTime = formatTaskWithTime(action, time);
        
        if (rowDateFormatted === todayFormatted) {
          todayTasks[taskPriority].push(taskWithTime);
        } else if (advanceDays > 0 && rowDateFormatted === advanceDateFormatted) {
          advanceTasks[taskPriority].push(taskWithTime);
        }
      } catch (dateError) {
        Logger.error(`Invalid date in row ${startRow + index}`, {
          date: date,
          action: action,
          error: dateError.message
        });
      }
    });

    const todayTotal = todayTasks.high.length + todayTasks.medium.length + todayTasks.low.length;
    const advanceTotal = advanceTasks.high.length + advanceTasks.medium.length + advanceTasks.low.length;
    
    Logger.info('Sheet scan completed', {
      totalRows,
      emptyRows,
      todayTasks: todayTotal,
      advanceTasks: advanceTotal,
      date: todayFormatted
    });

    if (todayTotal > 0 || advanceTotal > 0) {
      const emailBody = buildEnhancedEmailBody(todayTasks, advanceTasks, todayFormatted, advanceDateFormatted, ss.getName(), sheetName, advanceDays);
      
      MailApp.sendEmail({
        to: Session.getActiveUser().getEmail(),
        subject: buildEmailSubject(todayTotal, advanceTotal, todayTasks, advanceTasks),
        htmlBody: emailBody
      });
      
      Logger.success('Reminder email sent', {
        todayTaskCount: todayTotal,
        advanceTaskCount: advanceTotal,
        todayTasks: todayTasks,
        advanceTasks: advanceTasks
      });
    } else {
      Logger.info('No tasks due today or upcoming');
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
/**
 * Determines priority level from cell value
 * @param {string} priority - Priority value from sheet
 * @returns {string} Priority level (high/medium/low)
 */
function getPriority(priority) {
  if (!priority) return 'medium';
  const p = priority.toString().toLowerCase();
  if (p.includes('high') || p.includes('urgent') || p === '1') return 'high';
  if (p.includes('low') || p === '3') return 'low';
  return 'medium';
}

/**
 * Formats task with time if available
 * @param {string} action - Task action
 * @param {string} time - Time string (optional)
 * @returns {string} Formatted task
 */
function formatTaskWithTime(action, time) {
  if (!time) return action;
  return `${action} ⏰ ${time}`;
}

/**
 * Builds enhanced HTML email body with today and advance notifications
 * @param {Object} todayTasks - Today's tasks grouped by priority
 * @param {Object} advanceTasks - Advance tasks grouped by priority
 * @param {string} todayDate - Today's formatted date
 * @param {string} advanceDate - Advance formatted date
 * @param {string} spreadsheetName - Name of spreadsheet
 * @param {string} sheetName - Name of sheet
 * @param {number} advanceDays - Days in advance
 * @returns {string} HTML email body
 */
function buildEnhancedEmailBody(todayTasks, advanceTasks, todayDate, advanceDate, spreadsheetName, sheetName, advanceDays) {
  let html = '<div style="font-family: Arial, sans-serif; max-width: 600px;">';
  
  const todayTotal = todayTasks.high.length + todayTasks.medium.length + todayTasks.low.length;
  const advanceTotal = advanceTasks.high.length + advanceTasks.medium.length + advanceTasks.low.length;
  
  if (todayTotal > 0) {
    html += `<h2 style="color: #1976d2;">📅 Tasks Due Today (${todayDate})</h2>`;
    html += buildPrioritySection(todayTasks);
  }
  
  if (advanceTotal > 0) {
    html += `<h2 style="color: #7b1fa2; margin-top: 30px;">⏳ Upcoming in ${advanceDays} Day${advanceDays > 1 ? 's' : ''} (${advanceDate})</h2>`;
    html += buildPrioritySection(advanceTasks);
  }
  
  html += `<div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">`;
  html += `<p style="color: #666; font-style: italic; margin: 0;">📊 Source: ${spreadsheetName} - ${sheetName}</p>`;
  html += `</div></div>`;
  
  return html;
}

/**
 * Builds priority section HTML
 * @param {Object} tasks - Tasks grouped by priority
 * @returns {string} HTML for priority sections
 */
function buildPrioritySection(tasks) {
  let html = '';
  
  if (tasks.high.length > 0) {
    html += `<h3 style="color: #d32f2f; margin-bottom: 10px;">🔴 High Priority (${tasks.high.length})</h3>`;
    html += `<ul style="margin-top: 5px;">${tasks.high.map(task => `<li style="color: #d32f2f; font-weight: bold; margin-bottom: 5px;">${task}</li>`).join('')}</ul>`;
  }
  
  if (tasks.medium.length > 0) {
    html += `<h3 style="color: #f57c00; margin-bottom: 10px;">🟡 Medium Priority (${tasks.medium.length})</h3>`;
    html += `<ul style="margin-top: 5px;">${tasks.medium.map(task => `<li style="color: #f57c00; margin-bottom: 5px;">${task}</li>`).join('')}</ul>`;
  }
  
  if (tasks.low.length > 0) {
    html += `<h3 style="color: #388e3c; margin-bottom: 10px;">🟢 Low Priority (${tasks.low.length})</h3>`;
    html += `<ul style="margin-top: 5px;">${tasks.low.map(task => `<li style="color: #388e3c; margin-bottom: 5px;">${task}</li>`).join('')}</ul>`;
  }
  
  return html;
}

/**
 * Builds email subject line
 * @param {number} todayTotal - Today's task count
 * @param {number} advanceTotal - Advance task count
 * @param {Object} todayTasks - Today's tasks by priority
 * @param {Object} advanceTasks - Advance tasks by priority
 * @returns {string} Email subject
 */
function buildEmailSubject(todayTotal, advanceTotal, todayTasks, advanceTasks) {
  let subject = '📋 ';
  
  if (todayTotal > 0 && advanceTotal > 0) {
    subject += `${todayTotal} Due Today + ${advanceTotal} Upcoming`;
  } else if (todayTotal > 0) {
    subject += `${todayTotal} Task${todayTotal > 1 ? 's' : ''} Due Today`;
  } else {
    subject += `${advanceTotal} Task${advanceTotal > 1 ? 's' : ''} Coming Up`;
  }
  
  // Add priority indicator
  const hasHighPriority = (todayTasks.high.length + advanceTasks.high.length) > 0;
  if (hasHighPriority) {
    subject += ' 🔴';
  }
  
  return subject;
}

function validateConfiguration() {
  const { spreadsheetId, sheetName, dateColumn, actionColumn, priorityColumn, timeColumn, startRow, reminderHour, advanceDays } = CONFIG;
  
  if (!spreadsheetId || spreadsheetId === 'YOUR_SHEET_ID_HERE') {
    Logger.error('Invalid spreadsheet ID in config');
    return false;
  }
  
  if (!sheetName) {
    Logger.error('Sheet name not configured');
    return false;
  }
  
  if (dateColumn < 1 || actionColumn < 1 || startRow < 1 || reminderHour < 0 || reminderHour > 23 || advanceDays < 0) {
    Logger.error('Invalid column, row numbers, reminder hour, or advance days in config');
    return false;
  }
  
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.error(`Sheet "${sheetName}" not found in spreadsheet`);
      return false;
    }
    
    const maxColumn = Math.max(dateColumn, actionColumn, priorityColumn || 0, timeColumn || 0);
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
  const { reminderHour } = CONFIG;
  
  ScriptApp.newTrigger('sendDailyReminders')
    .timeBased()
    .atHour(reminderHour)
    .everyDays(1)
    .create();
  
  Logger.success(`Daily trigger created - emails will be sent at ${reminderHour}:00`);
}