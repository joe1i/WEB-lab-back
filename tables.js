const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database("./database.db", sqlite.OPEN_READWRITE, (err) => {
    if(err) return console.error(err);
});


const sql_user = `CREATE TABLE User (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    password TEXT,
    country TEXT,
    city TEXT,
    sex TEXT,
    about TEXT
)`;

const sql_collector = `CREATE TABLE Collector (
    userID INTEGER PRIMARY KEY,
    FOREIGN KEY (userID) REFERENCES User(userID)
)`;

const sql_artist = `CREATE TABLE Artist (
    userID INTEGER PRIMARY KEY,
    FOREIGN KEY (userID) REFERENCES User(userID)
)`;

const sql_art = `CREATE TABLE Art (
    artID  INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    image_path TEXT,
    price INTEGER,
    buyerID INTEGER,
    creatorID INTEGER,
    FOREIGN KEY (buyerID) REFERENCES Collector(userID),
    FOREIGN KEY (creatorID) REFERENCES Artist(userID)
)`;

const sql_update = `UPDATE Art SET buyerID = NULL WHERE artID = 4`

db.run(sql_update);

