import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { letterPoints } from "../utils/constants";
import { styles, theme } from "../utils/style";
import Text from "./Text";

const Tile = ({ letter, onPress, onDrag, size, noscore }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [moving, setMoving] = useState(false);

  const pan = Gesture.Pan()
    .onStart(() => setMoving(true))
    .onUpdate((event) => {
      setX(event.translationX);
      setY(event.translationY);
    })
    .onEnd(() => {
      setMoving(false);
      onDrag?.({ x, y });
    })
    .runOnJS(true);

  const tap = Gesture.Tap()
    .onStart(() => onPress?.())
    .runOnJS(true);

  const combined = onDrag ? Gesture.Race(tap, pan) : tap;

  return (
    <GestureDetector gesture={combined}>
      <View
        style={{
          ...styles.tile,
          width: size,
          height: size,
          backgroundColor: theme.bg2,
          borderRadius: size * 0.2,
          transform: moving ? [{ translateX: x }, { translateY: y }] : [],
          zIndex: moving ? 999 : 1,
          boxShadow: moving ? "2 2 5 2 rgba(0, 0, 0, 0.7)" : null,
        }}
      >
        <Text size={size * 0.7} style={{ bottom: Math.pow(size, 0.1) }}>
          {letter.toUpperCase()}
          {!noscore && <Text size={size * 0.3}>{letterPoints[letter]}</Text>}
        </Text>
      </View>
    </GestureDetector>
  );
};

export default Tile;
