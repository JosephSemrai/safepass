import React from 'react';
import { Text, Button, Spinner, Card, Input, Avatar, ButtonGroup } from '@ui-kitten/components';
import DefaultLayout from '../../components/layouts/DefaultLayout';
import { auth, db } from '../../components/FirebaseAuthenticator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import Icon from 'react-native-dynamic-vector-icons';
import {
  CreatePassScreenNavigationProp,
  CreatePassScreenRouteProp,
} from '../../navigation/HomeNavigation';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Platform, View, StyleSheet, Image, Dimensions, ListView } from 'react-native';
import LottieView from 'lottie-react-native';
import { Camera } from 'expo-camera';
import { Student } from './StudentInfoScreen';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/rootReducer';
import { getNumberWithOrdinal } from '../../components/SingleStudentDisplay';
import StudentSearch from '../../components/StudentSearch';
import IDScanner from '../../components/IDScanner';

export interface Room {
  category: string;
  displayName: string;
  maxPersonCount: number;
}

export interface RoomCategory {
  categorySpecifier: string;
  color: string;
  displayName: string;
  iconGroup: string;
  iconName: string;
  studentsRequireApproval: boolean;
}

const CreatePassScreen = ({
  navigation,
  route,
}: {
  navigation: CreatePassScreenNavigationProp;
  route: CreatePassScreenRouteProp;
}) => {
  const [selectedStudent, setSelectedStudent] = React.useState<firebase.firestore.DocumentData>();
  const [selectedRoom, setSelectedRoom] = React.useState<firebase.firestore.DocumentData>();
  const [selectedTime, setSelectedTime] = React.useState(5);
  const [step, setStep] = React.useState('selectStudent');
  const [creationStatus, setCreationStatus] = React.useState<string>();
  const [user, userLoading, userError] = useAuthState(auth);

  const schoolRoomCategories = useSelector((state: RootState) => state.setup.school.roomCategories);

  const handleCreatePass = () => {
    if (!user) {
      return alert('Please retry, failed to initialize user.');
    }

    // TODO: Track from location
    // TODO: ADD TIME
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + selectedTime * 60000);
    const passData = {
      fromLocation: 'default',
      toLocation: selectedRoom.ref,
      fromLocationName: 'default',
      toLocationName: selectedRoom.displayName,
      locationCategory: selectedRoom.category,
      issuingUserName: user.displayName,
      issuingUser: db.collection('users').doc(user.uid),
      passRecipientName: selectedStudent.displayName,
      passSchemaVersion: 1,
      startTime: new Date(),
      endTime: futureDate, // use SelectedTime
    };

    // setCreationStatus('Assigning student the pass...');
    selectedStudent.ref
      .collection('passes')
      .add(passData)
      .then(() => {
        // setCreationStatus('Updating school records...');
        selectedStudent.school
          .collection('passes')
          .add(passData)
          .then(() => {
            // setCreationStatus('Updating room records...');
            selectedRoom.ref
              .collection('passes')
              .add(passData)
              .then(() => {
                // setCreationStatus('Successfully created pass.');
                alert('Successfully created pass!');
                navigation.navigate('Home');
              })
              .catch((e: any) => alert(e.message));
          })
          .catch((e: any) => alert(e.message));
      })
      .catch((e: any) => alert(e.message));
  };

  const CapacityChecker = () => {
    // TODO: Optimize this, rerenders and rereads on time increment or decrement
    const [currentTime, _] = React.useState(new Date());
    const [activeRoomPasses, loading, error] = useCollection(
      selectedRoom.ref.collection('passes').where('endTime', '>=', currentTime)
    );

    if (loading) {
      return (
        <Card style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ textAlign: 'center' }} category="h1">
            Loading room capacity information...
          </Text>
          <Spinner />
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <Text>{error.message}</Text>
        </Card>
      );
    }
    const currentCount = activeRoomPasses.docs.length;

    return (
      <Card style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{ textAlign: 'center', fontFamily: 'Inter_600SemiBold', fontSize: 20 }}
          category="s1">
          Capacity Tracker
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 40,
              textAlign: 'center',
              color: currentCount > selectedRoom.maxPersonCount ? 'red' : 'green',
            }}
            category="h1">
            {currentCount}
          </Text>
          <Text category="h3">/{selectedRoom.maxPersonCount}</Text>
        </View>
      </Card>
    );
  };
  const LoadingIndicator = (props: any) => (
    <View
      style={[
        props.style,
        {
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}>
      <Spinner size="small" />
    </View>
  );

  const TimeSelector = () => {
    return (
      <View style={{ display: 'flex', flex: 1 }}>
        <Text style={{ marginBottom: 10 }} category="h1">
          Select Pass Duration
        </Text>
        <CapacityChecker />
        <View style={{ width: '100%', alignItems: 'center', alignContent: 'center' }}>
          <Text
            style={{ textAlign: 'center', fontSize: 40, marginBottom: 20, marginTop: 50 }}
            category="h1">
            {selectedTime} minutes
          </Text>
          <ButtonGroup>
            <Button onPress={() => setSelectedTime(selectedTime + 1)}>+</Button>
            <Button onPress={() => setSelectedTime(selectedTime - 1)}>-</Button>
          </ButtonGroup>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
          <Button status="success" onPress={handleCreatePass}>
            Create Pass
          </Button>
        </View>
      </View>
    );
  };

  const StudentSelector = ({ context }: { context: string }) => {
    return (
      <>
        <Text category="h1" style={{ marginBottom: 10 }}>
          Search for a student
        </Text>
        {context === 'scan' && (
          // TODO: FIX HANDLING OF SCANNER
          <IDScanner
            handleStudentScan={(data: any) =>
              navigation.navigate('StudentInfo', {
                schoolIssuedId: data,
                context: 'schoolIssuedId',
              })
            }
          />
        )}
        {context === 'search' && (
          <StudentSearch
            handleStudentSelect={(student: firebase.firestore.DocumentData) => {
              setSelectedStudent(student);

              setStep('selectRoom');
            }}
          />
        )}
      </>
    );
  };

  const RoomSelector = () => {
    const [selectedCategory, setSelectedCategory] = React.useState<any>();

    const SpecificRoomSelector = ({ category }: { category: any }) => {
      const schoolPath = useSelector((state: RootState) => state.setup.school.documentPath);

      const [
        matchingRoomsCollection,
        isMatchingRoomsCollectionLoading,
        matchingRoomsCollectionError,
      ] = useCollection(
        db
          .doc(schoolPath)
          .collection('rooms')
          .where('category', '==', category.categorySpecifier)
          .limit(20)
      );

      if (matchingRoomsCollectionError) {
        return <Text>{matchingRoomsCollectionError.message}</Text>;
      }

      if (isMatchingRoomsCollectionLoading) {
        return <Spinner />;
      }

      return (
        <>
          <ScrollView>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {matchingRoomsCollection.docs.map(room => (
                <TouchableOpacity
                  key={category.categorySpecifier}
                  onPress={() => {
                    setSelectedRoom({ ref: room.ref, ...room.data() });

                    setStep('selectTime');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: category.color || '#FC6',
                    borderRadius: 10,
                    padding: 15,
                    alignContent: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    minWidth: 125,
                    height: 150,
                    margin: 5,
                  }}>
                  <>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '600',
                        fontFamily: 'Inter_800ExtraBold',
                        fontSize: 20,
                        textAlign: 'center',
                        flexWrap: 'wrap',
                      }}>
                      {room.data().displayName}
                    </Text>
                  </>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      );
    };

    return (
      <>
        {!selectedCategory && (
          <>
            <Text category="h1" style={{ marginBottom: 10 }}>
              Select a category
            </Text>
            <ScrollView>
              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {schoolRoomCategories.map((category: RoomCategory) => (
                  <TouchableOpacity
                    key={category.categorySpecifier}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                      flex: 1,
                      backgroundColor: category.color || '#FC6',
                      borderRadius: 10,
                      padding: 15,
                      alignContent: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      minWidth: 125,
                      height: 150,
                      margin: 5,
                    }}>
                    <>
                      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Icon
                          name={category.iconName}
                          type={category.iconGroup}
                          size={35}
                          color="white"
                        />
                      </View>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: '600',
                          fontFamily: 'Inter_800ExtraBold',
                          fontSize: 20,
                          textAlign: 'center',
                          flexWrap: 'wrap',
                        }}>
                        {category.displayName}
                      </Text>
                      <Text
                        style={{
                          color: 'gray',
                          fontWeight: '600',
                          fontFamily: 'Inter_800ExtraBold',
                          fontSize: 20,
                          textAlign: 'center',
                          flexWrap: 'wrap',
                        }}>
                        {category.studentsRequireApproval && 'Requires Approval'}
                      </Text>
                    </>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {selectedCategory && (
          <>
            <Text category="h1" style={{ marginBottom: 10 }}>
              Select a room
            </Text>
            <SpecificRoomSelector category={selectedCategory} />
          </>
        )}
      </>
    );
  };

  if (Platform.OS === 'web' && route.params.context === 'scan') {
    alert(
      'Barcode scanning on the web version is not supported yet. Please use the manual search to add passes on the web'
    );
    navigation.goBack();
    return <Text>Web is not supported yet</Text>;
  }

  return (
    <>
      <DefaultLayout>
        <Icon
          style={{ marginTop: 20, marginBottom: 30 }}
          name="md-close-circle"
          type="Ionicons"
          size={35}
          color="black"
          onPress={() => {
            navigation.goBack();
          }}
        />

        {step === 'selectStudent' && <StudentSelector context={route.params.context} />}
        {step === 'selectRoom' && <RoomSelector />}
        {step === 'selectTime' && <TimeSelector />}
      </DefaultLayout>
    </>
  );
};

export default CreatePassScreen;
