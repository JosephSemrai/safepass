import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Pressable, View } from 'react-native';
import Icon from 'react-native-dynamic-vector-icons';
import { Text } from '@ui-kitten/components';

interface PrimaryButtonProps {
  onPress: any;
  text: string;
  color?: string;
  icon?: string;
  iconType?: string;
  style?: any;
}

const PrimaryButton = ({
  onPress,
  text,
  color = '#2253FF',
  icon,
  iconType,
  style,
}: PrimaryButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: color, padding: 20, borderRadius: 10, marginTop: 10, ...style }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {icon && iconType && (
          <Icon
            name={icon}
            type={iconType}
            size={20}
            color="white"
            // onPress={() => {
            //   navigation.goBack();
            // }}
          />
        )}
        <Text
          category="s1"
          style={{
            marginLeft: 10,
            color: 'white',
            fontSize: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

export default PrimaryButton;
