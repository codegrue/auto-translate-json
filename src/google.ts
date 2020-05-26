const { Translate } = require("@google-cloud/translate").v2;

export class GoogleTranslate {
  apikey: string;
  googleTranslate: any;

  constructor(apikey: string) {
    this.apikey = apikey;
    this.googleTranslate = new Translate({ key: this.apikey });
  }
  async translateText(text: string, target: string): Promise<string> {
    var translations = await this.googleTranslate.translate(text, target);
    return translations[0];
  }
}
