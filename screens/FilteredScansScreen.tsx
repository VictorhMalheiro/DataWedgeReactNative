/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component, useState, useEffect, useRef, useReducer} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, FlatList, TouchableHighlight, Alert, CheckBox, Button, NativeEventEmitter} from 'react-native';
import { useDataWedgeInterop } from '../DataWedgeInterop';


type Barcode = {
  isActive: boolean,
  hasBeenScanned: boolean,
  decodedText: string
}

export default function FilteredScansScreen()  {

    
  const [validBarcodes, setValidBarcodes] = useState<Barcode []>([
    {
      isActive: true,
      hasBeenScanned: false,
      decodedText: "ABC-1234"
    },
    {
      isActive: false,
      hasBeenScanned: false,
      decodedText: "DEF-5678"
    },
    {
      isActive: false,
      hasBeenScanned: false,
      decodedText: "GHI-9012"
    },
    {
      isActive: false,
      hasBeenScanned: false,
      decodedText: "JKL-3456"
    },
    {
      isActive: false,
      hasBeenScanned: false,
      decodedText: "MNO-7890"
    },
  ]);


  const scanHandler = function(scanData:any)  {
    console.log("Got Scanz Data!");
    console.log(scanData);
    console.log(validBarcodes);
    var currentBarcode = scanData.filteredProperties.data_string;
    console.log(currentBarcode);
    var activateNextBarcode: boolean = false;
    let newBarcodes = [];
    for (let barcode of validBarcodes)
    {
        var newBarcode = {...barcode};
        if (activateNextBarcode)
        {
            console.log("activated next barcode");
            newBarcode.isActive = true;
            activateNextBarcode = false;
        }
        if (newBarcode.isActive)
        {
            if (currentBarcode == newBarcode.decodedText)
            {
                newBarcode.isActive = false;
                newBarcode.hasBeenScanned = true;
                activateNextBarcode = true;
                console.log("Scanned correct barcode!");
            }
            else
            {
                console.log("Scanned incorrect barcode!");
            }
        }
        newBarcodes.push(newBarcode);
    }
    setValidBarcodes(newBarcodes);
  }
  const [dwInterop, dispatchDWRequest] = useDataWedgeInterop();
  
  useEffect(() =>
    {
        dispatchDWRequest({type: "RegisterScanHandler", handler: scanHandler});
        return () => dispatchDWRequest({type: "UnregisterScanHandler", handler: scanHandler});
    }
  ,
  [dwInterop]);


  const _onPressScanButton:any = () => dispatchDWRequest({ type: 'ToggleScan'});


  const [hasCurrentVersion, sethasCurrentVersion] = useState(false);
  if (hasCurrentVersion == false)
  {
    //determineVersion();
    sethasCurrentVersion(true);
  }
  
    return (
      <ScrollView>
      <View style={styles.container}>
        <Text style={styles.h1}>Filtered Scans</Text>
        <Text style={styles.h3}>This page shows how to hook up components to take scans in order and alert if the scans are not correct.</Text>
        
        <FlatList
          data={validBarcodes}
          extraData={validBarcodes}
          keyExtractor={item => item.decodedText}
          renderItem={({item, separators}) => (
            <View style={{
              backgroundColor: '#0077A0', 
              margin:10,
              borderRadius: 5,
            }}>
            <View style={{flexDirection: 'row', flex: 1}}>
            <Text style={styles.scanDataHead}>{item.hasBeenScanned ? "Scanned" : "Not Yet Scanned"}</Text>
            <View style={{flex: 1}}>
              <Text style={styles.scanDataHeadRight}>{item.isActive ? "Active" : "Inactive"}</Text>
            </View>
            </View>
            <Text style={styles.scanData}>{item.decodedText}</Text>
            </View>
          )}
        />
 

      </View>
      </ScrollView>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
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
