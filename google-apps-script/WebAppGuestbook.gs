/**
 * Web App endpoint that receives guestbook messages submitted directly from the
 * wedding website (Guestbook.jsx -> fetch POST to the /exec URL).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * FormToGuestbook.gs handles the *Google Form* path (onFormSubmit trigger).
 * But the website has its own inline guestbook form that POSTs name/text
 * straight to this Apps Script Web App. Without a doPost(), those website
 * submissions are silently dropped (the site uses fetch mode:'no-cors', so it
 * cannot see the failure and shows a success toast anyway).
 *
 * COLUMN LAYOUT (must match the sheet the website reads via gviz):
 *   Column 1: From (name)   Column 2: 본문 (message)   Column 3: Date
 *
 * DEPLOYMENT
 * ----------
 * 1. Open the guestbook Spreadsheet -> Extensions -> Apps Script.
 * 2. Add this file (WebAppGuestbook.gs) to the project.
 * 3. Deploy -> New deployment -> type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Copy the /exec URL and put it in src/data/content.json -> guestbook.scriptUrl
 *    (the URL currently there must point to a deployment that includes THIS doPost).
 * 5. Re-deploy (Manage deployments -> edit -> new version) after any change.
 */

// Same spreadsheet the website reads from (content.json -> guestbook.spreadsheetId).
const GUESTBOOK_SPREADSHEET_ID = '1-xtZaFSMU8ecMEzsCiWyplELJS9XRpET3SB_cUje1T4';

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const name = (params.name || '').toString().trim();
    const text = (params.text || '').toString().trim();

    // Reject blank submissions.
    if (!name || !text) {
      return jsonResponse({ ok: false, error: 'name and text are required' });
    }

    // Basic length guard (mirrors the maxLength on the website inputs).
    const safeName = name.substring(0, 30);
    const safeText = text.substring(0, 300);

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    const sheet = SpreadsheetApp.openById(GUESTBOOK_SPREADSHEET_ID).getSheets()[0];
    sheet.appendRow([safeName, safeText, timestamp]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.toString() });
  }
}

// Lets you open the /exec URL in a browser to confirm the deployment is live.
function doGet() {
  return jsonResponse({ ok: true, message: 'Guestbook web app is running.' });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
