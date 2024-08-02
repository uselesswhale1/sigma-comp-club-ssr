const db = require("./db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const find = async (email) => {
  const GET_USERS_QUERY = `SELECT * FROM users`;
  const WHERE = ` WHERE email = "${email}";`;

  const [users] = await db.promise().query(GET_USERS_QUERY + WHERE);

  return users[0];
};

const create = async ({ name, email, password }) => {
  try {
    // high coupling, function should not be there
    const hashedP = await bcrypt.hash(password, SALT_ROUNDS);

    return await createUser({ name, email, password: hashedP })
  } catch (error) {
    console.error(error);
  }
};

const createUser = async ({ name, email, password }, isAdmin = 0) => {
  try {
    const values = `"${name}", "${email}", "${password}", ${isAdmin}`;
    const sql = `INSERT INTO users(name, email, password, isAdmin) VALUES (${values});`

    return await db.promise().query(sql)
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  create,
  find
}