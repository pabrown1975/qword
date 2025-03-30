import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { forceHeight, forceWidth, useScreenArea } from '../utils/style';
import { styles, theme } from "../utils/style";
import Text from "./Text";
import Win from "./Win";
import Modal from "./Modal";

const AchievementsModal = ({ visible, setVisible, achievementList, completedAchievements }) => {
  const { viewWidth } = useScreenArea();
  const [selected, setSelected] = useState(null);
  const selectedAchievement = selected && achievementList.find((a) => a.name === selected);
  const selectedInfo = selectedAchievement ? (
    completedAchievements.indexOf(selectedAchievement.name) >= 0 ? (
      <Win {...selectedAchievement} />
    ) : (
      <>
        <Text>???</Text>
        {!!selectedAchievement.rarity && <Text style={{ color: theme.accent2}}>({selectedAchievement.rarity})</Text>}
      </>
    )
  ) : null;
  const tileSize = viewWidth / 5 - 5;

  return (
    <Modal visible={visible} setVisible={setVisible}>
      <View
        style={{
          ...forceWidth(viewWidth),
          ...styles.tile,
          padding: 10,
        }}
      >
        {selectedInfo ?? <Text>Select a tile for info</Text>}
      </View>
      <View
        style={{
          ...forceWidth(viewWidth),
          ...forceHeight(viewWidth),
          ...styles.tile,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 3,
          paddingVertical: 5,
        }}
      >
        {achievementList.map((a) => (
          <TouchableOpacity
            onPress={() => setSelected(a.name)}
            key={a.name}
            style={{
              ...styles.tile,
              width: tileSize,
              height: tileSize,
              borderColor: selected === a.name ? theme.accent2 : theme.fg2,
            }}
          >
            <Text size={tileSize * 0.7} style={{ color: theme.bg2 }}>
              {completedAchievements.indexOf(a.name) >= 0 ? a.icon : "?"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

export default AchievementsModal;
