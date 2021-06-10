const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

require('dotenv').config();

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// CONNEXION A LA BASE DE DONNEE MONGODB Atlas

mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@'+process.env.DB_CLUSTER+'.mongodb.net/'+process.env.DB_NAME+'?retryWrites=true&w=majority',
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// On set LE HEADER POUR ACCEPTER LES CONNEXIONS DE TOUTES ORIGINES ET AUTORISER TOUTES LES METHODES
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));


app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

app.use(helmet());
app.use('/api/', rateLimit);

module.exports = app;
