const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createChannel,
  getChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  inviteToChannel,
  joinChannel,
  leaveChannel,
} = require("../controllers/channelController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validationMiddleware");
const {
  createChannelSchema,
  updateChannelSchema,
  channelIdParamSchema,
  inviteToChannelSchema,
} = require("../validators/channelValidators");

const router = express.Router();

// Limiteur : 5 messages max par minute par utilisateur sur un channel
const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: "Trop de messages envoyés, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.user ? req.user.id : req.ip}-${req.params.id}`,
});

router.post(
  "/",
  authMiddleware,
  validate({ body: createChannelSchema }),
  createChannel
);
router.get("/", authMiddleware, getChannels);
router.get(
  "/:id",
  authMiddleware,
  validate({ params: channelIdParamSchema }),
  getChannelById
);
router.put(
  "/:id",
  authMiddleware,
  validate({ params: channelIdParamSchema, body: updateChannelSchema }),
  updateChannel
);
router.delete(
  "/:id",
  authMiddleware,
  validate({ params: channelIdParamSchema }),
  deleteChannel
);

router.post(
  "/:id/invite",
  authMiddleware,
  validate({ params: channelIdParamSchema, body: inviteToChannelSchema }),
  inviteToChannel
);

router.post(
  "/:id/join",
  authMiddleware,
  validate({ params: channelIdParamSchema }),
  joinChannel
);

router.post(
  "/:id/leave",
  authMiddleware,
  validate({ params: channelIdParamSchema }),
  leaveChannel
);

router.post(
  "/:id/messages",
  authMiddleware,
  messageRateLimiter,
  async (req, res, next) => {
    // Injecte channelId dans le body pour compatibilité avec le contrôleur
    req.body.channelId = req.params.id;
    next();
  },
  require("../controllers/messageController").sendMessage
);

module.exports = router;
