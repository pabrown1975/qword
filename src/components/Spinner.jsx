import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Text, { H2 } from "./Text";
import { useEffect } from "react";
import { styles, theme } from '../utils/style';

const Spinner = ({}) => {
  const a = useSharedValue(0);

  useEffect(() => {
    a.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.out(Easing.cubic) }), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${a.value}deg` }],
  }));

  return (
    <View
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            ...styles.tile,
            width: 50,
            height: 50,
          },
        ]}
      >
        <Text size={32} style={{ bottom: 6 }}>
          q
          <Text size={16} style={{ textAlignVertical: "bottom" }}>
            w
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
};

export default Spinner;
