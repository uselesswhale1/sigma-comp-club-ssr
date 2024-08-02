const db = require("./db");

const getGames = async () => {
  const GET_GAMES_QUERY = "SELECT * FROM games";

  try {
    const [res] = await db.promise().query(GET_GAMES_QUERY);

    return res;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getGames,
  getDetailed: getGames
};
