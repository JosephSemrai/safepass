import React from 'react';
import { Text, Button, Spinner, Card, Input, Avatar, ButtonGroup } from '@ui-kitten/components';
import { useAuthState } from 'react-firebase-hooks/auth';
import Icon from 'react-native-dynamic-vector-icons';

import { Platform, View } from 'react-native';

import StudentSearch from '../../../../components/StudentSearch';
import IDScanner from '../../../../components/IDScanner';
import CategorySelector from './CategorySelector';
import TimeSelector from './TimeSelector';
import SpecificRoomSelector from './SpecificRoomSelector';
import { CreatePassScreenNavigationProp, CreatePassScreenRouteProp } from '../../HomeNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/rootReducer';
import { RoomCategory, ReduxCourseEnrollment } from '../../../../types/school';
import ApproverSelector from './ApproverSelector';
import { createPass, createPassRequest } from '../../../../services/passServices';
import RoundedButton from '../../../../components/RoundedButton';
import CreateGuestPass from './CreateGuestPass';
import DefaultLayout from '../../../../components/layouts/DefaultLayout';
import { db, auth } from '../../../../app/AppAuthentication';

const CreatePassScreen = ({
  navigation,
  route,
}: {
  navigation: CreatePassScreenNavigationProp;
  route: CreatePassScreenRouteProp;
}) => {
  //TODO: USE DOCUMENT SNAPSHOTS FOR ALL OF THE RELEVANT PIECES OF STATE RATHER THAN DOCUMENT DATA
  const [selectedStudent, setSelectedStudent] = React.useState<firebase.firestore.DocumentData>();
  const [selectedRoom, setSelectedRoom] = React.useState<firebase.firestore.DocumentSnapshot>();
  const [selectedTime, setSelectedTime] = React.useState(5);
  const [selectedCategory, setSelectedCategory] = React.useState<RoomCategory>(); // Categories not pulled from Firestore at pass creation (populated Redux Store at app launch)
  const [selectedApproverInfo, setSelectedApproverInfo] = React.useState<ReduxCourseEnrollment>();
  const [step, setStep] = React.useState('selectStudent');
  // const [creationStatus, setCreationStatus] = React.useState<string>();
  const [user, userLoading, userError] = useAuthState(auth);

  const { role, studentInformation, displayName } = useSelector((state: RootState) => state.setup);

  const StudentSelector = ({ context }: { context: string }) => {
    // STUDENT CONTEXT: Automatically select the current student if it's a student assigning the role
    React.useEffect(() => {
      // if (role === 'student') {
      //   db.doc(studentInformation.documentPath)
      //     .get()
      //     .then(snap => {
      //       setSelectedStudent({ ref: snap.ref, uid: snap.id, ...snap.data() });
      //       setStep('selectCategory');
      //     });
      // }
      alert('To be implemented for student');
    }, []);

    if (role === 'student') {
      return (
        <Text category="h1">
          Retrieving your information... Context: Student requesting pass...
        </Text>
      );
    }

    return (
      <>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text category="h1" style={{ flex: 3 }}>
            Student Search
          </Text>

          <RoundedButton
            title="Guest Pass"
            onPress={() => setStep('createGuestPass')}
            size="sm"
            backgroundColor="#007bff"
            style={{ width: 150 }}
          />
        </View>

        <Text category="s1" style={{ marginBottom: 10 }}>
          Search for any student in your school.
        </Text>
        {context === 'scan' && (
          // TODO: FIX HANDLING OF SCANNER
          <IDScanner
            handleStudentScan={(data: any) =>
              navigation.navigate('StudentInfo', {
                schoolIssuedStudentId: data,
                context: 'schoolIssuedStudentId',
              })
            }
          />
        )}
        {context === 'search' && (
          <StudentSearch
            handleStudentSelect={(student: firebase.firestore.DocumentData) => {
              setSelectedStudent(student);

              setStep('selectCategory');
            }}
          />
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

  const handleCreatePass = () => {
    if (!user) {
      return alert('Please retry, failed to initialize user.');
    }

    console.log('Selected category color: ', selectedCategory.color);

    console.log(displayName);

    // setCreationStatus('Assigning student the pass...');

    navigation.navigate('Home');

    if (selectedApproverInfo && role === 'student') {
      createPassRequest(
        selectedStudent,
        selectedRoom,
        selectedCategory,
        selectedTime,
        selectedApproverInfo
      );
    } else {
      createPass(
        selectedStudent,
        selectedRoom,
        selectedCategory,
        selectedTime,
        displayName,
        user.uid
      );
    }
  };

  return (
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
      {step === 'selectCategory' && (
        <CategorySelector setSelectedCategory={setSelectedCategory} setStep={setStep} />
      )}
      {step === 'selectRoom' && (
        <SpecificRoomSelector
          category={selectedCategory}
          setSelectedRoom={setSelectedRoom}
          setStep={setStep}
        />
      )}

      {step === 'selectApprover' && (
        <ApproverSelector setSelectedApproverInfo={setSelectedApproverInfo} setStep={setStep} />
      )}

      {step === 'selectTime' && (
        <TimeSelector
          handleCreatePass={handleCreatePass}
          selectedRoom={selectedRoom}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      )}

      {step === 'createGuestPass' && <CreateGuestPass />}
    </DefaultLayout>
  );
};

export default CreatePassScreen;
