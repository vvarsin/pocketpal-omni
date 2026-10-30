import {Platform} from 'react-native';

import {clientHeaders, getApiBase, setApiBaseOverride} from '../apiBase';

describe('apiBase', () => {
  afterEach(() => {
    (global as any).__E2E__ = true;
    setApiBaseOverride(undefined);
  });

  it('uses the configured base by default', () => {
    expect(getApiBase()).toBe('https://palshub.ai');
  });

  it('applies an override in e2e builds', () => {
    setApiBaseOverride('http://127.0.0.1:8787');
    expect(getApiBase()).toBe('http://127.0.0.1:8787');
    setApiBaseOverride(undefined);
    expect(getApiBase()).toBe('https://palshub.ai');
  });

  it('ignores an override outside e2e builds', () => {
    (global as any).__E2E__ = false;
    setApiBaseOverride('http://127.0.0.1:8787');
    expect(getApiBase()).toBe('https://palshub.ai');
  });

  it('sends the client platform and no in-app purchase header', () => {
    expect(clientHeaders()).toEqual({
      'X-Client-Platform': Platform.OS,
    });
  });
});
