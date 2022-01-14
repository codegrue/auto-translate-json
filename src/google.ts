import { ITranslate } from './translate.interface';

import { TranslationServiceClient } from '@google-cloud/translate';
import { replaceContextVariables, replaceArgumentsWithNumbers } from './util';
const supportedLanguages = [
  'af',
  'sq',
  'am',
  'ar',
  'hy',
  'az',
  'eu',
  'be',
  'bn',
  'bs',
  'bg',
  'ca',
  'ceb',
  'zh-CN',
  'zh',
  'zh-TW',
  'co',
  'hr',
  'cs',
  'da',
  'nl',
  'en',
  'eo',
  'et',
  'fi',
  'fr',
  'fy',
  'gl',
  'ka',
  'de',
  'el',
  'gu',
  'ht',
  'ha',
  'haw',
  'he',
  'iw',
  'hi',
  'hmn',
  'hu',
  'is',
  'ig',
  'id',
  'ga',
  'it',
  'ja',
  'jv',
  'kn',
  'kk',
  'km',
  'rw',
  'ko',
  'ku',
  'ky',
  'lo',
  'lv',
  'lt',
  'lb',
  'mk',
  'mg',
  'ms',
  'ml',
  'mt',
  'mi',
  'mr',
  'mn',
  'my',
  'ne',
  'no',
  'ny',
  'or',
  'ps',
  'fa',
  'pl',
  'pt',
  'pa',
  'ro',
  'ru',
  'sm',
  'gd',
  'sr',
  'st',
  'sn',
  'sd',
  'si',
  'sk',
  'sl',
  'so',
  'es',
  'su',
  'sw',
  'sv',
  'tl',
  'tg',
  'ta',
  'tt',
  'te',
  'th',
  'tr',
  'tk',
  'uk',
  'ur',
  'ug',
  'uz',
  'vi',
  'cy',
  'xh',
  'yi',
  'yo',
  'zu'
];
export class GoogleTranslate implements ITranslate {
  private apikey: string;
  private googleTranslate: TranslationServiceClient;

  constructor(apikey: string) {
    this.apikey = apikey;
    this.googleTranslate = new TranslationServiceClient({ key: this.apikey });
    this.googleTranslate.getSupportedLanguages();
  }

  isValidLocale(targetLocale: string): boolean {
    return supportedLanguages.includes(targetLocale);
  }

  async translateText(
    text: string,
    _sourceLocale: string,
    targetLocale: string
  ): Promise<string> {
    let args;
    ({ args, text } = replaceContextVariables(text));

    let result = '';

    try {
      const response = await this.googleTranslate.translateText({
        contents: [text],
        targetLanguageCode: targetLocale
      }
      );
      result = response[0].toString();
    } catch (error) {
      if (error instanceof Error) {
        let message = error.message;
        if (error.message === 'Invalid Value') {
          message = 'Invalid Locale ' + targetLocale;
        }
        console.log(message);
        return message;
      }
      return "error";
    }

    // replace arguments with numbers
    result = replaceArgumentsWithNumbers(args, result);

    return result;
  }
}
