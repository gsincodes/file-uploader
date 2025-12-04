import passport from 'passport';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import path from 'node:path';
import { validateFolderName } from '../utils/validators.js';

async function fileUpHomeGet(req, res) { // UPDATED
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    try {

        const loggedUser = await prisma.user.findFirst({
            where: {
                id: req.user.id,
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        })

        if (!loggedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const myFiles = await prisma.file.findMany({
            where: {
                userId: req.user.id
            }
        })

        return res.json({success: true, loggedUser:loggedUser ,myFiles: myFiles, message: "Fetched Data Successfully"}); 
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error Fetching Data from Home Route"});
    }
}

async function signUpFormPost(req, res, next) { // UPDATED
    try {

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: 'No data received'
            });
        }

        const { email, password, firstname, lastname } = req.body;
        
        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: `${firstname} ${lastname}`,
                email: email,
                password: hashedPassword
            }
        })
        console.log("Sign-up completed.");
        return res.status(201).json({
            success: true,
            message: 'Sign-up successful',
            user: {
                id: newUser.id,
                username: newUser.name,
                email: newUser.email
            }
        });
    }
    catch(error) {
        console.log("Some error occured while signing up.");
        console.error(error);
        return next(error);
    }
}

function logInFormPost(req, res, next) { //UPDATED
    passport.authenticate("local", (err, user, info) => {
        if(err) {
            return res.status(500).json({
                success: false,
                message: 'internal server error'
            });
        }
        
        if(!user) {
            return res.status(401).json({
                success: false,
                message: info.message || 'Invalid Credentials'
            })
        }

        req.logIn(user, (err) => {
            if(err) {
                return res.status(500).json({
                    success: false,
                    message: 'Login Failed'
                });
            }

            console.log(`Login Successful! Welcome ${user.firstname} ${user.lastname}`);
            return res.status(200).json({
                success: true,
                message: 'Login Successful',
                user: {
                    id: user.id,
                    username: user.firstname
                }
            })
        })
    })(req, res, next);
};

async function logOutPost(req, res, next) { // UPDATED

    req.logout((error) => {
        if(error) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        console.log('✅ Passport logout successful');

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }

            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            console.log('✅ Cookie cleared');
    
            return res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        });
    });
}

async function allFilesAndFoldersGet(req, res)  { //UPDATED

    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    try {
        const folderId = req.params.folderId;
        
        console.log('folder ID -> ',folderId);
        // sub folders
        if(folderId) {
            // checks if the folder with folderId exists
            const currentFolder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: req.user.id
                }
            })

            if(!currentFolder) {
                return res.status(404).json({
                    success: false,
                    message: "Folder not Found"
                });
            }
            console.log('Current Folder Name -> ',currentFolder.name);

            //gets all its sub folders
            const subFolders = await prisma.folder.findMany({
                where: {
                    parentId: currentFolder.id,
                    userId: req.user.id
                }
            })

            //files in the folder
            const savedFile = await prisma.file.findMany({
                where: {
                    folderId: currentFolder.id,
                    userId: req.user.id
                }
            })


            res.json({ success: true, myFolders: Array.isArray(subFolders)? subFolders : [], savedFile: Array.isArray(savedFile)? savedFile : [],
                currentFolder: currentFolder
            });
        }

        // root folder
        else {
            const myFolders = await prisma.folder.findMany({
                where: {
                    userId: req.user.id,
                    parentId: null
                }
            })

            const savedFile = await prisma.file.findMany({
                where: {
                    folderId: null,
                    userId: req.user.id
                }
            })

            const folders = Array.isArray(myFolders) ? myFolders : [];

            res.json({ success: true, myFolders: folders, savedFile: Array.isArray(savedFile)? savedFile : [], currentFolder: null});
        }
    }
    catch (error) {
        console.error("No Folder Found", error);
        res.status(500).json({ success: false, message : "Internal Server Error"});
    }
}

async function createFolderPost(req, res) { //DONE

    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    try {
        const name = req.body.folderName;
        const parentFolderId = req.params.folderId;

        const validation = validateFolderName(name);
        if(!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const sanitizedName = validation.sanitized;

        if(parentFolderId) {

            const parentFolder = await prisma.folder.findUnique({
                where: {
                    id: parentFolderId,
                    userId: req.user.id
                }
            })

            if(!parentFolder) {
                return res.status(404).json({ success: false, message: "Parent Folder not found"});
            }

            const existingFolder = await prisma.folder.findFirst({
                where: {
                    name: sanitizedName,
                    userId: req.user.id,
                    parentId: parentFolder.id
                }
            });

            if (existingFolder) {
                return res.status(409).json({ 
                    success: false, 
                    message: "Folder already exists" 
                });
            }

            const path = parentFolder.path + "/" + sanitizedName;

            const folder = await prisma.folder.create({
                data: {
                    name: sanitizedName,
                    path: path,
                    user: {
                        connect: { id: req.user.id }
                    },
                    parent: {
                        connect: {
                            id: parentFolder.id //id: parentId
                        }
                    }
                }
            })

            return res.status(201).json({success: true ,folder: folder});
        }
        else {

            const existingFolder = await prisma.folder.findFirst({
                where: {
                    name: sanitizedName,
                    userId: req.user.id,
                    parentId: null // Root folder
                }
            });

            if (existingFolder) {
                return res.status(409).json({ 
                    success: false, 
                    message: "Folder already exists" 
                });
            }

            const folder = await prisma.folder.create({
                data: {
                    name: sanitizedName,
                    path: "/"+ sanitizedName,
                    user: {
                        connect: { id: req.user.id }
                    },
                    parentId: null
                }
            })

            return res.status(201).json({success: true ,folder: folder});
        }
    }
    catch (error) {
        console.error("Error creating folders", error);
        return res.status(500).json({ success: false, message: "Internal server error"});
    }

}

async function fileUploadPost(req, res) { //DONE

    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    if(!req.file) {
        return res.status(400).json({success: false, message: "Please select a file to upload" });
    }
    
    try {

        const folderStorageId = req.params.folderId;

        const savedFile = await prisma.file.create({
            data: {
                name: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
                storagePath: req.file.path,
                userId: req.user.id,
                extension: path.extname(req.file.originalname),
                folderId: folderStorageId || null
            }
        })

        console.log('file uploaded successfully');
        return res.json({success: true, message: 'File Uploaded Successfully!', file: savedFile});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to upload File'});
    }
}

// async function signUpFormGet(req, res) { 
//     res.render("sign-up-form");
// }

// async function logInFormGet(req, res) {
//     res.render("log-in-form");
// }

// async function uploadFormGet(req, res) {
//     if(!req.isAuthenticated()){
//         return res.redirect("/log-in");
//     }
//     res.render("upload-form");
// }

// async function createFolderGet(req, res) {
//     res.render("create-folder");
// }


export default {
    fileUpHomeGet,
    signUpFormPost,
    logInFormPost,
    logOutPost,
    fileUploadPost,
    allFilesAndFoldersGet,
    createFolderPost
}