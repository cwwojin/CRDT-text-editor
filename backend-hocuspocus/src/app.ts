import { Database } from '@hocuspocus/extension-database';
import { Logger } from '@hocuspocus/extension-logger';
import { Redis } from '@hocuspocus/extension-redis';
import { Server } from '@hocuspocus/server';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { generateJSON } from '@tiptap/html';
import { StarterKit } from '@tiptap/starter-kit';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { encodeStateAsUpdate } from 'yjs';
import { TiptapJwtPayload } from './interfaces';
import { Document } from './models';
import { allowedDocumentNameRegex } from './utils/function';

/* ====================================================== */
/* START Server Config                                    */
/* ====================================================== */

// const NODE_ENV = process.env.NODE_ENV ?? 'development';

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
        try {
          const document = await Document.findOne({ id: documentName });

          // Document 가 없음
          if (!document) return null;

          if (document.ydoc) {
            // Yjs data
            return document.ydoc;
          } else if (document.tiptapJson) {
            // JSON data
            return encodeStateAsUpdate(
              TiptapTransformer.toYdoc(document.tiptapJson),
            );
          } else if (document.html) {
            // HTML data
            const tiptapJson = generateJSON(document.html, [
              StarterKit.configure({
                dropcursor: false,
                heading: false,
                horizontalRule: false,
                blockquote: false,
                history: false,
                codeBlock: false,
              }),
            ]);

            return encodeStateAsUpdate(TiptapTransformer.toYdoc(tiptapJson));
          } else {
            return null;
          }
        } catch (e) {
          console.error(e);

          throw e;
        }
      },

      /**
       * @description insert or update one document
       */
      store: async ({ documentName, state, document }) => {
        try {
          const tiptapJson = TiptapTransformer.fromYdoc(document);

          await Document.updateOne(
            { id: documentName },
            { ydoc: state, tiptapJson: JSON.stringify(tiptapJson) },
            { upsert: true },
          );
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
    }),
    new Redis({
      host: process.env.REDIS_HOST as string,
      port: parseInt(process.env.REDIS_PORT as string),
      options: {
        password: process.env.REDIS_PASSWORD as string,
      },
    }),
    new Logger(),
  ],

  /* ====================================================== */
  /* START Hooks                                            */
  /* ====================================================== */

  async onConfigure() {
    try {
      await mongoose.connect(process.env.MONGO_URL as string, {
        dbName: process.env.MONGO_DATABASE as string,
        user: process.env.MONGO_USERNAME as string,
        pass: process.env.MONGO_PASSWORD as string,
        maxPoolSize: 10,
        maxIdleTimeMS: 5000,
      });

      console.log(`Database Initialized.`);
    } catch (e) {
      throw e;
    }
  },

  async onConnect({ connection }) {
    connection.requiresAuthentication = false;
  },

  async onAuthenticate({ token, documentName, connection }) {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || '',
      ) as TiptapJwtPayload;

      const allowedRegexes =
        payload?.allowedDocumentNames?.map((name) =>
          allowedDocumentNameRegex(name),
        ) ?? [];

      if (
        allowedRegexes
          .map((pattern) => pattern.test(documentName))
          .includes(true)
      )
        return payload;

      if (payload?.readonlyDocumentNames?.length) {
        const readOnlyRegexes =
          payload.readonlyDocumentNames.map((name) =>
            allowedDocumentNameRegex(name),
          ) ?? [];

        if (
          readOnlyRegexes
            .map((pattern) => pattern.test(documentName))
            .includes(true)
        ) {
          connection.readOnly = true;

          return payload;
        } else {
          throw new Error(`Invalid Token`);
        }
      } else {
        throw new Error(`Invalid Token`);
      }
    } catch (e) {
      console.error(e);

      throw e;
    }
  },

  /* ====================================================== */
  /* END Hooks                                              */
  /* ====================================================== */
});

/* ====================================================== */
/* END Server Config                                      */
/* ====================================================== */

export default server;
