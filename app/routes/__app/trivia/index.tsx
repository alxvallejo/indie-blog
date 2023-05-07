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
  "card mt-4 w-full bg-neutral md:basis-1/4 text-neutral-content";

const categories = [
  {
    label: "Computer Science",
    class: "btn-info",
  },
  {
    label: "History",
    class: "btn-warning",
  },
  {
    label: "Science",
    class: "btn-secondary",
  },
  {
    label: "Sports",
    class: "btn-success",
  },
  {
    label: "Entertainment",
    class: "btn-accent",
  },
  {
    label: "Current Events",
    class: "btn-primary",
  },
];

export default function TriviaIndex() {
  const user = useUser();
  const [userData, setUserData] = useState();
  const [signedIn, setSignedIn] = useState(false);
  const [players, setPlayers] = useState([]);
  console.log("players: ", players);
  const [selectedCategory, setSelectedCategory] = useState();
  const [yesterdaysWinner, setYesterdaysWinner] = useState();
  const [newGame, setNewGame] = useState();
  const [newGameError, setNewGameError] = useState();
  const [playerScores, setPlayerScores] = useState();
  const [playerScoreError, setPlayerScoreError] = useState();
  const [showPlayerScores, setShowPlayerScores] = useState(false);
  const [selectedOption, setSelectedOption] = useState();
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState();
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
  };

  const handlePlayAgain = () => {
    setSignedIn(false);
    setSelectedCategory();
    setNewGame();
    setNewGameError();
    setPlayers();
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

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on("message", (msg) => {
      console.log("msg: ", msg);
    });
    socket.on("players", setPlayers);
    socket.on("category", setSelectedCategory);
    socket.on("newGame", setNewGame);
    socket.on("newGameError", setNewGameError);
    socket.on("playerScores", handlePlayerScores);
    socket.on("playerScoreError", setPlayerScoreError);
    socket.on("answer", setCorrectAnswer);
    socket.on("signOut", onSignOut);
    socket.on("resetGame", handleResetGame);
  }, [socket]);

  useEffect(() => {
    return () => {
      console.log("Disconnect on tab close");
      // Remove yourself from players list
      console.log("userData on disconnect: ", userData);
      socket.emit("signOut", userData?.email);
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

  const handleSignOut = () => {
    console.log("userData: ", userData);
    socket.emit("signOut", userData.email);
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
        <div className="flex flex-col items-start">
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
    return (
      <button
        className={className}
        onClick={() => socket.emit("category", category.label)}
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
          <div className="card prose glass">
            <div className="card-body">
              <h3>Today's Category:</h3>
              <h2>{selectedCategory}</h2>
            </div>
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
    const { email, answered, playerData, isCorrect } = player;
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
        {email} {answerIcon}
      </div>
    );
  };

  const PlayerScoreRow = ({ player, rank }) => {
    const { playerData, name } = player;
    return (
      <tr>
        <td>{rank}</td>
        <td>{name}</td>
        <td>{playerData?.score || 0}</td>
      </tr>
    );
  };

  const PlayerScores = () => {
    const playerScores = players.sort((a, b) => {
      return b.playerData?.score - a.playerData?.score;
    });
    return (
      <table className="table w-full bg-neutral text-neutral-content">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {playerScores.map((player, index) => {
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

        {playerScores && (
          <button className="btn-primary btn" onClick={handlePlayAgain}>
            Play Again
          </button>
        )}
      </div>
    );
  };

  const playerScoreModalClass = showPlayerScores ? "modal model-open" : "modal";

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
        </div>
        <div className="basis-1/4">
          <div className={cardClass}>
            <div className="card-body">
              <div className="flex justify-between">
                <h2 className="card-title">Players</h2>
                {players.length > 0 && (
                  <label htmlFor="my-modal" className="btn">
                    Stats
                  </label>
                )}
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
        </div>
      </div>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className={playerScoreModalClass}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            Congratulations on completing today's standup Bowpourri!
          </h3>
          <PlayerScores />
        </div>
      </div>
    </div>
  );
}
