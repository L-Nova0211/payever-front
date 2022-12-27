import { AmqpClient } from './app/amqp-client';

const dotenv = require('dotenv');
const args = require('yargs').argv;

const isDev: boolean = args.dev;
if (isDev) {
  dotenv.config();
}

const amqpClient = new AmqpClient(!!process.env.DEBUG);
amqpClient.connect();
amqpClient.activateConsumer();
