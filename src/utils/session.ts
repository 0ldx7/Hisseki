// src/utils/session.ts
export const generateSessionId = () => '_' + Math.random().toString(36).substr(2, 9);
