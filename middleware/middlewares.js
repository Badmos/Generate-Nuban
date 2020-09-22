const { body, validationResult} = require('express-validator');

module.exports.sanitizeRequest = [
    body('account_number').not().isEmpty()
        .isNumeric()
        .withMessage('Account number can only be digits')
        .isLength({min: 10, max: 10})
        .withMessage('Account number must be 10 digits long'),
    body('bank_code').not().isEmpty()
        .isNumeric()
        .withMessage('Bank code number can only be digits')
        .isLength({min: 3, max: 5})
        .withMessage('Bank code must be minimum of 3 and maximum of 5 digits')
]


module.exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'failed',
            message: 'Nuban Generation failed',
            data: {
                errors: errors.array() 
            }
        })
    }

    next();
};

module.exports.errorHandler = (err, req, res, next) => {
    if (err instanceof Error) {
        return res.status(400).json({ 
            status: 'An error occured',
            message: err.message,
            data: null
    });
}
    console.error(err);
    res.status(400).send({
        message: 'something went wrong. Check the logs for more info',
    });
};