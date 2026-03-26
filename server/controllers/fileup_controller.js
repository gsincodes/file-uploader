import passport from 'passport';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import { validateFolderName } from '../utils/validators.js';

const prisma = new PrismaClient();

async function fileUpHomeGet(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    try {
        const loggedUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        if (!loggedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const myFiles = await prisma.file.findMany({
            where: { userId: req.user.id },
            take: 50 // Limit to 50 files
        });

        return res.json({
            success: true, 
            loggedUser: loggedUser,
            myFiles: myFiles,
            message: "Fetched Data Successfully"
        }); 
    }
    catch(error) {
        console.error('Error in fileUpHomeGet:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching data"
        });
    }
}

async function signUpFormPost(req, res, next) {
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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: `${firstname.trim()} ${lastname.trim()}`,
                email: email.toLowerCase().trim(),
                password: hashedPassword
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Sign-up successful',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch(error) {
        console.error('Sign-up error:', error);
        return res.status(500).json({
            success: false,
            message: 'Sign-up failed'
        });
    }
}

function logInFormPost(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if(err) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
        
        if(!user) {
            return res.status(401).json({
                success: false,
                message: info.message || 'Invalid credentials'
            });
        }

        req.logIn(user, (err) => {
            if(err) {
                return res.status(500).json({
                    success: false,
                    message: 'Login failed'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name
                }
            });
        });
    })(req, res, next);
}

async function logOutPost(req, res, next) {
    req.logout((error) => {
        if(error) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }

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
    
            return res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        });
    });
}

async function allFilesAndFoldersGet(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    try {
        const folderId = req.params.folderId;
        
        if(folderId) {
            // Get specific folder
            const currentFolder = await prisma.folder.findUnique({
                where: { id: folderId }
            });

            if(!currentFolder || currentFolder.userId !== req.user.id) {
                return res.status(404).json({
                    success: false,
                    message: "Folder not found"
                });
            }

            const subFolders = await prisma.folder.findMany({
                where: {
                    parentId: currentFolder.id,
                    userId: req.user.id
                }
            });

            const savedFile = await prisma.file.findMany({
                where: {
                    folderId: currentFolder.id,
                    userId: req.user.id
                },
                take: 100
            });

            return res.json({ 
                success: true, 
                myFolders: subFolders, 
                savedFile: savedFile,
                currentFolder: currentFolder
            });
        }
        else {
            // Get root folders and files
            const myFolders = await prisma.folder.findMany({
                where: {
                    userId: req.user.id,
                    parentId: null
                }
            });

            const savedFile = await prisma.file.findMany({
                where: {
                    folderId: null,
                    userId: req.user.id
                },
                take: 100
            });

            return res.json({ 
                success: true, 
                myFolders: myFolders, 
                savedFile: savedFile, 
                currentFolder: null
            });
        }
    }
    catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
}

async function createFolderPost(req, res) {
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
                where: { id: parentFolderId }
            });

            if(!parentFolder || parentFolder.userId !== req.user.id) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Parent folder not found"
                });
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

            const newPath = parentFolder.path + "/" + sanitizedName;

            const folder = await prisma.folder.create({
                data: {
                    name: sanitizedName,
                    path: newPath,
                    userId: req.user.id,
                    parentId: parentFolder.id
                }
            });

            return res.status(201).json({
                success: true,
                folder: folder
            });
        }
        else {
            const existingFolder = await prisma.folder.findFirst({
                where: {
                    name: sanitizedName,
                    userId: req.user.id,
                    parentId: null
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
                    path: "/" + sanitizedName,
                    userId: req.user.id,
                    parentId: null
                }
            });

            return res.status(201).json({
                success: true,
                folder: folder
            });
        }
    }
    catch (error) {
        console.error("Error creating folder:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
}

async function fileUploadPost(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authenticated",
            redirectTo: "/log-in"
        });
    }

    if(!req.file) {
        return res.status(400).json({
            success: false, 
            message: "Please select a file to upload"
        });
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
        });

        return res.json({
            success: true, 
            message: 'File uploaded successfully', 
            file: savedFile
        });
    }
    catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to upload file'
        });
    }
}

export default {
    fileUpHomeGet,
    signUpFormPost,
    logInFormPost,
    logOutPost,
    fileUploadPost,
    allFilesAndFoldersGet,
    createFolderPost
};