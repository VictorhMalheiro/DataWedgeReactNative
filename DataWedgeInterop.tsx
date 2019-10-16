import { useConsoleLogging } from "./Logging";
import { useState, useReducer, useEffect, useRef } from "react";
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

export function useDataWedgeInterop() {
  // TOOD: use IoC to resolve the logging type we want to use.
  const log = useConsoleLogging();

  const apiBase:string = "com.symbol.datawedge.api.";
  const broadcastActionLabel:string = apiBase + "ACTION";
  const [dwState, setDWState] = useState<DataWedgeState>(
    {
    version: -1,
    availableScanners: [],
    lastCommand: null,
    lastScan: null, // TODO: make this a data type
    activeProfileName: null

  });


  function eventReducer(state: DataWedgeState, action: ScanAction): DataWedgeState {

    // Some of these action types have side-effects, and are not a state reduction so in a production app
    // it may be appropriate to extract these into a side-effect management platform like Redux Saga.
    log({ logLevel: 'trace', message: "DWReducer - Previous state: ", additionalParams: [state] });
    log({ logLevel: 'trace', message: "DWReducer - Action: ", additionalParams: [action] });
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
        break;
      case "UnregisterScanHandler":
        console.log("This is where a handler should be unregistered.");
        break;
    }
    log({ logLevel: 'trace', message: "DWReducer - New state: ", additionalParams: [state] });
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
  let broadcastReceiverHandler: any = useRef(null);

  const registerBroadcastReceiver: any = () => {
    DataWedgeIntents.registerBroadcastReceiver({
      filterActions: [
        'com.zebra.reactnativedemo.ACTION',
        'com.symbol.datawedge.api.RESULT_ACTION'
      ],
      filterCategories: [
        'android.intent.category.DEFAULT'
      ]
    });
  }

  const broadcastReceiver: any = (intent: any) => {
    //  Broadcast received
    console.log('Received Intent: ' + JSON.stringify(intent));

    /*
  
    if (intent.hasOwnProperty('RESULT_INFO')) {
        var commandResult = intent.RESULT + " (" +
            intent.COMMAND.substring(intent.COMMAND.lastIndexOf('.') + 1, intent.COMMAND.length) + ")";// + JSON.stringify(intent.RESULT_INFO);
        setDWState({...dwState, lastCommand: commandResult});
    }
  
    if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
        //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
        var versionInfo = intent['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
        console.log('Version Info: ' + JSON.stringify(versionInfo));
        var datawedgeVersion = versionInfo['DATAWEDGE'];
        console.log("Datawedge version: " + datawedgeVersion);
  
        //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
        if (datawedgeVersion >= "6.3")
            datawedge63();
        if (datawedgeVersion >= "6.4")
            datawedge64();
        if (datawedgeVersion >= "6.5")
            datawedge65();
    }
    else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
        //  Return from our request to enumerate the available scanners
        var enumeratedScannersObj = intent['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
        setDWState({...dwState, availableScanners: ["A", "B", "C"]});
    }
    else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
        //  Return from our request to obtain the active profile
        var activeProfileObj = intent['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
        setDWState({...dwState, activeProfileName: activeProfileObj});
    }
    else if (!intent.hasOwnProperty('RESULT_INFO')) {
        //  A barcode has been scanned
        setDWState({...dwState, lastScan: intent});
        //(intent, new Date().toLocaleString());
    }*/
  }

  const [eventEmitter, setEventEmitter] = useState(new NativeEventEmitter(DataWedgeIntents));

  const intentHandler = useEffect(() => {
    eventEmitter.addListener('datawedge_broadcast_intent', broadcastReceiverHandler.current);
    return (() => {
      eventEmitter.removeListener('datawedge_broadcast_intent', broadcastReceiverHandler.current);
    })
  }, ["hot"]);

  if (broadcastReceiverHandler.current == null) {
    broadcastReceiverHandler.current = (intent: any) => {
      broadcastReceiver(intent);
    }
    registerBroadcastReceiver();
  }

  return useReducer(eventReducer, dwState);
}
