import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { letterPoints } from "../utils/constants";
import { styles, theme } from "../utils/style";
import Text from "./Text";

const Tile = ({ letter, onPress, onDragStart, onDrag, onDragEnd, size, noscore, style, ...props }) => {
  const [dragPoint, setDragPoint] = useState({});
  const [dragInfo, setDragInfo] = useState(null);

  const centered = (event) => ({
    ...event,
    absoluteX: size / 2 + event.absoluteX - dragPoint.x,
    absoluteY: size / 2 + event.absoluteY - dragPoint.y,
  });

  const pan = Gesture.Pan()
    .onStart((event) => {
      setDragInfo({ ...event });
      setDragPoint({ x: event.x, y: event.y });
      onDragStart?.(centered(event));
    })
    .onUpdate((event) => {
      onDrag?.(centered(event));
      setDragInfo(event);
    })
    .onEnd((event) => {
      onDragEnd?.(centered(event));
      setDragInfo(null);
      setDragPoint({});
    })
    .runOnJS(true);

  const tap = Gesture.Tap()
    .onStart(() => onPress?.())
    .runOnJS(true);

  const combined = onDragStart || onDrag || onDragEnd ? Gesture.Race(tap, pan) : tap;
  const dragStyles = dragInfo
    ? {
        transform: [
          { translateX: dragInfo.translationX },
          { translateY: dragInfo.translationY },
          { scale: 1.2 },
        ],
        boxShadow: "2 2 5 2 rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
      }
    : {};

  return (
    <GestureDetector gesture={combined}>
      <View
        style={{
          ...styles.tile,
          width: size,
          height: size,
          backgroundColor: theme.bg2,
          borderRadius: size * 0.2,
          ...dragStyles,
          ...style,
        }}
        {...props}
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
