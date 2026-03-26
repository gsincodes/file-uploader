import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            // Validate inputs
            if (!email || !password) {
                return done(null, false, { message: "Email and password are required" });
            }

            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                // Generic message for security (don't reveal if email exists)
                return done(null, false, { message: "Invalid email or password" });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                // Generic message for security
                return done(null, false, { message: "Invalid email or password" });
            }

            return done(null, user);
        }
        catch (error) {
            console.error('Authentication error:', error);
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id }
        });
        done(null, user);
    }
    catch (error) {
        console.error('Deserialization error:', error);
        done(error);
    }
});

export default passport;