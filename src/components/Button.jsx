import { TouchableOpacity } from "react-native";
import { theme } from "../utils/style";
import Text from "./Text";

const Button = ({ size = 20, text, style, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.bg2,
        paddingHorizontal: size * 0.55,
        paddingVertical: size * 0.2,
        height: size * 1.8,
        borderRadius: size,
        ...style,
      }}
    >
      <Text size={size} style={{ textAlign: "center" }}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
