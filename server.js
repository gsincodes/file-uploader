import path from 'node:path';
import express from 'express';
import session from "express-session";
import passport from "./config/passport.js";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client'; 
import fileup_router from './routes/fileup_route.js';
import ViteExpress from 'vite-express';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();

app.use(session({
    cookie: {
        maxAge: 7*24*60*60*1000 //ms
    },
    secret: 'look up',
    resave:true,
    saveUninitialized:true,
    store: new PrismaSessionStore(
        new PrismaClient(),
        {
            checkPeriod:2*60*1000, //ms
            dbRecordIdIsSessionId:true,
            dbRecordIdFunction:undefined,
        }
    )
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended:false }));

app.use("/", fileup_router);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'uploads')));

ViteExpress.listen(app, PORT, (error) => {
    if(error) {
        throw error;
    }
    console.log(`app listening on port -> ${PORT}!`)
})