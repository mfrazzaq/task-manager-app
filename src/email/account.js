const sendGridAPIKey = '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';

const sendGrid = require('@sendgrid/mail');

sendGrid.setApiKey(process.env.SENG_GRID_API_KEY);

const sendEmail = (name, email) => {
    sendGrid.send({
        to: email,
        from: 'frrough@gmail.com',
        subject:"Send Grid Test",
        text: `This is the first mail ${name}`
    });
}

module.exports = sendEmail;