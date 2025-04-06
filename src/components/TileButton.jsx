import { TouchableOpacity } from "react-native";
import { styles } from "../utils/style";

const TileButton = ({ children, style, ...props }) => {
  return (
    <TouchableOpacity
      style={{
        ...styles.tile,
        ...style,
      }}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default TileButton;
