const Message = require("../models/Message");
const Channel = require("../models/Channel");
const FileMeta = require("../models/FileMeta");

exports.search = async (req, res) => {
  try {
    const keywords = req.query.q;
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json({ message: "Paramètre q requis" });
    }

    const query = { $text: { $search: keywords } };
    const projection = { score: { $meta: "textScore" } };

    const [messages, channels, files] = await Promise.all([
      Message.find(query, projection)
        .sort({ score: { $meta: "textScore" } })
        .limit(20),
      Channel.find(query, projection)
        .sort({ score: { $meta: "textScore" } })
        .limit(20),
      FileMeta.find(query, projection)
        .sort({ score: { $meta: "textScore" } })
        .limit(20),
    ]);

    res.json({ messages, channels, files });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
