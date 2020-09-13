import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/rootReducer';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { Pass } from '../types/school';
import { db } from './FirebaseAuthenticator';
import LargeActivePass from './LargeActivePass';

const StudentLargePassList: React.FC = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const schoolPath = useSelector((state: RootState) => state.setup.school.documentPath);

  const studentPath = useSelector(
    (state: RootState) => state.setup.studentInformation.documentPath
  );

  const [studentLargePasses, isLoadingStudentLargePasses, studentLargePassesError] = useCollection(
    db
      .doc(schoolPath)
      .collection('passes')
      .where('passRecipientUser', '==', db.doc(studentPath || 'unknown'))
      .where('endTime', '>=', currentTime)
  );

  if (!studentPath) return null;

  return (
    <>
      {studentLargePasses &&
        studentLargePasses.docs.map(pass => (
          <LargeActivePass key={pass.id} passRef={pass.ref} passInfo={pass.data() as Pass} />
        ))}
    </>
  );
};

export default StudentLargePassList;