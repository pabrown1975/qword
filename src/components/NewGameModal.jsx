import { View } from "react-native";
import { forceWidth, styles } from '../utils/style';
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
          ...forceWidth(240),
          ...styles.tile,
          alignItems: "flex-start",
          gap: 6,
          padding: 16,
        }}
      >
        <Text>Today's daily qword:</Text>
        {availableLevels.map((lp) => (
          <Button
            onPress={() => handleNewGame("Daily", lp.name)}
            style={{ width: "100%" }}
            text={lp.name}
            key={`new daily ${lp.name}`}
          />
        ))}
        <Text style={{ marginTop: 10 }}>Random qword:</Text>
        {availableLevels.map((lp) => (
          <Button
            onPress={() => handleNewGame("Random", lp.name)}
            style={{ width: "100%" }}
            text={lp.name}
            key={`new random ${lp.name}`}
          />
        ))}
      </View>
    </Modal>
  );
};

export default NewGameModal;
