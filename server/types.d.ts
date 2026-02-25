declare module 'better-sqlite3-session-store' {
  import session from 'express-session';
  function BetterSqlite3SessionStore(session: typeof import('express-session')): new (options: { client: unknown; expired?: { clear: boolean; intervalMs: number } }) => session.Store;
  export = BetterSqlite3SessionStore;
}
