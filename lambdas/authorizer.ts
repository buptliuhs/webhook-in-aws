import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from "aws-lambda";

/**
 * @param event - API Gateway token authorizer event
 */
export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    try {
        // const authToken: string = event.authorizationToken;
        // TODO: validate signature of the payload
        const effect = 'allow';
        // const effect = 'deny';
        const result = {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: effect,
                        Resource: event.methodArn.split("/")[0] + "/*",
                    },
                ],
            },
        };
        console.log(`Result: ${JSON.stringify(result, null, 2)}`);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Unauthorized');
    }
};
