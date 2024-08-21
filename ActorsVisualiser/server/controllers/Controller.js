const Model = require('../models/Model');
const { getPostData } = require('../utils');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');

async function getUsers(req, res) {
    console.log("Controller!");

    const users = await Model.findAll();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(users));
    res.end();

}

async function login(req, res) {
    console.log("Controller!");

    const body = await getPostData(req);
    const username = JSON.parse(body).username;
    const password = JSON.parse(body).password;


    const validUser = await Model.checkUser(username, password);

    if (validUser) {
        console.log("Valid user!");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Valid user!" }));
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User not found" }));
        res.end();
    }
}

async function loginAdmin(req, res) {
    console.log("login admin Controller!");

    const body = await getPostData(req);
    const name = JSON.parse(body).name;
    const password = JSON.parse(body).password;
    const key = JSON.parse(body).key;


    const validAdmin = await Model.checkAdmin(name, password, key);

    if (validAdmin) {
        console.log("Valid admin!");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Valid admin!" }));
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Admin not found" }));
        res.end();
    }
}

async function register(req, res) {
    console.log("Controller!");

    const body = await getPostData(req);
    const username = JSON.parse(body).username;
    const password = JSON.parse(body).password;
    const confirmPassword = JSON.parse(body).confirmPassword;
    const email = JSON.parse(body).email;

    // Validate input
    if (!username || !password || !confirmPassword || !email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Missing fields" }));
        res.end();
        return;
    }

    if (password !== confirmPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Passwords do not match" }));
        res.end();
        return;
    }

    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Invalid email" }));
        res.end();
        return;
    }

    const existingEmail = await Model.getUserByEmail(email);
    if (existingEmail) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "An user with this email already exists" }));
        res.end();
        return;
    }

    const existingUser = await Model.getUserByUsername(username);
    if (existingUser) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Username already exists" }));
        res.end();
        return;
    }

    const newUser = await Model.createUser(username, password, email);
    if (newUser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User created!" }));
        res.end();
        return;
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User not created" }));
        res.end();
        return;
    }
}

async function deleteUser(req, res, userid) {
    console.log("delete user Controller!");

    const user = await Model.deleteUser(userid);

    if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User deleted!" }));
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User not found" }));
        res.end();
    }

}

async function changeUserPassword(req, res, userid) {   
    console.log("change user password Controller!");

    try {
        const body = await getPostData(req);
        const newPassword = JSON.parse(body).password;
        console.log(newPassword);

        // Validate input
        if (!newPassword) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: "Password is required" }));
            res.end();
            return;
        }

        const user = await Model.changeUserPassword(userid, newPassword);

        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: "Password changed successfully!" }));
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: "User not found" }));
            res.end();
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
    }
}

async function getCategories(req, res) {
    console.log("Fetching categories!");

    try {
        const categories = await Model.getCategories();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(categories));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function getYears(req, res) {
    console.log("Fetching years!");

    try {
        const years = await Model.getYears();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(years));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return; 
    }
}

async function getSeriesCategories(req, res) {
    console.log("Fetching categories containing 'series'");

    try {
        const categories = await Model.getSeriesCategories();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(categories));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function getAwardsInfo(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const category = url.searchParams.get('category');
    const year = url.searchParams.get('year');
    let isSeriesFilter = false;
    if (category && category.toLowerCase().includes('series')) {
        isSeriesFilter = true;
    } else {
        isSeriesFilter = url.searchParams.get('seriesFilter') === 'true';
    }

    try {
        const awardsInfo = await Model.getAwardsInfo(category, year, isSeriesFilter);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(awardsInfo));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}


async function addActor(req, res) {
    console.log("add Actor Controller!");
    var flag = 0;
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ message: 'Internal Server Error' }));
            res.end();
            return;
        }
        try {
            const requiredFields = ['name', 'details', 'birthday', 'birthplace', 'knownfor'];
            for (const field of requiredFields) {
                if (!fields[field] || fields[field].length === 0 || fields[field][0].trim() === '') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ message: `${field} required.` }));
                    res.end();
                    return;
                }
            }

            const name = fields.name[0];
            const details = fields.details[0];
            const birthday = fields.birthday[0];
            const deathday = fields.deathday ? fields.deathday[0] : null;
            const birthplace = fields.birthplace[0];
            const knownfor = fields.knownfor[0];

            let actorImageFileName = null;
            if (files.image && files.image[0]) {
                const file = files.image[0];
                flag = 1;
                const validFormats = ['.jpg', '.jpeg', '.png', '.gif'];
                const fileExtension = path.extname(file.originalFilename).toLowerCase();
                if (!validFormats.includes(fileExtension)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ message: "Invalid file format. Only jpg, jpeg, png and gif formats are allowed." }));
                    res.end();
                    return;
                }
                const tempPath = file.path;
                actorImageFileName = `${Date.now()}-${file.originalFilename}`;
                const targetPath = path.join(__dirname, '../resources/', actorImageFileName);
                fs.renameSync(tempPath, targetPath);
            }

            // Extract movies data

            if (fields.movies) {
                var movies = JSON.parse(fields.movies);

                for (let i = 0; i < movies.length; i++) {
                    const fieldName = `movieImage${i + 1}`;
                    const movieFile = files[fieldName];
                    const movieImage = movies[i].image;

                    if (!(movieImage.endsWith('.jpg') || movieImage.endsWith('.jpeg') || movieImage.endsWith('.png') || movieImage.endsWith('.gif'))) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.write(JSON.stringify({ message: "Invalid file format. Only jpg, jpeg, png and gif formats are allowed." }));
                        res.end();
                        return;
                    }
                    if (movieFile && movieFile.length > 0) {
                        const file = movieFile[0];
                        const tempPath = file.path;
                        movies[i].image = `${Date.now()}-${file.originalFilename}`;
                        const targetPath = path.join(__dirname, '../resources/', movies[i].image);

                        fs.renameSync(tempPath, targetPath);
                    } else {
                        console.error(`File for ${fieldName} not found.`);
                    }
                }
            }
            try {
                const newActor = await Model.addActor(name, details, birthday, deathday, birthplace, knownfor, actorImageFileName, movies);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(newActor));
                res.end();
                return;
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: 'Internal Server Error' }));
                res.end();
                return;
            }
        } catch (error) {
            console.error("Error adding actor:", error);
            res.write(JSON.stringify({ message: 'Internal Server Error' }));
            res.end();
            return;
        }
    });
}

async function getActors(req, res) {
    console.log("Controller!");

    try {
        const actors = await Model.findAllActors();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(actors));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}
async function getActorsFromDb(req, res) {
    console.log("Fetching actors!");

    try {
        const actors = await Model.getActorsFromDb();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(actors));
        res.end();
        
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function getActorById(req, res, id) {
    console.log("get actor by id Controller!");

    try {
        const actor = await Model.findActorById(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(actor));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function getMoviesByActorId(req, res, id) {
    console.log("get movies by actor id Controller!");

    try {
        const movies = await Model.findMoviesByActorId(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(movies));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function getImage(req, res, imageName) {

    try {
        const image = await Model.getImage(imageName, res);

        if (image.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: "Image not found!" }));
            return;
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpg' })
            res.end(image);
            return;
        }
    } catch (error) {
        console.log(error)
    }

}

async function getMovieImage(req, res, imageName) {
    console.log("get movies Image Controller!");

    try {
        const image = await Model.getMovieImage(imageName, res);

        if (image.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: "Image not found!" }));
            return;
        } else {

            res.writeHead(200, { 'Content-Type': 'image/jpg' })
            res.end(image);
            return;
        }
    } catch (error) {
        console.log(error)
    }

}

async function addActorToFavourites(req, res) {
    console.log("add to fav Controller!");

    const body = await getPostData(req);
    const username = JSON.parse(body).username;
    const actorId = JSON.parse(body).actorId;

    const user = await Model.getUserByUsername(username);
    if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User not found" }));
        res.end();
        return;
    }

    try {
        await Model.addActorToFavourites(user.userid, actorId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Actor added to favourites!" }));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function removeActorFromFavourites(req, res) {
    console.log("Controller!");

    const body = await getPostData(req);
    const username = JSON.parse(body).username;
    const actorId = JSON.parse(body).actorId;

    const user = await Model.getUserByUsername(username);
    if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "User not found" }));
        res.end();
        return;
    }

    try {
        await Model.removeActorFromFavourites(user.userid, actorId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Actor removed from favourites!" }));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function getUserFavoritesActors(req, res, username) {
    console.log(" get fav Controller!");

    try {
        const favorites = await Model.getUserFavoritesActors(username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(favorites));
        res.end();
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error' }));
        res.end();
        return;
    }
}

async function fetchNews(req, res) {
    console.log("Fetching news!");
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    const actorName = url.searchParams.get('actorName');
    if (!actorName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'actorName query parameter is required' }));
        res.end();
        return;
    }

    try {
        const articles = await Model.fetchNewsArticles(actorName);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(articles));
        res.end();
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: 'Internal Server Error', error: error.message }));
        res.end();
    }
}
module.exports = {
    getUsers,
    login,
    loginAdmin,
    register,
    deleteUser,
    changeUserPassword,
    getCategories,
    getYears,
    getActors,
    getSeriesCategories,
    getAwardsInfo,
    addActor,
    getActorsFromDb,
    getMoviesByActorId,
    getActorById,
    getImage,
    getMovieImage,
    addActorToFavourites,
    removeActorFromFavourites,
    getUserFavoritesActors,
    fetchNews
};
