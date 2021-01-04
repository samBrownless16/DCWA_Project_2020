const express = require('express');
const ejs = require('ejs');
var bodyParser = require('body-parser');
const mySQL_DAO = require('./mySQL_DAO');
const mongo_DAO = require('./mongo_DAO');

const app = express();
app.use("/stylesheets", express.static(__dirname + "/stylesheets"));
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.locals.errorDesc = "";

app.listen(3007, () => {
    console.log("Listening on Port 3007");
});

app.get('/', (req, res) => { 
    res.render('main_Page');
});

app.get('/listCountries', (req, res) => {
    mySQL_DAO.getAllCountries()
    .then((result) => {
        res.render('countries_Page', {countries:result, code:"Good"});
    })
    .catch((error) => {
        if (error.code == "ECONNREFUSED") {
            res.render('countries_Page', {call:error.syscall, code:error.code, address:error.address, portNum:error.port});
        } else {
            res.send(error);
        }
    });
});

app.get('/addcountry', (req, res) => { 
    res.render('add_Country_Page');
    app.locals.errorDesc = "";
});

app.post('/addcountry', (req, res) => {
    mySQL_DAO.addCountry(req.body.country_code, req.body.country_name, req.body.country_details)
    .then((result) => {
        res.redirect('/listCountries');
    })
    .catch((error) => {
        if (error.code == "ER_DUP_ENTRY") {
            app.locals.errorDesc = ("Error: " + req.body.country_code + " already exists");
            res.redirect('/addcountry');
        } else if (error.code == "ER_BAD_NULL_ERROR") {
            if (req.body.country_code.length < 1) {
                app.locals.errorDesc = "Country Code must be 3 characters";
            } else if (req.body.country_name.length < 1) {
                app.locals.errorDesc = "Country Name must be at least 3 characters";
            }
            res.redirect('/addcountry');
        } else {
            res.send(error);
        }
    });
});

app.get('/editcountry/:country', (req, res) => { 
    mySQL_DAO.getSpecificCountry(req.params.country)
    .then((result) => {
        res.render('edit_Country_Page', {countryDetails:result});
    })
    .catch((error) => {
        res.send(error);
    });
});

app.post('/editcountry/:country', (req, res) => {
    mySQL_DAO.updateCountry(req.body.country_name, req.body.country_details, req.params.country)
    .then((result) => {
        res.redirect('/listCountries');
    })
    .catch((error) => {
        res.send(error);
    });
});

app.get('/deletecountry/:country', (req, res) => {
    mySQL_DAO.deleteCountry(req.params.country)
    .then((result) => {
        res.redirect('/listCountries');
    })
    .catch((error) => {
        if (error.code == "ER_ROW_IS_REFERENCED_2") {
            res.render('deletion_error_Page', {countryRef:req.params.country});
        } else {
            res.send(error);
        }
    });
});

app.get('/listCities', (req, res) => { 
    mySQL_DAO.getAllCities()
    .then((result) => {
        res.render('cities_Page', {cities:result, code:"Good"});
    })
    .catch((error) => {
        if (error.code == "ECONNREFUSED") {
            res.render('countries_Page', {call:error.syscall, code:error.code, address:error.address, portNum:error.port});
        } else {
            res.send(error);
        }
    });
});

app.get('/alldetails/:city', (req, res) => { 
    mySQL_DAO.getSpecificCityDetails(req.params.city)
    .then((result) => {
        res.render('show_City_Details', {cityDetails:result});
    })
    .catch((error) => {
        res.send(error);
    });  
});

app.get('/deletecity/:city', (req, res) => {
    mySQL_DAO.deleteCity(req.params.city)
    .then((result) => {
        res.redirect('/listCities');
    })
    .catch((error) => {
        res.send(error);
    });
});

app.get('/listHeadsOfState', (req, res) => { 
    mongo_DAO.getAllStateLeaders()
    .then((result) => {
        res.render('heads_Of_State_Page', {leaders:result, code:"Good"});
    })
    .catch((error) => {
        if (error.message.includes("ECONNREFUSED")) {
            res.render('heads_Of_State_Page', {code:"ECONNREFUSED"});
        } else {
            res.send(error);
        }
    });
});

app.get('/addleader', (req, res) => { 
    res.render('add_Leader_Page');
    app.locals.errorDesc = "";
});

app.post('/addleader', (req, res) => {
    if (req.body._id.length > 0 && req.body.state_head.length > 0) { // Check that these values are not blank
        mySQL_DAO.getSpecificCountry(req.body._id) // Check Country is in mySQL database table
        .then((sqlResult) => {
            if (sqlResult.length > 0) { // Country in table continue to add a State Leader to the mongo database
                mongo_DAO.addStateLeader(req.body._id, req.body.state_head)
                .then((result) => { 
                    res.redirect('/listHeadsOfState');
                })
                .catch((error) => {
                    if (error.message.includes("11000")) {
                        app.locals.errorDesc = (req.body._id + " already has a Head of State");
                        res.redirect('/addleader');
                    } else {
                        res.send(error);
                    }
                });
            } else { // Country not in table redirect back to page with error message
                app.locals.errorDesc = ("Cannot add Head of State to " + req.body._id + " as this country is not in MySQL database");
                res.redirect('/addleader');
            }
        })
        .catch((sqlError) => {          
            res.send(sqlError);
        });
    } else { // Values are blank redirect back to page with error message
        if (req.body._id.length < 1) {
            app.locals.errorDesc = "Country Code must be 3 characters";
        } else if (req.body.state_head.length < 1) {
            app.locals.errorDesc = "Head of State must be at least 3 characters";
        }
        res.redirect('/addleader');
    }
});

app.get('/editleader/:countryCode', (req, res) => { 
    mongo_DAO.getSpecificStateLeader(req.params.countryCode)
    .then((result) => {
        res.render('edit_Leader_Page', {leaderDetails:result});
    })
    .catch((error) => {
        res.send(error);
    });
});

app.post('/editleader/:countryCode', (req, res) => {
    mongo_DAO.updateStateLeader(req.params.countryCode, req.body.state_head)
    .then((result) => {
        res.redirect('/listHeadsOfState');
    })
    .catch((error) => {
        res.send(error);
    });
});

app.get('/deleteleader/:countryCode', (req, res) => {
    mongo_DAO.removeStateLeader(req.params.countryCode)
    .then((result) => {
        res.redirect('/listHeadsOfState');
    })
    .catch((error) => {
        res.send(error);
    });
});