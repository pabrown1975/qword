import { useEffect, useState } from "react";
import { View } from "react-native";
import { levelParams } from "../utils/levels";
import { buildRacks } from "../utils/rollLetters";
import { moveArrayElement, shuffleArray } from "../utils/arrays";
import { slotHeight } from "../utils/style";
import { forceHeight, forceWidth, useScreenArea } from "../utils/style";
import { evaluateWord, wordScore } from "../utils/wordscore";
import { gameAchievements, roundAchievements } from "../utils/achievements";
import { theme } from "../utils/style";
import { clamp } from "../utils/math";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Text, { H1 } from "../components/Text";
import Spinner from "../components/Spinner";
import Tile from "../components/Tile";
import Button from "../components/Button";
import Slot from "../components/Slot";
import GameOver from "../components/GameOver";
import HelpModal from "./HelpModal";
import YesterdayModal from "./YesterdayModal";
import SettingsModal from "./SettingsModal";

const Main = ({}) => {
  const [loading, setLoading] = useState(true);
  const [gameSeed, setGameSeed] = useState("");
  const [levelData, setLevelData] = useState({});
  const [round, setRound] = useState(0);
  const [roundRacks, setRoundRacks] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [playedLetters, setPlayedLetters] = useState([]);
  const [playedWords, setPlayedWords] = useState([]);
  const [roundBests, setRoundBests] = useState([]);
  const [roundBingos, setRoundBingos] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(true);
  const [yesterdayModalVisible, setYesterdayModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const screenArea = useScreenArea();

  const newRack = (letters) => {
    setAvailableLetters(letters);
    setPlayedLetters([]);
  };

  const moveTile = (fromArray, fromIndex, toIndex, fromSetter, toSetter) => {
    const letter = fromArray[fromIndex];
    fromSetter((oldLetters) => oldLetters.toSpliced(fromIndex, 1));
    toSetter((oldLetters) => oldLetters.toSpliced(clamp(toIndex, 0, oldLetters.length), 0, letter));
  };

  const sortAvailableLetters = () => setAvailableLetters((letters) => [...letters].sort());

  const shuffleAvailableLetters = () => {
    setAvailableLetters((letters) => {
      const copy = [...letters];
      shuffleArray(copy);
      return copy;
    });
  };

  const clearPlayedLetters = () => {
    setAvailableLetters((oldLetters) => [...oldLetters, ...playedLetters]);
    setPlayedLetters([]);
  };

  const nextRound = () => {
    setPlayedLetters([]);

    if (round === levelData?.slotFuncs.length - 1) {
      setGameOver(true);
      return;
    }

    setRound((round) => round + 1);
  };

  const handleSlotClick = (index) => {
    const rawScore = wordScore(currentWord);
    const playedWord = {
      word: currentWord,
      score: rawScore,
      round,
      isBest: rawScore === roundBests[round],
    };
    playedWord.score += roundAchievements
      .filter((ra) => ra.bonus)
      .reduce(
        (prev, curr) =>
          prev +
          (curr.f({ word: playedWord, rack: roundRacks[round], best: roundBests[round], level: levelData.name })
            ? curr.bonus
            : 0),
        0
      );

    setPlayedWords((old) => {
      const copy = [...old];
      copy[index] = playedWord;

      return copy;
    });

    nextRound();
  };

  const newGame = (mode) => {
    setLoading(true);

    AsyncStorage.getItem("selectedLevel")
      .then((value) => {
        const { seed, racks, bestWords, bestScores, data } = buildRacks(mode, value ?? levelParams[0].name, new Date());

        newRack(racks[0]);

        setGameSeed(seed);
        setLevelData(data);
        setRoundRacks(racks);
        setRoundBests(bestScores);
        setRoundBingos(racks.map((r, i) => bestWords[i].length === r.length));
        setPlayedWords(new Array(racks.length).fill(null));
        setRound(0);
        setGameOver(false);
      })
      .then(() => AsyncStorage.getItem("hideHelp"))
      .then((data) => {
        if (data) {
          setHelpModalVisible(false);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    newGame("Daily");
  }, []);

  // Effect when round is changed
  useEffect(() => {
    if (!roundRacks.length || !roundRacks[round].length) {
      return;
    }

    newRack(roundRacks[round]);
  }, [round]);

  if (loading) {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.bg0,
        }}
      >
        <Spinner />
      </View>
    );
  }

  /*
  ----------  ----------
  title
  ----------  ----------
  slots
  ----------  ----------
  playedWord
  ----------  bottom
  tiles       (also
  ----------  gameOver)
  message
  ----------  ----------
  */

  const titleAreaHeight = 80;
  const slotAreaHeight = (levelData.slotFuncs.length + 1) * slotHeight + levelData.slotFuncs.length * 3;
  const bottomAreaHeight = screenArea.viewHeight - (titleAreaHeight + slotAreaHeight);
  const messageAreaHeight = 100;
  const playedWordAreaHeight = 90;
  const tileAreaHeight = bottomAreaHeight - (playedWordAreaHeight + messageAreaHeight);

  const tileSizeAvail = Math.min((tileAreaHeight - 20) / 3, (screenArea.viewWidth - 20) / 5, 60);
  const tileSizePlayed = Math.min(screenArea.viewWidth / playedLetters.length, 36);

  // The literals here are a best guess at layout slop (borders + padding) but might be off on some devices
  const availableLettersRackWidth = tileSizeAvail * 5 + 11;
  const availableLettersRackHeight = Math.ceil(availableLetters.length / 5) * (tileSizeAvail + 2) - 1;
  const fixedRackHeight = Math.ceil(levelData.tiles / 5) * tileSizeAvail + 7;

  const currentWord = playedLetters.join("");
  const { valid, msg } = evaluateWord(currentWord, levelData.minimumLength);

  const handleAvailableTileClick = (index) =>
    moveTile(availableLetters, index, 15, setAvailableLetters, setPlayedLetters);
  const handleAvailableTileDrag = (index, x, y) => {
    const oldrow = Math.floor(index / 5);
    const oldcol = index % 5;
    let newrow = oldrow + Math.round(y / tileSizeAvail);
    let newcol = oldcol + Math.round(x / tileSizeAvail);

    if (newrow < -1) {
      moveTile(
        availableLetters,
        index,
        playedLetters.length / 2 + (x + (oldcol - 2) * tileSizeAvail) / tileSizePlayed,
        setAvailableLetters,
        setPlayedLetters
      );
      return;
    }

    newrow = clamp(newrow, 0, 2);
    newcol = clamp(newcol, 0, 4);

    setAvailableLetters((oldLetters) =>
      moveArrayElement([...oldLetters], index, clamp(newrow * 5 + newcol, 0, oldLetters.length - 1))
    );
  };

  const handlePlayedTileClick = (index) => moveTile(playedLetters, index, 15, setPlayedLetters, setAvailableLetters);
  const handlePlayedTileDrag = (index, x, y) => {
    if (y > tileSizePlayed * 2) {
      handlePlayedTileClick(index);
      return;
    }

    setPlayedLetters((oldLetters) =>
      moveArrayElement([...oldLetters], index, clamp(index + Math.trunc(x / tileSizePlayed), 0, oldLetters.length - 1))
    );
  };

  const score =
    playedWords.reduce((prev, curr) => prev + (curr?.score ?? 0), 0) +
    (gameOver
      ? gameAchievements
          .filter((ga) => ga.bonus)
          .reduce(
            (prev, curr) =>
              prev +
              (curr.f({
                words: playedWords,
                racks: roundRacks,
                bests: roundBests,
                level: levelData.name,
              })
                ? curr.bonus
                : 0),
            0
          )
      : 0);

  return (
    <View
      style={{
        ...screenArea.padding,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: theme.bg0,
        maxHeight: "100%",
      }}
    >
      <View
        style={{
          width: "100%",
          ...forceHeight(titleAreaHeight),
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <H1>
          qword{!!score && ` ː ${score} pts`}
          {roundBingos[round] && <Text size={5}>⭐️</Text>}
        </H1>
        <Text>{gameSeed}</Text>
      </View>
      <View
        style={{
          width: "100%",
          ...forceHeight(slotAreaHeight),
          gap: 3,
        }}
      >
        {levelData.slotFuncs.map((sf, i) => (
          <Slot
            key={`slot ${sf.name}`}
            title={sf.name}
            word={playedWords[i]?.word}
            score={playedWords[i]?.score}
            stars={playedWords[i]?.isBest}
            playable={valid && sf.f(currentWord)}
            onPress={() => handleSlotClick(i)}
          />
        ))}
        {!gameOver && <Slot title="pass" playable onPress={nextRound} />}
      </View>
      <View
        style={{
          width: "100%",
          ...forceHeight(bottomAreaHeight),
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {gameOver ? (
          <GameOver
            height={bottomAreaHeight}
            score={score}
            words={playedWords}
            racks={roundRacks}
            bests={roundBests}
            level={levelData.name}
            onNewGame={newGame}
          />
        ) : (
          <>
            <View
              style={{
                width: "100%",
                ...forceHeight(playedWordAreaHeight),
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {playedLetters.length ? (
                playedLetters.map((l, i) => (
                  <Tile
                    key={`played tile ${i}`}
                    letter={l}
                    onPress={() => handlePlayedTileClick(i)}
                    onDrag={({ x, y }) => handlePlayedTileDrag(i, x, y)}
                    size={tileSizePlayed}
                    noscore
                  />
                ))
              ) : (
                <View style={{ backgroundColor: theme.bg1, padding: 10, borderRadius: 7 }}>
                  <Text size={13} style={{ color: theme.bg3 }}>Tap or drag tiles to make a word here</Text>
                </View>
              )}
            </View>
            <View
              style={{
                width: "100%",
                ...forceHeight(tileAreaHeight),
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 6,
              }}
            >
              <View
                style={{
                  ...forceHeight(fixedRackHeight),
                  justifyContent: "flex-start",
                }}
              >
                <View
                  style={{
                    ...forceWidth(availableLettersRackWidth),
                    ...forceHeight(availableLettersRackHeight),
                    flexDirection: "row",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  {availableLetters.map((l, i) => (
                    <Tile
                      key={`avail tile ${i}`}
                      letter={l}
                      onPress={() => handleAvailableTileClick(i)}
                      onDrag={({ x, y }) => handleAvailableTileDrag(i, x, y)}
                      size={tileSizeAvail}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View
              style={{
                ...forceHeight(messageAreaHeight),
                justifyContent: "space-evenly",
                alignItems: "center",
                width: "100%",
              }}
            >
              <View
                style={{
                  ...forceWidth(availableLettersRackWidth),
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {availableLetters.length > 1 && <Button text="sort" onPress={sortAvailableLetters} />}
                {availableLetters.length > 1 && <Button text="shuffle" onPress={shuffleAvailableLetters} />}
                {!!playedLetters.length && <Button text="clear" onPress={clearPlayedLetters} />}
              </View>
              <View
                style={{
                  ...forceWidth(screenArea.viewWidth),
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <View>
                  <Text>
                    Round {round + 1} of {levelData.slotFuncs.length}
                  </Text>
                  <Text>{msg}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Tile letter="❓" size={35} noscore onPress={() => setHelpModalVisible(true)} />
                  <Tile letter="📆" size={35} noscore onPress={() => setYesterdayModalVisible(true)} />
                  <Tile letter="⚙️" size={35} noscore onPress={() => setSettingsModalVisible(true)} />
                </View>
              </View>
            </View>
          </>
        )}
      </View>
      <HelpModal visible={helpModalVisible} setVisible={setHelpModalVisible} />
      <YesterdayModal visible={yesterdayModalVisible} setVisible={setYesterdayModalVisible} />
      <SettingsModal
        visible={settingsModalVisible}
        setVisible={setSettingsModalVisible}
        onQuit={() => setGameOver(true)}
      />
    </View>
  );
};

export default Main;
