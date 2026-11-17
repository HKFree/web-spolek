import type { Redaktor } from './auth';

// Publikaci (commit, build, zveřejnění, push) obstarává deploy/redakce/start.mjs,
// který se zaregistruje do globalThis. Ve vývojovém serveru publikace neběží
// a změny zůstávají jen v souborech.

export type PublishStatus = {
  state: 'local' | 'idle' | 'pending' | 'building' | 'error';
  message?: string;
  publishedAt?: string;
};

type Publisher = { notify(user: Redaktor | undefined): void; status(): PublishStatus };

const publisher = () => (globalThis as { __hkfreeRedakce?: Publisher }).__hkfreeRedakce;

export const notifyChange = (user: Redaktor | undefined) => publisher()?.notify(user);
export const publishStatus = (): PublishStatus => publisher()?.status() ?? { state: 'local' };
