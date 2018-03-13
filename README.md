# Duty Officer Add-on #

This project creates a Google Sheets add-on that interfaces with [Decisions for
Heroes (D4H)](http://d4h.org/) to create a call list with basic contact
information.  There are some additional features that are specific to the [San
Mateo County Search and Rescue (SMCSAR)](http://www.sanmateosar.org) callout
process.

## Usage ##

1. Add the DO Management add-on to your account
2. Create a new Google Sheet
2. Go to "Add-ons" -> "DO Management" -> "Populate Call Sheet"

## Development ##

This project uses the workflow outlined [here](https://github.com/google/clasp).

Specific steps are outlined below.

### Install clasp utility ###

Refer to latest instructions at https://github.com/google/clasp

1. Make sure you have node.js installed (at least v4.7.4) - https://nodejs.org/en/download/
2. In command line, run `npm i @google/clasp -g`
3. `clasp login` will open a web browser to connect your Google account with clasp.

### Add Google Apps Script to Your Google Account ###

1. Click "New" -> "More" -> "Connect more apps" and search for "Apps Script"
2. Add "Google Apps Script"
3. Enable Google Apps Script API to work with 3rd party applications [here](https://script.google.com/home/usersettings)

### Setup the Duty Officer Add-on Script ###

1.  Clone the fork/repository
    1. Using SSH (Mac/Linux): `git clone git@github.com:smcsar/duty-officer-addon <dir-name>`
    2. Using HTTPS (Windows/Mac/Linux): `git clone https://github.com/smcsar/duty-officer-addon <dir-name>`
2.  `cd <dir-name>/src`
3.  `clasp create "DO Manager"` or any name you wish
4.  [Here](https://script.google.com/home) you will see your new "DO Manager" project

### Setup a New Fork ###

If you have already followed this readme but would like to start work in
a new directory or on a new fork, please follow these steps:

1.  Clone the fork/repository
    1. Using SSH (Mac/Linux): `git clone git@github.com:smcsar/duty-officer-addon <dir-name>`
    2. Using HTTPS (Windows/Mac/Linux): `git clone https://github.com/smcsar/duty-officer-addon <dir-name>`
2.  `cd <dir-name>/src`
3.  `cp .clasp.json.template .clasp.json`
4.  Copy the script id of your existing Apps Script project [here](https://script.google.com/home), it is the random string following "/project/" in the url
5.  Paste script id into command-line `sed i 's/changethis/<script id>/' .clasp.json`
6.  Continue working from new cloned directory


### Testing Code the First Time ###

***All code modifications should be done locally on your computer and not in the Google Apps Script web interface***

1. Comment out the `setupCheckResponseTrigger()` call in `src/code.js`. This will disable the auto-highlighting related to those responding but will allow you to test your code without needing to deploy it
2. Run `clasp push` to push your code to Google's servers
3. Switch to the project within Google Chrome and continue testing from there:
   1.  Create a new spreadsheet in Google Drive and rename it to something you can find
   2.  Go to your Apps Script project and select "Run" -> "Test as Add-on"
   3.  Under "Configure New Test", click "Select Doc"
   4.  Click "Spreadsheets" and select the sheet you created earlier and click "Select"
   5.  Click "Save"
   6.  Select your "Saved Test" (radio button) and click "Test"
   7.  Go to "Add-ons" -> &lt;Project Name&gt; -> "Set D4H Token" (If this is the first time you're running the add-on, you will need to authorize the add-on.)
   8.  In a new tab, go to https://smcsar.d4h.org and click on the setup gear at the top right corner
   9.  Click "Generate API Access Key"
   10. Copy "Generated Token"
   11. Go back to your project and paste the API token and click "Save"
   12. To test, go to "Add-ons" -> <Project Name> -> "Populate Call Sheet"

### Basic workflow: ###

1. Open your project in Google Drive via a web browser
2. Go to "Run" -> "Test as Add-on" and select your previously saved test and click "Test"
3. The sheet you previously created and associated with the test should automatically open
4. Modify code in editor of choice (locally on your workstation)
5. `clasp push` to sync code - ***DON'T FORGET THIS STEP AFTER EVERY CHANGE!***  (You may consider setting up something that watches the files and executes this command every time there is a change.)
6. Go to the spreadsheet associated with your project and refresh (you only need to refresh the sheet itself and not the Apps Script project)

### Gotchas / Best Practices ###

- Javascript files use the *.js* extension in order to enable proper file
  handling by editors/IDE's.  This will be automatically changed to *.gs* when
  `clasp push` is called
- While files may be organized in directories within this project, Google Apps
  Script will flatten out the directory structure on the server.  As a result,
  you must ensure that all filenames are unique throughout the entire project -
  even if they are in different directories!
- Don't ever make changes within the web-based Apps Script IDE; otherwise, the
  version on the server and in this project will conflict

### Release Procedure ###

Detailed instructions TBD

- Increment version number when deploying the add-on (via web interface)

### Contributing ###

If you'd like to contribute, please reach out!  We're happy to review pull requests.

Copyright 2015, Andrew Nguyen

Distributed under the GNU Affero General Public License Version 3.
