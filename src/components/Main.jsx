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
  const playedWordAreaHeight = 120;
  const tileAreaHeight = bottomAreaHeight - (playedWordAreaHeight + messageAreaHeight);

  const tileSizeAvail = Math.min((tileAreaHeight - 20) / 3, (screenArea.viewWidth - 20) / 5, 60);
  const tileSizePlayed = Math.min(screenArea.viewWidth / (playedLetters.length + 1), tileSizeAvail * 0.8);

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
      fromPlayed: true,
      toPlayed: true,
      fromIndex: index,
      toIndex: index,
    });
  };

  const handleAvailableTileDragStart = (index) => {
    setDragInfo({
      fromPlayed: false,
      toPlayed: false,
      fromIndex: index,
      toIndex: index,
    });
  };

  /*
    [x] from avail, to played - tile edges are left by 0.5
    [x] from avail, to played - can't add at right end
    [x] from avail, to played, add at right end - ghost is wrong
    [ ] from avail, to avail, same row - shift everything between to and from by 1
    [ ] from avail, to avail, different row - shift everything to left by -0.5, shift everything to right by 0.5
    [ ] from played, to avail - same as "different row" above
    [ ] from played, to avail - can't add at right end
    [ ] from played, to avail - can't add to next row if num avail tiles is a multiple of 5
    [ ] from played, to avail - empty avail case
    [x] from avail, to played - empty played case
   */

  const handleTileDrag = (event) => {
    const toPlayed = event.absoluteY < layoutInfo["availTileArea"].y - 20;

    let toIndex;

    if (toPlayed) {
      if (!playedLetters.length || !layoutInfo[`played tile 0`] || event.absoluteX <= layoutInfo[`played tile 0`].x) {
        toIndex = 0;
      } else {
        if (dragInfo.fromPlayed) {
          if (event.absoluteX >= layoutInfo[`played tile ${playedLetters.length - 1}`]?.x) {
            toIndex = playedLetters.length - 1;
          } else {
            toIndex = playedLetters.findIndex((_, i) => layoutInfo[`played tile ${i}`].x > event.absoluteX) - 1;
          }
        } else {
          if (event.absoluteX >= layoutInfo[`played tile ${playedLetters.length - 1}`]?.x + tileSizePlayed) {
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

      if (!availableLetters.length || !layoutInfo[`avail tile 0`]) {
        toRow = 0;
        toCol = 0;
      } else {
        if (event.absoluteY <= layoutInfo[`avail tile 0`].y) {
          toRow = 0;
        } else {
          if (dragInfo.fromPlayed) {
            if (event.absoluteY >= layoutInfo[`avail tile ${availableLetters.length - 1}`]?.y) {
              toRow = Math.floor(availableLetters.length / 5);
            } else {
              toRow = availableLetters.findIndex((_, i) => layoutInfo[`avail tile ${i}`].y > event.absoluteY) / 5 - 1;
            }
          } else {
          }
        }

        if (event.absoluteX <= layoutInfo[`avail tile 0`].x) {
          toCol = 0;
        } else {
          if (dragInfo.fromPlayed) {
            if (event.absoluteX >= layoutInfo[`avail tile ${Math.min(availableLetters.length - 1, 4)}`]?.x) {
              toCol = 4;
            } else {
              toCol = availableLetters.findIndex((_, i) => layoutInfo[`avail tile ${i}`].x > event.absoluteX) - 1;
            }
          } else {
          }
        }
      }

      toIndex = clamp(toRow * 5 + toCol, 0, availableLetters.length - (dragInfo.fromPlayed ? 0 : 1));
    }

    setDragInfo((prev) => ({
      ...prev,
      toIndex,
      toPlayed,
    }));
  };

  const handleTileDragEnd = () => {
    if (dragInfo.fromPlayed) {
      if (dragInfo.toPlayed) {
        setPlayedLetters((oldLetters) => moveArrayElement([...oldLetters], dragInfo.fromIndex, dragInfo.toIndex ?? 15));
      } else {
        moveTile(playedLetters, dragInfo.fromIndex, dragInfo.toIndex, setPlayedLetters, setAvailableLetters);
      }
    } else {
      if (dragInfo.toPlayed) {
        moveTile(availableLetters, dragInfo.fromIndex, dragInfo.toIndex, setAvailableLetters, setPlayedLetters);
      } else {
        setAvailableLetters((oldLetters) =>
          moveArrayElement([...oldLetters], dragInfo.fromIndex, dragInfo.toIndex ?? 15)
        );
      }
    }

    setDragInfo({});
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

  /*
    from avail, to played

     -2  -1   0   1   2
              |      (l before insert)
             [0]        l = 0
           [0] [1]      l = 1
         [0] [1] [2]    l = 2
       [0] [1] [2] [3]  l - 3

    l | t | x
    ---------
    0   X   s * -1/2
    1   0   s * -1
    1   1   s * 0
    2   0   s * -3/2
    2   1   s * -1/2
    2   2   s * +1/2
    3   0   s * -2
    3   1   s * -1
    3   2   s * 0
    3   3   s * 1


    from played, to played

     -2  -1   0   1   2
              |      (l before insert)
             [0]        l = 1
           [0] [1]      l = 2
         [0] [1] [2]    l = 3

    l | t | x
    ---------
    0   X   X
    1   X   s * -1/2
    2   0   s * -1
    2   1   s * 0
    3   0   s * -3/2
    3   1   s * -1/2
    3   2   s * 1/2

    ----------- area.y
   |   -------  area.y + (area.h - s) / 2
   |  |       |
   |  |   * --- area.y + area.h / 2
   |  |       |
   |   -------
    ----------- area.y + area.h


    from played, to avail

    ----------- area.y
   |
   |   -------
   |  |       |
   |  |       |
   |  |       |
   |   -------
   |
   |   -------
   |  |       |
   |  |       |
   |  |       |
   |   -------
   |          --- area.y + area.h * row / numRows
   |   -------  area.y + area.h * (row + 1/2) / numRows - s / 2
   |  |       |
   |  |   * --- area.y + area.h * (row + 1/2) / numRows
   |  |       |
   |   -------
   |
    ----------- area.y + area.h

                              sw / 2 + area.w * (col - 2) / 5 - s / 2
                    sw / 2    | sw / 2 + area.w * (col - 2) / 5
    ----------------|---------|-|----
   |   ---   ---   ---   ---   ---   |
   |  |   | |   | |   | |   | |   |  |
   |   ---   ---   ---   ---   ---   |
    ---------------------------------

   */

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
      const numRows = Math.ceil(availableLetters.length / 5);
      const toRow = Math.floor(dragInfo.toIndex / 5);
      const toCol = dragInfo.toIndex % 5;

      // if (dragInfo.fromPlayed) {
      // }
      // else {
      // }

      x = screenArea.width / 2 + ((toArea.w - 3) * (toCol - 2)) / 5 - s / 2 - 2;

      y = toArea.y + ((toArea.h - 1) * (toRow + 1 / 2)) / numRows - s / 2;
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
        ...screenArea.padding,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: theme.bg0,
        maxHeight: "100%",
      }}
    >
      <View
        style={{
          ...ghostTileStyle,
          borderRadius: 6,
          backgroundColor: theme.ghost1,
          ...border(2, theme.ghost2),
        }}
      ></View>
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
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  ...forceHeight(tileSizePlayed * 1.5),
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

                      if (dragInfo.toPlayed) {
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
                  onLayout={(event) => updateLayoutPos("availTileArea", event.target)}
                >
                  {availableLetters.map((l, i) => {
                    const key = `avail tile ${i}`;

                    if (!dragInfo.toPlayed) {
                      const toCol = dragInfo.toIndex % 5;
                      const toRow = Math.floor(dragInfo.toIndex / 5);

                      if (dragInfo.fromPlayed) {
                        /*
                        STOPPED HERE

                        [x] bingo 12 and bingo 15 --> very rare
                        [ ] multi-page help, mention yesterday button, mention level score to beat
                        [x] 900 --> 1000
                        [ ] sort achievements (in grid and in list)
                        [x] remove "Achievements (#):"
                        [ ] confetti for full achievement board
                        [ ] finish drag
                          case 3...
                          - shift right if row === toRow and col >= toCol
                          do case 4
                         */
                      } else {
                        const fromCol = dragInfo.fromIndex % 5;
                        const fromRow = Math.floor(dragInfo.fromIndex / 5);
                      }
                    }

                    let xShift = {};

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
                        style={xShift}
                      />
                    );
                  })}
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
