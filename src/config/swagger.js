const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Affiliate Link Manager API',
      version: '1.0.0',
      description: 'API para gerenciamento de links de afiliados.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/docs/openapi.yaml'],
};
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
