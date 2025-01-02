import { Database } from '@hocuspocus/extension-database';
import { Logger } from '@hocuspocus/extension-logger';
import { Server } from '@hocuspocus/server';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { MongoClient } from 'mongodb';
import { Doc, applyUpdateV2 } from 'yjs';

/* ====================================================== */
/* START Server Config                                    */
/* ====================================================== */

const MONGO_URL = process.env.MONGO_URL ?? '';
const MONGO_DATABASE = process.env.MONGO_DATABASE ?? '';
const MONGO_COLLECTION = process.env.MONGO_COLLECTION ?? '';

const server = Server.configure({
  name: 'hocuspocus',
  quiet: false,
  port: 8001,
  debounce: 5000,
  maxDebounce: 10000,
  extensions: [
    new Database({
      /**
       * @description fetch one document
       */
      async fetch({ documentName }) {
        const client = new MongoClient(MONGO_URL);

        try {
          const db = client.db(MONGO_DATABASE);

          const document = await db
            .collection(MONGO_COLLECTION)
            .findOne({ id: documentName });

          return document?.data?.buffer || null;
        } catch (e) {
          console.error(e);

          throw e;
        } finally {
          client.close();
        }
      },

      /**
       * @description insert or update one document
       */
      store: async ({ documentName, state, document }) => {
        const prosemirrorDoc = TiptapTransformer.fromYdoc(document);

        console.log(prosemirrorDoc);

        const client = new MongoClient(MONGO_URL);

        try {
          const db = client.db(MONGO_DATABASE);

          await db
            .collection(MONGO_COLLECTION)
            .updateOne(
              { id: documentName },
              { $set: { data: state } },
              { upsert: true },
            );
        } catch (e) {
          console.error(e);

          throw e;
        } finally {
          client.close();
        }
      },
    }),
    new Logger(),
  ],

  /* ====================================================== */
  /* START Hooks                                            */
  /* ====================================================== */

  /* ====================================================== */
  /* END Hooks                                              */
  /* ====================================================== */
});

/* ====================================================== */
/* END Server Config                                      */
/* ====================================================== */

export default server;
