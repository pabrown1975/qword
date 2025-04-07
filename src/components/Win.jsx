import { View } from "react-native";
import Text, { H3 } from "./Text";
import { styles, theme } from "../utils/style";

const Win = ({ achievement, style = {} }) => {
  const background = achievement.bg ? { backgroundColor: achievement.bg } : {};

  return (
    <View style={{ marginVertical: 6, ...style }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ ...styles.tile, ...background, width: 52, height: 52 }}>{achievement.icon}</View>
        <View style={{ marginLeft: 6, maxWidth: "85%" }}>
          <Text>
            <H3>
              {achievement.name}
              {achievement.count > 1 && ` x${achievement.count}`}
            </H3>
            {!!achievement.bonus && <Text style={{ color: theme.accent1 }}> (+{achievement.bonus} pts)</Text>}
            {!!achievement.rarity && <Text style={{ color: theme.accent2 }}> ({achievement.rarity})</Text>}
          </Text>
          <Text style={{ color: theme.fg2 }}>{achievement.desc}</Text>
        </View>
      </View>
    </View>
  );
};

export default Win;
