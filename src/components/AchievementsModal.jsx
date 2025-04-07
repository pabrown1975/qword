import { useState } from "react";
import { View } from "react-native";
import { forceHeight, forceWidth, useScreenArea } from "../utils/style";
import { styles, theme } from "../utils/style";
import Text from "./Text";
import Win from "./Win";
import Modal from "./Modal";
import TileButton from "./TileButton";

const AchievementsModal = ({ visible, setVisible, achievementList, completedAchievements }) => {
  const { viewWidth } = useScreenArea();
  const [selected, setSelected] = useState(null);
  const selectedAchievement = selected && achievementList.find((a) => a.name === selected);
  const selectedInfo = selectedAchievement ? (
    completedAchievements.indexOf(selectedAchievement.name) >= 0 ? (
      <Win achievement={selectedAchievement} />
    ) : (
      <>
        <Text>
          ???
          {!!selectedAchievement.rarity && <Text style={{ color: theme.accent2 }}> ({selectedAchievement.rarity})</Text>}
        </Text>
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
        {achievementList.map((a) => {
          const highlightStyle =
            a.name === selected
              ? {
                  borderColor: theme.accent2,
                  transform: [{ scale: 1.5 }],
                  zIndex: 1500,
                }
              : {};

          return (
            <TileButton
              onPress={() => setSelected(a.name)}
              key={a.name}
              style={{
                width: tileSize,
                height: tileSize,
                backgroundColor: a.bg,
                ...highlightStyle,
              }}
            >
              {completedAchievements.indexOf(a.name) >= 0 ? a.icon : "?"}
            </TileButton>
          );
        })}
      </View>
    </Modal>
  );
};

export default AchievementsModal;
