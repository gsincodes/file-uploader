const { Router } = require('express')
const fileup_router = Router();
const fileup_controller = require('../controllers/fileup_controller');
const multerMiddleware = require('../config/multer');

fileup_router.get("/", fileup_controller.fileUpHomeGet); //works fine
fileup_router.get("/sign-up", fileup_controller.signUpFormGet); //works fine
fileup_router.post("/sign-up", fileup_controller.signUpFormPost); //works fine
fileup_router.get("/log-in", fileup_controller.logInFormGet); //works fine
fileup_router.post("/log-in", fileup_controller.logInFormPost); //works fine
fileup_router.get("/log-out", fileup_controller.logOutGet); //works fine

// fileup_router.get("/folders/upload", fileup_controller.uploadFormGet);

fileup_router.get("/folders", fileup_controller.allFilesAndFoldersGet); //works fine
fileup_router.post("/folders/upload", multerMiddleware.single('file') , fileup_controller.fileUploadPost); //root folder upload
fileup_router.post("/folders/create", fileup_controller.createFolderPost);// works fine

fileup_router.get("/folders/:folderId", fileup_controller.allFilesAndFoldersGet); //works fine
fileup_router.post("/folders/:folderId/upload", multerMiddleware.single('file') , fileup_controller.fileUploadPost);
fileup_router.post("/folders/:folderId/create", fileup_controller.createFolderPost);// works fine

// fileup_router.get("/folders/create", fileup_controller.createFolderGet);
// fileup_router.get("/folders/:folderId/create", fileup_controller.createFolderGet);



module.exports = fileup_router;