import React from 'react';
import {
  Text,
  Button,
  Spinner,
  Card,
  Input,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components';
import DefaultLayout from '../../components/layouts/DefaultLayout';
import { auth, db } from '../../components/FirebaseAuthenticator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/rootReducer';
import { signedOut } from '../login/setupSlice';
import { useAppDispatch } from '../../app/store';
import { Room } from '../../types/school';
import FancyInput from '../../components/FancyInput';
import FancyButton from '../../components/FancyButton';
import RoundedButton from '../../components/RoundedButton';

const RoomPreview = ({ roomData }: { roomData: Room }) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        borderColor: '#dadce0',
        borderWidth: 1,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxHeight: 50,
          minHeight: 50,
        }}>
        <View style={{ flex: 2 }}>
          <Text category="h5">{roomData.displayName}</Text>
          <Text category="s1">{roomData.category}</Text>
        </View>
        <RoundedButton
          title="View Details"
          onPress={() => alert('button pressed')}
          size="sm"
          style={{ borderRadius: 10, flex: 1 }}
          backgroundColor="#007bff"
        />
      </View>
    </View>
  );
};

const RoomScreen = () => {
  const schoolPath = useSelector((state: RootState) => state.setup.school.documentPath);
  const [schoolRooms, schoolRoomsLoading, schoolRoomsError] = useCollectionData<Room>(
    db.doc(schoolPath).collection('rooms')
  );

  if (schoolRoomsLoading) {
    return (
      <View>
        <Spinner />
        <Text>Loading room data...</Text>
      </View>
    );
  }

  return (
    <DefaultLayout scrollable>
      <Text category="h1" style={{ marginTop: 30, marginBottom: 20 }}>
        Rooms
      </Text>
      <FancyInput placeholder="Search for a room" />

      <View style={{ marginTop: 15 }}>
        {schoolRooms.map(room => (
          <RoomPreview key={room.displayName} roomData={room} />
        ))}
      </View>
    </DefaultLayout>
  );
};

export default RoomScreen;
