/******************************************************** ******************************************************* ******************************************************
************************************************************** EVENTREACTOR COLDFUSION SNIPPET AGGREGATOR **************************************************************
******************************************************** ******************************************************* *******************************************************/
// *** INITIAL DATA CONFIGURATION ***
const data = {
    logFileName        : 'eventReactorLog.txt',
    addSnippet         : false, // FALSE --> to put the snippet /// TRUE --> just to see the files that will be affected
    includeSubFolders  : true,
    includedExtensions : ['.cfm', '.cfc'],
    excludedFiles      : ['application.cfm'],
    initialFolders: [__dirname + '/testfolder'], // 'C:/work/adminsite/_admin/analytics'
    eventReactor : {
        project  : 'TailbaseAdminCleaning',
        category : 'Cleaning',
        tmodule  : 'Adminsite',
        location : '#CGI.SCRIPT_NAME#',
        message  : 'Access tracking',
        severity : 3
    }
}
/******************************************************** ****************************************************** ******************************************************
******************************************************************* ******************************* *******************************************************************
******************************************************** ****************************************************** *******************************************************/
const fs          = require('fs');
const path        = require('path');
const prependFile = require('prepend-file');
const logStream   = fs.createWriteStream(data.logFileName, { flags: 'w', encoding: 'utf8' });
const report      = {totalFiles:0,totalFolders: 0,skipped:0,added:0,already:0};
const snippet     = `<!--- ********************************** EVENTREACTOR SNIPPET CODE ********************************** --->
<cfscript>
    data=StructNew();
    data.project="${data.eventReactor.project}";
    data.category="${data.eventReactor.category}";
    data.module="${data.eventReactor.tmodule}";
    data.location="${data.eventReactor.location}";
    data.extraText="USER=#Session.identity# / ID=#Session.staffid# / LOC=${data.eventReactor.location} / FILE=#Session.page# / HOST=#CGI.REMOTE_HOST# / ${data.eventReactor.message}";
    data.severity=${data.eventReactor.severity};
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
                    if (data.includeSubFolders) {
                        sweepFiles(nextPath); // call recursive-function to sweep the next directory
                    }
                } else { // it is a file
                    report.totalFiles++;
                    addSnippetToFile(nextPath);
                }
            })
        })
    } else {
        console.log('Path does not exist =', folder);
    }
}

// FUNCTION - ADDING SNIPPET TO FILE
const addSnippetToFile = (thisFile) => {
    if (data.includedExtensions.some(ext => ext === path.extname(thisFile))) { // if this file extension is within 'includedExtensions'
        let fileContent = fs.readFileSync(thisFile, 'utf8');
        if (!fileContent.includes('EVENTREACTOR')) { // if thisFile wheter or not already has the snippet
            if (!data.addSnippet || data.excludedFiles.some(file => file === path.basename(thisFile))) { // skip if: 'addSnippet' OR this file is within 'excludedFiles'
                logStream.write(`-------SKIPPED----> ${thisFile}\n`);
                report.skipped++;
            } else {
                prependFile(thisFile, snippet + `\n`, (err) => { // adding the snippet at the beginning of the file
                    logStream.write(`---------ADDED----> ${thisFile}\n`);
                    report.added++;
                })
            }
        } else {
            logStream.write(`----ALREADY IN----> ${thisFile}\n`);
            report.already++;
        }
    }
}

const showReport = () => {
    setTimeout(() => {
logStream.write(`---------------- ---------------- ---------------- ---------------- ----------------
DATE = ${new Date().toUTCString()}
INCLUDED EXTENSIONS = ${data.includedExtensions.join(' ')} | EXCLUDED FILES = ${data.excludedFiles.join(' ')}
TOTAL FILES = ${report.totalFiles} | TOTAL FOLDERS = ${report.totalFolders} | SKIPPED = ${report.skipped} |\
 ADDED = ${report.added} | ALREADY IN = ${report.already}
---------------- ---------------- ---------------- ---------------- ----------------`);
    }, 1000);
}

// INITIAL AUTO-INVOKE FUNCTION
((folders) => {
    folders.forEach(folder => {
        sweepFiles(folder + '/');
    })
    showReport();
})(data.initialFolders)

// ADMIN CONSOLE
/******************************************************** ******************************************************* ******************************************************
< !--- ********************************** EVENTREACTOR SNIPPET CODE ********************************** --->
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
