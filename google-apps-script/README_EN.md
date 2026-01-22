# Google Forms to Guestbook Integration Guide

This guide explains how to automatically update the guestbook spreadsheet when a Google Form is submitted.

## 📋 Overview

When a Google Form is submitted with a name and congratulation message (both not blank), the system automatically updates the guestbook spreadsheet with:
- **Name** (form field "성함" → guestbook "From" column)
- **Message** (form field "축하 메세지" → guestbook "본문" column)
- **Timestamp** (automatically generated)

## 🔧 Setup Instructions

### Step 1: Google Form Setup

Ensure your Google Form contains these fields:
- **성함** (Name - question title should include "성함" or "이름")
- **축하 메세지** (Congratulation message - question title should include "축하" and "메세지" or "메시지")

### Step 2: Google Apps Script Setup

1. Open your Google Form
2. Click the three-dot menu (⋮) in the top right
3. Select **"Script editor"**
4. Copy and paste the contents of `FormToGuestbook.gs` into the editor
5. Verify/update the `GUESTBOOK_SPREADSHEET_ID` at the top of the script:
   ```javascript
   const GUESTBOOK_SPREADSHEET_ID = '1-xtZaFSMU8ecMEzsCiWyplELJS9XRpET3SB_cUje1T4';
   ```
6. Click **"Save"** (💾)

### Step 3: Trigger Setup

1. In the script editor, click the **clock icon** (Triggers) in the left menu
2. Click **"+ Add Trigger"** button in the bottom right
3. Configure as follows:
   - **Choose which function to run**: `onFormSubmit`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `From form`
   - **Select event type**: `On form submit`
4. Click **"Save"**
5. Authorize Google account permissions (first time only)

### Step 4: Verify Guestbook Spreadsheet Structure

The first sheet of your guestbook spreadsheet should have this structure:

| From (Name) | 본문 (Message) | Date |
|------------|---------------|------|
| John Doe   | Congratulations! | 2026-01-22 15:30:00 |

The script will automatically append new rows.

## 🧪 Testing

### Method 1: Submit the Form
1. Open your Google Form and submit test data
2. Check if a new row appears in the guestbook spreadsheet

### Method 2: Check Script Logs
1. In the script editor, select **"Run"** > `testScript`
2. Click **"Logs"** to verify spreadsheet connection

## ⚠️ Important Notes

1. **Field Names**: Form question titles must include "성함" for name and "축하 메세지" for message
2. **Blank Values**: If either name or message is blank, the entry will not be added to the guestbook
3. **Permissions**: The script needs authorization to access both the Form and Spreadsheet
4. **Timezone**: Timestamps use the Google Apps Script timezone setting

## 🔍 Troubleshooting

### Data Not Being Added
1. Check **"Execution log"** in the script editor
2. Verify form field names include "성함" and "축하 메세지"
3. Confirm the trigger is properly configured
4. Verify the spreadsheet ID is correct

### Permission Errors
1. Re-authorize Google account permissions in trigger settings
2. Ensure the Form and Spreadsheet have the same owner

## 📝 Script Customization

### Changing Field Names
Modify the field matching logic in lines 47-56:

```javascript
// Find name field
if (question.includes('성함') || question.includes('이름')) {
  name = answer;
}

// Find message field
if (question.includes('축하') && (question.includes('메세지') || question.includes('메시지'))) {
  message = answer;
}
```

### Changing Date Format
Modify the date format in line 64:

```javascript
const formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
```

## 📚 References

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [SpreadsheetApp Reference](https://developers.google.com/apps-script/reference/spreadsheet)
- [Form Triggers Guide](https://developers.google.com/apps-script/guides/triggers/events)

## 💡 Enhancement Ideas

- Email notifications when new guestbook entries are added
- Data validation (profanity filter, spam prevention)
- Duplicate submission prevention
- Automatic thank-you email to form submitter
