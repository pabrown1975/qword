import { ScrollView, View } from "react-native";
import { forceHeight, forceWidth, styles, theme, useScreenArea } from "../utils/style";
import Text, { H3 } from "./Text";
import Modal from "./Modal";

const YesterdayModal = ({ visible, setVisible, data }) => {
  const { viewWidth, viewHeight } = useScreenArea();

  return (
    <Modal visible={visible} setVisible={setVisible}>
      <H3>Yesterday's Best Words</H3>
      <ScrollView
        style={forceHeight(Math.min(642, viewHeight - 100))}
        contentContainerStyle={{ gap: 10, justifyContent: "center", alignItems: "center" }}
      >
        {data.map((lp, i) => (
          <View key={`level ${i}`} style={{ ...styles.tile, ...forceWidth(viewWidth), padding: 10, alignItems: "left" }}>
            <Text size={18} style={{ marginBottom: 6, color: theme.accent1 }}>
              {lp.seed}
            </Text>
            <View style={{ textAlign: "left" }}>
              {lp.racks.map((r, j) => (
                <Text key={`level ${i} word ${j}`}>
                  <Text style={{ color: theme.fg2 }}>Round {j + 1}: </Text>
                  <Text>{lp.bestWords[j] ?? "NONE!"}</Text>
                  {!!lp.bestWords[j] && <Text style={{ color: theme.fg2 }}>, {lp.bestScores[j]} pts</Text>}
                  {lp.bestWords[j]?.length === r.length && <Text style={{ color: theme.accent2 }}> (bingo!)</Text>}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Modal>
  );
};

export default YesterdayModal;
