import { useConsoleLogging } from "./Logging";
import { useState, useReducer, useEffect, useRef, MutableRefObject } from "react";
import DataWedgeIntents from 'react-native-datawedge-intents';
import { NativeEventEmitter } from "react-native";


type DataWedgeScanConfig = {
  appNamespace: string,
}
type ScanAction = 
  {
    type: "ToggleScan" | "ResetLastScan" | "GetActiveProfile" | "EnumerateScanners" | "GetVersion"
  } 
  |
  { 
    type: "CreateProfile",
    profileName: string
  }
  |
  {
    type: "UpdateProfile",
    profile: any
  }
  |
  {
    type: "RegisterScanHandler" | "UnregisterScanHandler",
    handler: any
  }

type DataWedgeState = {
  version: number,
  availableScanners: string[],
  lastCommand: string | null,
  lastScan: string | null,
  activeProfileName: string | null
}

export type ResultInfo = {
    type: "ResultInfo", infoDescription: string
};

export type DWVersion = {
    type: "DWVersion", version: string
};

export type EnumerateScanners = {
    type: "EnumerateScanners", scanners: any[]
};
export type ActiveProfile = { 
    type: "ActiveProfile", profile: any
};
export type Scan = {
    type: "Scan", filteredProperties: any
};

export type DataWedgeResult = null | ResultInfo | DWVersion | EnumerateScanners |  ActiveProfile | Scan;

type DataWedgeScanHandler = null | { handler: any };
/*
let handler: any = null;*/

export function useDataWedgeInterop(config: DataWedgeScanConfig) {
  // TOOD: use IoC to resolve the logging type we want to use.
  const log = useConsoleLogging();
  const handler:MutableRefObject<DataWedgeScanHandler> = useRef(null);
  const apiBase:string = "com.symbol.datawedge.api.";
  const dwEventNamespace:string = "com.symbol.datawedge."
  const broadcastActionLabel:string = apiBase + "ACTION";
  const [eventEmitter, setEventEmitter] = useState(new NativeEventEmitter(DataWedgeIntents));

  function eventReducer(state: DataWedgeState, action: ScanAction): DataWedgeState {

    // Some of these action types have side-effects, and are not a state reduction so in a production app
    // it may be appropriate to extract these into a side-effect management platform like Redux Saga.
    //log({ logLevel: 'trace', message: "DWReducer - Previous state: ", additionalParams: [state] });
    //log({ logLevel: 'trace', message: "DWReducer - Action: ", additionalParams: [action] });
    switch (action.type) {
      case "ToggleScan":
        sendCommand(apiBase + "SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');
        break;
      case "ResetLastScan":
        //setDWState({ ...dwState, lastScan: null });
        break;
      case "CreateProfile": 
        sendCommand(apiBase + "CREATE_PROFILE", action.profileName);
        break;
      case "GetActiveProfile":
        sendCommand(apiBase + "GET_ACTIVE_PROFILE");
        break;
      case "EnumerateScanners": 
        sendCommand(apiBase + "ENUMERATE_SCANNERS");
        break;
      case "UpdateProfile":
        sendCommand(apiBase + "SET_CONFIG", action.profile);
        break;
      case "GetVersion":
        sendCommand(apiBase + "GET_VERSION_INFO");
        break;
      case "RegisterScanHandler":
        console.log("This is where a handler should be registered.");
        handler.current = { handler: action.handler };
        //console.log({...state, lastCommand: "SDF", scanHandler: action.handler});
        //return {...state, lastCommand: "SDF", scanHandler: action.handler};
        //setHandler({handler : action.handler});
        //eventEmitter.addListener('datawedge_broadcast_intent', action.handler);
        break;
      case "UnregisterScanHandler":
        console.log("This is where a handler should be unregistered.");
        handler.current = null;
        //eventEmitter.removeListener('datawedge_broadcast_intent', action.handler);
        //return {...state, scanHandler: null };
        break;
    }
    //log({ logLevel: 'trace', message: "DWReducer - New state: ", additionalParams: [state] });
    return state;
  }

  const sendCommand: any = (extraName: string, extraValue: any): any => {
    if (extraValue == undefined) extraValue = "";
    log({ logLevel: 'debug', message: "Sending Command from hook: " + extraName, additionalParams: extraValue });
    var broadcastExtras: any = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = "true";
    DataWedgeIntents.sendBroadcastWithExtras({
      action: broadcastActionLabel,
      extras: broadcastExtras
    });
  }

  useEffect(() => {
    DataWedgeIntents.registerBroadcastReceiver({
      filterActions: [
        config.appNamespace + ".ACTION",
        apiBase + 'RESULT_ACTION'
      ],
      filterCategories: [
        'android.intent.category.DEFAULT'
      ]
    });
    eventEmitter.addListener('datawedge_broadcast_intent', broadcastReceiver);
    return () => eventEmitter.removeListener('datawedge_broadcast_intent', broadcastReceiver);
  }, [eventEmitter]);


  
  const [dwState, setDWState] = useReducer(eventReducer,
    {
    version: -1,
    availableScanners: [],
    lastCommand: null,
    lastScan: null, // TODO: make this a data type
    activeProfileName: null
  });



  function broadcastReceiver(intent: any)  {
    //  Broadcast received
    //console.log('Received Intent: ' + JSON.stringify(intent));

    var apiProperties:any = {};
    for (var property in intent)
    {
        if (property.startsWith(apiBase))
        {
          var baseName = property.substr(apiBase.length);
          apiProperties[baseName] = intent[property];
        }
        else if (property.startsWith(dwEventNamespace))
        {
          var baseName = property.substr(dwEventNamespace.length);
          apiProperties[baseName] = intent[property];
        }
    }

    var dataWedgeResult : DataWedgeResult = null;
    // Process intent
    if (intent.hasOwnProperty('RESULT_INFO')) {
        var commandResult = intent.RESULT + " (" +
            intent.COMMAND.substring(intent.COMMAND.lastIndexOf('.') + 1, intent.COMMAND.length) + ")";// + JSON.stringify(intent.RESULT_INFO);
        dataWedgeResult = { type: "ResultInfo", infoDescription: commandResult};
    }
  
    if (apiProperties.hasOwnProperty('RESULT_GET_VERSION_INFO')) {
        //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
        var versionInfo = apiProperties['RESULT_GET_VERSION_INFO'];
        //console.log('Version Info: ' + JSON.stringify(versionInfo));
        var datawedgeVersion = versionInfo['DATAWEDGE'];
        //console.log("Datawedge version: " + datawedgeVersion);
        dataWedgeResult = { type: "DWVersion", version: datawedgeVersion };

    }
    else if (apiProperties.hasOwnProperty('RESULT_ENUMERATE_SCANNERS')) {
        //  Return from our request to enumerate the available scanners
        var enumeratedScannersObj = apiProperties['RESULT_ENUMERATE_SCANNERS'];
        dataWedgeResult = { type: "EnumerateScanners", scanners: enumeratedScannersObj };
    }
    else if (apiProperties.hasOwnProperty('RESULT_GET_ACTIVE_PROFILE')) {
        //  Return from our request to obtain the active profile
        var activeProfileObj = apiProperties['RESULT_GET_ACTIVE_PROFILE'];
        dataWedgeResult = { type: "ActiveProfile", profile: activeProfileObj};
    }
    else if (!intent.hasOwnProperty('RESULT_INFO')) {
        //  A barcode has been scanned
        dataWedgeResult = {type: "Scan", filteredProperties: apiProperties};
        //(intent, new Date().toLocaleString());
    }
    
    //console.log("Handler check...");
    //console.log(dwState);
    if (handler.current != null) {
        //console.log("Handler dispatch");
        handler.current.handler(dataWedgeResult);
    }
  }
  const retval: [DataWedgeState, React.Dispatch<ScanAction>] = [dwState, setDWState];
  return retval;
}
