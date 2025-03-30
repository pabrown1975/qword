import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./utils/style";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import Main from "./components/Main";
import Splash from "./components/Splash";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const App = ({}) => {
  const [showSplash, setShowSplash] = useState(true);

  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 2900);
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider style={{ backgroundColor: theme.bg0 }}>{showSplash ? <Splash /> : <Main />}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
