import {
    AuthorizationType,
    LambdaIntegration,
    MethodLoggingLevel,
    RestApi,
    TokenAuthorizer
} from '@aws-cdk/aws-apigateway';
import { Runtime } from '@aws-cdk/aws-lambda';
import { App, CfnOutput, Duration, Stack } from '@aws-cdk/core';
import { NodejsFunction, NodejsFunctionProps } from '@aws-cdk/aws-lambda-nodejs';
import { join } from 'path'
import { RetentionDays } from "@aws-cdk/aws-logs";
import { MethodOptions } from "@aws-cdk/aws-apigateway/lib/method";
import { Topic } from "@aws-cdk/aws-sns";
import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";

const stackName = 'WebhookStack';
const webhookName = 'webhook';
const customAuthorizerEnabled = false;

export class WebhookStack extends Stack {
    constructor(app: App, id: string) {
        super(app, id);

        // Create SNS topic
        const webhookTopic = new Topic(this, `${stackName}-WebhookTopic`, {
            topicName: `${stackName}-WebhookTopic`,
        });

        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
                minify: false,
            },
            depsLockFilePath: join(__dirname, 'lambdas', 'package-lock.json'),
            environment: {
                SNS_TOPIC_ARN: webhookTopic.topicArn,
            },
            runtime: Runtime.NODEJS_14_X,
            timeout: Duration.seconds(15),
            memorySize: 256,
            /**
             *  The default log retention setting is RetentionDays.INFINITE
             */
            logRetention: RetentionDays.ONE_WEEK,
        }

        // Create a Lambda function for each of the CRUD operations
        const webhookLambda = new NodejsFunction(this, `${stackName}-WebhookFunction`, {
            functionName: `${stackName}-WebhookFunction`,
            entry: join(__dirname, 'lambdas', 'webhook.ts'),
            ...nodeJsFunctionProps,
        });
        // Create a policy statement
        webhookLambda.addToRolePolicy(new PolicyStatement({
            resources: [
                webhookTopic.topicArn
            ],
            actions: [
                "SNS:Publish"
            ],
            effect: Effect.ALLOW,
        }));

        let methodOptions: MethodOptions = {};
        if (customAuthorizerEnabled) {
            const authorizerLambda = new NodejsFunction(this, `${stackName}-AuthorizerFunction`, {
                functionName: `${stackName}-AuthorizerFunction`,
                entry: join(__dirname, 'lambdas', 'authorizer.ts'),
                ...nodeJsFunctionProps,
            });
            const customAuthorizer = new TokenAuthorizer(this, `${stackName}-CustomAuthorizer`, {
                handler: authorizerLambda,
                resultsCacheTtl: Duration.minutes(1),
            });
            methodOptions = {
                authorizationType: AuthorizationType.CUSTOM,
                authorizer: customAuthorizer,
            }
        }
        // Integrate the Lambda functions with the API Gateway resource
        const webhookIntegration = new LambdaIntegration(webhookLambda);

        // Create an API Gateway resource for each of the CRUD operations
        const api = new RestApi(this, `${stackName}-WebhookApi`, {
            restApiName: 'Webhook Service',
            description: 'Webhook Service',
            deployOptions: {
                stageName: "v1",
                loggingLevel: MethodLoggingLevel.INFO,
            }
        });

        // Path /webhook
        const webhook = api.root.addResource(webhookName);
        // POST /webhook
        webhook.addMethod('POST', webhookIntegration, methodOptions);

        // Output
        new CfnOutput(this, 'snsTopicArn', {
            value: webhookTopic.topicArn,
            description: 'The arn of the SNS topic',
        })
    }
}

const app = new App();
new WebhookStack(app, stackName);
app.synth();
