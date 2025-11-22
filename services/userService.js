const prisma = require('../lib/prisma');

class UserService {
    static async createUser(userData) {
        try {
            const user = await prisma.user.create({

            })
        }
        catch {
            
        }
    }
}