const Workspace = require("../models/Workspace");
const Permission = require("../models/Permission");

function isGlobalAdmin(user) {
  return user && user.role === "admin";
}

const findByUser = async (user) => {
  if (isGlobalAdmin(user)) {
    return Workspace.find();
  }

  const publicWorkspaces = await Workspace.find({ isPublic: true });
  const privateWorkspaces = await Workspace.find({
    isPublic: false,
    owner: user.id,
  });

  return [
    ...publicWorkspaces,
    ...privateWorkspaces.filter(
      (ws) => !publicWorkspaces.some((pub) => pub._id.equals(ws._id))
    ),
  ];
};

const findById = (id) => {
  return Workspace.findById(id).populate("owner", "username email");
};

const create = async ({ name, description, owner }) => {
  const workspace = new Workspace({
    name,
    description,
    owner,
    members: [owner],
  });
  await workspace.save();
  await Permission.create({
    userId: owner,
    workspaceId: workspace._id,
    role: "admin",
    permissions: {
      canPost: true,
      canDeleteMessages: true,
      canManageMembers: true,
      canManageChannels: true,
    },
  });
  return workspace;
};

const update = async (id, { name, description }) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) {
    return null;
  }
  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();
  return workspace;
};

const remove = async (id) => {
  await Workspace.findByIdAndDelete(id);
  await Permission.deleteMany({ workspaceId: id });
};

const invite = async (workspaceId, email, user) => {
  let isAdmin = false;
  if (isGlobalAdmin(user)) {
    isAdmin = true;
  } else {
    const perm = await Permission.findOne({
      userId: user.id,
      workspaceId,
      role: "admin",
    });
    isAdmin = !!perm;
  }
  if (!isAdmin) {
    throw new Error("NOT_ALLOWED");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error("NOT_FOUND");
  }
  if (workspace.invitations.includes(email)) {
    throw new Error("ALREADY_INVITED");
  }
  workspace.invitations.push(email);
  await workspace.save();
  return workspace;
};

const join = async (inviteCode, user) => {
  const workspace = await Workspace.findById(inviteCode);
  if (!workspace) {
    throw new Error("INVALID_INVITE");
  }
  const alreadyMember = await Permission.findOne({
    userId: user.id,
    workspaceId: workspace._id,
  });
  if (alreadyMember) {
    throw new Error("ALREADY_MEMBER");
  }
  await Permission.create({
    userId: user.id,
    workspaceId: workspace._id,
    role: "member",
    permissions: {
      canPost: true,
      canDeleteMessages: false,
      canManageMembers: false,
      canManageChannels: false,
    },
  });
  return workspace;
};

module.exports = {
  findByUser,
  findById,
  create,
  update,
  remove,
  invite,
  join,
};
