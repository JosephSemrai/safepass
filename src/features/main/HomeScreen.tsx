import React from 'react';
import { Text, Spinner } from '@ui-kitten/components';
import DefaultLayout from '../../components/layouts/DefaultLayout';
import { auth, db } from '../../components/FirebaseAuthenticator';
import { RootState } from '../../app/rootReducer';
import { useSelector } from 'react-redux';
import firebase from 'firebase';
import { View, Image } from 'react-native';
import MovingLinearGradient, { presetColors } from '../../components/MovingLinearGradient';
import MovingGradientButton from '../../components/MovingGradientButton';
import PassList from '../../components/PassList';
import { HomeScreenNavigationProp } from '../../navigation/HomeScreenNavigation';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import LargeActivePass from '../../components/LargeActivePass';
import { Pass } from '../../types/school';
import StudentLargePassList from '../../components/StudentLargePassList';

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const userUid = useSelector((state: RootState) => state.setup.userUid);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const role = useSelector((state: RootState) => state.setup.role);

  const [userPasses, setUserPasses] = React.useState<firebase.firestore.DocumentData[]>();

  React.useEffect(() => {
    console.log('Fetching Firebase Data: User -> School -> User Passes');
    let unsubscribePasses: any = () =>
      console.log('HomeScreen component unmounted Before unsubscribePasses could be set');
    const unsubscribe = db
      .collection('users')
      .doc(userUid)
      .onSnapshot(doc => {
        const profileData = doc.data();
        profileData.school.get().then((doc: firebase.firestore.DocumentSnapshot) => {
          unsubscribePasses = doc.ref
            .collection('passes')
            // TODO: Change this reference to user document when possible
            .where('issuingUser', '==', db.collection('users').doc(userUid))
            .where('endTime', '>=', currentTime)
            .onSnapshot((querySnapshot: firebase.firestore.QuerySnapshot) => {
              setUserPasses(
                querySnapshot.docs.map(doc => {
                  return { uid: doc.id, ...doc.data() };
                })
              );
              console.log('Fetching more passes...');
            });
        });
      });

    return () => {
      unsubscribe();
      unsubscribePasses();
    };
  }, []);

  return (
    <DefaultLayout scrollable>
      {role === 'student' && <StudentLargePassList />}

      <Text category="h1" style={{ marginTop: 30, paddingBottom: 10 }}>
        Create Passes
      </Text>

      <View style={{ flexDirection: 'row', display: 'flex' }}>
        <MovingGradientButton
          buttonHeight={125}
          speed={1700}
          customColors={presetColors.greenish}
          style={{ margin: 5 }}
          buttonText="Create"
          onButtonPress={() => navigation.navigate('CreatePass', { context: 'search' })}
        />
        {role !== 'student' && (
          <MovingGradientButton
            buttonHeight={125}
            customColors={presetColors.blueish}
            speed={3000}
            style={{ margin: 5 }}
            buttonText="Scan"
            onButtonPress={() => navigation.navigate('CreatePass', { context: 'scan' })}
          />
        )}
      </View>

      {/* TODO: Hide active passes and show only scheduled passes if student */}
      <Text category="h1" style={{ marginTop: 30, paddingBottom: 10 }}>
        Active Passes
      </Text>
      {userPasses && (
        <>
          <PassList passesData={userPasses} />
        </>
      )}
    </DefaultLayout>
  );
};

export default HomeScreen;
