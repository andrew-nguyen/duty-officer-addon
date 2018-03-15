// Add this line with DO phone number to separate .js file in /src:
// var DO_PHONE = "your #";

var D4H_STRING = "D4H";
var YNL_STRING = "Y / N / L";

var BRIGHT_GREEN = "#48FF05";

/**
 * @OnlyCurrentDoc  Limits the script to only accessing the current spreadsheet.
 */

var TOKEN_DIALOG_TITLE = 'Set D4H API Token';
var EMAIL_DIALOG_TITLE = 'Email Responding Roster';
var SMS_DIALOG_TITLE = 'SMS Responding Roster';
var SIDEBAR_TITLE = 'Example Sidebar';

var COLUMNS = [
  "Name",
  "Position",
  "Badge",
  "Responding",
  "Marshall or DR",
  "ETA ",
  "Time Out",
  "Time In",
  "Role ",
  "Home Safe",
  "Email",
  "Home Phone",
  "Mobile Phone",
  "Work Phone",
  "SMS Email"
];

var CALLOUT_SHEET_NAME = "Callout";
var RESPONDING_SHEET_NAME = "Carpool"

function test() {
  var t = 2130;
  String(t).trim();
}

/* Retrieves token from user property storage - this is stored on a per-user
 * basis
 */
function getToken() {
  var token = PropertiesService.getUserProperties().getProperty("D4H_TOKEN");
  Logger.log("D4H token: " + token);
  return token;
}

/* Saves the specified token to the user's properties */
function saveToken(token) {
  PropertiesService.getUserProperties().setProperty("D4H_TOKEN", token);
}

/* Checks the responses anytime the sheet is edited and makes appropriate
 * formatting changes
 *
 * Specifically:
 * - Checks the "Responding" string and sets the background color accordingly
 */
function checkResponse(e) {
  var sheet = SpreadsheetApp.getActiveSheet();

  /* checks response, if Y, turns cell green */
  /* Andy: I tried changing only those fields that
   * come in as part of e.range and it's not stable
   * Not sure what the problem is so just looping for now
   * There was no noticeable speed increase changing only
   * e.range
   */
  var range = sheet.getRange("D3:J100");
  for (var i=1; i<range.getNumRows(); i++) {
    var cell = range.getCell(i, 1);
    var respondingValue = cell.getValue().trim().toUpperCase();
    // sets it to green if Y
    if (respondingValue == "Y") {
      cell.setBackground(BRIGHT_GREEN);

      // copied to case "L" below
      var homeSafe = range.getCell(i, 7);
      if (String(homeSafe.getValue()).trim() != "") {
        homeSafe.setBackground("white");
      }
      else {
        homeSafe.setBackground("orange");
      }
    }
    else if (respondingValue == "N") {
      cell.setBackground("red");
    }
    else if (respondingValue == "L") {
      cell.setBackground("#9EC0FF") // Light blue
   
      // copied from case "Y" above
      var homeSafe = range.getCell(i, 7);
      if (String(homeSafe.getValue()).trim() != "") {
        homeSafe.setBackground("white");
      }
      else {
        homeSafe.setBackground("orange");
      }
    }
    // in case we set it back to D4H
    else if (respondingValue == D4H_STRING) {
      cell.setBackground("red");
    }
    else {
      cell.setBackground("white");
    }
    // sets everything to upper case
    cell.setValue(respondingValue);
  }
}

/* Sets up the a trigger to call checkResponse() on any
 * edits of the sheet
 *
 * Not the most efficient but there shouldn't be much
 * editing except for the "responding" column
 */
function setupCheckResponseTrigger() {
  // debugging to see how many triggers are registered
  var triggers = ScriptApp.getProjectTriggers();
  Logger.log("---> Num registered triggers: " + triggers.length);

  for (var i=0; i<triggers.length; i++) {
    var t = triggers[i];
    Logger.log("type(t)----->" + typeof t);
    ScriptApp.deleteTrigger(t);
  }

  /* Can't seem to register non-time-driven triggers in UI so
   * adding programmatically.  But, don't need this anymore
   * once the trigger has been added
   */
  ScriptApp.newTrigger("checkResponse")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create()
}

/**
 * Adds a custom menu with items to show the sidebar and dialog.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem("Populate Call Sheet", 'populateAllCall')
      .addItem("Coordinate Transportation", "createTransportationSheet")
      .addItem("Email Responding Roster", "showEmailDialog")
      .addItem("SMS Responding Roster", "showSMSDialog")
      .addItem("Set D4H Token", "showTokenDialog")
      //.addItem('Show sidebar', 'showSidebar')
      .addToUi();
}

/* Takes a person dictionary and phonetype key
 * If phonetype isn't defined, returns the empty string
 * Otherwise, returns a formatted phone number, dropping the
 * leading 1 if present
 */
function phoneFormat(person, phonetype) {
  if (phonetype in person) {
    phone = person[phonetype];
    if (phone.length == 10) {
      return "(" + phone.slice(0,3) + ") " + phone.slice(3,6) + "-" + phone.slice(6,10);
    }
    else if (phone.length == 11) {
      // currently removes the first character which is a '1'
      return "(" + phone.slice(1,4) + ") " + phone.slice(4,7) + "-" + phone.slice(7,11);
    }
    return person[phonetype];
  }
  else {
    return "";
  }
}

/* Returns a string of the provided date as YYYY-MM-DD */
function dateString(date) {
  var day = date.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  var month = date.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  return date.getFullYear() + "-" + month + "-" + day;
}

/* Takes the list of person dictionaries and populates the
 * spreadsheet
 *
 * This function does the bulk of the work in creating
 * the spreadsheet
 */
function populateAllCall() {
  // remove this function call if trying to test add-on without
  // deploying it since it uses functionality that is not supported
  // in test mode
  // !!!!!!!!!!!!!!!!!!!!!!!!!!
  // THIS SHOULD BE ENABLED WHEN COMMITTING TO MASTER / UPSTREAM
  // !!!!!!!!!!!!!!!!!!!!!!!!!!
  setupCheckResponseTrigger();

  var all_call = getAllCall();
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = SpreadsheetApp.getActiveSheet();

  // names the spreadsheet "SMCSAR YYYY-MM-DD "
  var today = new Date();
  var spreadsheetName = "SMCSAR " + dateString(today) + " ";
  spreadsheet.rename(spreadsheetName);

  // perhaps we want to remove this since users should be
  // starting with a clean spreadsheet... may consider
  // displaying an error if it's not an empty sheet
  sheet.clear();

  sheet.setName(CALLOUT_SHEET_NAME);

  // sets up the counting of available responders
  sheet.appendRow([
    "",
    "",
    "Available:",
    "=COUNTIF(D3:D,\"Y\")",
    "",
    "",
    "",
    "",
    "",
    "=COUNTA(J3:J)",
    "are home safe"
  ]);
  sheet.getRange("C1:D1").setBackground(BRIGHT_GREEN);
  sheet.getRange("J1:K1").setBackground('orange');


  // sets up header row
  sheet.appendRow(COLUMNS);

  // bolds the first two rows
  sheet.getRange("A1:Z2").setFontWeight("bold");

  var currentRow = 3; // ignore header and count row

  // cycles through everyone and appends a new row for each
  for (var i=0; i<all_call.length; i++) {
    var person = all_call[i];
    sheet.appendRow([
      person.name,
      person.position,
      person.ref,
      person.responding,
      "", // marshall/dr
      "", // eta
      "", // time out
      "", // time in
      "", // role
      "", // home safe
      person.email,
      phoneFormat(person, "homephone"),
      phoneFormat(person, "mobilephone"),
      phoneFormat(person, "workphone"),
      getGateway(phoneFormat(person, "mobilephone"))
    ]);

    // sets those off call in D4H to red
    if (person.responding == D4H_STRING) {
       sheet.getRange(currentRow, 4).setBackground("red");
    }
    currentRow++;
  }

  // Resizes all columns A-Z
  for (var i=1; i<27; i++) {
    sheet.autoResizeColumn(i);
  }
}

/* performs REST API call to D4H */
function getMembers(on_call, offset, limit) {
  // sets up arguments per D4H docs
  on_call = typeof on_call !== 'undefined' ? on_call : "off";
  offset = typeof offset !== 'undefined' ? offset : 0;
  limit = typeof limit !== 'undefined' ? limit : 25;

  var url = Utilities.formatString('https://api.d4h.org:443/v2/team/members?'
    + 'on_call=%s'
    + '&offset=%s'
    + '&limit=%s', on_call, offset, limit);

  var options = {
    'headers': {'Authorization': 'Bearer ' + getToken()}
  }
  
  var response = UrlFetchApp.fetch(url, options);
  //Logger.log(response);

  // Returns JSON without any explicit processing
  return JSON.parse(response.getContentText());
}

/* Returns true if the person is operational */
function isOperational(person) {
  return person.status.id == 1
}

/* Repeatedly invokes getMembers() to handle paging
 * since D4H limits to 25 members per call
 */
function getRoster(on_off) {
  var all_people = [];
  var offset = 0;
  var limit = 25;
  var people = null;
  do {
    var response = getMembers(on_off, offset, limit);
    var data = response.data;

    // map over people to trim names since some have
    // spurious whitespace
    people = data.map(function (e) {
      e.name = e.name.trim();
      return e;
    });

    // building the overall list of people
    all_people = all_people.concat(people);
    offset += limit;
  } while (people.length == 25); // if we got 25 responses, repeat

  return all_people;
}

/* Gets on-call and off-call separately then combines them
 * and sorts by name
 */
function getAllCall() {
  var on_call = getRoster("on").map(function(person) {
    person.responding = YNL_STRING;
    return person;
  });
  var off_call = getRoster("off").map(function(person) {
    person.responding = D4H_STRING;
    return person
  });

  var everyone = on_call.concat(off_call).filter(isOperational);

  everyone = everyone.sort(function (left, right) {
    return left.name.localeCompare(right.name);
  });

  return everyone;
}

function getGateway(phone) {
  var phone1 = "1" + DO_PHONE.replace(/[^\d]/g, '');
  var phone2 = "1" + phone.replace(/[^\d]/g, '');
  var gateSearchString = "from:" + phone1 + "." + phone2;

  var thread = GmailApp.search(gateSearchString, 0, 2)[0];
  if (thread == undefined) {return null};
  var message = thread.getMessages()[0];
  var msgFrom = message.getFrom();
  var msgTo = message.getTo();

  if (msgFrom.indexOf(phone2) > -1) {return msgFrom};
  if (msgTo.indexOf(phone2) > -1) {return msgTo};

  return null;
}

function setGateway(cell) {
  var gateway = getGateway(cell.getValue());
  if (gateway == null) { return };
  var range1 = SpreadsheetApp.getActiveRange();
  var col = range1.getColumn();
  var row = range1.getRow();
  var range2 = SpreadsheetApp.getActiveSheet().getRange(row,col+2);
  range2.setValue(gateway);
}

function getResponders() {
  var num_people = getAllCall().length;

  var spreadsheet = SpreadsheetApp.getActive();

  var sheet = spreadsheet.getSheetByName(CALLOUT_SHEET_NAME);

  var responders = sheet.getRange(3, 1, num_people, COLUMNS.length).getValues();
  responders = responders.filter(function (row) {
    return row[3] == "Y";
  })

  return responders;
}

/**
 * Goes through the call sheet and determines who is a "Y" in Responding and
 * creates a new sheet (tab) to facilitate transportation coordination.
 */
function createTransportationSheet() {
  var num_people = getAllCall().length;

  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName(CALLOUT_SHEET_NAME);

  var responders = getResponders();

  var responder_sheet_name = RESPONDING_SHEET_NAME;
  var responder_sheet = spreadsheet.getSheetByName(responder_sheet_name);
  if (responder_sheet != null) {
    spreadsheet.deleteSheet(responder_sheet);
  }
  responder_sheet = spreadsheet.insertSheet(responder_sheet_name);

  responder_sheet.appendRow([
    "CARPOOL"
  ]);

  responder_sheet.appendRow([
    "Name",
    "Position",
    "Badge",
    "Email",
    "Mobile Phone",
    "Have Car?",
    "Leaving From?",
    "Leaving When?",
    "# Passenger Seats Avail",
    "Passenger 1",
    "Passenger 2",
    "Passenger 3",
    "Passenger 4"
  ]);

  // bolds the first two rows
  responder_sheet.getRange("A1:Z2").setFontWeight("bold");

  for (var i=0; i<responders.length; i++) {
    var r = responders[i];
    responder_sheet.appendRow([
      r[0], // name
      r[1], // position
      r[2], // Badge
      r[10], // email
      r[12], // mobile phone
      r[14], // sms gateway
    ]);
  }

  // Resizes all columns A-Z
  for (var i=1; i<27; i++) {
    responder_sheet.autoResizeColumn(i);
  }
}

/**
 ** EVERYTHING BELOW HERE WAS AUTOGENERATED WITH THE NEW PROJECT
 **/

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */
function showSidebar() {
  var ui = HtmlService.createTemplateFromFile('Sidebar')
      .evaluate()
      .setTitle(SIDEBAR_TITLE);
  SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * Opens a dialog to set the D4H API Token. The dialog structure is described in
 * the TokenDialog.html project file.
 */
function showTokenDialog() {
  var ui = HtmlService.createTemplateFromFile('TokenDialog')
      .evaluate()
      .setWidth(400)
      .setHeight(190);
  SpreadsheetApp.getUi().showModalDialog(ui, TOKEN_DIALOG_TITLE);
}

/**
 * Opens a dialog to send email to OESL. The dialog structure is described in
 * the OESL-Email-Dialog.html project file.
 */
function showEmailDialog() {
  var ui = HtmlService.createTemplateFromFile('OESL-Email-Dialog')

  var responders = getResponders();

  var addresses = "";

  var message = "\nSMCSAR is sending " + responders.length + " to [INSERT SEARCH NAME/LOCATION] for [INSERT DATES]\n\n";

  for (var i=0; i<responders.length; i++) {
    var r = responders[i];
    addresses += r[10] + ",";
    message += r[0] + " - " + r[12] + " - " + r[10] + "\n";
  }

  ui.to_addr = addresses;

  ui.message_body = message;

  ui = ui.evaluate()
         .setWidth(600)
         .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(ui, EMAIL_DIALOG_TITLE);
}

/**
 * Opens a dialog to send sms to OESL. The dialog structure is described in
 * the OESL-Email-Dialog.html project file.
 */
function showSMSDialog() {
  var ui = HtmlService.createTemplateFromFile('OESL-Email-Dialog')

  var responders = getResponders();

  var addresses = "";

  var message = "\nSMCSAR is sending " + responders.length + " to [INSERT SEARCH NAME/LOCATION] for [INSERT DATES]\n\n";

  for (var i=0; i<responders.length; i++) {
    var r = responders[i];
    addresses += r[14] + ",";
    message += r[0] + " - " + r[12] + " - " + r[10] + "\n";
  }

  ui.to_addr = addresses;

  ui.message_body = message;

  ui = ui.evaluate()
         .setWidth(600)
         .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(ui, SMS_DIALOG_TITLE);
}

/**
 * Returns the value in the active cell.
 *
 * @return {String} The value of the active cell.
 */
function getActiveValue() {
  // Retrieve and return the information requested by the sidebar.
  var cell = SpreadsheetApp.getActiveSheet().getActiveCell();
  return cell.getValue();
}

/**
 * Replaces the active cell value with the given value.
 *
 * @param {Number} value A reference number to replace with.
 */
function setActiveValue(value) {
  // Use data collected from sidebar to manipulate the sheet.
  var cell = SpreadsheetApp.getActiveSheet().getActiveCell();
  cell.setValue(value);
}

/**
 * Executes the specified action (create a new sheet, copy the active sheet, or
 * clear the current sheet).
 *
 * @param {String} action An identifier for the action to take.
 */
function modifySheets(action) {
  // Use data collected from dialog to manipulate the spreadsheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var currentSheet = ss.getActiveSheet();
  if (action == "create") {
    ss.insertSheet();
  } else if (action == "copy") {
    currentSheet.copyTo(ss);
  } else if (action == "clear") {
    currentSheet.clear();
  }
}

/* Used to send emails to OES-L or anyone else with those responding
 * and their phone/email
 */
function sendEmail(email, subject, body) {
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body,
    cc: Session.getActiveUser().getEmail()
  })
}
