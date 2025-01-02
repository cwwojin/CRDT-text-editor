import { config } from 'dotenv';
config();

// import { Hocuspocus } from '@hocuspocus/server';
import server from './server/app';

// Configure the server …
// const server = new Hocuspocus({
//   port: 8001,
// });

// … and run it!
server.listen();
