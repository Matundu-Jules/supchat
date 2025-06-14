const Channel = require("../models/Channel");
const Permission = require("../models/Permission");
const Workspace = require("../models/Workspace");
const User = require("../models/User");

const isAdminOrOwner = async (userId, workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }
  if (String(workspace.owner) === String(userId)) {
    return true;
  }
  const perm = await Permission.findOne({ userId, workspaceId });
  if (!perm) return false;
  return perm.role === "admin" || perm.permissions?.canManageChannels;
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
  if (perm.role === "admin" || perm.permissions?.canManageChannels) return true;
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
  await Workspace.findByIdAndUpdate(workspaceId, {
    $addToSet: { channels: channel._id },
  });
  return channel;
};

const findByWorkspace = async (workspaceId, user) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  const isOwner = String(workspace.owner) === String(user.id);
  const perm = await Permission.findOne({ userId: user.id, workspaceId });
  const isMember = workspace.members?.some(
    (m) => String(m._id || m) === String(user.id)
  );

  if (!isOwner && !perm && !isMember) {
    throw new Error("NOT_ALLOWED");
  }

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
  await Workspace.findByIdAndUpdate(channel.workspace, {
    $pull: { channels: channel._id },
  });
  await Permission.updateMany(
    { workspaceId: channel.workspace },
    { $pull: { channelRoles: { channelId: channel._id } } }
  );
  return Channel.findByIdAndDelete(id);
};

const invite = async (channelId, email, user) => {
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error("NOT_FOUND");
  }
  const allowed =
    (await isAdminOrOwner(user.id, channel.workspace)) ||
    (await isChannelAdmin(user.id, channel));
  if (!allowed) {
    throw new Error("NOT_ALLOWED");
  }
  const invitedUser = await User.findOne({ email });
  if (!invitedUser) {
    throw new Error("USER_NOT_FOUND");
  }
  if (channel.members.some((m) => String(m) === String(invitedUser._id))) {
    throw new Error("ALREADY_MEMBER");
  }
  if (!channel.invitations.includes(email)) {
    channel.invitations.push(email);
    await channel.save();
  }
  return channel;
};

const join = async (channelId, user) => {
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error("NOT_FOUND");
  }
  if (channel.members.some((m) => String(m) === String(user.id))) {
    throw new Error("ALREADY_MEMBER");
  }
  if (
    channel.type === "private" &&
    !channel.invitations.includes(user.email)
  ) {
    throw new Error("INVALID_INVITE");
  }
  await Channel.findByIdAndUpdate(channelId, {
    $addToSet: { members: user.id },
    $pull: { invitations: user.email },
  });
  return Channel.findById(channelId);
};

const leave = async (channelId, user) => {
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error("NOT_FOUND");
  }
  await Channel.findByIdAndUpdate(channelId, {
    $pull: { members: user.id },
  });
  return Channel.findById(channelId);
};

module.exports = {
  create,
  findByWorkspace,
  findById,
  update,
  remove,
  invite,
  join,
  leave,
};
