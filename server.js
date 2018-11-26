/******************************************************** ****************************************************** ******************************************************
******************************************************************* EVENTREACTOR SNIPPET AGGREGATOR *******************************************************************
******************************************************** ****************************************************** *******************************************************/
// *** INITIAL VARIABLES CONFIGURATION ***
let logFile           = 'eventReactorLog.txt';
let subFolders        = true;
let allowedFiles      = ['.cfm', '.cfc'];
let initialFolder     = '/test/';
let justShowFilesInfo = false;
// EventReactor info to send
let project  = 'TailbaseAdminCleaning';
let category = 'Cleaning';
let tmodule  = 'Analytics';
let location = '#CGI.SCRIPT_NAME#';
let message  = 'Access tracking';
let severity = 3;
/******************************************************** ****************************************************** ******************************************************
******************************************************************* ******************************* *******************************************************************
******************************************************** ****************************************************** *******************************************************/
const fs           = require('fs');
const path         = require('path');
const prependFile  = require('prepend-file');
const logStream    = fs.createWriteStream(logFile, { flags: 'a', encoding: 'utf8' });
initialFolder      = __dirname + initialFolder;
const snippet      = `<!--- ********************************** EVENTREACTOR SNIPPET CODE ********************************** --->
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

(function sweepFiles(initialFolder) {
    if (fs.existsSync(initialFolder)) { // verifiyng path
        fs.readdir(initialFolder, 'utf8', (err, files) => { // reading directory
            if (err) throw err;
            files.forEach(file => { // object iteracting (files/directories) 
                let nextElement = initialFolder + file + '/';
                if (fs.lstatSync(nextElement).isDirectory()) { // if it is a directory
                    if (subFolders) {
                        sweepFiles(nextElement); // call recursive-function with the new directory to sweep 
                    }
                } else { // if it is a file
                    addSnippet(nextElement);
                }
            })
        });
    } else {
        console.log('Path does not exist');
    }
})(initialFolder);

const addSnippet = (url) => {
    if (allowedFiles.some(ext => ext === path.extname(url))) { // verifiyng is that extension is allowed
        let fileContent = fs.readFileSync(url, 'utf8');
        if (!justShowFilesInfo && !fileContent.includes('EVENTREACTOR')) { // verifiyng whether or not that file already has the Snippet
            prependFile(url, snippet + '\n', (err) => { // adding the snippet at the beginning of the file
                logStream.write('EVENTREACTOR ADDED > ' + url + '\n'); // snippet added
            })
        } else {
            logStream.write('------------ ----- > ' + url + '\n'); // no added
        }
    }
}
