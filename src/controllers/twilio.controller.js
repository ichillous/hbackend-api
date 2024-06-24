
const twilio = require('twilio');


exports.handleVoiceRequest = (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Welcome to the group call');
    twiml.dial().conference('My conference');
    res.type('text/xml');
    res.send(twiml.toString());
};

