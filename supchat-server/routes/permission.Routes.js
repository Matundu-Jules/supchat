const express = require("express");
const {
  setPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} = require("../controllers/permissionController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, setPermission);
router.get("/", authMiddleware, getPermissions);
router.get("/:id", authMiddleware, getPermissionById);
router.put("/:id", authMiddleware, updatePermission);
router.delete("/:id", authMiddleware, deletePermission);

module.exports = router;
