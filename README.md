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

This project uses the workflow outlined [here](https://github.com/danthareja/node-google-apps-script/pull/15), using [our fork of the node-google-apps-script](https://github.com/smcsar/node-google-apps-script) project.

Specific steps are outlined below.

### Install gapps utility ###

1. Make sure you have node.js installed (at least v0.12.x) - https://nodejs.org/en/download/
2. `git clone https://github.com/smcsar/node-google-apps-script.git`
3. `cd` into the above project and run `npm install -g`
4. Test gapps installation by running `gapps -V` (you should see a version number 1.0.0)

### Add Google Apps Script to Your Google Account ###

1. Click "New" -> "More" -> "Connect more apps" and search for "Apps Script"
2. Add "Google Apps Script"

### Setup your Developers Console Project ###

You only need to do this the first time you setup your Developers Console
Project.  This will create a file in your home directory that allows you to
push files to a Google Developers Console Project.

1.  Click [this link](https://console.developers.google.com/start/api?id=drive&credential=client_key) to create a new Google Developers Console Project
2.  Select `Create a new project` and click "Continue"
3.  Click "Go to credentials"
4.  Click "Add credentials"
5.  Select "OAuth 2.0 client ID"
6.  Click "Configure consent screen"
7.  Fill in product name (e.g. "SMCSAR DO Addon") and click "Save"
8.  Select "Other" for Application type and fill in "Name" (e.g. <Your name>)
9.  Click "OK"
10. Click on the download icon for your newly created credentials and remember where you downloaded it.  This will download a JSON file
11. You may close the Google Developers Console window
12. Go to your command-line window
13. Run `gapps auth <path to where you downloaded the credentials file>
14. Follow the directions generated by the above command - you should see a URL that you can copy/paste into a web browser
15. Click "Allow" to give your project appropriate permissions
16. You may now delete the JSON credentials file

### Setup the Duty Officer Add-on Project ###

1.  Clone the fork/repository
    1. Using SSH (Mac/Linux): `git clone git@github.com:<username>/duty-officer-addon.git`
    2. Using HTTPS (Windows/Mac/Linux): `git clone https://github.com/<username>/duty-officer-addon.git`
2.  `cd` into the above project
3.  Run `gapps init -s src` to initialize the DO project
4.  Open http://console.developers.google.com in a new tab and select your Developers Console Project that you previously created
5.  Copy the `Project Number`
6.  Open a web browser and goto https://drive.google.com
7.  Click "New" -> "More" -> "Google Apps Script" to create a new Apps Script project
8.  Select "Blank Project"
9.  Go to "Resources" -> "Developers Console Project"
10. Name your project (e.g. "DO Manager") and click "OK"
11. Under "Change Project", paste the Developers Console project number and click "Set Project"
12. Follow instructions for confirming project change
13. You should see "Success! Project Changed" next to the project name
14. Click "Close"
15. Copy your Project ID from the address bar - your project id is the random string after `/d/` and before `/edit`
16. Go to your command-line window and run `gapps add dev <project id>`.  This will add a deployment target called "dev"
17. Run `gapps deploy dev` to push files to Google's environment
18. If you don't see "Great success!", go to a corner and cry
19. Go back to your web browser with your Google Drive project and refresh - you should see `code.gs` and several other HTML files

### Setup a New Fork ###

If you have already followed this readme but would like to start work in
a new directory or on a new fork, please follow these steps:

1.  Clone the fork/repository
    1. Using SSH (Mac/Linux): `git clone git@github.com:<your username>/duty-officer-addon.git`
    2. Using HTTPS (Windows/Mac/Linux): `git clone https://github.com/<your username>/duty-officer-addon.git`
2.  `cd` into the above project
3.  Run `gapps init -s src` to initialize the DO project
4.  Open a web browser and goto https://drive.google.com
5.  Select your Apps Script project that you previously created (blue icon with white arrow)
6.  Copy your Project ID from the address bar - your project id is the random string after `/d/` and before `/edit`
7.  Go to your command-line window and run `gapps add dev <project id>`.  This will add a deployment target called "dev"
8.  Run `gapps deploy dev` to push files to Google's environment
9.  If you don't see "Great success!", go to a corner and cry
10. Go back to your web browser with your Google Drive project and refresh - you should see `code.gs` and several other HTML files

### Testing Code the First Time ###

***All code modifications should be done locally on your computer and not in the Google Drive web interface***

1. Comment out the `setupCheckResponseTrigger()`. This will disable the auto-highlighting related
   to those responding but will allow you to test your code without needing to deploy it
2. Run `gapps deploy dev` to push your code to Google's servers
3. Switch to the project within Google Chrome and continue testing from there:
   1.  Create a new spreadsheet in Google Drive and rename it to something you can find
   2.  Go to your Apps Script project and select "Publish" -> "Test as Add-on"
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
2. Go to "Publish" -> "Test as Add-on" and select your previously saved test and click "Test"
3. The sheet you previously created and associated with the test should automatically open
4. Modify code in editor of choice (locally on your workstation)
5. `gapps deploy dev` to sync code - ***DON'T FORGET THIS STEP AFTER EVERY CHANGE!***  (You may consider setting up something that watches the files and executes this command every time there is a change.)
6. Go to the spreadsheet associated with your project and refresh (you only need to refresh the sheet itself and not the Apps Script project)

### Gotchas / Best Practices ###

- Javascript files use the *.js* extension in order to enable proper file
  handling by editors/IDE's.  This will be automatically changed to *.gs* when
  `gapps deploy` is called
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
