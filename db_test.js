var mysql = require('mysql2');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "test"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
    con.query("SELECT * FROM Users;", function(err, result, fields) {
        if (err) throw err;
        console.log(result);
	con.end();
    })
});

