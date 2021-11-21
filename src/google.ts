import { ITranslate } from "./translate.interface";

import { TranslationServiceClient } from "@google-cloud/translate";
const supportedLanguages = [
  "af",
  "sq",
  "am",
  "ar",
  "hy",
  "az",
  "eu",
  "be",
  "bn",
  "bs",
  "bg",
  "ca",
  "ceb",
  "zh-CN",
  "zh",
  "zh-TW",
  "co",
  "hr",
  "cs",
  "da",
  "nl",
  "en",
  "eo",
  "et",
  "fi",
  "fr",
  "fy",
  "gl",
  "ka",
  "de",
  "el",
  "gu",
  "ht",
  "ha",
  "haw",
  "he",
  "iw",
  "hi",
  "hmn",
  "hu",
  "is",
  "ig",
  "id",
  "ga",
  "it",
  "ja",
  "jv",
  "kn",
  "kk",
  "km",
  "rw",
  "ko",
  "ku",
  "ky",
  "lo",
  "lv",
  "lt",
  "lb",
  "mk",
  "mg",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "mn",
  "my",
  "ne",
  "no",
  "ny",
  "or",
  "ps",
  "fa",
  "pl",
  "pt",
  "pa",
  "ro",
  "ru",
  "sm",
  "gd",
  "sr",
  "st",
  "sn",
  "sd",
  "si",
  "sk",
  "sl",
  "so",
  "es",
  "su",
  "sw",
  "sv",
  "tl",
  "tg",
  "ta",
  "tt",
  "te",
  "th",
  "tr",
  "tk",
  "uk",
  "ur",
  "ug",
  "uz",
  "vi",
  "cy",
  "xh",
  "yi",
  "yo",
  "zu",
];
export class GoogleTranslate implements ITranslate {
  private apikey: string;
  private googleTranslate: any;

  constructor(apikey: string) {
    this.apikey = apikey;
    this.googleTranslate = new TranslationServiceClient({ key: this.apikey });
    this.googleTranslate.getLanguages();
  }

  isValidLocale(targetLocale: string): boolean {
    return supportedLanguages.includes(targetLocale);
  }

  async translateText(
    text: string,
    _sourceLocale: string,
    targetLocale: string
  ): Promise<string> {
    const pattern = /{(.*?)}/g;
    const args = text.match(pattern);

    // replace arguments with numbers
    if (args) {
      let i = 0;
      for (let arg of args) {
        text = text.replace(arg, "{" + i + "}");
        i++;
      }
    }

    let result = "";

    try {
      const translations = await this.googleTranslate.translateText(
        text,
        targetLocale
      );
      result = translations[0];
    } catch (error) {
      if (error instanceof Error) {
        let message = error.message;
        if (error.message === "Invalid Value") {
          message = "Invalid Locale " + targetLocale;
        }
        console.log(message);
      }
      return "";
    }

    // replace arguments with numbers
    if (args) {
      let i = 0;
      for (let arg of args) {
        result = result.replace("{" + i + "}", arg);
        i++;
      }
    }

    return result;
  }
}
