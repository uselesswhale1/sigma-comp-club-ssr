const db = require("./db");

const find = async (id) => {
  const [clubs] = await db.promise().query(`SELECT * FROM clubs WHERE clubs.id = ${id};`);

  return clubs[0];
};

const findByAdmin = async (adminId) => {
  const clubCols = "clubs.id, clubs.name, clubs.address, clubs.desksAmount";

  const sql = `SELECT ${clubCols} FROM clubs WHERE clubs.adminId=${adminId};`;

  const [clubs] = await db.promise().query(sql);

  return clubs[0];
};

const getDetailed = async (_, uid) => {
  try {
    const colsClub = "clubs.id, clubs.name, clubs.address, clubs.desksAmount, clubs.adminId";
    const colsUser = "users.name AS adminName, users.email";

    const joinUsers = "LEFT JOIN users ON clubs.adminId = users.id";

    const sql = `SELECT ${colsClub},${colsUser} FROM clubs ${joinUsers};`;

    const [clubs] = await db.promise().query(sql);

    const colsComp = "clubId, COUNT(computers.clubId) as total,SUM(computers.isOccupied) as occupied, SUM(computers.isStashed) as stashed";
    const sqlComps = `SELECT ${colsComp} FROM computers GROUP BY clubId;`;

    const [comps] = await db.promise().query(sqlComps);

    const data = await clubs.map((club) => {
      const comp = comps.find((cp) => cp.clubId === club.id);
      return { ...club, ...comp, isAdmin: club.adminId === uid }
    });

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

module.exports = {
  find,
  findByAdmin,
  getDetailed
};