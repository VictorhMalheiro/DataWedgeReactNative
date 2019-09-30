import { useConsoleLogging } from "./Logging";
import { useState, useReducer } from "react";
import DataWedgeIntents from 'react-native-datawedge-intents';

type DataWedgeScanConfig = {
  appNamespace: string,
}
type ScanAction = {
  type: "ToggleScan",
}
type DataWedgeState = {
    version: number
}

export function useDataWedgeScanHandler(config: DataWedgeScanConfig)
{
  // TOOD: use IoC to resolve the logging type we want to use.
  const log = useConsoleLogging();

  function eventReducer(state:DataWedgeState, action: ScanAction): DataWedgeState {
    
    // Some of these action types have side-effects, and are not a state reduction so in a production app
    // it may be appropriate to extract these into a side-effect management platform like Redux Saga.
    log({logLevel: 'trace', message: "DWReducer - Previous state: ", additionalParams: [state]});
    log({logLevel: 'trace', message: "DWReducer - Action: ", additionalParams: [action]});
    switch (action.type)
    {
      case "ToggleScan":
        sendCommand(apiBase + "SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');
        break;
    }
    log({logLevel: 'trace', message: "DWReducer - New state: ", additionalParams: [state]});
    return state;
  }

  const apiBase:string = "com.symbol.datawedge.api.";
  const broadcastActionLabel:string = apiBase + "ACTION";


  //const [sendCommandResult, setsendCommandResult] = useState("false");
  const [sendCommandResult, setsendCommandResult] = useState("true");
  const [dwState, setDWState] = useState<DataWedgeState>({version: -1});

  const sendCommand:any = (extraName: string, extraValue: any): any => {
    log({logLevel: 'debug', message: "Sending Command from hook: " + extraName, additionalParams: extraValue});
    var broadcastExtras: any = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = sendCommandResult;
    DataWedgeIntents.sendBroadcastWithExtras({
        action: broadcastActionLabel,
        extras: broadcastExtras});
  }

  return useReducer(eventReducer, dwState);
}
