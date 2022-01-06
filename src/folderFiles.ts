import * as path from 'path';
import * as fs from 'fs';
import { IFiles, loadJsonFromLocale, saveJsonToLocale } from './files';

export class FolderFiles implements IFiles {
  folderPath: string;
  sourceLocale: string;
  targetLocales: Array<string>;
  fileName: string;

  constructor(filePath: string) {
    const localeDir = path.dirname(filePath);
    this.folderPath = path.dirname(localeDir);
    this.fileName = path.basename(filePath);
    this.sourceLocale = path.basename(localeDir);
    this.targetLocales = this.getTargetLocales();

    console.log(
      this.folderPath,
      this.fileName,
      this.sourceLocale,
      this.targetLocales
    );
  }

  private getTargetLocales(): string[] {
    let files = fs
      .readdirSync(this.folderPath)
      .map((folder) => path.basename(folder))
      .map((locale) => (locale !== this.sourceLocale ? locale : ''))
      .filter((x) => x); // do not want empty strings

    return files;
  }

  private createFileName(locale: string): string {
    return `${this.folderPath}/${locale}/${this.fileName}`;
  }

  loadJsonFromLocale(locale: string) {
    return loadJsonFromLocale(this.createFileName(locale));
  }

  saveJsonToLocale(locale: string, file: any) {
    saveJsonToLocale(this.createFileName(locale), file);
  }
}
