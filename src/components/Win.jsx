import { View } from "react-native";
import Text, { H3 } from "./Text";
import { theme } from '../utils/style';

const Win = ({ icon, name, desc, rarity, bonus, style = {}, count = 1 }) => (
  <View style={{ marginVertical: 6, ...style }}>
    <H3>
      {icon.repeat(count)} {name}
      {count > 1 && ` x${count}`}
    </H3>
    <Text>
      <Text style={{ color: theme.fg2}}>{desc}</Text>
      {!!bonus && <Text style={{ color: theme.accent1}}> (+{bonus} pts)</Text>}
      {!!rarity && <Text style={{ color: theme.accent2}}> ({rarity})</Text>}
    </Text>
  </View>
);

export default Win;
