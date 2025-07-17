# Sheet Reminder Bot - Roadmap

## Phase 1: Core Improvements

- [x] **Error handling for invalid dates** - Skip malformed dates gracefully
- [x] **Multiple date formats** - Support MM/DD/YYYY, DD/MM/YYYY, DD.MM.YYYY (handled by Google Sheets)
- [x] **Better logging** - Track sent reminders with timestamps
- [x] **Configuration validation** - Check if sheet/columns exist on startup

## Phase 2: Enhanced Notifications

- [ ] **Priority levels** - Add priority column (High/Medium/Low) with color-coded emails
- [ ] **Time-based reminders** - Support specific reminder times (not just 8 AM)
- [ ] **Advance notifications** - Remind X days before due date
- [ ] **Better email formatting** - Group tasks by priority, add emojis

## Phase 3: Advanced Features

- [ ] **Recurring tasks** - Support "every Monday", "monthly", "yearly" patterns
- [ ] **Multiple recipients** - Email column to notify different people
- [ ] **Task completion tracking** - Mark tasks as done to avoid repeats
- [ ] **Snooze functionality** - Postpone reminders by X days

## Phase 4: Reporting & Analytics

- [ ] **Summary emails** - Weekly/monthly overview of upcoming tasks
- [ ] **Completion reports** - Track what gets done vs missed
- [ ] **Usage statistics** - How many reminders sent, response rates
- [ ] **Dashboard sheet** - Auto-generated stats in separate tab

## Phase 5: User Experience

- [ ] **Web interface** - Simple form to add/edit tasks
- [ ] **Mobile notifications** - SMS or push notifications option
- [ ] **Calendar integration** - Sync with Google Calendar
- [ ] **Template actions** - Pre-defined common tasks

## Phase 6: Collaboration

- [ ] **Team reminders** - Assign tasks to team members
- [ ] **Shared sheets** - Multiple people managing same reminder list
- [ ] **Approval workflows** - Require confirmation before sending
- [ ] **Delegation** - Forward reminders to others

## Technical Debt

- [ ] **Unit tests** - Test core functions
- [ ] **Error monitoring** - Better error reporting and alerts
- [ ] **Performance optimization** - Handle large sheets efficiently
- [ ] **Backup system** - Auto-backup of configurations and logs
