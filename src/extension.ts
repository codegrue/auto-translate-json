// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Files, IFiles } from './files';
import { FolderFiles } from './folderFiles';

import { AWSTranslate } from './aws';
import { AzureTranslate } from './azure';
import { GoogleTranslate } from './google';
import { ITranslate } from './translate.interface';

const NAME = 'AutoTranslateJSON';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Extension "auto-translate-json" is active');

  vscode.commands.registerCommand(
    'extension.autotranslate',
    async (resource: vscode.Uri) => {
      // check that we have a google api key
      const googleApiKey = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.googleApiKey') as string;

      const awsAccessKeyId = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.awsAccessKeyId') as string;

      const awsSecretAccessKey = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.awsSecretAccessKey') as string;

      const awsRegion = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.awsRegion') as string;

      const azureSecretKey = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.azureSecretKey') as string;

      const azureRegion = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.azureRegion') as string;

      if (
        !googleApiKey &&
        !awsAccessKeyId &&
        !awsSecretAccessKey &&
        !awsRegion &&
        !azureSecretKey &&
        !azureRegion
      ) {
        showWarning(
          'You must provide a Google, AWS or Azure parameters first in the extension settings.'
        );

        return;
      }

      let translateEngine: ITranslate;

      if (googleApiKey) {
        translateEngine = new GoogleTranslate(googleApiKey);
      } else if (awsAccessKeyId && awsSecretAccessKey && awsRegion) {
        translateEngine = new AWSTranslate(
          awsAccessKeyId,
          awsSecretAccessKey,
          awsRegion
        );
      } else if (azureSecretKey && azureRegion) {
        translateEngine = new AzureTranslate(azureSecretKey, azureRegion);
      } else {
        showWarning(
          'You must provide a Google, AWS or Azure parameters first in the extension settings.'
        );
        return;
      }

      // inform user if running the extension from the command bar
      if (resource === null) {
        showMessage(
          'You must run this extension by right clicking on a .json file',
          ''
        );
        return;
      }

      const fileMode =
        (vscode.workspace.getConfiguration().get('auto-translate-json.mode') as
          | 'file'
          | 'folder') ?? 'file';

      const files = readFiles(resource.fsPath, fileMode);
      if (files === null) {
        return;
      }

      // enforce source locale if provided in settings
      const configLocale = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.sourceLocale') as string;
      if (!configLocale || configLocale !== files.sourceLocale) {
        showWarning(
          'You must use the ' +
            configLocale +
            '.json file due to your Source Locale setting.'
        );
        return;
      }

      // ask user to pick options
      const keepTranslations = await askToPreserveTranslations();
      if (keepTranslations === null) {
        showWarning('You must select a translations option');
        return;
      }
      const keepExtras = await askToKeepExtra();
      if (keepExtras === null) {
        showWarning('You must select a keep option');
        return;
      }

      // load source JSON
      let source: any;
      try {
        source = await files.loadJsonFromLocale(files.sourceLocale);
      } catch (error) {
        if (error instanceof Error) {
          showError(error, 'Source file malformed');
        }
        return;
      }

      // Iterate target Locales
      files.targetLocales.forEach(async (targetLocale) => {
        try {
          const isValid = await translateEngine.isValidLocale(targetLocale);
          if (!isValid) {
            throw Error(targetLocale + ' is not supported. Skipping.');
          }

          const targetOriginal = await files.loadJsonFromLocale(targetLocale);

          // Iterate source terms
          const targetNew = await recurseNode(
            source,
            targetOriginal,
            keepTranslations,
            keepExtras,
            files.sourceLocale,
            targetLocale,
            translateEngine
          );

          // save target
          files.saveJsonToLocale(targetLocale, targetNew);

          const feedback = "Translated locale '" + targetLocale + "'";
          console.log(feedback);
          vscode.window.showInformationMessage(feedback);
        } catch (error) {
          if (error instanceof Error) {
            showError(error);
          }
          return;
        }
      });
    }
  );

  const readFiles: (
    filePath: string,
    mode: 'file' | 'folder'
  ) => IFiles | null = (filePath: string, mode: string) => {
    try {
      const files: IFiles =
        mode === 'file' ? new Files(filePath) : new FolderFiles(filePath);

      // log locale info
      showMessage('Source locale = ' + files.sourceLocale);
      showMessage('Target locales = ' + files.targetLocales);

      return files;
    } catch (error) {
      if (error instanceof Error) {
        showError(error, 'Opening Files: ');
      }
      return null;
    }
  };

  async function recurseNode(
    source: any,
    original: any,
    keepTranslations: boolean | null,
    keepExtras: boolean | null,
    sourceLocale: string,
    locale: string,
    googleTranslate: ITranslate
  ): Promise<any> {
    const destination: any = {};

    // defaults
    if (keepTranslations === null) {
      keepTranslations = true;
    }
    if (keepExtras === null) {
      keepExtras = true;
    }

    for (const term in source) {
      const node = source[term];

      if (node instanceof Object && node !== null) {
        destination[term] = await recurseNode(
          node,
          original[term] ?? {},
          keepTranslations,
          keepExtras,
          sourceLocale,
          locale,
          googleTranslate
        );
      } else {
        // if we already have a translation, keep it
        if (keepTranslations && original[term]) {
          destination[term] = original[term];
        } else {
          const translation = await googleTranslate
            .translateText(node, sourceLocale, locale)
            .catch((err) => showError(err));
          destination[term] = translation;
        }
      }
    }

    if (keepExtras) {
      // add back in any terms that were not in source
      for (const term in original) {
        if (!destination[term]) {
          destination[term] = original[term];
        }
      }
    }

    return destination;
  }
}

function showError(error: Error, prefix: string = '') {
  let message = error.toString();
  if (error.message) {
    message = NAME + ': ' + prefix + error.message;
  } else {
    message = NAME + ': ' + prefix + message;
  }
  console.error(message);
  vscode.window.showErrorMessage(message);
}

function showWarning(message: string, prefix: string = '') {
  message = NAME + ': ' + prefix + message;
  console.log(message);
  vscode.window.showWarningMessage(message);
}

function showMessage(message: string, prefix: string = '') {
  message = NAME + ': ' + prefix + message;
  console.log(message);
  vscode.window.showInformationMessage(message);
}

async function askToPreserveTranslations(): Promise<boolean | null> {
  let keepTranslations: boolean | null = null;
  const optionKeep = 'Preserve previous translations (default)';
  const optionReplace = 'Retranslate previous translations';
  await vscode.window
    .showQuickPick([optionKeep, optionReplace])
    .then((selection) => {
      if (selection === optionReplace) {
        keepTranslations = false;
      }
      if (selection === optionKeep) {
        keepTranslations = true;
      }
    });
  return keepTranslations;
}

async function askToKeepExtra(): Promise<boolean | null> {
  let keepExtra: boolean | null = null;
  const optionKeep = 'Keep extra translations (default)';
  const optionReplace = 'Remove extra translations';
  await vscode.window
    .showQuickPick([optionKeep, optionReplace])
    .then((selection) => {
      if (selection === optionReplace) {
        keepExtra = false;
      }
      if (selection === optionKeep) {
        keepExtra = true;
      }
    });
  return keepExtra;
}

// this method is called when your extension is deactivated
export function deactivate() {}
