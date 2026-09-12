// Paste into Extensions > Apps Script in the wedding spreadsheet.
const SPREADSHEET_ID = '1T6LqoEhdsySHqyY9-JYW_fAFYp_k2-9ZvKGkJnrz7Ro';
const TAB_NAME = 'RSVP';
const HEADERS = ['ID', 'Fecha (Lima)', 'Nombre', 'Asistencia', 'Mensaje'];

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let lock;
  try {
    const text = e && e.postData && e.postData.contents;
    if (!text || text.length > 12000) return json({saved:false});
    const data = JSON.parse(text);
    const secret = PropertiesService.getScriptProperties().getProperty('RSVP_SHEETS_SECRET');
    if (!secret || !data || data.secret !== secret) return json({saved:false});
    if (typeof data.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(data.id) ||
        typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.length > 100 ||
        ['yes','no'].indexOf(data.attendance) < 0 || typeof data.message !== 'string' || data.message.length > 1000) return json({saved:false});
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return json({saved:false});
    const book = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = book.getSheetByName(TAB_NAME) || book.insertSheet(TAB_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    if (JSON.stringify(sheet.getRange(1,1,1,5).getValues()[0]) !== JSON.stringify(HEADERS)) return json({saved:false});
    const last = sheet.getLastRow();
    if (last > 1 && sheet.getRange(2,1,last-1,1).createTextFinder(data.id).matchEntireCell(true).findNext()) return json({saved:true});
    // Escape formula prefixes; names and messages must remain literal text.
    const literal = value => /^[=+@\-\t\r\n]/.test(value) ? "'" + value : value;
    sheet.getRange(last+1,1,1,5).setNumberFormat('@').setValues([[
      data.id, Utilities.formatDate(new Date(),'America/Lima','yyyy-MM-dd HH:mm:ss'),
      literal(data.name.trim()), data.attendance === 'yes' ? 'Sí' : 'No', literal(data.message.trim())
    ]]);
    SpreadsheetApp.flush();
    return json({saved:true});
  } catch (_) { return json({saved:false}); }
  finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}
