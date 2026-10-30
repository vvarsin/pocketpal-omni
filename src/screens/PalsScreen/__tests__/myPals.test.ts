import {myPals} from '../myPals';
import type {Pal} from '../../../types/pal';
import type {PalsHubPal} from '../../../types/palshub';

const hub = (id: string, title = `Hub ${id}`): PalsHubPal => ({
  type: 'palshub',
  id,
  creator_id: 'c',
  title,
  protection_level: 'public',
  price_cents: 0,
  allow_fork: true,
  created_at: '',
  updated_at: '',
});

const installed = (palshubId?: string, id = `local-${palshubId}`): Pal =>
  ({
    type: 'local',
    id,
    name: `Local ${id}`,
    palshub_id: palshubId,
    source: palshubId ? 'palshub' : 'local',
  }) as Pal;

describe('myPals', () => {
  it('prefers the installed local card over the library card', () => {
    const result = myPals([], [installed('p1')], [hub('p1')], []);
    expect(result.installed.map(p => p.id)).toEqual(['local-p1']);
    expect(result.library).toEqual([]);
  });

  it('keeps local Pals that never came from the hub', () => {
    const result = myPals([installed(undefined, 'mine')], [], [], []);
    expect(result.installed.map(p => p.id)).toEqual(['mine']);
  });

  it('dedupes library and created Pals', () => {
    const result = myPals([], [], [hub('p1')], [hub('p1'), hub('p2')]);
    expect(result.library.map(p => p.id)).toEqual(['p1', 'p2']);
  });

  it('shows one card for a Pal installed twice', () => {
    const result = myPals([], [installed('p1'), installed('p1', 'b')], [], []);
    expect(result.installed.map(p => p.id)).toEqual(['local-p1']);
  });
});
