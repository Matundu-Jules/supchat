const Channel = require("../models/Channel");

const create = async ({ name, workspaceId, description, type }) => {
  const channel = new Channel({
    name,
    workspace: workspaceId,
    description: description || "",
    type,
  });
  await channel.save();
  return channel;
};

const findByWorkspace = (workspaceId) => {
  return Channel.find({ workspace: workspaceId });
};

const findById = (id) => {
  return Channel.findById(id);
};

const update = async (id, { name, description }) => {
  const channel = await Channel.findById(id);
  if (!channel) {
    return null;
  }
  if (name) {
    channel.name = name;
  }
  if (description !== undefined) {
    channel.description = description;
  }
  await channel.save();
  return channel;
};

const remove = (id) => {
  return Channel.findByIdAndDelete(id);
};

module.exports = {
  create,
  findByWorkspace,
  findById,
  update,
  remove,
};
