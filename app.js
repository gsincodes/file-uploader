const path = require('node:path');
const express = require('express');
const session = require("express-session");
const passport = require("./config/passport");
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client'); 
const fileup_router = require('./routes/fileup_route');

const PORT = process.env.PORT || 3001;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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
app.use(express.urlencoded({ extended:false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use("/", fileup_router);

app.listen(PORT, (error) => {
    if(error) {
        throw error;
    }
    console.log(`app listening on port -> ${PORT}!`)
})