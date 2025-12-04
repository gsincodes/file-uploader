import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },async (email, password, done) => {
        try {
            const userInfo = await prisma.user.findFirst({
                where: {
                    email: email
                }
            })

            if(!userInfo) {
                return done(null, false, { message: "Incorrect username or email"});
            }
            const match = await bcrypt.compare(password, userInfo.password)

            if(!match) {
                return done(null, false, { message: "Incorrect Password"});
            }
            return done(null, userInfo);
        }
        catch(error) {
            return done(error);
        }
    })
)

passport.serializeUser((userInfo, done) => {
    done(null, userInfo.id);
})

passport.deserializeUser(async (id, done) => {
    try {
        const userInfo = await prisma.user.findFirst({
            where: {
                id: id
            }
        })
        done(null, userInfo);
    }
    catch(error) {
        done(error);
    }
})

export default passport;