import { ITranslate } from './translate.interface';
import { Util } from './util';

const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

const supportedLanguages = [
  'af',
  'sq',
  'am',
  'ar',
  'hy',
  'as',
  'az',
  'bn',
  'ba',
  'bs',
  'bg',
  'yue',
  'ca',
  'lzh',
  'zh-Hans',
  'zh-Hant',
  'hr',
  'cs',
  'da',
  'prs',
  'dv',
  'nl',
  'en',
  'et',
  'fj',
  'fil',
  'fi',
  'fr',
  'fr-ca',
  'ka',
  'de',
  'el',
  'gu',
  'ht',
  'he',
  'hi',
  'mww',
  'hu',
  'is',
  'id',
  'iu',
  'ga',
  'it',
  'ja',
  'kn',
  'kk',
  'km',
  'tlh-Latn',
  'tlh-Piqd',
  'ko',
  'ku',
  'kmr',
  'ky',
  'lo',
  'lv',
  'lt',
  'mk',
  'mg',
  'ms',
  'ml',
  'mt',
  'mi',
  'mr',
  'mn-Cyrl',
  'mn-Mong',
  'my',
  'ne',
  'nb',
  'or',
  'ps',
  'fa',
  'pl',
  'pt',
  'pt-pt',
  'pa',
  'otq',
  'ro',
  'ru',
  'sm',
  'sr-Cyrl',
  'sr-Latn',
  'sk',
  'sl',
  'es',
  'sw',
  'sv',
  'ty',
  'ta',
  'tt',
  'te',
  'th',
  'bo',
  'ti',
  'to',
  'tr',
  'tk',
  'uk',
  'ur',
  'ug',
  'uz',
  'vi',
  'cy',
  'yua'
];

export class AzureTranslate implements ITranslate {
  private endpoint = 'https://api.cognitive.microsofttranslator.com';
  constructor(
    private subscriptionKey: string,
    private subscriptionRegion: string
  ) {}
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

    const response = await axios({
      baseURL: this.endpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Ocp-Apim-Subscription-Region': this.subscriptionRegion,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      },
      params: {
        'api-version': '3.0',
        from: sourceLocale,
        to: [targetLocale]
      },
      data: [
        {
          text: text
        }
      ],
      responseType: 'json'
    });
    result = response.data[0].translations[0].text;

    result = Util.replaceArgumentsWithNumbers(args, result);

    return result;
  }
}

// https://docs.microsoft.com/en-us/azure/cognitive-services/translator/quickstart-translator?tabs=nodejs#translate-text

// Add your location, also known as region. The default is global.
// This is required if using a Cognitive Services resource.

/*

*/
