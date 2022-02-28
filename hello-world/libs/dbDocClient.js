// Create service client module using ES6 syntax.
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Set the AWS Region.
const REGION = "ap-south-1"; //e.g. "us-east-1"
const params = {
    region: REGION
};

if (process.env.ENDPOINT_OVERRIDE) {
    params['endpoint'] = process.env.ENDPOINT_OVERRIDE;
}

// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient(params);

const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: false, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

// Create the DynamoDB Document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);


module.exports = { ddbDocClient };
