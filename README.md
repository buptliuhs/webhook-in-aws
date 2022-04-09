# Webhook in AWS

---

![Stability: Stable](https://img.shields.io/badge/stability-Stable-success.svg?style=for-the-badge)

> **This is a stable example. It should successfully build out of the box**
>
> This examples does is built on Construct Libraries marked "Stable" and does not have any infrastructure prerequisites to build.

---

This an example of Webhook in AWS.

## Pre-requisites

- NodeJS v14.x
- [ESBuild](https://esbuild.github.io/)

## Build

To build this app, you need to be in this example's root folder. Then run the following:

```bash
npm install -g aws-cdk
npm install
npm run build
```

This will install the necessary CDK, then this example's dependencies, then the lambda functions' dependencies, and then
build your TypeScript files and your CloudFormation template.

## Deploy

Run `cdk deploy`. This will deploy / redeploy your Stack to your AWS Account.

## How it works

### Post a message to the webhook
```shell
curl --location --request POST 'https://<apigateway-id>.execute-api.us-west-2.amazonaws.com/v1/webhook' \
--header 'Content-Type: application/json' \
--data-raw '{
    "a": 1,
    "valid": true
}'
```

### Receive notification inside AWS
All messages received via the webhook will be published to SNS topic. The topic ARN is in CDK deployment output (`WebhookStack.snsTopicArn`):
```shell
Outputs:
WebhookStack.snsTopicArn = arn:aws:sns:us-west-2:<aws-account-id>:WebhookStack-WebhookTopic
```

Subscribe to the SNS topic in order to receive notifications. Subscriber can be SQS, Email, and so on.

## CDK Toolkit

The [`cdk.json`](./cdk.json) file in the root of this repository includes instructions for the CDK toolkit on how to
execute this program.

After building your TypeScript code, you will be able to run the CDK toolkit commands as usual:

```bash
    $ cdk ls
    <list all stacks in this program>

    $ cdk synth
    <generates and outputs cloudformation template>

    $ cdk deploy
    <deploys stack to your account>

    $ cdk diff
    <shows diff against deployed stack>
```
