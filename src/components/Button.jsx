import { TouchableOpacity } from "react-native";
import { theme } from "../utils/style";
import Text from "./Text";

const Button = ({ size = 36, text, style, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.bg2,
        paddingHorizontal: size * 0.3,
        height: size,
        borderRadius: size / 2,
        justifyContent: "center",
        ...style,
      }}
    >
      <Text size={size * 0.5} style={{ textAlign: "center" }}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
