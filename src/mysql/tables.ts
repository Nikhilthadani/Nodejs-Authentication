export const CREATE_TABLE_USERS = `CREATE TABLE IF NOT EXISTS users(
id INT PRIMARY KEY AUTO_INCREMENT,
name varchar(32),
email varchar(55) UNIQUE,
password varchar(255))
`;
