export interface TiptapJwtPayload {
  sub: string;
  allowedDocumentNames: string[];
  readonlyDocumentNames?: string[];
}
