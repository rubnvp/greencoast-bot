const axios = require('axios');
const { FB_ID, FB_SECRET, SLACK_TOKEN } = require('./secrets');

const fetchAndSendMenu = attemptsCount => axios
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
    .then(lastPost => {
        const createdDate = lastPost.created_time.split('T')[0];
        const currentDate = (new Date()).toISOString().split('T')[0];
        if (createdDate !== currentDate) return false;
        return axios
            .post('https://slack.com/api/chat.postMessage', {
                    channel: '#greencoast', // to test DM to Ruben use id: U2XE9BDRA
                    text: ':robot_face: ' + lastPost.message,
                }, {headers: {'Authorization': 'Bearer ' + SLACK_TOKEN}}
            );
    })
    .then(response => {
        if (response) {
            console.log('Sent menu');
        }
        else if (attemptsCount < 12) { // try a maximum of 12 times
            console.log("Menu is not yet published, trying again in 5 minutes...");
            setTimeout(fetchAndSendMenu, 5 * 60 * 1000, ++attemptsCount); // every 5 minutes
        }
        else {
            console.log("Maximum attempts reached, today's menu is not available");
        }
        
    })
    .catch(error => {
        console.log(error);
    });

fetchAndSendMenu(0);