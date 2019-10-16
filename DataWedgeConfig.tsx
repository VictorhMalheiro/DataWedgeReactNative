import { useConsoleLogging } from "./Logging";
import { useState, useReducer, useEffect, useRef } from "react";
import DataWedgeIntents from 'react-native-datawedge-intents';
import { NativeEventEmitter } from "react-native";
import { useDataWedgeInterop } from "./DataWedgeInterop";

type DataWedgeConfig = {
  appNamespace: string,
}
type DataWedgeState = {
    version: number,
    availableScanners: string[],
    lastCommand: string | null,
    lastScan: string | null,
    activeProfileName: string | null
}

type ConfigAction = {
  type: string
}

export function useDataWedgeConfig(config: DataWedgeConfig)
{
  // TODO: use IoC to resolve the logging type we want to use.
  const log = useConsoleLogging();
  const [dwInterop, dispatchDWRequest] = useDataWedgeInterop();

  function eventReducer(state:DataWedgeState, action: ConfigAction): DataWedgeState {
    
    // Some of these action types have side-effects, and are not a state reduction so in a production app
    // it may be appropriate to extract these into a side-effect management platform like Redux Saga.
    log({logLevel: 'trace', message: "DWReducer - Previous state: ", additionalParams: [state]});
    log({logLevel: 'trace', message: "DWReducer - Action: ", additionalParams: [action]});
    switch (action.type)
    {
      case "Initialize":
        console.log("Starting initialization.");
        break;
    }
    log({logLevel: 'trace', message: "DWReducer - New state: ", additionalParams: [state]});
    return state;
  }
  
  const apiBase:string = "com.symbol.datawedge.api.";
  const broadcastActionLabel:string = apiBase + "ACTION";


  //const [sendCommandResult, setsendCommandResult] = useState("false");
  // TODO: set send command result based on DW version.
  const [sendCommandResult, setsendCommandResult] = useState("true");
  const [dwState, setDWState] = useState<DataWedgeState>(
    {
    version: -1,
    availableScanners: [],
    lastCommand: null,
    lastScan: null, // TODO: make this a data type
    activeProfileName: null

  });

  const determineVersion:any = () => 
  {
    console.log("Determine Version");
    dispatchDWRequest({ type: "GetVersion" });
  }


  const datawedge63:any = () =>
  {
    console.log("Datawedge 6.3 APIs are available");
    //  Create a profile for our application
    dispatchDWRequest({ type: "CreateProfile", profileName: "ZebraReactNativeDemo"});

    // TODO: migrate to UI layer 
    // setdwVersionText("6.3.  Please configure profile manually.  See ReadMe for more details.");
    
    //  Although we created the profile we can only configure it with DW 6.4.
    dispatchDWRequest({ type: "GetActiveProfile" });

    //  Enumerate the available scanners on the device
    dispatchDWRequest({type: "EnumerateScanners"});

    //  Functionality of the scan button is available
    // TODO: migrate to UI layer 
    // setscanButtonVisible(true);

  }

  const datawedge64:any = () =>
  {
    console.log("Datawedge 6.4 APIs are available");

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    // TODO: migrate to UI layer 
    // setdwVersionText("6.4.");
    // setdwVersionTextStyle({...styles.itemText, backgroundColor: "white"});
    
    //  Decoders are now available
    // TODO: migrate to UI layer 
    // setcheckBoxesDisabled(false);

    //  Configure the created profile (associated app and keyboard plugin)
    var profileConfig = {
        "PROFILE_NAME": "ZebraReactNativeDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {}
        },
        "APP_LIST": [{
            "PACKAGE_NAME": "com.datawedgereactnative.demo",
            "ACTIVITY_LIST": ["*"]
        }]
    };
    dispatchDWRequest({ type: "UpdateProfile", profile: profileConfig });

    //  Configure the created profile (intent plugin)
    var profileConfig2 = {
        "PROFILE_NAME": "ZebraReactNativeDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "INTENT",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {
                "intent_output_enabled": "true",
                "intent_action": "com.zebra.reactnativedemo.ACTION",
                "intent_delivery": "2"
            }
        }
    };
    dispatchDWRequest({ type: "UpdateProfile", profile: profileConfig2});

    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
        dispatchDWRequest({ type: "GetActiveProfile"});
    }, 1000);
  }

  const datawedge65:any = () =>
  {
    console.log("Datawedge 6.5 APIs are available");

    // TODO: migrate to UI layer 
    //setdwVersionText("6.5 or higher.");

    //  Instruct the API to send 
    //TODO: uncomment 
    //setsendCommandResult("true");
    
    // TODO: migrate to UI layer 
    // setlastApiVisible(true);
  }




  return useReducer(eventReducer, dwState);
}
