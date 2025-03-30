import { Modal as RNModal, View } from "react-native";
import Button from "./Button";

const Modal = ({ visible, setVisible, children }) => {
  return (
    <RNModal animationType="slide" visible={visible} transparent onRequestClose={() => setVisible(false)}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
      >
        {children}
        {!!setVisible && <Button size={24} text="Close" onPress={() => setVisible(false)} />}
      </View>
    </RNModal>
  );
};

export default Modal;
