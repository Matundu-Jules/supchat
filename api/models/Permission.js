const mongoose = require('mongoose')

const PermissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: false,
        },
        role: {
            type: String,
            enum: ['admin', 'membre', 'invité'],
            default: 'membre',
        },
        channelRoles: [
            {
                channelId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Channel',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['admin', 'membre', 'invité'],
                    default: 'membre',
                },
            },
        ],
        permissions: {
            type: [String],
            default: ['post', 'view'],
            enum: [
                'post',
                'view',
                'moderate',
                'manage_members',
                'manage_channels',
                'delete_messages',
                'upload_files',
                'react',
                'invite_members',
            ],
        },
        // Support de l'ancien format pour la compatibilité
        legacyPermissions: {
            canPost: { type: Boolean, default: true },
            canDeleteMessages: { type: Boolean, default: false },
            canManageMembers: { type: Boolean, default: false },
            canManageChannels: { type: Boolean, default: false },
            canCreateChannels: { type: Boolean, default: false },
            canViewAllMembers: { type: Boolean, default: true },
            canViewPublicChannels: { type: Boolean, default: true },
            canUploadFiles: { type: Boolean, default: true },
            canReact: { type: Boolean, default: true },
        },
        // Nouveau support pour les permissions par type de ressource
        resourceType: {
            type: String,
            enum: ['workspace', 'channel', 'user'],
            default: 'workspace',
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Permission', PermissionSchema)
