const mongoose = require('mongoose')
const User = require('./supchat-server/models/User')
const bcrypt = require('bcrypt')

async function createTestUsers() {
    try {
        // Connexion à la base (utilise les variables d'env du .env)
        await mongoose.connect('mongodb://localhost:27017/supchat')

        console.log('Connexion à MongoDB réussie')

        // Créer quelques utilisateurs de test
        const testUsers = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: await bcrypt.hash('TestPassword123!', 10),
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                password: await bcrypt.hash('TestPassword123!', 10),
            },
            {
                name: 'Test User',
                email: 'test@example.com',
                password: await bcrypt.hash('TestPassword123!', 10),
            },
        ]

        for (const userData of testUsers) {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findOne({ email: userData.email })
            if (existingUser) {
                console.log(`Utilisateur ${userData.email} existe déjà`)
            } else {
                const newUser = new User(userData)
                await newUser.save()
                console.log(`Utilisateur créé: ${userData.email}`)
            }
        }

        // Lister tous les utilisateurs
        const allUsers = await User.find({}).select('email name createdAt')
        console.log('\nUtilisateurs en base:')
        allUsers.forEach((user) => {
            console.log(`- ${user.email} (${user.name})`)
        })

        await mongoose.connection.close()
        console.log('\nTerminé!')
    } catch (error) {
        console.error('Erreur:', error)
        process.exit(1)
    }
}

createTestUsers()
