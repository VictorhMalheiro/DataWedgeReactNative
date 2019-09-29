import { useReducer } from "react";

export type LogMessage = {
  logLevel: "trace" | "debug" | "info" | "warn" | "error",
  message: string,
  additionalParams: any[] | undefined
}


export function useNullLogging()
{
  const eventReducer:any = (state: any, action: LogMessage) => {
    
  }
  const [ignore, dispatch] = useReducer(eventReducer, "");
  return dispatch;
}


export function useConsoleLogging()
{
  function eventReducer(state: any, action: LogMessage): any {
    switch(action.logLevel)
    {
      case 'trace':
        console.trace(action.message, action.additionalParams);
        break;
      case 'debug':
        console.debug(action.message, action.additionalParams);
        break;
      case 'info':
        console.info(action.message, action.additionalParams);
        break;
      case 'warn':
        console.warn(action.message, action.additionalParams);
        break;
      case 'error':
          console.error(action.message, action.additionalParams);
          break;
    }
  }
  const [ignore, dispatch] = useReducer(eventReducer, "");
  return dispatch;
}