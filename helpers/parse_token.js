/**
 * This file parse the toekn and returns the required details
 * @param String token 
 */
const parseToken = (token) => {

    const getUserId = () => {
        return token.id;
    };

    const getTenantId = () => {
        return token.tenant;
    };

    return {
        getUserId,
        getTenantId
    };
};

module.exports = parseToken;

