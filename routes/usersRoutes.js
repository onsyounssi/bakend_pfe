///// routes/userRoutes.js 
const express = require("express"); 
const router = express.Router();
const usersController = require("../controllers/usersController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware.js");
router.post("/register", usersController.register); 
router.post("/login", usersController.login);
 

// route protégée admin uniquement 
router.post( 
  "/ajouter", 
  protect, 
  authorizeRoles("admin"), usersController.ajouterUtilisateur 
); 
// route protégée 
router.get("/", protect,authorizeRoles("admin"), usersController.listerUtilisateurs);

router.get("/:id", usersController.getUtilisateurById); 
router.put("/:id", usersController.updateUtilisateur); 
router.delete("/:id", usersController.deleteUtilisateur); 
module.exports = router;



 
 