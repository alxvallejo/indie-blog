// const apiUrl = "https://lionfish-app-si2ii.ondigitalocean.app";
const apiUrl = "http://localhost:8000";

export const fetchNewGame = async () => {
  const url = apiUrl + "/newGame";
  const resp = await fetch(url);
};
