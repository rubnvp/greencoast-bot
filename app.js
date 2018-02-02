const axios = require('axios');
const { FB_ID, FB_SECRET, SLACK_TOKEN } = require('./secrets');

axios
    .get('https://graph.facebook.com/v2.12/oauth/access_token', {
        params: {
            client_id: FB_ID,
            client_secret: FB_SECRET,
            grant_type: 'client_credentials',
        }
    })
    .then(response => response.data.access_token) // get fb accessToken
    .then(accessToken => axios
    .get('https://graph.facebook.com/v2.12/828823737185056/feed', {
        params: {
            access_token: accessToken,
            limit: 1,
        }
    }))
    .then(response => response.data.data[0]) // get lastPost
    .then(lastPost => axios
    .post('https://slack.com/api/chat.postMessage', {
        channel: '#greencoast', // to test DM to Ruben use id: U2XE9BDRA
        text: ':robot_face: ' + lastPost.message,
    }, {
        headers: {
            'Authorization': 'Bearer ' + SLACK_TOKEN,
        }
    }))
    .catch(error => {
        console.log(error);
    });