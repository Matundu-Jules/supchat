const express = require("express");
const {
  setPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} = require("../controllers/permissionController");

const router = express.Router();

router.post("/", setPermission);
router.get("/", getPermissions);
router.get("/:id", getPermissionById);
router.put("/:id", updatePermission);
router.delete("/:id", deletePermission);

module.exports = router;
