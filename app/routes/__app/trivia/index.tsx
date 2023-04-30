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

const socket = io.connect("http://localhost:4000");

// const wsUrl = process.env.WEBSOCKET_API || "";
// const wsUrl = "wss://lionfish-app-si2ii.ondigitalocean.app";
// const wsUrl = "wss://localhost:8000";

// export async function loader({ request }: LoaderArgs) {
//   // const userId = await requireUserId(request);
//   const wsUrl = process.env.WEBSOCKET_API || "ws://localhost:8000";
//   return json({ wsUrl });
// }

const MIN_PLAYERS = 1;
const COUNTDOWN_SECONDS = 5;
const ANSWER_BUFFER = 5;

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
  const [selectedCategory, setSelectedCategory] = useState();
  const [yesterdaysWinner, setYesterdaysWinner] = useState();
  const [newGame, setNewGame] = useState();
  const [selectedOption, setSelectedOption] = useState();
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState();
  // const [categories, setCategories] = useState([]);
  // const [selectedCategory, setSelectedCa]
  // const { wsUrl } = useLoaderData<typeof loader>();

  useEffect(() => {
    socket.on("message", (msg) => {
      console.log("msg: ", msg);
    });
    socket.on("players", setPlayers);
    socket.on("category", setSelectedCategory);
    socket.on("newGame", setNewGame);
    socket.on("answer", setCorrectAnswer);
  }, []);

  useEffect(() => {
    // console.log("websocket url", getWebSocket().url);
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
    if (selectedOption) {
      socket.emit("answer", selectedOption);
    }
  }, [selectedOption]);

  const handleSignIn = () => {
    if (userData) {
      console.log("userData: ", userData);
      socket.emit("signIn", userData);
    }
  };

  const StartTriviaCard = () => {
    return (
      <div className="card w-96">
        <div className="card-body">
          <h2 className="card-title">Bowpourri</h2>
          <div className="card-actions justify-end">
            <button onClick={handleSignIn} className="btn-primary btn">
              Start!
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleCountdown = ({ seconds, completed }) => {
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
    const className = `btn btn-outline ${category.class}`;
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
          <div>
            <h3>Today's Category:</h3>
            <h2>{selectedCategory}</h2>
          </div>
        );
      }
      return (
        <div>
          Choose a category:
          <div className="flex flex-row justify-between">
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
    const { email, answered, playerData } = player;
    console.log("player: ", player);
    let answerIcon;
    if (correctAnswer) {
      const isCorrect = correctAnswer.option == selectedOption;
      if (isCorrect) {
        answerIcon = <CheckBadgeIcon className="h-6 w-6 text-green-500" />;
      } else {
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

  return (
    <div className="container">
      <div className="flex flex-row justify-between">
        <div className="basis-3/4 pr-6">
          {!signedIn ? <StartTriviaCard /> : <StatusCard />}
          {selectedCategory ? <ShowQuestion /> : ""}
          {newGame && unanswered.length > 0 ? (
            <div>Waiting on: {unanswered.map((p, i) => p.name).join(", ")}</div>
          ) : (
            <ShowAnswer />
          )}
        </div>

        <div className="card glass w-96">
          <div className="card-body">
            <h2 className="card-title">Players</h2>
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
      </div>
    </div>
  );
}
