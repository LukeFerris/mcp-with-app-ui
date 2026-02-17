import serverlessExpress from '@codegenie/serverless-express';
import { createExpressApp } from './app.js';

const app = createExpressApp();

/**
 * AWS Lambda handler wrapping the Express MCP server via serverless-express.
 */
export const handler = serverlessExpress({ app });
