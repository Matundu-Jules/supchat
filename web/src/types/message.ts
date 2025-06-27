// src/types/message.ts

export interface Message {
  _id: string;
  text?: string;
  content?: string;
  userId?: { email?: string; username?: string };
  author?: { email?: string; username?: string };
  createdAt?: string;
  file?: string;
  filename?: string;
  mimetype?: string;
  [key: string]: unknown;
}
