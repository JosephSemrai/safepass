import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from './store';

// Apollo
import { gql, useQuery } from '@apollo/client';

// Firebase config
import firebase from 'firebase/app';
import { signedIn, signedOut, updateToken } from '../features/login/authSlice';
import { RootState } from './rootReducer';
require('firebase/auth');
require('firebase/firestore');

// Firebase configuration provided to us by the app creation process
export const firebaseConfig = {
  apiKey: 'AIzaSyA20GOUrO9uk7w-HItfChUWQAsiRHfvkow',
  authDomain: 'passable-a4dba.firebaseapp.com',
  databaseURL: 'https://passable-a4dba.firebaseio.com',
  projectId: 'passable-a4dba',
  storageBucket: 'passable-a4dba.appspot.com',
  messagingSenderId: '397657248582',
  appId: '1:397657248582:web:c4cda4fca6f0a996480b47',
  measurementId: 'G-0VMMSRKJNR',
};

// Initializes Firebase and creates an app instance
try {
  !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
} catch (err) {
  // Catches 'already initialized' errors and logs it to enable hot reloading to continue to work
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error raised', err.stack);
  }
}

export const auth = firebase.auth();
export const db = firebase.firestore();

const AppAuthentication: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const uid = user.uid;
        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims'];

        if (hasuraClaim) {
          dispatch(signedIn({ status: 'in', token, uid }));
        } else {
          // Check if refresh is required.
          const claimsRef = firebase.database().ref('claims/' + user.uid + '/refreshTime');

          claimsRef.on('value', async data => {
            if (!data.exists) return;
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true);
            dispatch(signedIn({ status: 'in', token, uid }));
          });
        }
      } else {
        // Data is cleared 5 seconds after sign out
        setTimeout(() => {
          dispatch(signedOut());

          console.log('Dispatched sign out');
        }, 5000);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.auth().onIdTokenChanged(async user => {
      if (user) {
        // User is signed in or token was refreshed.

        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims'];

        if (hasuraClaim) {
          console.log('Hasura Claims Verified: Refreshing Token');
          dispatch(updateToken(token));
        } else {
          console.error('Hasura Claims Failed on Token Refresh');
        }
      }
    });

    return unsubscribe;
  }, []);

  return null;
};

export default AppAuthentication;
