import { APIGatewayProxyHandler } from "aws-lambda";
import { snsClient } from "./libs/sns-client";
import { PublishInput } from "aws-sdk/clients/sns";

export const handler: APIGatewayProxyHandler = async (event) => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    console.log(`Request body: ${event.body}`);
    const publishInput: PublishInput = {
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: event.body,
    }
    await snsClient.publish(publishInput).promise();
    return {statusCode: 201, body: ''};
};
