import { Router } from 'express';
const fileup_router = Router();
import fileup_controller from '../controllers/fileup_controller.js';
import multerMiddleware from '../config/multer.js';


//LOG-IN LOGIC
fileup_router.post("/api/log-in", fileup_controller.logInFormPost); //UPDATED
fileup_router.post("/api/log-out", fileup_controller.logOutPost); //UPDATED

//SIGN-IN LOGIC
fileup_router.post("/api/sign-up", fileup_controller.signUpFormPost); //UPDATED

//HOME LOGIC
fileup_router.get("/api/home", fileup_controller.fileUpHomeGet); //UPDATED

//FOLDERS AND FILES. THEIR CREATION AND UPLOAD
fileup_router.get("/api/folders", fileup_controller.allFilesAndFoldersGet); //UPDATED
fileup_router.post("/api/folders/upload", multerMiddleware.single('file') , fileup_controller.fileUploadPost); 
fileup_router.post("/api/folders/create", fileup_controller.createFolderPost);


//SUBFOLDERS AND FILES. THEIR CREATION AND UPLOAD
fileup_router.get("/api/folders/:folderId", fileup_controller.allFilesAndFoldersGet); //UPDATED
fileup_router.post("/api/folders/:folderId/upload", multerMiddleware.single('file') , fileup_controller.fileUploadPost);
fileup_router.post("/api/folders/:folderId/create", fileup_controller.createFolderPost);


//DEPRECATED
// fileup_router.get("/sign-up", fileup_controller.signUpFormGet);
// fileup_router.get("/log-in", fileup_controller.logInFormGet);
// fileup_router.get("/folders/upload", fileup_controller.uploadFormGet);
// fileup_router.get("/folders/create", fileup_controller.createFolderGet);
// fileup_router.get("/folders/:folderId/create", fileup_controller.createFolderGet);



export default fileup_router;