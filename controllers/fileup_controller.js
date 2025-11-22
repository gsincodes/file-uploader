const passport = require('passport');
const bcrypt = require('bcryptjs');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('node:path');
const { error } = require('node:console');

async function fileUpHomeGet(req, res) {
    if(!req.isAuthenticated()){
        return res.redirect("/log-in");
    }

    const myfiles = await prisma.file.findMany({
        where: {
            userId: req.user.id
        }
    })

    const loggedUser = await prisma.user.findFirst({
        where: {
            id: req.user.id
        }
    })

    return res.render("home", { loggedUser:loggedUser ,myfiles: myfiles});
}

async function signUpFormGet(req, res) {
    res.render("sign-up-form");
}

async function signUpFormPost(req, res, next) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const insertUserPass = await prisma.user.create({
            data: {
                name: `${req.body.firstname} ${req.body.lastname}`,
                email: req.body.email,
                password: hashedPassword
            }
        })
        res.redirect("/log-in");
    }
    catch(error) {
        console.error(error);
        return next(error);
    }
}

async function logInFormGet(req, res) {
    res.render("log-in-form");
}

function logInFormPost(req, res, next) {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/log-in"
    })(req, res, next);
};

async function logOutGet(req, res, next) {
    req.logout((error) => {
        if(error) {
            return next(error);
        }
        res.redirect("/");
    })
}

async function uploadFormGet(req, res) {
    if(!req.isAuthenticated()){
        return res.redirect("/log-in");
    }
    res.render("upload-form");
}

async function allFilesAndFoldersGet(req, res)  {

    if(!req.isAuthenticated()){
        return res.redirect("/log-in");
    }

    try {
        const parentId = req.params.folderId;

        // sub folders
        if(parentId) {
            // checks if the folder with folderId exists
            const currentFolders = await prisma.folder.findFirst({
                where: {
                    id: parentId,
                    userId: req.user.id
                }
            })

            if(!currentFolders) {
                return res.status(404).render('404');
            }

            //gets all its sub folders
            const subFolders = await prisma.folder.findMany({
                where: {
                    parentId: parentId,
                    userId: req.user.id
                }
            })

            //files in the folder
            const savedFile = await prisma.file.findMany({
                where: {
                    folderId: parentId,
                    userId: req.user.id
                }
            })


            res.render("my-folders", { myFolders: Array.isArray(subFolders)? subFolders : [], savedFile: Array.isArray(savedFile)? savedFile : []});
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

            res.render("my-folders", { myFolders: folders, savedFile: Array.isArray(savedFile)? savedFile : []});
        }
    }
    catch (error) {
        console.error("No Folder Found", error);
        res.status(500).render("Error", { message : "Internal Server Error"});
    }
}

async function createFolderGet(req, res) {
    res.render("create-folder");
}

async function createFolderPost(req, res) {

    try {
        const name = req.body.folderName;
        const parentId = req.params.folderId;

        if(parentId) {

            const parentFolder = await prisma.folder.findUnique({
                where: {
                    id:parentId,
                    userId: req.user.id
                }
            })

            if(!parentFolder) {
                return res.status(404).json({ error: "Parent Folder not found"});
            }

            const path = parentFolder.path + "/" + name;

            const folder = await prisma.folder.create({
                data: {
                    name: name,
                    path: path,
                    user: {
                        connect: { id: req.user.id }
                    },
                    parent: {
                        connect: {
                            id: parentId
                        }
                    }
                }
            })

            return res.status(201).json(folder);
        }
        else {
            const folder = await prisma.folder.create({
                data: {
                    name: name,
                    path: "/"+ name,
                    user: {
                        connect: { id: req.user.id }
                    }
                }
            })

            // return res.status(201).json(folder);
            return res.redirect("/");
        }
    }
    catch (error) {
        console.error("Error creating folders", error);
        return res.status(500).json({ error: "Internal server error"});
    }

}

async function fileUploadPost(req, res) {

    if(!req.isAuthenticated()){
        return res.redirect("/log-in");
    }
    if(!req.file) {
        return res.status(400).json({ error: 'No file uploaded'});
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

        console.log("folderID ->", folderStorageId);

        console.log('file uploaded successfully');
        return res.redirect(`/folders`);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to upload File'});
    }


}

module.exports = {
    fileUpHomeGet,
    signUpFormGet,
    signUpFormPost,
    logInFormGet,
    logInFormPost,
    logOutGet,
    uploadFormGet,
    fileUploadPost,
    allFilesAndFoldersGet,
    createFolderGet,
    createFolderPost
}