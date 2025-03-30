import { View } from "react-native";
import { styles } from '../utils/style';
import Modal from "./Modal";
import Text, { H2, H3 } from "./Text";

const HelpModal = ({ visible, setVisible }) => {
  return (
    <Modal visible={visible} setVisible={setVisible}>
      <H2>Welcome to qword!</H2>
      <View style={styles.infoBox}>
        <Text>This is a game about finding the best word, given a random rack of letters.</Text>
        <Text>
          Tap the letters in your rack to build a word, then tap again to remove. You'll see some helpful information at
          the bottom as you try different words. When you have a valid word, you can play it by clicking one of the
          available slots. The goal is to fill all the slots with the highest scoring words you can find!
        </Text>
        <Text>
          Finding the best word isn't easy! The letters you get are random, so the best word usually doesn't use all of
          them. When you do play the best word for a given round, it will be marked with stars ⭐️.
        </Text>
      </View>
      <View style={styles.infoBox}>
        <H3>Scoring</H3>
        <Text>
          The score for a word is calculated by adding up the points for each letter, then multiplying by an extra 20%
          per letter, meaning that longer words score a lot more points.
        </Text>
      </View>
    </Modal>
  );
};

export default HelpModal;
