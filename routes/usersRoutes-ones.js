///// routes/userRoutes.js 
const express = require("express"); 
const router = express.Router();
const usersController = require("../controllers/usersController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware"); 
 const {
   forgotPassword,
   resetPassword
 } = require("../controllers/usersController");
  router.post("/forgot-password", forgotPassword);

 router.post("/reset-password/:token", resetPassword);

//router.post("/register", upload.single("image"), usersController.register); 
router.post('/register', usersController.register, (req, res) => {
  console.log('Received registration request');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Send back what we received for debugging
  res.status(200).json({
    success: true,
    received: req.body,
    message: 'Data received successfully'
  });
});


router.post('/login', usersController.login);

 

// route protégée admin uniquement 
router.post( 
  "/ajouter", upload.single("image"),
  protect, 
  authorizeRoles("admin"), usersController.ajouterUtilisateur 
); 
// route protégée 
router.get("/", protect,authorizeRoles("admin"), usersController.listerUtilisateurs);

router.get("/:id", protect, usersController.getUtilisateurById); 
router.put("/:id", protect, usersController.updateUtilisateur); 
router.delete("/:id", protect, usersController.deleteUtilisateur); 
module.exports = router;



 
 