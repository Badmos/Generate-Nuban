const express = require('express');
const { sanitizeRequest, validateRequest } = require('../middleware/middlewares');
const { NubanGenerator } = require('../lib/nuban-generator')

const router = express.Router();

const nubanController = (req, res) => {
    let nubans;

    try {
        const { account_number, bank_code } = req.body;
        nubans = NubanGenerator.generateNubans(account_number, bank_code);
    } catch (err) {
        return res.status(400).json({
            status: 'error',
            message: err.message,
            data: null
        })
    }

    res.status(200).json({
        status: "success",
        message: "Nubans successfully Generated",
        data: {
            nubans
        }
    })
}

router.post('/nubans', sanitizeRequest, validateRequest, nubanController);

module.exports.nubanRouter = router;