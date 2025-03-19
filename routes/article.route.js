const express = require('express');
const router = express.Router();
const Article=require("../models/article")
const Scategorie =require("../models/scategorie")
const {verifyToken} =require("../middleware/verifytoken")
const {authorizeRoles} = require("../middleware/authorizeRoles")
const {generateMongoQuery} = require("../query/generateMongoQuery");

// afficher la liste des articles.
router.get('/', async (req, res, )=> {
try {
const articles = await Article.find({}, null, {sort: {'_id': -
1}}).populate("scategorieID").exec();
res.status(200).json(articles);
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// créer un nouvel article
router.post('/', async (req, res) => {
const nouvarticle = new Article(req.body)
try {
await nouvarticle.save();
res.status(200).json(nouvarticle );
} catch (error) {
res.status(404).json({ message: error.message });



}
});
// afficher la liste des articles par page
router.get('/pagination', async(req, res) => {
const page = req.query.page ||1 // Current page
const limit = req.query.limit ||5; // Number of items per page
// Calculez le nombre d'éléments à sauter (offset)
const offset = (page - 1) * limit;
try {
// Effectuez la requête à votre source de données en utilisant les paramètresde pagination

const articlesTot = await Article.countDocuments();
const articles = await Article.find( {}, null, {sort: {'_id': -1}})
.skip(offset)
.limit(limit)
res.status(200).json({articles:articles,tot:articlesTot});
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// chercher un article
router.get('/:articleId',async(req, res)=>{
try {
const art = await Article.findById(req.params.articleId);
res.status(200).json(art);
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// modifier un article
router.put('/:articleId', async (req, res)=> {
try {
const art = await Article.findByIdAndUpdate(
req.params.articleId,
{ $set: req.body },
{ new: true }
);
const articles = await
Article.findById(art._id).populate("scategorieID").exec();

res.status(200).json(articles);
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// Supprimer un article
router.delete('/:articleId', async (req, res)=> {
const id = req.params.articleId;
await Article.findByIdAndDelete(id);
res.json({ message: "article deleted successfully." });
});
// chercher un article par s/cat
router.get('/scat/:scategorieID',async(req, res)=>{
try {
const art = await Article.find({ scategorieID:
req.params.scategorieID}).exec();
res.status(200).json(art);
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// chercher un article par cat
router.get('/cat/:categorieID', async (req, res) => {
    try {
    // Recherche des sous-catégories correspondant à la catégorie donnée
    const sousCategories = await Scategorie.find({ categorieID:
    req.params.categorieID }).exec();
    
    // Initialiser un tableau pour stocker les identifiants des sous-catégories trouvées
    
    const sousCategorieIDs = sousCategories.map(scategorie => scategorie._id);
    // Recherche des articles correspondant aux sous-catégories trouvées
    const articles = await Article.find({ scategorieID: { $in:
    sousCategorieIDs } }).exec();
    res.status(200).json(articles);
    } catch (error) {
    res.status(404).json({ message: error.message });
    }
    });


    router.post("/query", async (req, res) => {
        try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Aucune requête fournie."
        
        });
        
        console.log(" Requête reçue:", text);
        // Générer la requête MongoDB via LLaMA 3
        const mongoQuery = await generateMongoQuery(text);
        console.log(" Requête MongoDB générée avant correction:", mongoQuery);
        let query = mongoQuery.filter || {};
        const sort = mongoQuery.sort || { _id: -1 };
        const limit = mongoQuery.limit ? parseInt(mongoQuery.limit) : 0;
        const skip = mongoQuery.skip ? parseInt(mongoQuery.skip) : 0;
        let scategorieName = null;
        // Vérification et correction de `souscategorie`
        if (query.scategorie) {
        scategorieName = query.scategorie;
        delete query.scategorie; // Supprimer `souscategorie` qui est incorrect
        } else if (query.scategorieID && typeof query.scategorieID === "string") {
        scategorieName = query.scategorieID;
        }
        if (scategorieName) {
        console.log(" Recherche de l'ID de la sous-catégorie pour :",
        
        scategorieName);
        
        // Chercher l'ObjectId correspondant à la sous-catégorie
        const scategorie = await Scategorie.findOne({
        nomscategorie: { $regex: scategorieName, $options: "i" }
        });
        if (!scategorie) {
        console.log(" Aucune sous-catégorie trouvée pour:", scategorieName);
        return res.json({ result: [] });
        }
        
        console.log("Sous-catégorie trouvée:", scategorie._id);
        query.scategorieID = scategorie._id; // Remplacement par l'ObjectId
        
        correct
        }
        console.log(" Requête finale exécutée sur MongoDB:", JSON.stringify(query,null, 2));
        
        // Détection si l'utilisateur demande un comptage
        if (/nombre|combien|count/i.test(text)) {
        const count = await Article.countDocuments(query);
        console.log(`📊 Nombre d'articles trouvés: ${count}`);
        return res.json({ count });
        }
        // Exécution de la requête avec jointure complète si ce n'est pas un comptage
        
        const result = await Article.find(query)
        .populate({
        path: "scategorieID",
        populate: { path: "categorieID" }
        })
        .sort(sort)
        .skip(skip)
        .limit(limit > 0 ? limit : 0)
        .exec();
        console.log(` ${result.length} articles trouvés.`);
        res.json({ result });
        } catch (error) {
        console.error(" Erreur serveur:", error);
        res.status(500).json({ error: "Erreur serveur" });
        }
        });





module.exports = router;