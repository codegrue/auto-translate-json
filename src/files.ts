import * as path from "path";
import * as fs from "fs";

export class Files {
  folderPath: string;
  sourceLocale: string;
  targetLocales: Array<string>;

  constructor(filePath: string) {
    this.folderPath = path.dirname(filePath);
    const fileName = path.basename(filePath);
    this.sourceLocale = this.getLocaleFromFilename(fileName);
    this.targetLocales = this.getTargetLocales();
  }

  private getLocaleFromFilename(fileName: string): string {
    return fileName.replace(".json", "");
  }

  private getTargetLocales(): string[] {
    const locales = new Array();

    const files = fs.readdirSync(this.folderPath);

    files.forEach((file) => {
      const locale = this.getLocaleFromFilename(file);
      if (locale !== this.sourceLocale) {
        locales.push(locale);
      }
    });

    return locales;
  }

  async loadJsonFromLocale(locale: string): Promise<any> {
    const filename = this.folderPath + "/" + locale + ".json";
    let data = await this.readFileAsync(filename);

    // handle empty files
    if (!data) {
      data = "{}";
    }

    const json = JSON.parse(data);

    return json;
  }

  private async readFileAsync(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, (error, data) => {
        error ? reject(error) : resolve(data.toString());
      });
    });
  }

  saveJsonToLocale(locale: string, file: any) {
    const filename = this.folderPath + "/" + locale + ".json";

    const data = JSON.stringify(file, null, "  ");

    fs.writeFileSync(filename, data, "utf8");
  }
}
