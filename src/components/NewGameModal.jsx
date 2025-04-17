import { View } from "react-native";
import { forceWidth, styles, theme } from "../utils/style";
import { levelParams } from "../utils/levels";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "./Button";
import Modal from "./Modal";
import Text from "./Text";

const NewGameModal = ({ visible, setVisible, playerLevel, onNewGame }) => {
  const handleNewGame = (mode, level) => AsyncStorage.setItem("selectedLevel", level).then(() => onNewGame(mode));
  const availableLevels = levelParams.slice(0, levelParams.findIndex((lp) => lp.name === playerLevel) + 1);

  return (
    <Modal visible={visible} setVisible={setVisible}>
      <View
        style={{
          ...forceWidth("85%"),
          ...styles.tile,
          alignItems: "center",
          gap: 6,
          padding: 16,
        }}
      >
        <Text size={20}>Daily qword:</Text>
        <Text style={{ textAlign: "center", color: theme.fg2 }}>
          Play again to improve your score on today's puzzle
        </Text>
        {availableLevels.map((lp) => (
          <Button
            onPress={() => handleNewGame("Daily", lp.name)}
            style={{ width: "85%" }}
            text={lp.name}
            key={`new daily ${lp.name}`}
          />
        ))}
        <Text size={20} style={{ marginTop: 10 }}>
          Random qword:
        </Text>
        <Text style={{ textAlign: "center", color: theme.fg2 }}>
          Get some practice on a completely random puzzle
        </Text>
        {availableLevels.map((lp) => (
          <Button
            onPress={() => handleNewGame("Random", lp.name)}
            style={{ width: "85%" }}
            text={lp.name}
            key={`new random ${lp.name}`}
          />
        ))}
      </View>
    </Modal>
  );
};

export default NewGameModal;
