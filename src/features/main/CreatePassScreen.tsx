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
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Platform, View, StyleSheet, Image, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { Camera } from 'expo-camera';
import { Student } from './StudentInfoScreen';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/rootReducer';

export interface Room {
  category: string;
  displayName: string;
  maxPersonCount: number;
}

export const prepareNameSearch = (inputString: string) => {
  const removedSpacesString = inputString.replace(/\s/g, '');
  const lowercasedString = removedSpacesString.toLowerCase();
  return lowercasedString;
};

export const StudentResultItem = ({
  student,
  handleStudentSelect,
}: {
  student: firebase.firestore.DocumentData;
  handleStudentSelect: any;
}) => {
  return (
    <TouchableOpacity onPress={() => handleStudentSelect(student)}>
      <View style={{ flexDirection: 'row' }}>
        <Avatar
          source={{
            uri:
              student.profilePictureUri ||
              'https://image.shutterstock.com/image-vector/male-default-placeholder-avatar-profile-260nw-387516193.jpg',
          }}
        />
        <Text>{student.displayName}</Text>
        <Text>
          {student.grade} | {student.schoolIssuedId}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const StudentSearch = ({ handleStudentSelect }: { handleStudentSelect: Function }) => {
  const schoolPath = useSelector((state: RootState) => state.setup.school.documentPath);

  const [searchText, setSearchText] = React.useState('');

  const fallbackText = prepareNameSearch(searchText) || 'placeholder';
  const [
    matchingUsersCollection,
    isMatchingUsersCollectionLoading,
    matchingUsersCollectionError,
  ] = useCollection(
    db
      .doc(schoolPath)
      .collection('students')
      .orderBy('searchName')
      .startAt(fallbackText)
      .endAt(fallbackText + '\uf8ff')
      .limit(5)
  );

  // TODO: Display any error

  return (
    <>
      <Input
        returnKeyType="done"
        placeholder="Search for a student"
        value={searchText}
        onChangeText={(nextValue: string) => setSearchText(nextValue)}
      />

      {isMatchingUsersCollectionLoading && <Spinner />}

      {matchingUsersCollection?.docs.length === 0 && searchText !== '' ? (
        <Text category="h4">
          No results found. Please check the spelling of the student's name.
        </Text>
      ) : (
        undefined
      )}

      {matchingUsersCollection &&
        matchingUsersCollection.docs.map(student => {
          return (
            <StudentResultItem
              student={{ ref: student.ref, ...student.data() }}
              key={student.data().schoolIssuedId}
              handleStudentSelect={handleStudentSelect}
            />
          );
        })}
    </>
  );
};

export const Scanner = ({ handleStudentScan }: { handleStudentScan: Function }) => {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    // Potential source of error, no-op memory leak
    BarCodeScanner.requestPermissionsAsync().then(({ status }) =>
      setHasPermission(status === 'granted')
    );
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera access to initiate scanning...</Text>;
  }
  if (hasPermission === false) {
    return (
      <Text>
        No access to camera. Please open your settings and allow this app to access your camera.
      </Text>
    );
  }

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    handleStudentScan(data);
  };

  return (
    <View
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}>
      <Text category="h6" style={{ marginBottom: 10 }}>
        Position the ID's barcode in frame
      </Text>
      <View style={{ flex: 3, borderRadius: 20 }}>
        <Camera
          style={[
            StyleSheet.absoluteFillObject,
            {
              flex: 1,
              width: '100%',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.code39],
          }}
          onBarCodeScanned={handleBarCodeScanned}>
          <LottieView
            loop
            autoPlay
            style={{
              width: '100%',
            }}
            source={require('../../assets/barcodeScanning.json')}
          />
        </Camera>
      </View>
      <View style={{ flex: 1 }}></View>

      {scanned && <Button onPress={() => setScanned(false)}>Scan Again?</Button>}
    </View>
  );
};

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

  const handleCreatePass = () => {
    alert(selectedStudent.ref);

    if (!user) {
      return alert('Please wait, initializing user.');
    }

    // TODO: Track from location
    // TODO: ADD TIME
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
      endTime: new Date(), // use SelectedTime
    };

    setCreationStatus('Assigning student the pass...');
    selectedStudent.ref
      .collection('passes')
      .add(passData)
      .then(() => {
        setCreationStatus('Updating school records...');

        selectedStudent.school
          .collection('passes')
          .add(passData)
          .then(() => setCreationStatus('Successfully created pass...'))
          .catch(e => alert(e.message));
      });
  };

  const TimeSelector = () => {
    return (
      <View>
        <Text>{selectedTime} minutes</Text>
        <ButtonGroup>
          <Button onPress={() => setSelectedTime(selectedTime + 1)}>+</Button>
          <Button onPress={() => setSelectedTime(selectedTime - 1)}>-</Button>
        </ButtonGroup>

        {creationStatus && <Text>{creationStatus}</Text>}
        <Button onPress={handleCreatePass}>Create Pass</Button>
      </View>
    );
  };

  const StudentSelector = ({ context }: { context: string }) => {
    return (
      <>
        {context === 'scan' && (
          <Scanner
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
          {matchingRoomsCollection.docs.map(room => (
            <TouchableOpacity
              onPress={() => {
                setSelectedRoom({ ref: room.ref, ...room.data() });

                setStep('selectTime');
              }}>
              <View
                style={{
                  backgroundColor: category.color,
                  borderRadius: 15,
                  height: 75,
                  width: '50%',
                  padding: 15,
                  alignContent: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontFamily: 'Inter_800ExtraBold',
                    fontSize: 20,
                    textAlign: 'center',
                  }}>
                  {room.data().displayName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      );
    };
    const categories = [
      {
        name: 'Bathrooms',
        categorySpecifier: 'bathroom',
        color: '#00BFFF',
        iconGroup: 'MaterialCommunityIcons',
        iconName: 'watermark',
      },
      {
        name: 'Water Fountains',
        categorySpecifier: 'waterfountain',
        color: '#00D364',
        iconGroup: 'Ionicons',
        iconName: 'md-water',
      },
      {
        name: 'Classrooms',
        categorySpecifier: 'classroom',
        color: '#F39',
        iconGroup: 'Ionicons',
        iconName: 'md-water',
      },
    ];

    return (
      <>
        {!selectedCategory && (
          <>
            <Text>Select a category</Text>
            {categories.map(category => (
              <TouchableOpacity onPress={() => setSelectedCategory(category)}>
                <View
                  style={{
                    backgroundColor: category.color,
                    borderRadius: 15,
                    height: 125,
                    width: '50%',
                    padding: 15,
                    alignContent: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: 10,
                  }}>
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
                    }}>
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {selectedCategory && (
          <>
            <Text>Select a room</Text>
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
          name="md-close-circle"
          type="Ionicons"
          size={35}
          color="black"
          onPress={() => {
            navigation.goBack();
          }}
        />

        <Text category="h1" style={{ marginBottom: 5 }}>
          Create Pass
        </Text>

        {step === 'selectStudent' && <StudentSelector context={route.params.context} />}
        {step === 'selectRoom' && <RoomSelector />}
        {step === 'selectTime' && <TimeSelector />}
      </DefaultLayout>
    </>
  );
};

export default CreatePassScreen;
