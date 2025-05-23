import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { H2 } from "./Text";
import { forceHeight, theme } from "../utils/style";
import { gameAchievements, roundAchievements } from "../utils/achievements";
import Button from "./Button";
import Win from "./Win";
import Spinner from "./Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AchievementsModal from "./AchievementsModal";
import { levelParams } from "../utils/levels";
import NewGameModal from "./NewGameModal";

const GameOver = ({ height, score, words, racks, bests, level, onNewGame }) => {
  const [loading, setLoading] = useState(true);
  const [completedAchievements, setCompletedAchievements] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [playerLevel, setPlayerLevel] = useState("");
  const levelData = levelParams.find((lp) => lp.name === level) ?? levelParams[0];
  const roundInfo = racks.map((rack, i) => ({
    rack,
    word: words[i],
    best: bests[i],
  }));
  const roundWins = roundAchievements
    .map((ra) => ({
      ...ra,
      count: roundInfo.filter((ri) => ra.f({ ...ri, level })).length,
    }))
    .filter((ra) => ra.count);
  const gameWins = gameAchievements.filter((ga) => ga.f({ words, racks, bests, level, score, roundWins }));
  const wins = [...roundWins, ...gameWins];

  wins.sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    let all = [];

    AsyncStorage.getItem("achievements")
      .then((data) => {
        const saved = JSON.parse(data ?? "[]");

        all = [...new Set([...saved, ...wins.map((w) => w.name)])];

        return AsyncStorage.setItem("achievements", JSON.stringify(all));
      })
      .then(() => setCompletedAchievements(all))
      .then(() => AsyncStorage.getItem("playerLevel"))
      .then((data) => {
        const savedPlayerLevel = data ?? levelParams[0].name;

        if (score > levelData.scoreToBeat && level === savedPlayerLevel) {
          const nextLevel = levelParams[levelParams.findIndex((lp) => lp.name === savedPlayerLevel) + 1].name;

          setPlayerLevel(nextLevel);

          return AsyncStorage.setItem("playerLevel", nextLevel);
        }

        setPlayerLevel(savedPlayerLevel);
      })
      .then(() => AsyncStorage.setItem("hideHelp", "true"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spinner />;
  }

  const scoreAreaHeight = 60;
  const buttonAreaHeight = 60;
  const achievementAreaHeight = height - (scoreAreaHeight + buttonAreaHeight);

  return (
    <View style={{ width: "100%", ...forceHeight(height) }}>
      <View
        style={{
          width: "100%",
          ...forceHeight(scoreAreaHeight),
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <H2>Final score: {score} pts</H2>
      </View>
      {!!wins.length && (
        <ScrollView
          style={{
            ...forceHeight(achievementAreaHeight),
            padding: 6,
            backgroundColor: theme.bg2,
            borderRadius: 6,
          }}
          contentContainerStyle={{ paddingBottom: 6 }}
        >
          {wins.map((gw) => (
            <Win achievement={gw} key={gw.name} />
          ))}
        </ScrollView>
      )}
      <View
        style={{
          width: "100%",
          ...forceHeight(buttonAreaHeight),
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 3,
          }}
        >
          <Button onPress={() => setShowNewGameModal(true)} text="New game" />
          <Button onPress={() => setShowAchievementsModal(true)} text="Trophy case 🏆" />
        </View>
      </View>
      <NewGameModal
        visible={showNewGameModal}
        setVisible={setShowNewGameModal}
        playerLevel={playerLevel}
        onNewGame={onNewGame}
      />
      <AchievementsModal
        visible={showAchievementsModal}
        setVisible={setShowAchievementsModal}
        achievementList={[...roundAchievements, ...gameAchievements].sort((a, b) => a.sortOrder - b.sortOrder)}
        completedAchievements={completedAchievements}
      />
    </View>
  );
};

export default GameOver;
