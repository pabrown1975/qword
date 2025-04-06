import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { letterPoints } from "../utils/constants";
import { styles, theme } from "../utils/style";
import Text from "./Text";

const Tile = ({ letter, onPress, onDragStart, onDrag, onDragEnd, size, noscore, style, ...props }) => {
  const [dragInfo, setDragInfo] = useState(null);

  const centered = (event) => ({
    ...event,
    absoluteX: size / 2 + event.absoluteX - event.x,
    absoluteY: size / 2 + event.absoluteY - event.y,
  });

  const pan = Gesture.Pan()
    .onStart((event) => {
      // this is an awful solution but nothing else seems to work
      // RNGH has no way to disable multiple pan gestures happening simultaneously
      if (window.activeDragGestureHandler != null) {
        return;
      }

      window.activeDragGestureHandler = event.handlerTag;
      onDragStart?.(centered(event));
      setDragInfo({ ...event });
    })
    .onUpdate((event) => {
      if (window.activeDragGestureHandler === event.handlerTag) {
        onDrag?.(centered(event));
        setDragInfo(event);
      }
    })
    .onEnd((event) => {
      if (window.activeDragGestureHandler === event.handlerTag) {
        onDragEnd?.(centered(event));
        setDragInfo(null);
      }

      window.activeDragGestureHandler = null;
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
    <GestureDetector gesture={combined} enabled={false}>
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
          {letter?.toUpperCase()}
          {!noscore && <Text size={size * 0.3}>{letterPoints[letter]}</Text>}
        </Text>
      </View>
    </GestureDetector>
  );
};

export default Tile;
