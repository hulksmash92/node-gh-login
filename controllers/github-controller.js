const axios = require('axios');
const qs = require('querystring');
const express = require('express');
const router = express.Router();

/**
 * Checks the access token and returns the data response
 */
async function checkToken(token) {
    try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const url = `https://api.github.com/applications/${clientId}/token`;
        const body = { 
            access_token: token
        };
        const config = {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            auth: {
                username: clientId,
                password: process.env.GITHUB_CLIENT_SECRET
            }
        };
        const response = await axios.post(url, body, config);
        return response?.data;
    } catch (error) {
        return error;
    }
}

/**
 * Parses the access token from the Authorization header
 */
function getAccessToken(req) {
    const authHeader = req.get('Authorization')?.replace('bearer ', '')?.replace('Bearer ', '');
    if (!authHeader) {
        throw new Error('Access denied: Invalid access token!');
    }
    return authHeader;
}

/************ Requests ************/
router.get('/loginUrl', (req, res) => {
    try {
        const scopes = process.env.GITHUB_SCOPES || 'user:email';
        const clientId = process.env.GITHUB_CLIENT_ID;
        const loginUrl = process.env.GITHUB_URL_LOGIN;
        if (!clientId || !loginUrl) {
            throw new Error('Oops something went wrong');
        }
        const url = `${loginUrl}?scopes=${scopes}&client_id=${clientId}`;
        res.send({ data: url });
    } catch (error) {
        res.status(400).send({ message: error.message});
    }
});

router.post('/token', async (req, res) => {
    try {
        const sessionCode = req.body?.sessionCode;
        if (!sessionCode) {
            throw new Error('Missing or null session code');
        }
        const data = {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: sessionCode,
        };
        axios.defaults.headers.post['Content-Type'] = 'application/x-form-urlencoded';
        const tokenResponse = await axios.post(process.env.GITHUB_URL_TOKEN, data);
        const responseData = qs.parse(tokenResponse.data)
        if (Object.keys(responseData).indexOf('error') > -1) {
            throw new Error(responseData.error);
        }
        res.send({ data: responseData.access_token });
    } catch (error) {
        res.status(400).send({ message: error.message});
    }
});

router.get('/me', async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        const checkTokenRes = await checkToken(accessToken);
        res.send({ data: checkTokenRes?.user });
    } catch (error) {
        res.status(400).send({ message: error.message});
    }
});

module.exports = router;