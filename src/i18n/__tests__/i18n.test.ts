import en from '../en';
import ja from '../ja';

function flattenKeys(obj: Record<string, any>, prefix = ''): Record<string, string> {
  let result: Record<string, string> = {};
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(result, flattenKeys(obj[k], fullKey));
    } else {
      result[fullKey] = String(obj[k]);
    }
  }
  return result;
}

function extractVariables(str: string): string[] {
  const matches = str.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  return matches.map((m) => m.replace(/[\{\}]/g, '').trim()).sort();
}

describe('i18n translation resources', () => {
  const flatEn = flattenKeys(en);
  const flatJa = flattenKeys(ja);

  it('en and ja have identical key sets', () => {
    const enKeys = Object.keys(flatEn).sort();
    const jaKeys = Object.keys(flatJa).sort();
    expect(enKeys).toEqual(jaKeys);
  });

  it('has no empty strings in en', () => {
    for (const [key, val] of Object.entries(flatEn)) {
      expect(val.trim().length).toBeGreaterThan(0);
    }
  });

  it('has no empty strings in ja', () => {
    for (const [key, val] of Object.entries(flatJa)) {
      expect(val.trim().length).toBeGreaterThan(0);
    }
  });

  it('has identical {{variables}} per key between en and ja', () => {
    for (const key of Object.keys(flatEn)) {
      const enVars = extractVariables(flatEn[key]);
      const jaVars = extractVariables(flatJa[key]);
      expect(jaVars).toEqual(enVars);
    }
  });
});
