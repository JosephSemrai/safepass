import React from 'react';
import { firestore } from 'firebase';
import PassCard from './PassCard';
import { Text } from '@ui-kitten/components';
import { FlatList, ScrollView, View, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

const PassList = ({
  passesData,
  displayIssuer,
  displayDateInsteadOfTime,
}: {
  passesData: firebase.firestore.DocumentData[];
  displayIssuer?: boolean;
  displayDateInsteadOfTime?: boolean;
}) => {
  return (
    <>
      {passesData.length == 0 ? (
        <View
          style={{
            flex: 1,
            display: 'flex',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {Platform.OS !== 'web' && (
            <LottieView
              autoPlay
              loop
              speed={0.5}
              style={{
                width: 300,
              }}
              source={require('../assets/passDisplay.json')}
            />
          )}
          <Text category="h5" style={{ textAlign: 'center', paddingBottom: 20 }}>
            No Current Passes. Create One!
          </Text>
        </View>
      ) : (
        <ScrollView>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {passesData.map((pass, index) => {
              return (
                <PassCard
                  displayIssuer={displayIssuer}
                  displayDateInsteadOfTime={displayDateInsteadOfTime}
                  key={pass.uid}
                  //@ts-ignore
                  passInfo={{ passColor: '#00BFFF', ...pass }}
                  style={{
                    flex: 1,
                    minWidth: 150,
                    margin: 5,
                  }}
                />
              );
            })}
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default PassList;
