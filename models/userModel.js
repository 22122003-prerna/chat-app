// models/userModel.js
const bcrypt = require('bcryptjs');
const users = require('../config/db');

class User {
    static async createUser(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, password: hashedPassword };
        users.push(user);
        return user;
    }

    static async findUser(username) {
        return users.find(user => user.username === username);
    }

    static async validatePassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }
}

module.exports = User;