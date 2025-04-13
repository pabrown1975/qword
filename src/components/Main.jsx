import { useEffect, useState } from "react";
import { View } from "react-native";
import { levelParams } from "../utils/levels";
import { buildRacks } from "../utils/rollLetters";
import { moveArrayElement, shuffleArray } from "../utils/arrays";
import { border, slotHeight } from "../utils/style";
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
import TileButton from "./TileButton";
import SettingsIcon from "../../assets/images/settings.svg";
import CalenderIcon from "../../assets/images/calender.svg";

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
  const [layoutInfo, setLayoutInfo] = useState({});
  const [dragInfo, setDragInfo] = useState({});
  const [yesterdayInfo, setYesterdayInfo] = useState({});

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

    setRound((prev) => prev + 1);
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
        const d = new Date();

        // Generate racks for current game
        const { seed, racks, bestWords, bestScores, data } = buildRacks(mode, value ?? levelParams[0].name, d);

        // Generate all racks for yesterday's games
        d.setDate(d.getDate() - 1);

        setYesterdayInfo((prev) => {
          if (prev.date === d.toDateString()) {
            // Already generated
            return prev;
          }

          return {
            date: d.toDateString(),
            racks: levelParams.map((lp) => ({
              ...lp,
              ...buildRacks("Daily", lp.name, d),
            })),
          };
        });

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

  const titleAreaHeight = 80;
  const slotAreaHeight = (levelData.slotFuncs.length + 1) * slotHeight + levelData.slotFuncs.length * 3;
  const bottomAreaHeight = screenArea.viewHeight - (titleAreaHeight + slotAreaHeight);
  const playedWordAreaHeight = 120;
  const helpButtonsSize = 40;
  const rackButtonAreaHeight = 42;
  const messageAreaHeight = helpButtonsSize + 12;
  const tileAreaHeight = bottomAreaHeight - (playedWordAreaHeight + messageAreaHeight);

  const tileSizeAvail = Math.min((tileAreaHeight - (rackButtonAreaHeight + 20)) / 3, (screenArea.viewWidth - 20) / 5, 60);
  const tileSizePlayed = Math.min((screenArea.viewWidth - 20) / playedLetters.length, 50);

  // The literals here are a best guess at layout slop (borders + padding) but might be off on some devices
  const availableLettersRackWidth = tileSizeAvail * 5 + 8;
  const availableLettersRackHeight = Math.ceil(availableLetters.length / 5) * (tileSizeAvail + 1) + 1;
  const fixedRackHeight = Math.ceil(levelData.tiles / 5) * tileSizeAvail + 7;

  const currentWord = playedLetters.join("");
  const { valid, msg } = evaluateWord(currentWord, levelData.minimumLength);

  const handleAvailableTileClick = (index) =>
    moveTile(availableLetters, index, 15, setAvailableLetters, setPlayedLetters);

  const handlePlayedTileClick = (index) => moveTile(playedLetters, index, 15, setPlayedLetters, setAvailableLetters);

  const handlePlayedTileDragStart = (index) => {
    setDragInfo({
      active: true,
      fromPlayed: true,
      toPlayed: true,
      fromIndex: index,
      toIndex: index,
    });
  };

  const handleAvailableTileDragStart = (index) => {
    setDragInfo({
      active: true,
      fromPlayed: false,
      toPlayed: false,
      fromIndex: index,
      toIndex: index,
    });
  };

  const handleTileDrag = (event) => {
    setDragInfo((prev) => {
      // RNGH sometimes gets gestures out of order
      if (!prev.active) {
        return {};
      }

      const toPlayed = event.absoluteY < layoutInfo["availTileArea"].y - 20;
      const { fromPlayed } = prev;
      let toIndex;

      if (toPlayed) {
        if (!playedLetters.length || !layoutInfo[`played tile 0`] || event.absoluteX <= layoutInfo[`played tile 0`].x) {
          toIndex = 0;
        } else {
          if (fromPlayed) {
            if (event.absoluteX >= layoutInfo[`played tile ${playedLetters.length - 1}`]?.x) {
              toIndex = playedLetters.length - 1;
            } else {
              toIndex = playedLetters.findIndex((_, i) => layoutInfo[`played tile ${i}`].x > event.absoluteX) - 1;
            }
          } else {
            if (event.absoluteX >= layoutInfo[`played tile ${playedLetters.length - 1}`]?.x + tileSizePlayed / 2) {
              toIndex = playedLetters.length;
            } else {
              toIndex = playedLetters.findLastIndex(
                (_, i) => layoutInfo[`played tile ${i}`].x - tileSizePlayed / 2 < event.absoluteX
              );
            }
          }
        }
      } else {
        let toRow;
        let toCol;
        const lastSlot = availableLetters.length - (fromPlayed ? 0 : 1);

        if (!availableLetters.length || !layoutInfo[`avail tile 0`]) {
          toRow = 0;
          toCol = 0;
        } else {
          if (event.absoluteY <= layoutInfo[`avail tile 0`].y) {
            toRow = 0;
          } else {
            toRow = clamp(
              Math.trunc(
                (availableLetters.findLastIndex(
                  (_, i) => layoutInfo[`avail tile ${i}`].y + tileSizeAvail < event.absoluteY
                ) +
                  1) /
                  5
              ),
              0,
              Math.floor(lastSlot / 5)
            );
          }

          if (event.absoluteX <= layoutInfo["avail tile 0"].x) {
            toCol = 0;
          } else {
            toCol =
              availableLetters
                .slice(0, 5)
                .findLastIndex((_, i) => layoutInfo[`avail tile ${i}`].x + tileSizeAvail < event.absoluteX) + 1;
          }
        }

        toIndex = clamp(toRow * 5 + toCol, 0, lastSlot);
      }

      return {
        ...prev,
        toIndex,
        toPlayed,
      };
    });
  };

  const handleTileDragEnd = () => {
    setDragInfo((prev) => {
      // RNGH sometimes gets gestures out of order
      if (!prev.active) {
        return {};
      }

      if (prev.fromPlayed) {
        if (prev.toPlayed) {
          setPlayedLetters((oldLetters) => moveArrayElement([...oldLetters], prev.fromIndex, prev.toIndex ?? 15));
        } else {
          moveTile(playedLetters, prev.fromIndex, prev.toIndex, setPlayedLetters, setAvailableLetters);
        }
      } else {
        if (prev.toPlayed) {
          moveTile(availableLetters, prev.fromIndex, prev.toIndex, setAvailableLetters, setPlayedLetters);
        } else {
          setAvailableLetters((oldLetters) => moveArrayElement([...oldLetters], prev.fromIndex, prev.toIndex ?? 15));
        }
      }

      return {};
    });
  };

  const updateLayoutPos = (elementName, element) =>
    element.measure((_, __, w, h, x, y) => setLayoutInfo((prev) => ({ ...prev, [elementName]: { w, h, x, y } })));

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

  let ghostTileStyle = {
    display: "none",
  };

  if (dragInfo.toIndex >= 0) {
    const s = dragInfo.toPlayed ? tileSizePlayed : tileSizeAvail;
    const l = dragInfo.toPlayed ? playedLetters.length : availableLetters.length;
    const toArea = layoutInfo[dragInfo.toPlayed ? "playedTileArea" : "availTileArea"];
    let x, y;

    if (dragInfo.toPlayed) {
      if (dragInfo.fromPlayed) {
        x = screenArea.width / 2 + s * (dragInfo.toIndex - l / 2);
      } else {
        x = screenArea.width / 2 + s * ((l + 1) / -2 + dragInfo.toIndex);
      }

      y = toArea.y + (toArea.h - s) / 2;
    } else {
      const numRows = Math.ceil(l / 5);
      const toRow = Math.floor(dragInfo.toIndex / 5);
      const toCol = dragInfo.toIndex % 5;

      x = screenArea.width / 2 + ((toArea.w - 3) * (toCol - 2)) / 5 - s / 2 - 2;

      if (l) {
        y = toArea.y + ((toArea.h - 1) * (toRow + 1 / 2)) / numRows - s / 2;
      } else {
        y = toArea.y;
      }
    }

    ghostTileStyle = {
      display: "flex",
      position: "absolute",
      top: y + s * 0.05,
      left: x + s * 0.05,
      width: s * 0.9,
      height: s * 0.9,
      zIndex: 500,
    };
  }

  return (
    <View
      style={{
        ...forceWidth(screenArea.width),
        ...forceHeight(screenArea.height),
        ...screenArea.padding,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: theme.bg0,
      }}
    >
      <View
        style={{
          ...ghostTileStyle,
          borderRadius: 6,
          backgroundColor: theme.ghost1,
          ...border(2, theme.ghost2),
        }}
      />
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
          {roundBingos[round] && <Text size={6}>⭐️</Text>}
          {!roundBests[round] && <Text size={6}>☠️</Text>}
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
          justifyContent: "center",
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
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  ...forceHeight(tileSizePlayed + 20),
                  flexDirection: "row",
                  backgroundColor: theme.bg1,
                  borderRadius: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onLayout={(event) => updateLayoutPos("playedTileArea", event.target)}
              >
                {playedLetters.length
                  ? playedLetters.map((l, i) => {
                      const key = `played tile ${i}`;
                      let xShift = {};

                      if (dragInfo.active && dragInfo.toPlayed) {
                        if (dragInfo.fromPlayed) {
                          if (i >= dragInfo.toIndex && i < dragInfo.fromIndex) {
                            xShift = { transform: [{ translateX: tileSizePlayed }] };
                          } else if (i > dragInfo.fromIndex && i <= dragInfo.toIndex) {
                            xShift = { transform: [{ translateX: -tileSizePlayed }] };
                          }
                        } else {
                          if (i >= dragInfo.toIndex) {
                            xShift = { transform: [{ translateX: tileSizePlayed / 2 }] };
                          } else {
                            xShift = { transform: [{ translateX: tileSizePlayed / -2 }] };
                          }
                        }
                      }

                      return (
                        <Tile
                          key={key}
                          letter={l}
                          onPress={() => handlePlayedTileClick(i)}
                          onDragStart={() => handlePlayedTileDragStart(i)}
                          onDrag={handleTileDrag}
                          onDragEnd={handleTileDragEnd}
                          size={tileSizePlayed}
                          noscore
                          onLayout={(event) => updateLayoutPos(key, event.target)}
                          style={xShift}
                        />
                      );
                    })
                  : !round && (
                      <Text size={13} style={{ color: theme.bg3 }}>
                        Tap or drag tiles to make a word here
                      </Text>
                    )}
              </View>
            </View>
            <View
              style={{
                width: "100%",
                ...forceHeight(tileAreaHeight),
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
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
                  onLayout={(event) => updateLayoutPos("availTileArea", event.target)}
                >
                  {availableLetters.map((l, i) => {
                    const key = `avail tile ${i}`;
                    let xyShift = {};

                    if (dragInfo.active && !dragInfo.toPlayed) {
                      const shiftRight = {
                        transform: [
                          { translateX: (i % 5 === 4 ? -4 : 1) * (tileSizeAvail + 1) },
                          { translateY: (i % 5 === 4 ? 1 : 0) * (tileSizeAvail + 1) },
                        ],
                      };

                      const shiftLeft = {
                        transform: [
                          { translateX: (i % 5 === 0 ? 4 : -1) * (tileSizeAvail + 1) },
                          { translateY: (i % 5 === 0 ? -1 : 0) * (tileSizeAvail + 1) },
                        ],
                      };

                      if (dragInfo.fromPlayed) {
                        if (i >= dragInfo.toIndex) {
                          xyShift = shiftRight;
                        }
                      } else {
                        if (i >= dragInfo.toIndex && i < dragInfo.fromIndex) {
                          xyShift = shiftRight;
                        } else if (i > dragInfo.fromIndex && i <= dragInfo.toIndex) {
                          xyShift = shiftLeft;
                        }
                      }
                    }

                    return (
                      <Tile
                        key={key}
                        letter={l}
                        onPress={() => handleAvailableTileClick(i)}
                        onDragStart={() => handleAvailableTileDragStart(i)}
                        onDrag={handleTileDrag}
                        onDragEnd={handleTileDragEnd}
                        size={tileSizeAvail}
                        onLayout={(event) => updateLayoutPos(key, event.target)}
                        style={xyShift}
                      />
                    );
                  })}
                </View>
              </View>
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
                  ...forceWidth(screenArea.viewWidth),
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <View style={forceWidth(screenArea.viewWidth - ((helpButtonsSize + 6) * 3 + 10))}>
                  <Text style={{ color: theme.fg2 }}>
                    Round {round + 1} of {levelData.slotFuncs.length}
                  </Text>
                  <Text size={13}>{msg}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TileButton onPress={() => setHelpModalVisible(true)}>
                    <Text
                      size={helpButtonsSize * 0.5}
                      style={{
                        width: helpButtonsSize,
                        height: helpButtonsSize,
                        textAlign: "center",
                        textAlignVertical: "center",
                      }}
                    >
                      {"❓"}
                    </Text>
                  </TileButton>
                  <TileButton onPress={() => setYesterdayModalVisible(true)}>
                    <CalenderIcon width={helpButtonsSize} height={helpButtonsSize} />
                  </TileButton>
                  <TileButton onPress={() => setSettingsModalVisible(true)}>
                    <SettingsIcon width={helpButtonsSize} height={helpButtonsSize} />
                  </TileButton>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
      <HelpModal visible={helpModalVisible} setVisible={setHelpModalVisible} />
      <YesterdayModal visible={yesterdayModalVisible} setVisible={setYesterdayModalVisible} data={yesterdayInfo.racks} />
      <SettingsModal
        visible={settingsModalVisible}
        setVisible={setSettingsModalVisible}
        onQuit={() => setGameOver(true)}
      />
    </View>
  );
};

export default Main;
