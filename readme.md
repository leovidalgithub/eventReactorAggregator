# Event Reactor Aggregator

Script based on NodeJS which sweeps a given directory *(initialFolder)* and add the EventReactor snippet to those files that previously has not the snippet.

>*** INITIAL VARIABLES CONFIGURATION ***
```js
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
```

> Snippet demo
```html
<!--- ********************************** EVENTREACTOR SNIPPET CODE ********************************** --->
<cfscript>
    data=StructNew();
    data.project="TailbaseAdminCleaning";
    data.category="cleaning";
    data.module="Analytics";
    data.location="#CGI.SCRIPT_NAME#";
    data.extraText="USER=#Session.identity# / ID=#Session.staffid# / LOC=#CGI.SCRIPT_NAME# / FILE=#Session.page# / HOST=#CGI.REMOTE_HOST# / Access tracking";
    data.severity=3;
</cfscript>
<cfinvoke component="#VARIABLES.eventReactor#" method="set_eventReractor_log" returnvariable="response" data="#data#">
<!--- ********************************** ********************************** ********************************** --->

```

Thanks!