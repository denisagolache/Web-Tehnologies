const pkg = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres', 
    password: 'STUDENT',
    database: 'AcVisDb',
    port: 5432,
});

function createTablesIfNotExists() {
    const createAwardsInfoTableQuery = `
    CREATE TABLE IF NOT EXISTS "awardsInfo" (
        year TEXT,
        category TEXT,
        full_name TEXT,
        show TEXT,
        won BOOLEAN,
        CONSTRAINT unique_award_entry UNIQUE (year, category, full_name, show)
    );`;

    const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS "users" (
        userid SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        favorites TEXT[] UNIQUE
    );`; 

    const createAdminsTableQuery = `
    CREATE TABLE IF NOT EXISTS "admins" (
        adminid SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL,
        key VARCHAR(50) NOT NULL
    );`; 

    const createAddedActorsTableQuery = `
    CREATE TABLE IF NOT EXISTS "addedActors" (
        id SERIAL PRIMARY KEY,
        actorName VARCHAR(50) NOT NULL,
        details VARCHAR(10000) NOT NULL,
        birthday DATE NOT NULL,
        deathday DATE,
        birthplace VARCHAR(50) NOT NULL,
        knownFor VARCHAR(10000) NOT NULL,
        image VARCHAR(1000),
        movies JSONB
    );`;

    pool.query(createAwardsInfoTableQuery, (err, res) => {
        if (err) {
            console.error('Error creating awardsInfo table', err.stack);
        } else {
            console.log('Table awardsInfo created or already exists');
            populateDatabase();
        }
    });

    pool.query(createUsersTableQuery, (err, res) => {
        if (err) {
            console.error('Error creating  users table', err.stack);
        } else {
            console.log('Table users created or already exists');
        }
    });

    pool.query(createAdminsTableQuery, (err, res) => {
        if (err) {
            console.error('Error creating admins table', err.stack);
        } else {
            console.log('Table admins created or already exists');
        }
    });

    pool.query(createAddedActorsTableQuery, (err, res) => {
        if (err) {
            console.error('Error creating addedActors table', err.stack);
        } else {
            console.log('Table addedActors created or already exists');
        }
    });
}

function populateDatabase() {
    const results = [];

    fs.createReadStream('screen_actor_guild_awards.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach(row => {
                const query = {
                    text: `INSERT INTO "awardsInfo" (year, category, full_name, show, won) 
                           VALUES ($1, $2, $3, $4, $5)
                           ON CONFLICT (year, category, full_name, show) DO NOTHING`,
                    values: [row.year, row.category, row.full_name, row.show, row.won === 'true']
                };

                pool.query(query, (err, res) => {
                    if (err) {
                        console.error('Error executing query', err.stack);
                    } else {
                        //console.log('Query executed successfully');
                    }
                });
            });
        });
}

pool.connect((err, client, done) => {
    if (err) throw err;
    console.log('Connected to the database');
    createTablesIfNotExists();
    done();
});

module.exports = pool;
