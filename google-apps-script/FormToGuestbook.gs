/**
 * Google Apps Script to sync Google Forms submissions to Guestbook Spreadsheet
 * 
 * Setup Instructions:
 * 1. Open your Google Form
 * 2. Click on "More" (three dots) → "Script editor" 
 * 3. Copy this entire script into the script editor
 * 4. Update the GUESTBOOK_SPREADSHEET_ID with your guestbook spreadsheet ID
 * 5. Save the script
 * 6. Click on "Triggers" (clock icon) → "Add Trigger"
 * 7. Configure:
 *    - Choose which function to run: onFormSubmit
 *    - Choose which deployment should run: Head
 *    - Select event source: From form
 *    - Select event type: On form submit
 * 8. Save the trigger
 * 
 * Form Field Names:
 * - "성함" (Name field)
 * - "축하 메세지" (Congratulation message field)
 */

// Replace this with your actual Guestbook Spreadsheet ID
const GUESTBOOK_SPREADSHEET_ID = '1-xtZaFSMU8ecMEzsCiWyplELJS9XRpET3SB_cUje1T4';

/**
 * Triggered when the Google Form is submitted
 * @param {Object} e - The form submit event object
 */
function onFormSubmit(e) {
  try {
    // Get the form response
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // Extract responses
    let name = '';
    let message = '';
    
    // Loop through all form items to find name and message
    for (let i = 0; i < itemResponses.length; i++) {
      const itemResponse = itemResponses[i];
      const question = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      
      // Check for name field (성함 or 이름)
      if (question.includes('성함') || question.includes('이름')) {
        name = answer;
      }
      
      // Check for message field (축하 메세지 or 메시지)
      if (question.includes('축하') && (question.includes('메세지') || question.includes('메시지'))) {
        message = answer;
      }
    }
    
    // Validate that both name and message are not blank
    if (!name || name.trim() === '' || !message || message.trim() === '') {
      Logger.log('Name or message is blank. Skipping guestbook update.');
      Logger.log('Name: ' + name);
      Logger.log('Message: ' + message);
      return;
    }
    
    // Get submission timestamp
    const timestamp = formResponse.getTimestamp();
    const formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    // Open the guestbook spreadsheet
    const guestbookSpreadsheet = SpreadsheetApp.openById(GUESTBOOK_SPREADSHEET_ID);
    const sheet = guestbookSpreadsheet.getSheets()[0]; // Get the first sheet
    
    // Append the data to the guestbook
    // Format: [Name (From), Message (본문), Timestamp]
    sheet.appendRow([name.trim(), message.trim(), formattedDate]);
    
    Logger.log('Successfully added to guestbook:');
    Logger.log('Name: ' + name);
    Logger.log('Message: ' + message);
    Logger.log('Timestamp: ' + formattedDate);
    
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    // You might want to send an email notification about the error
    // MailApp.sendEmail('your-email@example.com', 'Form to Guestbook Error', error.toString());
  }
}

/**
 * Test function to manually test the script
 * This won't work for actual form submissions, but useful for debugging
 */
function testScript() {
  Logger.log('Test function - This should be run manually');
  Logger.log('Spreadsheet ID: ' + GUESTBOOK_SPREADSHEET_ID);
  
  try {
    const spreadsheet = SpreadsheetApp.openById(GUESTBOOK_SPREADSHEET_ID);
    Logger.log('Successfully connected to spreadsheet: ' + spreadsheet.getName());
    
    const sheet = spreadsheet.getSheets()[0];
    Logger.log('First sheet name: ' + sheet.getName());
    Logger.log('Last row: ' + sheet.getLastRow());
  } catch (error) {
    Logger.log('Error accessing spreadsheet: ' + error.toString());
  }
}
