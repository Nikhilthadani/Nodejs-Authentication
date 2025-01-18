export const GET_USERS_QUERY = `SELECT * FROM users`;
export const GET_USER_BY_ID = `SELECT * FROM users where id = ?`;
export const INSERT_USER_STATEMENT = `INSERT INTO users 
(name,email,password),
VALUES (?,?,?)
`;
