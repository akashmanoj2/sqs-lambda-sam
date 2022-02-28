const { sqsClient } = require('./sqsClient');
const { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const moment = require('moment');
const { writeMessage } = require('./dbUtility');

// Create an SQS FIFO queue and replace the below string with that queue URL
const queueUrl = "https://sqs.ap-south-1.amazonaws.com/421521792938/TestQueue.fifo";

const pushMessages = async (messages) => {
    console.log("Pushing message to queue...");
    const response = [];

    for (const message of messages) {
        const params = formatMessage(message);
        console.log("Pushing message - ", params);
        const data = await sqsClient.send(new SendMessageCommand(params));
        console.log("Success, message sent. MessageID : ", data.MessageId);
        response.push(data);
    }

    return {
        data: response
    };
};

const formatMessage = (message) => {
    const { messageBody, messageAttributes = {}, groupId } = message;
    const time = {
        DataType: "String",
        StringValue: moment().format()
    };
    messageAttributes['requestTime'] = time;

    const params = {
        MessageBody: messageBody,
        // MessageDeduplicationId: "Group1", // Required for FIFO queues if content based de-duplication is disabled
        MessageGroupId: groupId ? groupId.toString() : "Group1",  // Required for FIFO queues
        MessageAttributes: messageAttributes,
        QueueUrl: queueUrl // SQS_QUEUE_URL; e.g., 'https://sqs.REGION.amazonaws.com/ACCOUNT-ID/QUEUE-NAME'
    };

    return params;
};

const readMessages = async () => {
    const params = {
        AttributeNames: ["SentTimestamp"],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: ["All"],
        QueueUrl: queueUrl,
    };

    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    if (!data) {
        throw new Error("Something went wrong");
    }

    return data;
};

const deleteMessage = async (body) => {
    const { receiptHandle, messageId } = body;

    const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
        Id: messageId
    };

    const data = await sqsClient.send(new DeleteMessageCommand(deleteParams));
    console.log("Message deleted", data);

    return data;
};


module.exports = {
    pushMessages,
    readMessages,
    deleteMessage
};