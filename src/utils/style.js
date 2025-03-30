import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const theme = {
  fg1: "#fed",
  fg2: "#987",
  bg0: "#030101",
  bg1: "#201810",
  bg2: "#432",
  bg3: "#765",
  accent1: "#396",
  accent2: "#6c8",
};

export const slotHeight = 32;
const screenPadding = 10;

export const border = (width, color) => ({
  borderWidth: width,
  borderColor: color,
  borderStyle: "solid",
});

export const forceHeight = (h) => ({
  height: h,
  minHeight: h,
  maxHeight: h,
});

export const forceWidth = (w) => ({
  width: w,
  minWidth: w,
  maxWidth: w,
});

export const useScreenArea = () => {
  let { width, height } = Dimensions.get("window");
  let { top, bottom, left, right } = useSafeAreaInsets();

  top += screenPadding;
  bottom += screenPadding;
  left += screenPadding;
  right += screenPadding;

  return {
    width,
    height,
    padding: {
      paddingTop: top,
      paddingBottom: bottom,
      paddingLeft: left,
      paddingRight: right,
    },
    viewWidth: width - (left + right),
    viewHeight: height - (top + bottom),
  };
};

export const styles = {
  tile: {
    backgroundColor: theme.bg1,
    justifyContent: "center",
    alignItems: "center",
    ...border(2, theme.fg2),
    borderRadius: 6,
  },
  infoBox: {
    backgroundColor: theme.bg0,
    ...border(2, theme.fg2),
    borderRadius: 6,
    padding: 6,
    gap: 12,
    width: "95%",
  },
};
