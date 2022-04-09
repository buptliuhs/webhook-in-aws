import { APIGatewayProxyHandler } from "aws-lambda";
import { snsClient } from "./libs/sns-client";
import { MessageAttributeMap, PublishInput } from "aws-sdk/clients/sns";

export const handler: APIGatewayProxyHandler = async (event) => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    const messageAttributes: MessageAttributeMap = {};
    messageAttributes["headers"] = {
        DataType: 'String',
        StringValue: JSON.stringify(event.headers),
    }
    const publishInput: PublishInput = {
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: event.body,
        MessageAttributes: messageAttributes,
    }
    console.debug(`Sending message to SNS: ${JSON.stringify(publishInput)}`);
    await snsClient.publish(publishInput).promise();
    return {statusCode: 201, body: ''};
};
