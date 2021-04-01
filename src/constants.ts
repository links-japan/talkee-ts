export const isProduct = process.env.APP_ENV === "prod";

export const APP_ENV = process.env.APP_ENV;

export const APP_TOKEN = process.env.APP_TOKEN;

export const API_BASE = process.env.API_BASE;

export const LOGIN_BASE = process.env.LOGIN_BASE;

export const CLIENT_ID = process.env.CLIENT_ID;

export const LOGIN_URL = `${LOGIN_BASE}?client_id=${CLIENT_ID}&scope=PROFILE:READ+PHONE:READ&state=`;

export const TWEET_BASE = "https://twitter.com/intent/tweet";

export const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0YzRjMiLz4KPC9zdmc+Cg==";
