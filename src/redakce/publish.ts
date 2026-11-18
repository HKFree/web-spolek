import type { Redaktor } from './auth';

// Publikaci obstarává deploy/redakce/start.mjs přes globalThis; v npm run dev neběží.

export type PublishStatus = {
  state: 'local' | 'idle' | 'pending' | 'building' | 'error';
  message?: string;
  publishedAt?: string;
};

type Publisher = { notify(user: Redaktor | undefined): void; status(): PublishStatus };

const publisher = () => (globalThis as { __hkfreeRedakce?: Publisher }).__hkfreeRedakce;

export const notifyChange = (user: Redaktor | undefined) => publisher()?.notify(user);
export const publishStatus = (): PublishStatus => publisher()?.status() ?? { state: 'local' };
