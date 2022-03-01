const { pushMessages, readMessages, deleteMessage } = require("./libs/sqsUtility");
const { writeMessage } = require("./libs/dbUtility");


let response = {};
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.sendMessage = async (event, context) => {
    try {
        console.log("-------------Sending message----------------");
        if (!event.body) {
            throw new Error("Request body missing !");
        }

        let data;

        const messages = JSON.parse(event.body);
        console.log("Request body received - ", messages);

        data = await pushMessages(messages);

        response = {
            'statusCode': 200,
            'body': JSON.stringify(data)
        };
    } catch (err) {
        console.log('Error occured: ', err);
        return {
            'statusCode': 500,
            'body': {
                message: err.message
            }
        };
    }

    return response;
};

exports.readMessages = async (event, context) => {
    try {
        console.log("-------------Reading message----------------");
        const data = await readMessages();
        let messages;

        if (data.Messages) {
            console.log(JSON.stringify(data.Messages));
            messages = data.Messages;
        } else {
            messages = 'Queue is empty...';
            console.log(messages);
        }

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: messages
            })
        };
    } catch (err) {
        console.log(err);
        return {
            'statusCode': 500,
            'body': {
                message: err.message
            }
        };
    }

    return response;
};

exports.deleteMessage = async (event, context) => {
    try {
        console.log("-------------Deleting message----------------");
        if (!event.body) {
            throw new Error("Request body missing !");
        }

        const body = event.body;
        const data = await deleteMessage(body);

        response = {
            'statusCode': 200,
            'body': JSON.stringify(data)
        };
    } catch (err) {
        console.log(err);
        return {
            'statusCode': 500,
            'body': {
                message: err.message
            }
        };
    }

    return response;
};

exports.handleMessages = async (event, context) => {
    const batchItemFailures = [];

    console.log("-------------Message handler invoked----------------");
    let index = 1;

    console.log(`Request received - `, event);
    console.log(`Request length - `, event.Records.length);

    for (const record of event.Records) {
        try {
            console.log(`Received Record ${index++}: `, JSON.stringify(record));
            // let deletedRecord;

            if (record.body === 'Stop') {
                throw new Error(`Error occured while processing message`);
            }

            // writeMessage uses DynamoDb. While running in local, dynamoDb has to be set up seperately. Comment out if not required.
            const data = await writeMessage(record);

            if (data) {
                console.log("Record processed successfully.");
            }

            // Not required to delete data when using SQS queue as Lambda triggers
            // if (data) {
            //     deletedRecord = await deleteMessage(record.receiptHandle);
            // }
            // console.log('Deleted successfully - ', JSON.stringify(deletedRecord));
        } catch (error) {
            console.log("Error occured while processing : ", error);

            batchItemFailures.push({
                itemIdentifier: record.messageId
            });
        }
    }

    console.log("batchItemFailures - ", batchItemFailures);

    return {
        batchItemFailures
    };
};
