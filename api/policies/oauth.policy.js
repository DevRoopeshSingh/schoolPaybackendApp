module.exports = (req, res, next) => {

    let tokenToVerify;

    if (req.header('Authorization')) {
        const parts = req.header('Authorization').split(' ');

        if (parts.length === 2) {
            const scheme = parts[0];
            const credentials = parts[1];

            if (/^Bearer$/.test(scheme)) {
                tokenToVerify = credentials;
            } else {
                return res.status(401).json({
                    msg: 'Format for Authorization: Bearer [token]',
                    success: false
                });
            }
        } else {
            return res.status(401).json({
                msg: 'Format for Authorization: Bearer [token]',
                success: false
            });
        }
    } else if (req.body.token) {
        tokenToVerify = req.body.token;
        delete req.query.token;
    } else {
        return res.status(401).json({
            msg: 'No Authorization was found',
            success: false
        });
    }

    var request = require('request');
    var options = {
        'method': 'POST',
        'url': 'https://lc-detailed-assessment.azure-api.net/advanced-assessment',
        headers: {
            Authorization: "Bearer " + tokenToVerify
        }
    };
    
    request(options, function (error, response) {
        if (error) throw new Error(error);
        
        if (response.statusCode == 200) {
            req.token = tokenToVerify;
            return next();
        } else {
            return res.status(401).json({
                msg: 'Token Error',
                success: false
            });
        }
    });
}