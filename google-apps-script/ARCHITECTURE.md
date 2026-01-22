# Google Forms ↔ Guestbook Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTEGRATION FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Google Form     │
│  (RSVP Form)     │
│                  │
│  Fields:         │
│  ✓ 성함          │
│  ✓ 축하 메시지    │
│  ✓ (other)       │
└────────┬─────────┘
         │
         │ User submits form
         │
         ▼
┌────────────────────────────────────────┐
│   Google Apps Script Trigger           │
│   onFormSubmit(e)                      │
│                                        │
│   1. Extract name (성함/이름)          │
│   2. Extract message (축하 메시지)     │
│   3. Validate not blank               │
│   4. Generate timestamp               │
│   5. Format data                      │
└────────┬───────────────────────────────┘
         │
         │ If valid
         │
         ▼
┌────────────────────────────────────────┐
│   Guestbook Spreadsheet                │
│   ID: 1-xtZa...                        │
│                                        │
│   ┌───────┬──────────┬──────────────┐ │
│   │ From  │ 본문      │ Date         │ │
│   ├───────┼──────────┼──────────────┤ │
│   │ 홍길동 │ 축하해요! │ 2026-01-22   │ │
│   │ ...   │ ...      │ ...          │ │
│   └───────┴──────────┴──────────────┘ │
│                                        │
└────────┬───────────────────────────────┘
         │
         │ Fetches via Google Sheets API
         │
         ▼
┌────────────────────────────────────────┐
│   Wedding Website                      │
│   (Guestbook Section)                  │
│                                        │
│   - Displays messages                 │
│   - Scrolling animation               │
│   - Real-time updates                 │
└────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

VALIDATION RULES:
─────────────────
✓ Name must not be blank
✓ Message must not be blank  
✓ Timestamp auto-generated
✗ Blank entries are skipped

DATA MAPPING:
─────────────
Form Field "성함"        → Spreadsheet Column 1 (From)
Form Field "축하 메시지"  → Spreadsheet Column 2 (본문)
Auto-generated           → Spreadsheet Column 3 (Date)

SUPPORTED FIELD NAMES:
──────────────────────
Name: "성함" or "이름"
Message: "축하" + ("메시지" or "메세지")

═══════════════════════════════════════════════════════════════════

DEPLOYMENT CHECKLIST:
────────────────────
[ ] 1. Open Google Form
[ ] 2. Access Script Editor (⋮ → Script editor)
[ ] 3. Copy FormToGuestbook.gs content
[ ] 4. Verify GUESTBOOK_SPREADSHEET_ID
[ ] 5. Save script
[ ] 6. Create trigger (onFormSubmit, From form, On form submit)
[ ] 7. Authorize permissions
[ ] 8. Test with form submission
[ ] 9. Verify spreadsheet update
[ ] 10. Check website display

═══════════════════════════════════════════════════════════════════
```
