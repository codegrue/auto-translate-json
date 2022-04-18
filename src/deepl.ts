import FormData = require('form-data');
import { ITranslate } from './translate.interface';

const axios = require('axios').default;
import { Util } from './util';

const supportedLanguages = [
  'BG',
  'CS',
  'DA',
  'DE',
  'EL',
  'EN-GB',
  'EN-US',
  'EN',
  'ES',
  'ET',
  'FI',
  'FR',
  'HU',
  'IT',
  'JA',
  'LT',
  'LV',
  'NL',
  'PL',
  'PT-PT',
  'PT-BR',
  'PT',
  'RO',
  'RU',
  'SK',
  'SL',
  'SV',
  'ZH'
];

export class DeepLTranslate implements ITranslate {
  private endpoint = 'https://api.deepl.com';
  constructor(private subscriptionKey: string, private type: 'free' | 'pro') {
    if (this.type === 'free') {
      this.endpoint = 'https://api.free.deepl.com';
    }
  }
  isValidLocale(targetLocale: string): boolean {
    return supportedLanguages.includes(targetLocale.toUpperCase());
  }
  async translateText(
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string> {
    let args;
    ({ args, text } = Util.replaceContextVariables(text));

    let result = '';

    const formData = new FormData();
    formData.append('auth_key', this.subscriptionKey);
    formData.append('text', text);
    formData.append('source_lang', sourceLocale.toUpperCase());
    formData.append('target_lang', targetLocale.toUpperCase());

    const response = await axios({
      baseURL: this.endpoint,
      url: 'v2/translate',
      method: 'post',
      data: formData,
      responseType: 'json'
    });

    result = response.translations[1].text;

    result = Util.replaceArgumentsWithNumbers(args, result);

    return result;
  }
}

// https://www.deepl.com/docs-api/translating-text/example/
