/******************************************************** ******************************************************* ******************************************************
************************************************************** EVENTREACTOR COLDFUSION SNIPPET AGGREGATOR **************************************************************
******************************************************** ******************************************************* *******************************************************/
// *** INITIAL VARIABLES CONFIGURATION ***
const logFile             = 'eventReactorLog.txt';
const subFoldersAllowed   = true;
const includedExtensions  = ['.cfm', '.cfc'];
const excludedFiles       = ['application.cfm'];
const justShowFilesInfo   = true; // FALSE --> to put the snippet /// TRUE --> just to see the files that will be affected
// const initialFoldersArray = ['C:/work/adminsite/_admin/analytics'];
// EVENTREACTOR INFOR TO SEND __dirname
const project  = 'TailbaseAdminCleaning';
const category = 'Cleaning';
const tmodule  = 'Adminsite';
const location = '#CGI.SCRIPT_NAME#';
const message  = 'Access tracking';
const severity = 3;
/******************************************************** ****************************************************** ******************************************************
******************************************************************* ******************************* *******************************************************************
******************************************************** ****************************************************** *******************************************************/
const fs          = require('fs');
const path        = require('path');
const prependFile = require('prepend-file');
const logStream   = fs.createWriteStream(logFile, { flags: 'a', encoding: 'utf8' });
const report      = {totalFiles:0,totalFolders: 0,skipped:0,added:0,already:0};
const snippet     = `<!--- ********************************** EVENTREACTOR SNIPPET CODE ********************************** --->
<cfscript>
    data=StructNew();
    data.project="${project}";
    data.category="${category}";
    data.module="${tmodule}";
    data.location="${location}";
    data.extraText="USER=#Session.identity# / ID=#Session.staffid# / LOC=${location} / FILE=#Session.page# / HOST=#CGI.REMOTE_HOST# / ${message}";
    data.severity=${severity};
</cfscript>
<cfinvoke component="#VARIABLES.eventReactor#" method="set_eventReractor_log" returnvariable="response" data="#data#">
<!--- ********************************** ********************************** ********************************** --->
`;

// RECURSIVE FUNCTION - NAVIGATING THROUGH FILES AND FOLDERS
const sweepFiles = (folder) => {
    if (fs.existsSync(folder)) { // verifiyng path exists
        report.totalFolders++;
        fs.readdir(folder, 'utf8', (err, elements) => { // reading directory - (elements could be either file or directory)            
            if (err) throw err;
            elements.forEach(element => { // elements iteracting (files & directories)
                let nextPath = folder + element + '/';
                if (fs.lstatSync(nextPath).isDirectory()) { // it is a directory
                    if (subFoldersAllowed) {
                        sweepFiles(nextPath); // call recursive-function to sweep the next directory
                    }
                } else { // it is a file
                    report.totalFiles++;
                    addSnippet(nextPath);
                }
            })
        })
    } else {
        console.log('Path does not exist =', folder);
    }
}

// FUNCTION - ADDING SNIPPET
const addSnippet = (thisPath) => {
    if (includedExtensions.some(ext => ext === path.extname(thisPath))) { // verifiyng is that extension is allowed
        let fileContent = fs.readFileSync(thisPath, 'utf8');
        if (!fileContent.includes('EVENTREACTOR')) { // the file does not content the snippet
            if (justShowFilesInfo || excludedFiles.some(file => file === path.basename(thisPath))) { // skip if: 'justShowFilesInfo' OR this file is within 'excludedFiles'
                logStream.write('--skipped-- ------- > ' + thisPath + '\n');
                report.skipped++;
            } else {
                prependFile(thisPath, snippet + '\n', (err) => { // adding the snippet at the beginning of the file
                    logStream.write('--SNIPPET-- -ADDED- > ' + thisPath + '\n');
                    report.added++;
                })
            }
        } else {
            logStream.write('--SNIPPET-- --IN--- > ' + thisPath + '\n');
            report.already++;
        }
    }
}

const showReport = () => {
    setTimeout(() => {
logStream.write(`-------------------- -------------------- -------------------- -------------------- --------------------
DATE = ${new Date().toUTCString()}
INCLUDED EXTENSIONS = ${includedExtensions.join(' ')} | EXCLUDED FILES = ${excludedFiles.join(' ')}
TOTAL FILES = ${report.totalFiles} | TOTAL FOLDERS = ${report.totalFolders} | SKIPPED FILES = ${report.skipped} |\
 SNIPPET ADDED = ${report.added} | SNIPPET ALREADY IN = ${report.already}
-------------------- -------------------- -------------------- -------------------- --------------------`);
    }, 1000);
}

// INITIAL AUTO-INVOKE FUNCTION
((folders) => {
    folders.forEach(folder => {
        sweepFiles(folder + '/');
    })
    showReport();
})(initialFoldersArray)

/******************************************************** ******************************************************* ******************************************************
< !--- ********************************** EVENTREACTOR SNIPPET CODE ********************************** --->
---- FOR ADMIN CONSOLE
<cfscript>
data=StructNew();
data.project="TailbaseConsoleCleaning";
data.category="cleaning";
data.module="Console Admin";
data.location="#CGI.SCRIPT_NAME#";
data.extraText="USER=#Session.merchantname# / ID=#Session.user_id# / LOC=#CGI.SCRIPT_NAME# / PATH=#CGI.CF_TEMPLATE_PATH# / HOST=#CGI.REMOTE_HOST# / Access tracking";
data.severity=3;
</cfscript>
<cfinvoke component="#VARIABLES.eventReactor#" method="set_eventReractor_log" returnvariable="response" data="#data#">
<!--- ********************************** ********************************** ********************************** --->
******************************************************** ******************************************************* *******************************************************/
