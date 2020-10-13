import React from 'react';
import { View, Platform } from 'react-native';
import DefaultLayout from '../../../components/layouts/DefaultLayout';
import { Text } from '@ui-kitten/components';
import LottieView from 'lottie-react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';

const StudentAttendanceKioskScreen = () => {
  if (Platform.OS === 'web')
    return (
      <DefaultLayout>
        <Text category="h1">
          Kiosk mode is not supported on web. Please try again using the iOS or Android client.
        </Text>
      </DefaultLayout>
    );

  return (
    <DefaultLayout>
      <Text category="h1" style={{ marginTop: 30, marginBottom: 10 }}>
        Passable Kiosk
      </Text>
      <View
        style={{
          width: '100%',
          height: '90%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 1,
            height: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <LottieView
            loop
            autoPlay
            style={{
              height: 180,
              marginBottom: 40,
            }}
            source={require('../../../assets/exitLottie.json')}
          />
          <View style={{ width: '80%' }}>
            <Text category="h1" style={{ textAlign: 'center' }}>
              This is an{' '}
              <Text category="h1" style={{ color: '#EA2027' }}>
                EXIT{' '}
              </Text>
              point
            </Text>
            <Text category="h5" style={{ textAlign: 'center' }}>
              Please scan your ID or enter in your ID number before leaving campus.
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            height: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Camera
            style={[
              {
                flex: 1,
                width: '100%',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15,
                overflow: 'hidden',
              },
            ]}
            type={Camera.Constants.Type.front}
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.code39],
            }}
            onBarCodeScanned={data => {
              console.log(data);
            }}>
            <LottieView
              loop
              autoPlay
              style={{
                width: '75%',
              }}
              source={require('../../../assets/barcodeScanning.json')}
            />
          </Camera>
        </View>
      </View>
    </DefaultLayout>
  );
};

export default StudentAttendanceKioskScreen;