const FileService = require('../../services/fileService')
const fs = require('fs')
const path = require('path')

describe('FileService', () => {
    const testUploadsDir = path.join(__dirname, '../uploads/test')
    const testFilePath = path.join(testUploadsDir, 'test-avatar.jpg')

    beforeAll(() => {
        // Créer le dossier de test
        if (!fs.existsSync(testUploadsDir)) {
            fs.mkdirSync(testUploadsDir, { recursive: true })
        }
    })

    beforeEach(() => {
        // Créer un fichier de test
        if (!fs.existsSync(testFilePath)) {
            fs.writeFileSync(testFilePath, 'test image content')
        }
    })

    afterEach(() => {
        // Nettoyer après chaque test
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath)
        }
    })

    afterAll(() => {
        // Nettoyer le dossier de test
        if (fs.existsSync(testUploadsDir)) {
            fs.rmSync(testUploadsDir, { recursive: true, force: true })
        }
    })

    describe('deleteFile', () => {
        it('devrait supprimer un fichier existant', () => {
            const result = FileService.deleteFile(
                '/uploads/test/test-avatar.jpg'
            )
            expect(result).toBe(true)
            expect(fs.existsSync(testFilePath)).toBe(false)
        })

        it('devrait retourner false pour un fichier inexistant', () => {
            const result = FileService.deleteFile(
                '/uploads/test/nonexistent.jpg'
            )
            expect(result).toBe(false)
        })

        it('devrait rejeter les chemins en dehors du dossier uploads', () => {
            const result = FileService.deleteFile('../../../etc/passwd')
            expect(result).toBe(false)
        })

        it('devrait gérer les chemins invalides', () => {
            expect(FileService.deleteFile(null)).toBe(false)
            expect(FileService.deleteFile('')).toBe(false)
            expect(FileService.deleteFile(123)).toBe(false)
        })
    })

    describe('deleteOldAvatar', () => {
        it('devrait supprimer un ancien avatar valide', () => {
            const result = FileService.deleteOldAvatar(
                '/uploads/test/test-avatar.jpg'
            )
            expect(result).toBe(true)
            expect(fs.existsSync(testFilePath)).toBe(false)
        })

        it('ne devrait pas supprimer un avatar par défaut', () => {
            const result = FileService.deleteOldAvatar(
                '/uploads/default-avatar.png'
            )
            expect(result).toBe(false)
        })

        it('devrait gérer les avatars vides', () => {
            expect(FileService.deleteOldAvatar('')).toBe(false)
            expect(FileService.deleteOldAvatar(null)).toBe(false)
        })
    })

    describe('isValidImageFile', () => {
        it("devrait accepter les formats d'image valides", () => {
            const validFiles = [
                { originalname: 'test.jpg', mimetype: 'image/jpeg' },
                { originalname: 'test.png', mimetype: 'image/png' },
                { originalname: 'test.gif', mimetype: 'image/gif' },
                { originalname: 'test.webp', mimetype: 'image/webp' },
            ]

            validFiles.forEach((file) => {
                expect(FileService.isValidImageFile(file)).toBe(true)
            })
        })

        it('devrait rejeter les formats non supportés', () => {
            const invalidFiles = [
                { originalname: 'test.pdf', mimetype: 'application/pdf' },
                { originalname: 'test.txt', mimetype: 'text/plain' },
                {
                    originalname: 'test.exe',
                    mimetype: 'application/octet-stream',
                },
                { originalname: 'test.svg', mimetype: 'image/svg+xml' },
            ]

            invalidFiles.forEach((file) => {
                expect(FileService.isValidImageFile(file)).toBe(false)
            })
        })

        it('devrait gérer les fichiers null/undefined', () => {
            expect(FileService.isValidImageFile(null)).toBe(false)
            expect(FileService.isValidImageFile(undefined)).toBe(false)
        })
    })
})
