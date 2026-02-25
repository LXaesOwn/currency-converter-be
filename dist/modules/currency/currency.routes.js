"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currency_controller_1 = require("./currency.controller");
const router = (0, express_1.Router)();
router.get('/currencies', currency_controller_1.currencyController.getCurrencies.bind(currency_controller_1.currencyController));
router.get('/rates', currency_controller_1.currencyController.getRates.bind(currency_controller_1.currencyController));
exports.default = router;
