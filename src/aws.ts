import { ITranslate } from './translate.interface';

import {
  Translate,
  TranslateTextCommandInput
} from '@aws-sdk/client-translate';
import { Util } from './util';

const supportedLanguages = [
  'af',
  'sq',
  'am',
  'ar',
  'hy',
  'az',
  'bn',
  'bs',
  'bg',
  'ca',
  'zh',
  'zh-TW',
  'hr',
  'cs',
  'da',
  'fa-AF',
  'nl',
  'en',
  'et',
  'fa',
  'tl',
  'fi',
  'fr',
  'fr-CA',
  'ka',
  'de',
  'el',
  'gu',
  'ht',
  'ha',
  'he',
  'hi',
  'hu',
  'is',
  'id',
  'ga',
  'it',
  'ja',
  'kn',
  'kk',
  'ko',
  'lv',
  'lt',
  'mk',
  'ms',
  'ml',
  'mt',
  'mr',
  'mn',
  'no',
  'ps',
  'pl',
  'pt',
  'pt-PT',
  'pa',
  'ro',
  'ru',
  'sr',
  'si',
  'sk',
  'sl',
  'so',
  'es',
  'es-MX',
  'sw',
  'sv',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'ur',
  'uz',
  'vi',
  'cy'
];

export class AWSTranslate implements ITranslate {
  private client: Translate;
  constructor(
    private accessKeyId: string,
    private secretAccessKey: string,
    private regions: string
  ) {
    this.client = new Translate({
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey
      },
      region: this.regions
    });
  }
  isValidLocale(targetLocale: string): boolean {
    return supportedLanguages.includes(targetLocale);
  }
  async translateText(
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string> {
    let args;
    ({ args, text } = Util.replaceContextVariables(text));

    let result = '';

    const params: TranslateTextCommandInput = {
      SourceLanguageCode: sourceLocale,
      TargetLanguageCode: targetLocale,
      Text: text
    };

    try {
      const translation = await this.client.translateText(params);
      result = translation.TranslatedText as string;
    } catch (error) {
      console.log(error);
      return '';
    }

    result = Util.replaceArgumentsWithNumbers(args, result);

    return result;
  }
}
