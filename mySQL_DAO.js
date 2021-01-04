var mysql = require('promise-mysql');
var pool;

mysql.createPool({
    connectionLimit : 7,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'geography'
})
.then((result) => {
    pool = result;
})
.catch((error) => {
    console.log(error);
});

// Query to return all Countries
var getAllCountries = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM country')
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Query to return all Cities
var getAllCities = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM city')
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Add a country to database
var addCountry = function(countryCode, countryName, countryDetails) {
    return new Promise((resolve, reject) => { 
        if (countryCode.length < 1) { // Ensure Country Code cannot be left blank (Database rules will not allow a null so returns an error)
            countryCode = null;
        }
        if (countryName.length < 1) { // Ensure Country Namer cannot be left blank (Database rules will not allow a null so returns an error)
            countryName = null;
        }
        var insertCountry = {
            sql:'INSERT INTO country VALUES (?, ?, ?)',
            values: [countryCode, countryName, countryDetails]
        };
        pool.query(insertCountry)
            .then((insertData) => {
                resolve(insertData);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Update a country on database
var updateCountry = function(countryName, countryDetails, countryCode) {
    return new Promise((resolve, reject) => {
        var updateQuery = {
            sql: 'UPDATE country SET co_name = ?, co_details = ? WHERE co_code = ?',
            values: [countryName, countryDetails, countryCode]
        }
        pool.query(updateQuery)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Delete a country on database
var deleteCountry = function(countryCode) {
    return new Promise((resolve, reject) => {
        var delQuery = {
            sql: 'DELETE FROM country WHERE co_code = ?',
            values: [countryCode]
        }
        pool.query(delQuery)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Query to return a specific Country from the database
var getSpecificCountry = function(countryCode) {
    return new Promise((resolve, reject) => {
        var countryQuery = {
            sql: 'SELECT * FROM country WHERE co_code = ?',
            values: [countryCode]
        }
        pool.query(countryQuery)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Query that returns details about a particular city
var getSpecificCityDetails = function(cityCode) {
    return new Promise((resolve, reject) => {
        var cityQuery = {
            sql: 'SELECT C.cty_code, C.cty_name, C.population, C.isCoastal, C.areaKM, CO.co_code, CO.co_name FROM city ' +
                    'C LEFT JOIN country CO ON C.co_code = CO.co_code WHERE C.cty_code = ?',
            values: [cityCode]
        }
        pool.query(cityQuery)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Delete a city from the database
var deleteCity = function(cityCode) {
    return new Promise((resolve, reject) => {
        var delQuery = {
            sql: 'DELETE FROM city WHERE cty_code = ?',
            values: [cityCode]
        }
        pool.query(delQuery)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Export
module.exports = { 
    getAllCountries, getAllCities, addCountry, getSpecificCountry, getSpecificCityDetails, 
    deleteCountry, updateCountry, deleteCity
}