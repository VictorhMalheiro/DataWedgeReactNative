import { useConsoleLogging } from "./Logging";
import { useState, useReducer, useEffect, useRef, MutableRefObject, Reducer, Dispatch } from "react";
import DataWedgeIntents from 'react-native-datawedge-intents';
import { NativeEventEmitter } from "react-native";
import { useDataWedgeInterop, DataWedgeResult, DWVersion, ActiveProfile, EnumerateScanners, ResultInfo } from "./DataWedgeInterop";

type DataWedgeConfig = {
  appNamespace: string,
  profileName: string
}
type DataWedgeState = {
    version: string,
    availableScanners: any[],
    lastCommand: string | null,
    lastScan: string | null,
    activeProfileName: string | null
}

type ConfigAction = {
  type: "Initialize",
} |
{
    type: "UpdateState",
    newState: DataWedgeState
}

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const eventDelegates: any = {

};
const eventsCompleted: any = {

};

const awaitEventReceived = async (eventType: string, callback:any, timeoutMs: number) => {
    // Wrap callback in a function so it will just sit there and wait
    // until the callback is called.
    let p = async (dwResult: DataWedgeResult) => 
        { 
            await callback(dwResult);
            eventsCompleted[eventType] = true; 
        };

    eventDelegates[eventType] = p;

    let startTimestamp: number = new Date().getTime();
    while (true)
    {
        if (eventsCompleted[eventType])
        {
            eventsCompleted[eventType] = false;
            break;
        }
        await sleep(250);
        let currentTimestamp: number = new Date().getTime();
        if (currentTimestamp - startTimestamp > timeoutMs)
        {
            console.log("Timeout awaiting event response of type: " + eventType);
            break;
        }
    }
}


const scanHandler = (scanData: DataWedgeResult) => {
    if (scanData == null) { return; }
    console.log(scanData);
    if (eventDelegates[scanData.type] !== undefined && eventDelegates[scanData.type] !== null)
    {
        eventDelegates[scanData.type](scanData);
        eventDelegates[scanData.type] = null;
    }
}
;

export function useDataWedgeConfig(config: DataWedgeConfig, dispatchDWRequest: any)
{
  const dwLocalState = useRef<DataWedgeState>(
    {
    version: "",
    availableScanners: [],
    lastCommand: null,
    lastScan: null, // TODO: make this a data type
    activeProfileName: null
  });
  

  const [hasInitialized, setHasInitialized] = useState(false);
  const [dwGlobalState, reducer] = useReducer(eventReducer, dwLocalState.current);
  // TODO: use IoC to resolve the logging type we want to use.
  const log = useConsoleLogging();

  async function initialize() {
    await dispatchDWRequest({type: "RegisterScanHandler", handler: scanHandler});
    await determineVersion();
    // TODO: call these based on actual version returned.
    if (dwLocalState.current.version >= "6.3.0")
    {
        await datawedge63();
    }
    if (dwLocalState.current.version >= "6.4.0")
    {
        await datawedge64();
    }
  }

  function eventReducer(state:DataWedgeState, action: ConfigAction): DataWedgeState {
    
    // Some of these action types have side-effects, and are not a state reduction so in a production app
    // it may be appropriate to extract these into a side-effect management platform like Redux Saga.
    //log({logLevel: 'trace', message: "DWReducer - Previous state: ", additionalParams: [state]});
    //log({logLevel: 'trace', message: "DWReducer - Action: ", additionalParams: [action]});
    switch (action.type)
    {
        case "Initialize":
            if (!hasInitialized)
            {
                setHasInitialized(true);
                initialize();
            }
            break;
        case "UpdateState":
            return action.newState;
            break;
    }
    //log({logLevel: 'trace', message: "DWReducer - New state: ", additionalParams: [state]});
    return state;
  }
  
  const apiBase:string = "com.symbol.datawedge.api.";
  const broadcastActionLabel:string = apiBase + "ACTION";


  //const [sendCommandResult, setsendCommandResult] = useState("false");
  // TODO: set send command result based on DW version.
  const [sendCommandResult, setsendCommandResult] = useState("true");

  const determineVersion:any = async () => 
  {
    let watcher:any = awaitEventReceived("DWVersion", (scanData: DWVersion) => {
        dwLocalState.current = {...dwLocalState.current, version: scanData.version };
        reducer({type: "UpdateState", newState: dwLocalState.current});
    }, 5000);
    dispatchDWRequest({ type: "GetVersion" });
    await watcher;
  }

  const datawedge63:any = async () =>
  {
    //  Create a profile for our application
    await dispatchDWRequest({ type: "CreateProfile", profileName: config.profileName});

    //  Although we created the profile we can only configure it with DW 6.4.
    let watcher:any = awaitEventReceived("ActiveProfile", (scanData: ActiveProfile) => {
        dwLocalState.current = {...dwLocalState.current, activeProfileName: scanData.profile };
        reducer({type: "UpdateState", newState: dwLocalState.current});
    }, 5000);

    await dispatchDWRequest({ type: "GetActiveProfile" });

    await watcher;
    //  Enumerate the available scanners on the device
    
    watcher = awaitEventReceived("EnumerateScanners", (scanData: EnumerateScanners) => {
        dwLocalState.current = {...dwLocalState.current, availableScanners: scanData.scanners };
        reducer({type: "UpdateState", newState: dwLocalState.current});
    }, 5000);

    await dispatchDWRequest({type: "EnumerateScanners"});
    await watcher;
  }

  const datawedge64:any = async () =>
  {
    console.log("Datawedge 6.4 APIs are available");

    //  Configure the created profile (associated app and keyboard plugin)
    var profileConfig = {
        "PROFILE_NAME": config.profileName,
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {}
        },
        "APP_LIST": [{
            "PACKAGE_NAME": config.appNamespace,
            "ACTIVITY_LIST": ["*"]
        }]
    };

    
    let watcher: any = awaitEventReceived("ResultInfo", (scanData: ResultInfo) => {
        console.log(scanData);
        //dwLocalState.current = {...dwLocalState.current, availableScanners: scanData.scanners }
    }, 5000);
    await dispatchDWRequest({ type: "UpdateProfile", profile: profileConfig });
    await watcher;
    //  Configure the created profile (intent plugin)
    var profileConfig2 = {
        "PROFILE_NAME": config.profileName,
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "INTENT",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {
                "intent_output_enabled": "true",
                "intent_action": config.appNamespace + ".ACTION",
                "intent_delivery": "2"
            }
        }
    };
    
    watcher = awaitEventReceived("ResultInfo", (scanData: ResultInfo) => {
        console.log(scanData);
        //dwLocalState.current = {...dwLocalState.current, availableScanners: scanData.scanners }
    }, 5000);
    await dispatchDWRequest({ type: "UpdateProfile", profile: profileConfig2});
    await watcher;
    
    watcher = awaitEventReceived("ActiveProfile", (scanData: ActiveProfile) => {
        console.log(scanData);
        dwLocalState.current = {...dwLocalState.current, activeProfileName: scanData.profile };
        reducer({type: "UpdateState", newState: dwLocalState.current});
        
    }, 5000);
    await dispatchDWRequest({ type: "GetActiveProfile"});
    await watcher;
  }

  let retVal: [DataWedgeState, Dispatch<ConfigAction>] = [dwGlobalState, reducer];
  return retVal;
}
