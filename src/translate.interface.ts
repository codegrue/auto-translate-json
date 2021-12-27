export interface ITranslate {
  isValidLocale(targetLocale: string): boolean;
  translateText(
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string>;
}
