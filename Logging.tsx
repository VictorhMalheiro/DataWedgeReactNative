export type LogMessage = {
  logLevel: "trace" | "debug" | "info" | "warn" | "error",
  message: string,
  additionalParams: any[] | undefined
}


export function useNullLogging()
{
  function effect(action: LogMessage): void {
    
  }
  return effect;
}


export function useConsoleLogging()
{
  function effect(action: LogMessage): void {
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
  return effect;
}