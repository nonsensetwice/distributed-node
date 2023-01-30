#!/usr/bin/env node
import fastify from 'fastify';
import mercurius from 'mercurius';
import fs from 'fs';
import { resolve } from 'path';

const serverOptions = {
    https: {
        key: fs.readFileSync(resolve('./tls/producer-private-key.key')),
        cert: fs.readFileSync(resolve('../shared/tls/producer-certificate.cert')),
    }    
};

const server = fastify(serverOptions);
const schema = fs.readFileSync(resolve('../shared/graphql-schema.gql')).toString();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const resolvers = {
	Query: {
		pid: () => process.pid,
		recipe: async (_obj, { id }) => {
			if (id != 42) {
				throw new Error(`recipe ${id} not found`)
			};
			return {
				id, name: 'Chicken Tikka Misala',
				steps: 'Throw it in a pot...',
			}
		}
	},
	Recipe: {
		ingredients: async (obj) => {
			return (obj.id != 42) ? [] : [
			    { id: 1, name: 'Chicken', quantity: '1 lb', },
				{ id: 2, name: 'Sauce', quantity: '2 cups', }
			]
		}
	}
};

try {
	server
        .register(mercurius, { schema, resolvers, graphiql: true })
	    .listen(PORT, HOST, () => {
		    console.log(`Producer running at http://${HOST}:${PORT}/graphql`);
	    });
} catch (e) {
	console.error(e);
}
