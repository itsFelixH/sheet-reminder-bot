# Sheet Reminder Bot

A Google Apps Script bot that reads a Google Sheet containing dates and actions, automatically sending daily email reminders for tasks due on the current day.

## Features

- Reads dates and actions from a Google Sheet
- Sends daily email notifications for tasks due today
- Configurable sheet name and column layout
- Automatic daily trigger setup
- HTML formatted email with task list

## Setup

1. Create a Google Sheet with:
   - Column A: Dates (any date format)
   - Column B: Actions/tasks to be reminded of
   - Data starting from row 2 (row 1 for headers)

2. Open Google Apps Script (script.google.com)
3. Create a new project and paste the code from `src/main.js`
4. Run `createDailyTrigger()` once to set up automatic daily emails at 8 AM

## Configuration

Edit the CONFIG object in `src/config.js`:
- `spreadsheetId`: Your Google Sheet ID (found in the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`)
- `sheetName`: Name of your sheet (default: "Sheet1")
- `dateColumn`: Column number for dates (default: 1 = Column A)
- `actionColumn`: Column number for actions (default: 2 = Column B)
- `startRow`: First data row (default: 2)

## Usage

The bot will automatically:
1. Check your sheet daily at 8 AM
2. Find entries matching today's date
3. Send an email with all matching actions
4. Email goes to the Google account running the script

## Development

```bash
npm install
npm test
```

## Permissions

The script requires:
- Google Sheets access (read your sheet)
- Gmail access (send reminder emails)
- User profile access (get your email address)
