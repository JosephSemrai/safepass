import React, { Component } from 'react';
import { StyleSheet, Animated } from 'react-native';
import GradientHelper from './gradient-helper';

const styles = StyleSheet.create({
  component: {
    flex: 1,
  },
});

const AnimatedGradientHelper = Animated.createAnimatedComponent(GradientHelper);

interface IAnimatedGradientProps {
  colors: string[];
  style: object;
}

interface IAnimatedGradientState {
  prevColors: string[];
  colors: string[];
  tweener: Animated.Value;
}

export class AnimatedGradient extends Component<IAnimatedGradientProps, IAnimatedGradientState> {
  constructor(props: IAnimatedGradientProps) {
    super(props);

    const { colors } = props;
    this.state = {
      prevColors: colors,
      colors,
      tweener: new Animated.Value(0),
    };
  }

  static getDerivedStateFromProps(props: IAnimatedGradientProps, state: IAnimatedGradientState) {
    const { colors: prevColors } = state;
    const { colors } = props;
    const tweener = new Animated.Value(0);
    return {
      prevColors,
      colors,
      tweener,
    };
  }

  componentDidUpdate() {
    const { tweener } = this.state;
    Animated.timing(tweener, {
      useNativeDriver: false,
      toValue: 1,
    }).start();
  }

  render() {
    const { tweener, prevColors, colors } = this.state;

    const { style } = this.props;

    const color1Interp = tweener.interpolate({
      inputRange: [0, 1],
      outputRange: [prevColors[0], colors[0]],
    });

    const color2Interp = tweener.interpolate({
      inputRange: [0, 1],
      outputRange: [prevColors[1], colors[1]],
    });

    return (
      <AnimatedGradientHelper
        style={style || styles.component}
        color1={color1Interp}
        color2={color2Interp}>
        {this.props.children}
      </AnimatedGradientHelper>
    );
  }
}
