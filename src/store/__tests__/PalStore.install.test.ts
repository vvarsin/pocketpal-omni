import {runInAction} from 'mobx';

import {palStore} from '../PalStore';
import {palRepository} from '../../repositories/PalRepository';
import type {Pal} from '../../types/pal';
import type {PalsHubPal} from '../../types/palshub';

jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    clear: jest.fn(async () => values.clear()),
  };
});

const mockDb: Pal[] = [];

jest.mock('../../repositories/PalRepository', () => ({
  palRepository: {
    getAllPals: jest.fn(async () => []),
    checkAndMigrateFromJSON: jest.fn(async () => false),
    getPalByPalshubId: jest.fn(
      async (id: string) => mockDb.find(p => p.palshub_id === id) ?? null,
    ),
    createPal: jest.fn(async (data: Omit<Pal, 'id'>) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      const pal = {...data, id: `local-${mockDb.length + 1}`} as Pal;
      mockDb.push(pal);
      return pal;
    }),
    updatePal: jest.fn(async (id: string, updates: Partial<Pal>) => {
      const index = mockDb.findIndex(p => p.id === id);
      mockDb[index] = {...mockDb[index], ...updates};
      return mockDb[index];
    }),
    deletePal: jest.fn(async () => true),
  },
}));

jest.mock('../../utils/hfResolve', () => ({
  resolveHFModelForDownload: jest.fn().mockRejectedValue(new Error('offline')),
}));

jest.mock('../../utils/imageUtils', () => ({
  downloadPalThumbnail: jest.fn(async () => 'pal-images/thumb.png'),
  deletePalThumbnail: jest.fn(),
}));

jest.mock('../../services', () => ({palsHubService: {}}));

jest.mock('mobx-persist-store', () => ({makePersistable: jest.fn()}));

const hubPal = (overrides: Partial<PalsHubPal> = {}): PalsHubPal => ({
  type: 'palshub',
  id: 'hub-1',
  creator_id: 'creator',
  title: 'Story Pal',
  description: 'Tells stories',
  protection_level: 'public',
  price_cents: 0,
  allow_fork: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  system_prompt: 'You tell stories.',
  ...overrides,
});

describe('PalStore hub install', () => {
  beforeEach(async () => {
    await palStore.ready;
    jest.clearAllMocks();
    mockDb.length = 0;
    runInAction(() => {
      palStore.pals = [];
    });
  });

  it('exposes readiness as the initialize promise', async () => {
    await expect(palStore.ready).resolves.toBeUndefined();
  });

  it('installs a hub Pal as a local Pal', async () => {
    const localPal = await palStore.downloadPalsHubPal(hubPal());

    expect(localPal.palshub_id).toBe('hub-1');
    expect(localPal.systemPrompt).toBe('You tell stories.');
    expect(palStore.pals).toHaveLength(1);
  });

  it('creates one local Pal for two concurrent installs', async () => {
    const [first, second] = await Promise.all([
      palStore.downloadPalsHubPal(hubPal()),
      palStore.downloadPalsHubPal(hubPal()),
    ]);

    expect(palRepository.createPal).toHaveBeenCalledTimes(1);
    expect(first.id).toBe(second.id);
    expect(palStore.pals).toHaveLength(1);
  });

  it('adopts an existing Pal without writing it', async () => {
    mockDb.push({
      type: 'local',
      id: 'db-only',
      name: 'Story Pal',
      systemPrompt: 'You tell stories.',
      isSystemPromptChanged: false,
      useAIPrompt: false,
      parameters: {},
      parameterSchema: [],
      source: 'palshub',
      palshub_id: 'hub-1',
    } as Pal);

    const localPal = await palStore.downloadPalsHubPal(
      hubPal({title: 'New title', system_prompt: 'New prompt.'}),
    );

    expect(localPal.id).toBe('db-only');
    expect(palRepository.createPal).not.toHaveBeenCalled();
    expect(palRepository.updatePal).not.toHaveBeenCalled();
    expect(localPal.systemPrompt).toBe('You tell stories.');
    expect(palStore.getPalById('db-only')).toBeDefined();
  });
});
