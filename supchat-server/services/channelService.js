const Channel = require("../models/Channel");
const Permission = require("../models/Permission");
const Workspace = require("../models/Workspace");

const isAdminOrOwner = async (userId, workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }
  if (String(workspace.owner) === String(userId)) {
    return true;
  }
  const perm = await Permission.findOne({
    userId,
    workspaceId,
    role: "admin",
  });
  return !!perm;
};

const isChannelAdmin = async (userId, channel) => {
  const workspace = await Workspace.findById(channel.workspace);
  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }
  if (String(workspace.owner) === String(userId)) {
    return true;
  }
  const perm = await Permission.findOne({
    userId,
    workspaceId: workspace._id,
  });
  if (!perm) return false;
  if (perm.role === "admin") return true;
  const chanRole = perm.channelRoles?.find(
    (c) => String(c.channelId) === String(channel._id)
  );
  return chanRole && chanRole.role === "admin";
};

const create = async ({ name, workspaceId, description, type }, user) => {
  const allowed = await isAdminOrOwner(user.id, workspaceId);
  if (!allowed) {
    throw new Error("NOT_ALLOWED");
  }
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

const update = async (id, { name, description }, user) => {
  const channel = await Channel.findById(id);
  if (!channel) {
    return null;
  }
  const allowed =
    (await isAdminOrOwner(user.id, channel.workspace)) ||
    (await isChannelAdmin(user.id, channel));
  if (!allowed) {
    throw new Error("NOT_ALLOWED");
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

const remove = async (id, user) => {
  const channel = await Channel.findById(id);
  if (!channel) {
    return null;
  }
  const allowed =
    (await isAdminOrOwner(user.id, channel.workspace)) ||
    (await isChannelAdmin(user.id, channel));
  if (!allowed) {
    throw new Error("NOT_ALLOWED");
  }
  return Channel.findByIdAndDelete(id);
};

module.exports = {
  create,
  findByWorkspace,
  findById,
  update,
  remove,
};
