import type { FastifyInstance } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import type { AuthInstance } from './auth.types';

export function registerAuthHandler(
  fastify: FastifyInstance,
  auth: AuthInstance,
): void {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const origin = `${request.protocol}://${request.headers.host ?? 'localhost'}`;
      const url = new URL(request.url, origin);
      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
      const headers = fromNodeHeaders(request.raw.headers);
      if (hasBody && request.body !== undefined) {
        headers.set('content-type', 'application/json');
      }
      const authRequest = new Request(url, {
        method: request.method,
        headers,
        body:
          hasBody && request.body !== undefined
            ? JSON.stringify(request.body)
            : undefined,
      });
      const response = await auth.handler(authRequest);

      reply.code(response.status);
      response.headers.forEach((value, key) => {
        if (key !== 'set-cookie') reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) reply.header('set-cookie', cookies);

      if (!response.body || response.status === 204) return reply.send();
      return reply.send(await response.text());
    },
  });
}
