import type {Pal} from '../../types/pal';
import type {PalsHubPal} from '../../types/palshub';

export interface MyPals {
  installed: Pal[];
  library: PalsHubPal[];
}

export const myPals = (
  local: Pal[],
  downloaded: Pal[],
  library: PalsHubPal[],
  created: PalsHubPal[],
): MyPals => {
  const seen = new Set<string>();
  const installed = [...local, ...downloaded].filter(pal => {
    if (!pal.palshub_id) {
      return true;
    }
    if (seen.has(pal.palshub_id)) {
      return false;
    }
    seen.add(pal.palshub_id);
    return true;
  });

  const accountCards = [...library, ...created].filter(card => {
    if (seen.has(card.id)) {
      return false;
    }
    seen.add(card.id);
    return true;
  });

  return {installed, library: accountCards};
};
