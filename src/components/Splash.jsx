import { Image, View } from "react-native";
import { useScreenArea } from '../utils/style';

const Splash = ({}) => {
  const { width, height } = useScreenArea();

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image source={require("../../assets/images/splash.png")} style={{ width, height, resizeMode: "contain" }} />
    </View>
  );
};

export default Splash;
