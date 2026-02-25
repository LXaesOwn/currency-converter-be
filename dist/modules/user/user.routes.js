"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.get('/', user_controller_1.userController.getUser.bind(user_controller_1.userController));
router.post('/', user_controller_1.userController.updateUser.bind(user_controller_1.userController));
exports.default = router;
