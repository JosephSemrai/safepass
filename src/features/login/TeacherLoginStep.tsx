import React from 'react';
import { Layout, Text, Button, Spinner, Input } from '@ui-kitten/components';
import { View, Image } from 'react-native';
import DefaultLayout from '../../components/layouts/DefaultLayout';
import { db, auth } from '../../app/AppAuthentication';
import { TeacherLoginScreenNavigationProp } from './LoginNavigation';
import PrimaryInput from '../../components/PrimaryInput';
import FancyInput from '../../components/FancyInput';
import WavyHeader from '../../components/WavyHeader';
import PrimaryButton from '../../components/PrimaryButton';

interface TeacherLoginStepProps {
  navigation: TeacherLoginScreenNavigationProp;
}

function validateEmail(email: string) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const TeacherLoginStep = ({ navigation }: TeacherLoginStepProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNext = () => {
    // Validation
    if (!password) {
      alert('Please enter your password');
    }
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
    }

    setIsLoading(true);

    auth
      .signInWithEmailAndPassword(email, password)
      .then(res => {
        console.log('Signed in!');
      })
      .catch(err => {
        const errorCode = err.code;
        const errorMesage = err.message;

        alert(
          err.message +
            ' (Error Code: ' +
            errorCode +
            ') \n Please check your credentials and try again.'
        );
        setIsLoading(false);
        return;
      });

    setIsLoading(false);

    // dispatch(setupDistrict(district));
  };

  const LoadingIndicator = () => (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Spinner size="small" />
    </View>
  );

  return (
    <>
      <WavyHeader
        customStyles={{ position: 'absolute', width: '100%' }}
        customHeight={450}
        customTop={230}
        customBgColor="#2253ff"
        customWavePattern="M0,96L48,112C96,128,192,160,288,
        186.7C384,213,480,235,576,213.3C672,192,768,128,864,
        128C960,128,1056,192,1152,208C1248,224,1344,192,1392,
        176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,
        0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,
        0,96,0,48,0L0,0Z"
      />

      <DefaultLayout backgroundColor="transparent">
        <Image
          style={{ width: 200, height: 50, marginTop: 50 }}
          source={require('../../assets/white-wordmark.png')}
        />

        <Text category="h1" style={{ marginTop: 30, color: 'white' }}>
          Welcome
        </Text>
        <Text category="s1" style={{ color: 'white' }}>
          Please enter your district provided credentials.
        </Text>

        <FancyInput
          style={{ marginTop: 20, marginBottom: 10 }}
          placeholder="Username or Email Address"
          value={email}
          onChangeText={text => setEmail(text)}
        />

        <FancyInput
          style={{ marginTop: 10, marginBottom: 20 }}
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={text => setPassword(text)}
        />

        <Text
          category="s1"
          style={{ color: 'white', textDecorationLine: 'underline' }}
          onPress={() => navigation.navigate('RegisterScreen')}>
          Need to register your school?
        </Text>

        <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
          <Text style={{ textAlign: 'center' }}>
            By pressing "Sign In", you agree to our Terms and that you have read our Data Use Policy
          </Text>

          <PrimaryButton onPress={handleNext} text="Sign In" icon="login" iconType="AntDesign" />
        </View>
      </DefaultLayout>
    </>
  );
};

export default TeacherLoginStep;
