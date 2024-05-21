const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const sqlite = require('sqlite3').verbose();
const url = require("url");
let sql;

const db = new sqlite.Database("./database.db", sqlite.OPEN_READWRITE, (err) => {
    if(err) return console.error(err);
});

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.post('/collectors', (req, res) => {
    try {
        const { name, email, password, country, city, sex, about } = req.body;

        const sqlUser = `
            INSERT INTO User (name, email, password, country, city, sex, about)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sqlUser, [name, email, password, country, city, sex, about], function(err) {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err.message
                });
            }

            const userID = this.lastID;

            const sqlCollector = "INSERT INTO Collector(userID) VALUES (?)";
            db.run(sqlCollector, [userID], function(err) {
                if (err) {
                    console.error('Error inserting collector into database:', err);
                    return res.json({
                        status: 300,
                        success: false,
                        error: err.message
                    });
                }

                const sqlSelectUser = "SELECT * FROM User WHERE userID = ?";
                db.get(sqlSelectUser, [userID], (err, row) => {
                    if (err) {
                        console.error('Error fetching user from database:', err);
                        return res.json({
                            status: 300,
                            success: false,
                            error: err.message
                        });
                    }

                    console.log('Successful input for collector with userID:', userID);
                    return res.json({
                        status: 200,
                        success: true,
                        data: row
                    });
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});


app.post('/collectors/update', (req, res) => {
    try {
        const { userID, name, email, password, country, city, sex, about } = req.body;

        let sqlUpdateUser = `
            UPDATE User 
            SET name = ?, email = ?, password = ?, country = ?, city = ?, sex = ?, about = ?
            WHERE userID = ?
        `;
        db.run(sqlUpdateUser, [name, email, password, country, city, sex, about, userID], function(err) {
            if (err) {
                console.error('Error updating user in the database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err
                });
            }

            console.log('Successful update for user with userID:', userID);

            let sqlSelectUser = `
                SELECT * FROM User
                WHERE userID = ?
            `;
            db.get(sqlSelectUser, [userID], (err, row) => {
                if (err) {
                    console.error('Error retrieving user from the database:', err);
                    return res.json({
                        status: 300,
                        success: false,
                        error: err
                    });
                }

                return res.json({
                    status: 200,
                    success: true,
                    data: row
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});



app.get('/collectors', (req, res) => {
    try {
        const queryObject = url.parse(req.url, true).query;
        const userEmail = queryObject.email;

        let sql = `
            SELECT 
                User.userID, 
                User.name, 
                User.email,
                User.password,
                User.country, 
                User.city,
                User.sex,
                User.about
            FROM 
                Collector
            JOIN 
                User 
            ON 
                Collector.userID = User.userID
            WHERE 
                User.email = ?
        `;

        db.get(sql, [userEmail], (err, row) => {
            if (err) {
                console.error('Error retrieving collectors from database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err
                });
            }

            if (!row) {
                return res.json({
                    status: 404,
                    success: false,
                    message: 'Collector not found'
                });
            }

            return res.json({
                status: 200,
                success: true,
                data: row
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});



app.post('/artists', (req, res) => {
    try {
        const { name, email, password, country, city, sex, about } = req.body;

        let sqlUser = "INSERT INTO User (name, email, password, country, city, sex, about) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.run(sqlUser, [name, email, password, country, city, sex, about], function(err) {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err
                });
            }

            const userID = this.lastID;

            let sqlArtist = "INSERT INTO Artist(userID) VALUES (?)";
            db.run(sqlArtist, [userID], (err) => {
                if (err) {
                    console.error('Error inserting artist into database:', err);
                    return res.json({
                        status: 300,
                        success: false,
                        error: err
                    });
                }

                console.log('Successful input for artist with userID:', userID);
                return res.json({
                    status: 200,
                    success: true,
                    userID: userID
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});


app.get('/artists', (req, res) => {
    try {
        const queryObject = url.parse(req.url, true).query;
        const userID = queryObject.userID;

        let sql = `
            SELECT 
                User.userID, 
                User.name, 
                User.email,
                User.password,
                User.country, 
                User.city,
                User.sex,
                User.about
            FROM 
                Artist
            JOIN 
                User 
            ON 
                Artist.userID = User.userID
            WHERE 
                User.userID = ?
        `;

        db.get(sql, [userID], (err, row) => {
            if (err) {
                console.error('Error retrieving artist from database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err
                });
            }

            if (!row) {
                return res.json({
                    status: 404,
                    success: false,
                    message: 'Artist not found'
                });
            }

            return res.json({
                status: 200,
                success: true,
                data: row
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});


app.post('/arts', (req, res) => {
    try {
        const { name, price, image_path, creatorID } = req.body;

        let sqlCheckArtist = "SELECT * FROM Artist WHERE userID = ?";
        db.get(sqlCheckArtist, [creatorID], (err, row) => {
            if (err) {
                console.error('Error checking artist from database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err
                });
            }

            if (!row) {
                return res.json({
                    status: 400,
                    success: false,
                    error: 'Artist with specified creatorID not found'
                });
            }

            let sqlArt = "INSERT INTO Art (name, price, image_path, creatorID) VALUES (?, ?, ?, ?);";
            db.run(sqlArt, [name, price, image_path, creatorID], function(err) {
                if (err) {
                    console.error('Error inserting art into database:', err);
                    return res.json({
                        status: 300,
                        success: false,
                        error: err
                    });
                }

                console.log('Successful input for art');
                return res.json({
                    status: 200,
                    success: true,
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});



app.get('/arts/available_arts', (req, res) => {
    sql = "SELECT * FROM Art WHERE buyerID IS NULL";
    try {
        db.all(sql, [], (err, rows)=>{
            if(err) {
                return res.json({status: 300, success: false, error: err});
            }

            if(rows.length < 1) {
                return res.json({status: 300, success: false, error: "No match"}); 
            }

            return res.json({ 
                status: 200,
                data:rows,
                success: true
            });

        })
    } catch (error) {
        return res.json({
            status: 400,
            success: false
        });
    }
});



app.post('/arts/buy', (req, res) => {
    try {
        const { artID, buyerID } = req.body;

        let sqlCheckCollector = "SELECT * FROM Collector WHERE userID = ?";
        db.get(sqlCheckCollector, [buyerID], (err, row) => {
            if (err) {
                console.error('Error checking collector from database:', err);
                return res.json({
                    status: 300,
                    success: false,
                    error: err
                });
            }

            if (!row) {
                return res.json({
                    status: 400,
                    success: false,
                    error: 'Collector with specified buyerID not found'
                });
            }

            let sqlArt = `UPDATE Art SET buyerID = ? WHERE artID = ? `;
            db.run(sqlArt, [buyerID, artID], function(err) {
                if (err) {
                    console.error('Error buying art:', err);
                    return res.json({
                        status: 300,
                        success: false,
                        error: err
                    });
                }

                console.log('Successful buy for art');
                return res.json({
                    status: 200,
                    success: true,
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});


app.get('/collectors/collection', (req, res) => {
    try {
        const queryObject = url.parse(req.url, true).query;
        const buyerID = queryObject.buyerID;

        let sql = `
            SELECT 
                Art.artID,
                Art.name,
                Art.image_path,
                Art.price,
                Art.buyerID,
                Art.creatorID
            FROM 
                Art
            LEFT JOIN 
                Collector
            ON 
                Art.buyerID = Collector.userID
            WHERE 
                Collector.userID = ?
        `;

        db.all(sql, [buyerID], (err, rows) => {
            if(err) {
                return res.json({status: 300, success: false, error: err});
            }

            if(rows.length < 1) {
                return res.json({status: 300, success: false, error: "No match"}); 
            }

            return res.json({ 
                status: 200,
                data: rows,
                success: true
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});

