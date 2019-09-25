import React from 'react';

const ScanContext = React.createContext({});

export const ScanProvider = ScanContext.Provider;
export const ScanConsumer = ScanContext.Consumer;
export default ScanContext;




/*

  constructor(Props) 
  {
    super(Props)
    this.state = {
      ean8checked: true,
      ean13checked: true, 
      code39checked: true, 
      code128checked: true, 
      lastApiVisible: false, 
      lastApiText: "Messages from DataWedge will go here",
      checkBoxesDisabled: true, 
      scanButtonVisible: false, 
      dwVersionText: "Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details",
      dwVersionTextStyle: styles.itemTextAttention,
      activeProfileText: "Requires DataWedge 6.3+",
      enumeratedScannersText: "Requires DataWedge 6.3+",
      scans: [],
    };
    //this.scans = [{decoder: 'label', timeAtDecode: 'time', data: '123'}, 
    //  {decoder: 'label', timeAtDecode: 'time', data: '321'}, 
    //  {decoder: 'label', timeAtDecode: 'time', data: '123'}]; 
    this.sendCommandResult = "false";
    this.broadcastReceiverHandler = (intent) =>
    {
      this.broadcastReceiver(intent);
    }
    DeviceEventEmitter.addListener('datawedge_broadcast_intent', this.broadcastReceiverHandler);
    this.registerBroadcastReceiver();
    this.determineVersion();
  }

  _onPressScanButton()
  {
    this.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');
  }

  determineVersion()
  {
    this.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
  }

  setDecoders()
  {
    //  Set the new configuration
    var profileConfig = {
        "PROFILE_NAME": "ZebraReactNativeDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "PARAM_LIST": {
                //"current-device-id": this.selectedScannerId,
                "scanner_selection": "auto",
                "decoder_ean8": "" + this.state.ean8checked,
                "decoder_ean13": "" + this.state.ean13checked,
                "decoder_code128": "" + this.state.code128checked,
                "decoder_code39": "" + this.state.code39checked
            }
        }
    };
    this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
  }

  sendCommand(extraName, extraValue) {
    console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
    var broadcastExtras = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = this.sendCommandResult;
    DataWedgeIntents.sendBroadcastWithExtras({
        action: "com.symbol.datawedge.api.ACTION",
        extras: broadcastExtras});
  }

  registerBroadcastReceiver()
  {
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

  broadcastReceiver(intent)
  {
    //  Broadcast received
    console.log('Received Intent: ' + JSON.stringify(intent));
    if (intent.hasOwnProperty('RESULT_INFO')) {
        var commandResult = intent.RESULT + " (" +
            intent.COMMAND.substring(intent.COMMAND.lastIndexOf('.') + 1, intent.COMMAND.length) + ")";// + JSON.stringify(intent.RESULT_INFO);
        this.commandReceived(commandResult.toLowerCase());
    }

    if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
        //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
        var versionInfo = intent['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
        console.log('Version Info: ' + JSON.stringify(versionInfo));
        var datawedgeVersion = versionInfo['DATAWEDGE'];
        console.log("Datawedge version: " + datawedgeVersion);

        //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
        if (datawedgeVersion >= "6.3")
            this.datawedge63();
        if (datawedgeVersion >= "6.4")
            this.datawedge64();
        if (datawedgeVersion >= "6.5")
            this.datawedge65();

        this.setState(this.state);
    }
    else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
        //  Return from our request to enumerate the available scanners
        var enumeratedScannersObj = intent['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
        this.enumerateScanners(enumeratedScannersObj);
    }
    else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
        //  Return from our request to obtain the active profile
        var activeProfileObj = intent['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
        this.activeProfile(activeProfileObj);
    }
    else if (!intent.hasOwnProperty('RESULT_INFO')) {
        //  A barcode has been scanned
        this.barcodeScanned(intent, new Date().toLocaleString());
    }
  }

  datawedge63()
  {
    console.log("Datawedge 6.3 APIs are available");
    //  Create a profile for our application
    this.sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "ZebraReactNativeDemo");

    this.state.dwVersionText = "6.3.  Please configure profile manually.  See ReadMe for more details.";
    
    //  Although we created the profile we can only configure it with DW 6.4.
    this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

    //  Enumerate the available scanners on the device
    this.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

    //  Functionality of the scan button is available
    this.state.scanButtonVisible = true;

  }

  datawedge64()
  {
    console.log("Datawedge 6.4 APIs are available");

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    this.state.dwVersionText = "6.4.";
    this.state.dwVersionTextStyle = styles.itemText;
    //document.getElementById('info_datawedgeVersion').classList.remove("attention");

    //  Decoders are now available
    this.state.checkBoxesDisabled = false;

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
    this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

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
    this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
        this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    }, 1000);
  }

  datawedge65()
  {
    console.log("Datawedge 6.5 APIs are available");

    this.state.dwVersionText = "6.5 or higher.";

    //  Instruct the API to send 
    this.sendCommandResult = "true";
    this.state.lastApiVisible = true;
  }

  commandReceived(commandText)
  {
    this.state.lastApiText = commandText;
    this.setState(this.state);
  }

  enumerateScanners(enumeratedScanners)
  {
    var humanReadableScannerList = "";
    for (var i = 0; i < enumeratedScanners.length; i++)
    {
        console.log("Scanner found: name= " + enumeratedScanners[i].SCANNER_NAME + ", id=" + enumeratedScanners[i].SCANNER_INDEX + ", connected=" + enumeratedScanners[i].SCANNER_CONNECTION_STATE);
        humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
        if (i < enumeratedScanners.length - 1)
            humanReadableScannerList += ", ";
    }
    this.state.enumeratedScannersText = humanReadableScannerList;
  }

  activeProfile(theActiveProfile)
  {
    this.state.activeProfileText = theActiveProfile;
    this.setState(this.state);
  }

  barcodeScanned(scanData, timeOfScan)
  {
    var scannedData = scanData["com.symbol.datawedge.data_string"];
    var scannedType = scanData["com.symbol.datawedge.label_type"];
    console.log("Scan: " + scannedData);
    this.state.scans.unshift({ data: scannedData, decoder: scannedType, timeAtDecode: timeOfScan });
    console.log(this.state.scans);
    this.setState(this.state);
  }

  */