const fastify = require('fastify')({ logger: true });

fastify.post('/users', require('./routes/create-user.js'));
fastify.post('/login', require('./routes/login.js'));
fastify.delete('/users/:userId', require('./routes/delete-user.js'));
fastify.get('/users/:userId', require('./routes/get-user.js'));

async function start () {
  try {
    await fastify.listen(3000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err)
    process.exit(1);
  }
};

fastify.addHook('onRequest', async (request, reply) => {

  // If the route is not private we ignore this hook
  if (!reply.context.config.isPrivate) return;

  const faunaSecret = request.headers['fauna-secret'];

  // If there is no header
  if (!faunaSecret) {
    reply.status(401).send();
    return;
  }

  // Add the secret to the request object
  request.faunaSecret = faunaSecret;
});

fastify.decorateRequest('faunaSecret', '');

start();