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


export default function ConfigScreen()  {


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

  const config = {
    appNamespace: "com.datawedgereactnative.demo",
    profileName: "ZebraReactNativeDemo"
    };

    const [dwInterop, dispatchDWRequest] = useDataWedgeInterop(config);
    const [dataWedgeState, dispatchDWConfig] = useDataWedgeConfig(config, dispatchDWRequest);
  
  const someData = useEffect(() =>
    {
        dispatchDWConfig({type: "Initialize"});
    }
  );

  const _onPressScanButton:any = () => dispatchDWRequest({ type: 'ToggleScan'});

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
