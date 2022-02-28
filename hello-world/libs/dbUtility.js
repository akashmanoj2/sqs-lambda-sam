const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('./dbDocClient');

const tableName = process.env.TABLE_NAME;

const writeMessage = async (message) => {
    if (!message.messageId) {
        throw new Error("messageId attribute missing !");
    }

    console.log("Writing to DB - ", message);

    const params = {
        TableName: tableName,
        Item: message
    };

    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
    return data;
};

module.exports = {
    writeMessage
};