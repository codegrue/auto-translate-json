import * as path from "path";
import * as fs from "fs";

export class Files {
  folderPath: string;
  sourceLocale: string;
  targetLocales: Array<string>;

  constructor(filePath: string) {
    this.folderPath = path.dirname(filePath);
    var fileName = path.basename(filePath);
    this.sourceLocale = this.getLocaleFromFilename(fileName);
    this.targetLocales = this.getTargetLocales();
  }

  private getLocaleFromFilename(fileName: string): string {
    return fileName.replace(".json", "");
  }

  private getTargetLocales(): string[] {
    var locales = new Array();

    var files = fs.readdirSync(this.folderPath);

    files.forEach((file) => {
      var locale = this.getLocaleFromFilename(file);
      if (locale !== this.sourceLocale) {
        locales.push(locale);
      }
    });

    return locales;
  }

  async loadJsonFromLocale(locale: string): Promise<any> {
    var filename = this.folderPath + "/" + locale + ".json";
    var data = await this.readFileAsync(filename);

    // handle empty files
    if (!data) {
      data = "{}";
    }

    var json = JSON.parse(data);

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
    var filename = this.folderPath + "/" + locale + ".json";

    var data = JSON.stringify(file, null, "\t");

    fs.writeFileSync(filename, data, "utf8");
  }
}
