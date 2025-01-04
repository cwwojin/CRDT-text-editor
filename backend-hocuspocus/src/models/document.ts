import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema({
  id: {
    required: true,
    unique: true,
    type: String,
  },
  ydoc: {
    required: true,
    type: Buffer,
    default: null,
  },
  tiptapJson: {
    required: false,
    type: String,
  },
  html: {
    required: false,
    type: String,
  },
});

export const Document = mongoose.model('document', documentSchema);
