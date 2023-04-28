import { LoaderArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { fetchNewGame } from "~/services/bowpourri";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

// const wsUrl = process.env.WEBSOCKET_API || "";
// const wsUrl = "wss://lionfish-app-si2ii.ondigitalocean.app";
// const wsUrl = "wss://localhost:8000";

export async function loader({ request }: LoaderArgs) {
  // const userId = await requireUserId(request);
  const wsUrl = process.env.WEBSOCKET_API || "ws://localhost:8000";
  return json({ wsUrl });
}

export default function TriviaIndex() {
  const user = useUser();
  const [userData, setUserData] = useState();
  const [signedIn, setSignedIn] = useState(false);
  const [players, setPlayers] = useState([]);
  const { wsUrl } = useLoaderData<typeof loader>();

  const { sendMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket(wsUrl, {
      share: true,
      onOpen: () => {
        console.log("WebSocket connection established.");
      },
      onError: (e) => {
        console.log("WebSocket connection error.", e);
      },
      onClose: () => {
        console.log("WebSocket connection closed.");
      },
      onMessage: (e) => {
        const msg = JSON.parse(e.data);
        console.log("msg: ", msg);
        if (!msg.type) {
          return;
        }
        switch (msg.type) {
          case "players":
            setPlayers(msg.data);
          default:
            return;
        }
      },
      shouldReconnect: (closeEvent) => true,
    });
  // const completion = async () => {
  //   const resp = await openai.createCompletion({
  //     model: "text-davinci-003",
  //     prompt: "Hello world",
  //   });
  //   console.log(resp.data.choices[0].text);
  //   return resp;
  // };

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
    console.log('players: ', players);
    if (players && players.find(x => x.email == user.email)) {
      setSignedIn(true)
    } else {
      setSignedIn(false)
    }
  }, [players])

  useEffect(() => {
    console.log("readyState: ", readyState);
    if (readyState == 1) {
      sendJsonMessage({ message: "test" });
    }
  }, [readyState]);

  const handleNewGame = async () => {
    const resp = await fetchNewGame();
  };

  const handleSignIn = () => {
    if (userData) {
      console.log("userData: ", userData);
      sendJsonMessage({ type: "signIn", user: userData });
    }
  };

  const startTriviaCard = () => {
    return (
      <div className="card glass w-96">
        <div className="card-body">
          <h2 className="card-title">Bowpourri</h2>
          <div className="card-actions justify-end">
            <button onClick={handleSignIn} className="btn-primary btn">
              Start!
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusCard = () => {
    if (players.length < 3) {
      return (<div className="card glass w-96">
          <div className="card-body">
            <h2 className="card-title">Waiting for more players...</h2>
          </div>
        </div>)
    } else {
      return (<div className="card glass w-96">
          <div className="card-body">
            <h2 className="card-title">Let the game begin!</h2>
          </div>
        </div>)
    }
  }

  return (
    <div className="container">
      <div className="flex justify-between">
        {!signedIn ? (
          {startTriviaCard()}
        ) : (
          {statusCard()}
        )}
        
        <div className="card glass w-96">
          <div className="card-body">
            <h2 className="card-title">Players</h2>
            <ul>
              {players.map((player, index) => {
                return <li key={index}>{player.email}</li>;
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
