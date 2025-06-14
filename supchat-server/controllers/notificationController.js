const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("messageId");
    res.status(200).json(notifs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true }
    );
    res.status(200).json({ message: "Notification lue" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
