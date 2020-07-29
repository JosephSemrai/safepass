import React from 'react';
import { Text, Button, Spinner } from '@ui-kitten/components';
import DefaultLayout from '../../components/layouts/DefaultLayout';
import { auth, db } from '../../components/FirebaseAuthenticator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export interface UserProfile {}

const ProfileScreen = () => {
  const [user, isAuthLoading, authError] = useAuthState(auth);
  const [schoolData, setSchoolData] = React.useState<firebase.firestore.DocumentData>();
  const [userData, setUserData] = React.useState<firebase.firestore.DocumentData>();
  // const [userDoc, isUserDocLoading, userDocError] = useDocumentData(
  //   db.collection('users').doc(user.uid)
  // );
  React.useEffect(() => {
    console.log('Fetching Firebase Data: User Profile Information');
    const unsubscribe = db
      .collection('users')
      .doc(user.uid)
      .onSnapshot(doc => {
        const profileData = doc.data();
        setUserData(profileData);
        profileData.school
          .get()
          .then((doc: firebase.firestore.DocumentSnapshot) => setSchoolData(doc.data()));
      });

    return unsubscribe;
  }, []);

  if (isAuthLoading || !userData || !schoolData)
    return (
      <DefaultLayout>
        <Spinner />
      </DefaultLayout>
    );

  return (
    <DefaultLayout>
      <Text category="h1" style={{ marginBottom: 20 }}>
        Profile
      </Text>

      <Text category="h2">{user.displayName}</Text>
      <Text category="h3">{userData.role}</Text>
      <Text category="p1">{schoolData.name}</Text>
      <Button onPress={() => auth.signOut()}>Sign out</Button>
    </DefaultLayout>
  );
};

export default ProfileScreen;