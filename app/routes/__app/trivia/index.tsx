import { openai } from "~/models/trivia.server";

export default function TriviaIndex() {
  const completion = async () => {
    const resp = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Hello world",
    });
    console.log(resp.data.choices[0].text);
    return resp;
  };

  return <h2>New Game</h2>;
}
