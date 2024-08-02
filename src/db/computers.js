
const db = require("./db");

const stash = async (id, stashReason) => {
  const sql = `UPDATE computers SET isOccupied = 0, isStashed = 1, stashReason = "${stashReason}" WHERE computers.id = ${id};`

  const [result] = await db.promise().query(sql);

  return result;
};

const unstash = async (id) => {
  const sql = `UPDATE computers SET isOccupied = 0, isStashed = 0, stashReason = NULL WHERE computers.id = ${id};`

  const [result] = await db.promise().query(sql);

  return result;
};

const book = async (id, occupantId) => {
  const sql = `UPDATE computers SET isOccupied= 1, occupantId= ${occupantId} WHERE computers.id = ${id};`

  const [result] = await db.promise().query(sql);

  return result;
};

const unbook = async (id) => {
  const sql = `UPDATE computers SET isOccupied = 0, occupantId = NULL WHERE computers.id = ${id};`

  const [result] = await db.promise().query(sql);

  return result;
};

const getAll = async () => {
  return db.promise().query("SELECT * FROM computers");
};

const find = async (id) => {
  const [items] = await db.promise().query(`SELECT * FROM computers WHERE computers.id = ${id}`)

  return items[0];
};

const getDetailed = async (cid, _, pcId) => {
  const CLUB_COMP_FIELDS = "computers.id, computers.name, computers.deskId, computers.isOccupied, computers.isStashed, computers.stashReason";
  const USER_FIELDS = "users.name AS occupantName, users.email as occupantEmail";
  const JOIN_USERS = `LEFT JOIN users ON computers.occupantId = users.id`;

  const GET_CLUB_COMPS_QUERY = `SELECT ${CLUB_COMP_FIELDS}, ${USER_FIELDS} FROM computers ${JOIN_USERS}`;

  let WHERE = ` WHERE computers.clubId=${cid}`;

  if (pcId) {
    WHERE += ` AND computers.id=${pcId}`;
  }

  const [items] = await db.promise().query(GET_CLUB_COMPS_QUERY + WHERE + ";");

  return items;
};

module.exports = {
  getAll,
  find,
  getDetailed,
  stash,
  unstash,
  book,
  unbook
};