import * as AWS from 'aws-sdk';

const snsClient = new AWS.SNS({apiVersion: 'latest'});

export { snsClient }
