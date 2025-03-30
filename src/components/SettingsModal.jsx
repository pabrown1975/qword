import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "./Modal";
import Button from "./Button";
import Text, { H2, H3 } from "./Text";
import { useState } from "react";
import { styles } from "../utils/style";

const YesNoDialog = ({ title, buttonText, confirmText, onYes }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <View style={{ marginVertical: 16, alignItems: "center", gap: 6 }}>
      <H3>{title}:</H3>
      {!showConfirmation && <Button text={buttonText} onPress={() => setShowConfirmation(true)} />}
      {showConfirmation && (
        <>
          <Text style={{ textAlign: "center" }}>{confirmText}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              text={"Yes"}
              onPress={() => {
                setShowConfirmation(false);
                onYes();
              }}
            />
            <Button text={"No"} onPress={() => setShowConfirmation(false)} />
          </View>
        </>
      )}
    </View>
  );
};

const SettingsModal = ({ visible, setVisible, onNewGame }) => {
  return (
    <Modal visible={visible} setVisible={setVisible}>
      <H2>Settings</H2>
      <View style={{ ...styles.tile, alignItems: "center", padding: 6, width: "90%" }}>
        <YesNoDialog
          title="Start over"
          buttonText="Quit"
          confirmText="Are you sure? You will lose your current game progress."
          onYes={() => {
            setVisible(false);
            onNewGame();
          }}
        />
        <YesNoDialog
          title="Clear all data"
          buttonText="Reset"
          confirmText="Are you sure? This will erase all of your achievements."
          onYes={() => AsyncStorage.clear()}
        />
      </View>
    </Modal>
  );
};

export default SettingsModal;
