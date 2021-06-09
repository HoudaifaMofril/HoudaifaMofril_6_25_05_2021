//LOGIQUE METIER
const Sauce = require('../models/sauce_schema');
const fs = require('fs');

// ROUTES POUR CREER ET ENREGISTRER SAUCES
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => res.status(201).json({message: 'Object saved !'}))
        .catch(error => res.status(400).json({error}));
};


// ROUTE POUR MODIFIER UNE SAUCE AVEC SON IDENTIFIANT
exports.modifySauce = (req,res) => {
    const sauceObject = req.file ?
        {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    } : { ...req.body };
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Object updated !'}))
        .catch( error => res.status(400).json({error}));
};

// ROUTE POUR SUPPRIMER UNE SAUCE AVEC SON IDENTIFIANT
exports.deleteSauce = (req,res) =>{

    Sauce.findOne({_id: req.params.id})
        .then(sauce =>{
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Object deleted !'}))
                    .catch(error => res.status(400).json({error}));
            });
        })
        .catch(error => res.status(500).json({error}));
};

// ROUTE API RECUPERER TOUTES LES SAUCES , TABLEAU DE SAUCES
exports.getAllSauce = (req, res, next) => {

    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

// ROUTE API POUR RECUPERER UNE SAUCE SPECIFIQUE AVEC SON ID
exports.getOneSauce = (req,res) =>{
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

// ROUTE STATUS LIKE SAUCE

exports.likeSauce = (req, res) => {
    //L'utilisateur annule ce qu'il aime ou ce qu'il n'aime pas // On supprimer l'utilisateur du tableau correspodnant

    switch(req.body.like){
        case 0:
            Sauce.findOne({_id: req.params.id})
                .then((sauceFound) => {
                    if (sauceFound.usersLiked.find((user) => user === req.body.userId)){
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { likes: -1},
                                $pull: {usersLiked: req.body.userId},
                                _id: req.params.id,
                            }
                        )
                            .then(() => {
                                res.status(200).json({message: 'Votre avis a été supprimé'})
                            })
                            .catch(error => res.status(400).json({error}))
                    };
                    if(sauceFound.usersDisliked.find((user) => user === req.body.userId)){
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { dislikes: -1},
                                $pull: {usersDisliked: req.body.userId},
                                _id: req.params.id,
                            }
                        )
                            .then(() => {
                                res.status(200).json({message: 'Votre avis a été supprimé'})
                            })
                            .catch((error) => res.status(400).json({error}))
                    };
                })
                .catch(error => res.status(400).json({error}));

            break;
        case 1 : // Si l'utilisateur aime, on ajouter son identifiant au tableau des 'J'aime'
            Sauce.updateOne(
                {_id: req.params.id},
                {
                    $inc: { likes: 1},
                    $push: { usersLiked: req.body.userId},
                    _id: req.params.id
                }
            )
                .then(() => {
                    res.status(200).json({message: 'Votre avis a été pris en compte !'})
                })
                .catch(error => res.status(400).json({error}))

            break;
        case -1: // Si l'utilisateur n'aime pas, on ajoute son identifiant au tableau des 'J'aime pas'
            Sauce.updateOne(
                {_id: req.params.id},
                {
                    $inc: { dislikes: 1},
                    $push: { usersDisliked: req.body.userId},
                    _id: req.params.id
                }
            )
                .then(() => res.status(200).json({message: 'Votre avis a été pris en compte !'}))
                .catch(error => res.status(400).json({error}));

            break;
        default:
            console.error('Erreur avec la requête !')
    }
};