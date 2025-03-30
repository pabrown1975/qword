import { Text as ReactNativeText } from "react-native";
import { theme } from "../utils/style";

const Text = ({ size = 16, style = {}, noWrap, children, ...props }) => {
  return (
    <ReactNativeText
      selectable={false}
      numberOfLines={noWrap ? 1 : undefined}
      style={{ color: theme.fg1, fontFamily: "RobotoSlab-Regular", fontSize: size, ...style }}
      {...props}
    >
      {children}
    </ReactNativeText>
  );
};

export const H1 = ({ children, ...props }) => (
  <Text {...props} size={36}>
    {children}
  </Text>
);

export const H2 = ({ children, ...props }) => (
  <Text {...props} size={30}>
    {children}
  </Text>
);

export const H3 = ({ children, ...props }) => (
  <Text {...props} size={22}>
    {children}
  </Text>
);

export default Text;
