import useWebSocket from "react-use-websocket";
import { fetchNewGame } from "~/services/bowpourri";

// const wsUrl = process.env.WEBSOCKET_API || "";
const wsUrl = "wss://lionfish-app-si2ii.ondigitalocean.app";

export default function TriviaIndex() {
  useWebSocket(wsUrl, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
  });
  // const completion = async () => {
  //   const resp = await openai.createCompletion({
  //     model: "text-davinci-003",
  //     prompt: "Hello world",
  //   });
  //   console.log(resp.data.choices[0].text);
  //   return resp;
  // };

  const handleNewGame = async () => {
    const resp = await fetchNewGame();
  };

  return (
    <div className="container">
      <div className="card glass w-96">
        {/* <figure>
    <img src="/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="car!"/>
    </figure> */}
        <div className="card-body">
          <h2 className="card-title">Bowpourri</h2>
          <div className="card-actions justify-end">
            <button onClick={handleNewGame} className="btn-primary btn">
              Start!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
