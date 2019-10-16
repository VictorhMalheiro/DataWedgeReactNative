/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component, useState, useEffect, useRef, useReducer} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, FlatList, TouchableHighlight, Alert, CheckBox, Button, NativeEventEmitter} from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import DataWedgeIntents from 'react-native-datawedge-intents';
import { useDataWedgeConfig } from '../DataWedgeConfig';
import { useDataWedgeInterop } from '../DataWedgeInterop';


export default function AllScansScreen()  {


  const [ean8checked, setean8checked] = useState(true);
  const [ean13checked, setean13checked] = useState(true);
  const [code39checked, setcode39checked] = useState(true);
  const [code128checked, setcode128checked] = useState(true);
  const [lastApiVisible, setlastApiVisible] = useState(false);
  const [lastApiText, setlastApiText] = useState("Messages from DataWedge will go here");
  const [enumeratedScannersText, setenumeratedScannersText] = useState("Requires DataWedge 6.3+");
  const [checkBoxesDisabled, setcheckBoxesDisabled] = useState(true);
  const [scanButtonVisible, setscanButtonVisible] = useState(false);
  const [dwVersionText, setdwVersionText] = useState("Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details");
  const [dwVersionTextStyle, setdwVersionTextStyle] = useState(styles.itemTextAttention);
  const [activeProfileText, setactiveProfileText] = useState("Requires DataWedge 6.3+");
  const [scans, setscans] = useState(Array());
  //const [sendCommandResult, setsendCommandResult] = useState("false");

  const [dataWedgeState, dispatchDWConfig] = useDataWedgeConfig({
      appNamespace: "com.datawedgereactnative.demo"
  });

  const [dwInterop, dispatchDWRequest] = useDataWedgeInterop();

  const someData = useEffect(() =>
    {
      console.log("called effect.")
    }
  );


  const _onPressScanButton:any = () => dispatchDWRequest({ type: 'ToggleScan'});

  // const registerBroadcastReceiver : any = () => 
  // {
  //   DataWedgeIntents.registerBroadcastReceiver({
  //     filterActions: [
  //         'com.zebra.reactnativedemo.ACTION',
  //         'com.symbol.datawedge.api.RESULT_ACTION'
  //     ],
  //     filterCategories: [
  //         'android.intent.category.DEFAULT'
  //     ]
  //   });
  // }

  // const broadcastReceiver:any = (intent: any) =>
  // {
  //   //  Broadcast received
  //   console.log('Received Intent: ' + JSON.stringify(intent));
  //   if (intent.hasOwnProperty('RESULT_INFO')) {
  //       var commandResult = intent.RESULT + " (" +
  //           intent.COMMAND.substring(intent.COMMAND.lastIndexOf('.') + 1, intent.COMMAND.length) + ")";// + JSON.stringify(intent.RESULT_INFO);
  //       commandReceived(commandResult.toLowerCase());
  //   }

  //   if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
  //       //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
  //       var versionInfo = intent['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
  //       console.log('Version Info: ' + JSON.stringify(versionInfo));
  //       var datawedgeVersion = versionInfo['DATAWEDGE'];
  //       console.log("Datawedge version: " + datawedgeVersion);

  //       //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
  //       if (datawedgeVersion >= "6.3")
  //           datawedge63();
  //       if (datawedgeVersion >= "6.4")
  //           datawedge64();
  //       if (datawedgeVersion >= "6.5")
  //           datawedge65();
  //   }
  //   else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
  //       //  Return from our request to enumerate the available scanners
  //       var enumeratedScannersObj = intent['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
  //       enumerateScanners(enumeratedScannersObj);
  //   }
  //   else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
  //       //  Return from our request to obtain the active profile
  //       var activeProfileObj = intent['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
  //       activeProfile(activeProfileObj);
  //   }
  //   else if (!intent.hasOwnProperty('RESULT_INFO')) {
  //       //  A barcode has been scanned
  //       barcodeScanned(intent, new Date().toLocaleString());
  //   }
  // }

  // const datawedge63:any = () =>
  // {
  //   console.log("Datawedge 6.3 APIs are available");
  //   //  Create a profile for our application
  //   sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "ZebraReactNativeDemo");

  //   setdwVersionText("6.3.  Please configure profile manually.  See ReadMe for more details.");
    
  //   //  Although we created the profile we can only configure it with DW 6.4.
  //   sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

  //   //  Enumerate the available scanners on the device
  //   sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

  //   //  Functionality of the scan button is available
  //   setscanButtonVisible(true);

  // }

  // const datawedge64:any = () =>
  // {
  //   console.log("Datawedge 6.4 APIs are available");

  //   //  Documentation states the ability to set a profile config is only available from DW 6.4.
  //   //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
  //   setdwVersionText("6.4.");
  //   setdwVersionTextStyle({...styles.itemText, backgroundColor: "white"});
    
  //   //  Decoders are now available
  //   setcheckBoxesDisabled(false);

  //   //  Configure the created profile (associated app and keyboard plugin)
  //   var profileConfig = {
  //       "PROFILE_NAME": "ZebraReactNativeDemo",
  //       "PROFILE_ENABLED": "true",
  //       "CONFIG_MODE": "UPDATE",
  //       "PLUGIN_CONFIG": {
  //           "PLUGIN_NAME": "BARCODE",
  //           "RESET_CONFIG": "true",
  //           "PARAM_LIST": {}
  //       },
  //       "APP_LIST": [{
  //           "PACKAGE_NAME": "com.datawedgereactnative.demo",
  //           "ACTIVITY_LIST": ["*"]
  //       }]
  //   };
  //   sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

  //   //  Configure the created profile (intent plugin)
  //   var profileConfig2 = {
  //       "PROFILE_NAME": "ZebraReactNativeDemo",
  //       "PROFILE_ENABLED": "true",
  //       "CONFIG_MODE": "UPDATE",
  //       "PLUGIN_CONFIG": {
  //           "PLUGIN_NAME": "INTENT",
  //           "RESET_CONFIG": "true",
  //           "PARAM_LIST": {
  //               "intent_output_enabled": "true",
  //               "intent_action": "com.zebra.reactnativedemo.ACTION",
  //               "intent_delivery": "2"
  //           }
  //       }
  //   };
  //   sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

  //   //  Give some time for the profile to settle then query its value
  //   setTimeout(() => {
  //       sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
  //   }, 1000);
  // }

  // const datawedge65:any = () =>
  // {
  //   console.log("Datawedge 6.5 APIs are available");

  //   setdwVersionText("6.5 or higher.");

  //   //  Instruct the API to send 
  //   //TODO: uncomment 
  //   //setsendCommandResult("true");
  //   setlastApiVisible(true);
  // }
  const commandReceived:any = (commandText: any) =>
  {
    console.log("Last api text set");
    setlastApiText(commandText);
  }

  // TODO: enumeratedScanners should be a data type.
  const enumerateScanners:any = (enumeratedScanners: any) =>
  {
    setenumeratedScannersText(enumeratedScanners.map((s: any) => 
    {
      console.log("Scanner found: name= " + s.SCANNER_NAME + ", id=" + s.SCANNER_INDEX + ", connected=" + s.SCANNER_CONNECTION_STATE);
      return s.SCANNER_NAME;
    }
    ).join(", "));
  }

  const activeProfile:any = (theActiveProfile: string) =>
  {
    setactiveProfileText(theActiveProfile);
  }
  const prepend = (array:any[], value:any) :any[] => {
    var newArray = array.slice();
    newArray.unshift(value);
    return newArray;
  }
  const barcodeScanned:any = (scanData: any, timeOfScan: any) =>
  {
    var scannedData = scanData["com.symbol.datawedge.data_string"];
    var scannedType = scanData["com.symbol.datawedge.label_type"];
    console.log("Scan: " + scannedData);
    var scanArray = scans;
    scanArray;
    setscans(scans => prepend(scans, { data: scannedData, decoder: scannedType, timeAtDecode: timeOfScan }));
  }

const setDecoders = () => {
  //  Set the new configuration
  var profileConfig = {
      "PROFILE_NAME": "ZebraReactNativeDemo",
      "PROFILE_ENABLED": "true",
      "CONFIG_MODE": "UPDATE",
      "PLUGIN_CONFIG": {
          "PLUGIN_NAME": "BARCODE",
          "PARAM_LIST": {
              "scanner_selection": "auto",
              "decoder_ean8": "" + ean8checked,
              "decoder_ean13": "" + ean13checked,
              "decoder_code128": "" + code128checked,
              "decoder_code39": "" + code39checked
          }
      }
  };
  sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
}
const sendCommand:any = (extraName: string, extraValue: any): any => {
  console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
  var broadcastExtras: any = {};
  broadcastExtras[extraName] = extraValue;
  broadcastExtras["SEND_RESULT"] = "true";
  // TODO: fix this command setting.
  //broadcastExtras["SEND_RESULT"] = sendCommandResult;
  DataWedgeIntents.sendBroadcastWithExtras({
      action: "com.symbol.datawedge.api.ACTION",
      extras: broadcastExtras});
}

  const [hasCurrentVersion, sethasCurrentVersion] = useState(false);
  if (hasCurrentVersion == false)
  {
    //determineVersion();
    sethasCurrentVersion(true);
  }
  
    return (
      <ScrollView>
      <View style={styles.container}>
        <Text style={styles.h1}>Zebra ReactNative DataWedge Demo</Text>
        <Text style={styles.h3}>Information / Configuration</Text>
        <Text style={styles.itemHeading}>DataWedge version:</Text>
        <Text style={dwVersionTextStyle}>{dwVersionText}</Text>
        <Text style={styles.itemHeading}>Active Profile</Text>
        <Text style={styles.itemText}>{activeProfileText}</Text>
        { lastApiVisible && 
          <Text style={styles.itemHeading}>Last API message</Text>
        }
        { lastApiVisible && 
          <Text style={styles.itemText}>{lastApiText}</Text>
        }
        <Text style={styles.itemHeading}>Available scanners:</Text>
        <Text style={styles.itemText}>{enumeratedScannersText}</Text>
        <View style={{flexDirection: 'row', flex: 1, alignItems:'center', alignContent: "space-around", justifyContent: "space-evenly"}}>
          <Text style={{alignContent: 'center', alignSelf: 'center', width: 70}}>EAN 8</Text>
          <CheckBox
            value={ean8checked}
            onValueChange={async (val) => {
              await setean8checked(val);
              setDecoders();
            }}
          />
          <Text style={{alignContent: 'center', alignSelf: 'center', width: 70}}>EAN 13</Text>
          <CheckBox
            value={ean13checked}
            disabled={checkBoxesDisabled}
            onValueChange={async (val) => {
              await setean13checked(val);
              setDecoders();
            }}
          />
        </View>
        <View style={{flexDirection: 'row', flex: 1, alignItems:'center', alignContent: "space-around", justifyContent:'space-evenly'}}>
          <Text style={{alignContent: 'center', alignSelf: 'center', width: 70}}>EAN 39</Text>
          <CheckBox
            value={code39checked}
            disabled={checkBoxesDisabled}
            onValueChange={async (val) => {
              await setcode39checked(val);
              setDecoders();
            }}
          />
          <Text style={{alignContent: 'center', alignSelf: 'center', width: 70}}>EAN 128</Text>
          <CheckBox
            value={code128checked}
            disabled={checkBoxesDisabled}
            onValueChange={async (val) => {
              await setcode128checked(val);
              setDecoders();
            }}
          />
        </View>
        {scanButtonVisible && 
          <Button
          title='Scan'
          color="#333333"
          onPress={() => {_onPressScanButton()}}
          />
        }

        <Text style={styles.itemHeading}>Scanned barcodes will be displayed here.  Scanned barcodes: {scans.length}</Text>

        <FlatList
          data={scans}
          extraData={scans}
          keyExtractor={item => item.timeAtDecode}
          renderItem={({item, separators}) => (
            <TouchableHighlight
            onShowUnderlay={separators.highlight}
            onHideUnderlay={separators.unhighlight}>
            <View style={{
              backgroundColor: '#0077A0', 
              margin:10,
              borderRadius: 5,
            }}>
            <View style={{flexDirection: 'row', flex: 1}}>
            <Text style={styles.scanDataHead}>{item.decoder}</Text>
            <View style={{flex: 1}}>
              <Text style={styles.scanDataHeadRight}>{item.timeAtDecode}</Text>
            </View>
            </View>
            <Text style={styles.scanData}>{item.data}</Text>
            </View>
          </TouchableHighlight>
          )}
        />
 

      </View>
      </ScrollView>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  h1: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 14,
    textAlign: 'center',
    margin: 10,
    fontWeight: "bold",
  },
  itemHeading: {
    fontSize: 12,
    textAlign: 'left',
    left: 10,
    fontWeight: "bold",
  },
  itemText: {
    fontSize: 12,
    textAlign: 'left',
    margin: 10,
  },
  itemTextAttention: {
    fontSize: 12,
    textAlign: 'left',
    margin: 10,
    backgroundColor: '#ffd200'
  },
  scanDataHead: {
    fontSize: 10,
    margin: 2,
    fontWeight: "bold",
    color: 'white',
  },
  scanDataHeadRight: {
    fontSize: 10,
    margin: 2,
    textAlign: 'right',
    fontWeight: "bold",
    color: 'white',
  },
  scanData: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'center',
    margin: 2,
    color: 'white',
  }
});
