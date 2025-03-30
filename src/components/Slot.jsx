import { Pressable } from "react-native";
import { slotHeight, theme } from "../utils/style";
import { forceHeight, forceWidth } from "../utils/style";
import { useState } from "react";
import Text from "./Text";

const Slot = ({ title, word, score, stars, playable, onPress }) => {
  const [pressed, setPressed] = useState(false);

  const backgroundColor =
    word
      ? theme.bg2
      : playable
        ? pressed ? theme.bg1 : theme.accent1
        : theme.bg3;

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={playable && ! word ? onPress : () => null}
      style={{
        width: "100%",
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor,
        paddingHorizontal: 10,
        borderRadius: 6,
        ...forceHeight(slotHeight),
      }}
    >
      <Text style={{ ...forceWidth(90) }}>
        {title}
        {!!word && ":"}
      </Text>
      <Text>
        {stars && "⭐️ "}
        {word ?? " "}
        {stars && " ⭐️"}
      </Text>
      <Text style={{ ...forceWidth(30), textAlign: "right" }}>{score ?? " "}</Text>
      {!word && playable && title !== "pass" && <Text>Touch to play</Text>}
    </Pressable>
  );
};

export default Slot;
