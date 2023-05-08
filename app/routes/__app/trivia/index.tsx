import { LoaderArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { fetchNewGame } from "~/services/bowpourri";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import Countdown from "react-countdown";
import {
  CheckIcon,
  CheckBadgeIcon,
  FaceFrownIcon,
} from "@heroicons/react/24/solid";
import { categories } from "./categories";

import io from "socket.io-client";
console.log("loading socket");
const socket = io.connect("http://localhost:4000");

// const wsUrl = process.env.WEBSOCKET_API || "";
// const wsUrl = "wss://lionfish-app-si2ii.ondigitalocean.app";
// const wsUrl = "wss://localhost:8000";

export async function loader({ request }: LoaderArgs) {
  // const userId = await requireUserId(request);
  const wsUrl = process.env.WEBSOCKET_API || "http://localhost:4000";
  return json({ wsUrl });
}

const MIN_PLAYERS = 1;
const COUNTDOWN_SECONDS = 5;
const ANSWER_BUFFER = 5;

const cardClass =
  "card mt-4 w-full bg-neutral md:basis-1/4 text-neutral-content cursor-pointer";

export default function TriviaIndex() {
  const user = useUser();
  const [userData, setUserData] = useState();
  const [signedIn, setSignedIn] = useState(false);
  const [players, setPlayers] = useState([]);
  console.log("players: ", players);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState();
  const [categorySelector, setCategorySelector] = useState();
  const [yesterdaysWinner, setYesterdaysWinner] = useState();
  const [newGame, setNewGame] = useState();
  const [newGameError, setNewGameError] = useState();
  const [playerScores, setPlayerScores] = useState();
  const [playerScoreError, setPlayerScoreError] = useState();
  const [showPlayerScores, setShowPlayerScores] = useState(false);
  const [playerStats, setPlayerStats] = useState();
  const [selectedOption, setSelectedOption] = useState();
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState();
  const [answerImg, setAnswerImg] = useState();
  const { wsUrl } = useLoaderData<typeof loader>();

  // let socket;

  const onSignOut = (socketId) => {
    // Remove the corresponding player
    const newPlayers = players.filter((x) => x.socketId !== socketId);
    setPlayers(newPlayers);
  };

  const handlePlayerScores = (newPlayerScores) => {
    console.log("newPlayerScores: ", newPlayerScores);
    setPlayerScores(newPlayerScores);
    setShowPlayerScores(true);
    setGameComplete(true);
  };

  const handlePlayAgain = () => {
    setSignedIn(false);
    setGameComplete(false);
    setSelectedCategory();
    setNewGame();
    setNewGameError();
    setPlayers([]);
    setPlayerScores();
    setPlayerScoreError();
    setSelectedOption();
    setCountdownCompleted(false);
    setCorrectAnswer();
  };

  const handleResetGame = (msg) => {
    console.log("msg: ", msg);
    handlePlayAgain();
  };

  const handleCategory = (name, newCategory) => {
    setCategorySelector(name);
    setSelectedCategory(newCategory);
  };

  const handleUserScores = (userScores) => {
    console.log("userScores: ", userScores);
    setPlayerScores(userScores);
  };

  const handlePlayerStats = async (stats, gameFinished: boolean = false) => {
    setPlayerStats(stats);
    if (gameFinished) {
      setShowPlayerScores(true);
      setGameComplete(true);
    }
  };

  useEffect(() => {
    if (!playerStats) {
      socket.emit("playerStats");
    }
  }, [playerStats]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on("message", (msg) => {
      console.log("msg: ", msg);
    });
    socket.on("userScores", handleUserScores);
    socket.on("players", setPlayers);
    socket.on("category", handleCategory);
    socket.on("newGame", setNewGame);
    socket.on("newGameError", setNewGameError);
    socket.on("playerScores", handlePlayerScores);
    socket.on("playerScoreError", setPlayerScoreError);
    socket.on("playerStats", handlePlayerStats);
    socket.on("answer", setCorrectAnswer);
    socket.on("answerImg", setAnswerImg);
    socket.on("signOut", onSignOut);
    socket.on("resetGame", handleResetGame);
  }, [socket]);

  useEffect(() => {
    return () => {
      console.log("Disconnect on tab close");
      // Remove yourself from players list
      console.log("userData on disconnect: ", userData);
      socket.emit("signOut", userData?.email);
      // socket.off("userScores", handleUserScores);
      // socket.off("players", setPlayers);
      // socket.off("category", setSelectedCategory);
      // socket.off("newGame", setNewGame);
      // socket.off("newGameError", setNewGameError);
      // socket.off("playerScores", handlePlayerScores);
      // socket.off("playerScoreError", setPlayerScoreError);
      // socket.off("answer", setCorrectAnswer);
      // socket.off("signOut", onSignOut);
      // socket.off("resetGame", handleResetGame);

      socket.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (user) {
      console.log("user: ", user);
      setUserData({
        email: user.email,
        name: user.name,
        id: user.id,
      });
    }
  }, [user]);

  useEffect(() => {
    console.log("players: ", players);
    if (players && players.find((x) => x.email == user.email)) {
      setSignedIn(true);
    } else {
      setSignedIn(false);
    }
  }, [players]);

  useEffect(() => {
    if (selectedOption && userData) {
      socket.emit("answer", userData.email, selectedOption);
    }
  }, [selectedOption, userData]);

  const handleSignIn = () => {
    if (userData) {
      console.log("userData: ", userData);
      socket.emit("signIn", userData);
    }
  };

  const StartTriviaCard = () => {
    return (
      <div className="card prose w-96">
        <div className="card-body">
          <h2 className="card-title">Bowpourri</h2>
          <div className="card-actions">
            <button onClick={handleSignIn} className="btn-primary btn">
              Join Game!
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleCountdown = ({ seconds, completed }) => {
    console.log("newGame: ", newGame);
    if ((completed || countdownCompleted) && newGame) {
      return (
        <div className="prose flex flex-col items-start">
          Today's question:
          <h3>{newGame.question}</h3>
          {newGame.options.map((option, i) => {
            return (
              <div className="form-control" key={i}>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio mr-4 checked:bg-blue-500"
                    onChange={() => setSelectedOption(option)}
                    checked={selectedOption == option}
                  />
                  <span className="label-text">{option}</span>
                </label>
              </div>
            );
          })}
        </div>
      );
    } else {
      setCountdownCompleted(true);
      return (
        <div>
          <h2>The game will begin momentarily</h2>
          <h1>{seconds}</h1>
        </div>
      );
    }
  };

  const ShowQuestion = () => {
    const ms = COUNTDOWN_SECONDS * 1000;
    return (
      <div>
        <Countdown date={Date.now() + ms} renderer={handleCountdown} />
      </div>
    );
  };

  const CategoryCard = ({ category }) => {
    const className = `btn btn-outline ${category.class} m-2`;
    const isDisabled = !!selectedCategory;
    const name = userData?.name || userData?.email;
    return (
      <button
        className={className}
        onClick={() => socket.emit("category", name, category.label)}
        disabled={isDisabled}
      >
        {category.label}
      </button>
    );
  };

  const StatusCard = () => {
    if (players.length < MIN_PLAYERS) {
      return (
        <div>
          <h2>Waiting for more players...</h2>
        </div>
      );
    } else {
      const filteredCategories = selectedCategory
        ? categories.filter((x) => x.label === selectedCategory)
        : categories;
      if (selectedCategory) {
        return (
          <div className="prose">
            <h3>
              {categorySelector} chose {selectedCategory}
            </h3>
            <h2>{selectedCategory}</h2>
          </div>
        );
      }
      return (
        <div>
          Choose a category:
          <div className="flex flex-row flex-wrap items-start">
            {filteredCategories.map((cat, i) => {
              return <CategoryCard key={i} category={cat} />;
            })}
          </div>
        </div>
      );
    }
  };

  const handleAnswer = ({ seconds, completed }) => {
    if (correctAnswer) {
      const isCorrect = correctAnswer.option == selectedOption;
      if (isCorrect) {
        return (
          <div>
            <h2>Congratulations!</h2>
            <div>Correct Answer: {correctAnswer.option}</div>
          </div>
        );
      } else {
        return (
          <div>
            <h3>Sorry, you are incorrect.</h3>
            <div>Correct Answer: {correctAnswer.option}</div>
          </div>
        );
      }
    } else {
      return <div>Letting you change your mind for {seconds} seconds...</div>;
    }
  };

  const ShowAnswer = () => {
    if (countdownCompleted && newGame) {
      const ms = ANSWER_BUFFER * 1000;
      return (
        <div>
          <Countdown date={Date.now() + ms} renderer={handleAnswer} />
        </div>
      );
    } else {
      return "";
    }
  };

  const unanswered = players.filter((x) => !x.answered);

  const PlayerStatus = ({ player }) => {
    const { name, email, answered, playerData, isCorrect } = player;
    console.log("player: ", player);
    let answerIcon;
    if (correctAnswer) {
      // const isCorrect = correctAnswer.option == selectedOption;
      if (isCorrect == true) {
        answerIcon = <CheckBadgeIcon className="h-6 w-6 text-green-500" />;
      } else if (isCorrect == false) {
        answerIcon = <FaceFrownIcon className="text-warning-500 h-6 w-6" />;
      }
    } else if (answered) {
      answerIcon = <CheckIcon className="h-6 w-6 text-green-500" />;
    }
    return (
      <div className="flex">
        {name} {answerIcon}
      </div>
    );
  };

  const PlayerScoreRow = ({ player, rank }) => {
    const { score, name } = player;
    return (
      <tr>
        <td>{rank}</td>
        <td>{name}</td>
        <td>{score || 0}</td>
      </tr>
    );
  };

  const PlayerScores = () => {
    if (!playerStats) {
      return <div>No player scores yet!</div>;
    }
    const scores = playerStats.sort((a, b) => {
      return b.score - a.score;
    });
    return (
      <table className="table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((player, index) => {
            return (
              <PlayerScoreRow key={index} player={player} rank={index + 1} />
            );
          })}
        </tbody>
      </table>
    );
  };

  const GameActions = () => {
    return (
      <div className="card mt-4 w-full bg-neutral md:basis-1/4">
        {/* <button className="btn-secondary btn" onClick={handleSignOut}>
          Sign Out
        </button> */}

        {gameComplete && (
          <button className="btn-primary btn" onClick={handlePlayAgain}>
            Play Again
          </button>
        )}
      </div>
    );
  };

  const playerScoreModalClass = showPlayerScores ? "modal modal-open" : "modal";

  return (
    <div className="container">
      <div className="flex flex-wrap justify-between">
        <div className="basis-3/4 pr-6">
          {!signedIn ? <StartTriviaCard /> : <StatusCard />}
          {selectedCategory ? <ShowQuestion /> : ""}
          {newGame && unanswered.length > 0 ? (
            <div>Waiting on: {unanswered.map((p, i) => p.name).join(", ")}</div>
          ) : (
            <ShowAnswer />
          )}
          {answerImg && <img src={answerImg} alt="answer-img" />}
        </div>
        <div className="basis-1/4">
          <div className={cardClass}>
            <div className="card-body">
              <div className="flex justify-between">
                <h2 className="card-title">Players</h2>
                <label
                  className="btn"
                  onClick={() => setShowPlayerScores(true)}
                >
                  Stats
                </label>
              </div>

              <ul>
                {players.map((player, index) => {
                  return (
                    <li key={index}>
                      <PlayerStatus player={player} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <GameActions />
          {gameComplete ? <div>Game Complete</div> : ""}
        </div>
      </div>
      <div className={playerScoreModalClass}>
        <div className="modal-box relative">
          <label
            className="btn-sm btn-circle btn absolute right-2 top-2"
            onClick={() => setShowPlayerScores(false)}
          >
            ✕
          </label>
          <h3 className="text-lg font-bold">Winner's Circle</h3>
          <PlayerScores />
        </div>
      </div>
    </div>
  );
}
