const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");
router.get("/voucher-held", userController.getVoucherHeld);
router.get("/paginate", userController.getAllUsersPaginate);
router.put("/change-role", userController.changeUserRole);
router.get("/", userController.getAllUsers);
router.put("/", userController.updateUserById);
router.delete("/:id", userController.deleteAllByUser);
router.get("/:id", userController.getUserById);
router.put("/change-shift", userController.changeUserShift);

module.exports = router;
