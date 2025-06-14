const express = require("express");
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

module.exports = router;
