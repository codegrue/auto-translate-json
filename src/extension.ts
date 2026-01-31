// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { translate, Configuration } from 'auto-translate-json-library';
const NAME = 'AutoTranslate';

// Supported file extensions
const SUPPORTED_EXTENSIONS = [
  '.json', '.xml', '.yaml', '.yml', '.arb', '.po', '.pot',
  '.xlf', '.xliff', '.xmb', '.xtb', '.properties', '.csv', '.tsv'
];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Extension "auto-translate-json" is active');

  vscode.commands.registerCommand(
    'extension.autotranslate',
    async (resource: vscode.Uri) => {
      // inform user if running the extension from the command bar
      if (resource === undefined) {
        showMessage(
          'You must run this extension by right clicking on a supported translation file'
        );
        return;
      }

      const apiType = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.apiType') as string;

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

      const deepLProSecretKey = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.deepLProSecretKey') as string;

      const deepLFreeSecretKey = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.deepLFreeSecretKey') as string;

      const azureRegion = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.azureRegion') as string;

      const openAIKey = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.openAIKey') as string;

      const openAIBaseURL = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.openAIBaseURL') as string;

      const openAIModel = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.openAIModel') as string;

      const openAIMaxTokens = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.openAIMaxTokens') as number;

      const openAITemperature = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.openAITemperature') as number ?? 0.1;

      const startDelimiter = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.startDelimiter') as string;

      const endDelimiter = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.endDelimiter') as string;

      const ignorePrefix = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.ignorePrefix') as string;

      const format = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.format') as string ?? 'auto';

      const fileMode =
        (vscode.workspace.getConfiguration().get('auto-translate-json.mode') as
          | 'file'
          | 'folder') ?? 'file';

      const sourceLocale = vscode.workspace
        .getConfiguration()
        .get('auto-translate-json.sourceLocale') as string;

      const config: Configuration = {} as Configuration;
      config.ignorePrefix = '';
      config.mode = fileMode;
      config.sourceLocale = sourceLocale;

      if (startDelimiter) {
        config.startDelimiter = startDelimiter;
      }

      if (endDelimiter) {
        config.endDelimiter = endDelimiter;
      }

      if (ignorePrefix) {
        config.ignorePrefix = ignorePrefix.trim();
      }

      // Set format if not auto
      if (format && format !== 'auto') {
        config.format = format;
      }

      // Build the config based on the desired type
      showWarning('Selected API is ' + apiType);
      switch (apiType) {
        case 'Google': {
          if (googleApiKey) {
            config.translationKeyInfo = {
              kind: 'google',
              apiKey: googleApiKey
            };
            break;
          } else {
            showWarning(
              'You must provide `googleApiKey` parameter first in the extension settings.'
            );
            return;
          }
        }

        case 'AWS': {
          if (awsAccessKeyId && awsSecretAccessKey && awsRegion) {
            config.translationKeyInfo = {
              kind: 'aws',
              accessKeyId: awsAccessKeyId,
              secretAccessKey: awsSecretAccessKey,
              region: awsRegion
            };
            break;
          } else {
            showWarning(
              'You must provide the `awsAccessKeyId`, `awsSecretAccessKey`, and `awsRegion` parameters first in the extension settings.'
            );
            return;
          }
        }

        case 'Azure': {
          if (azureSecretKey && azureRegion) {
            config.translationKeyInfo = {
              kind: 'azure',
              secretKey: azureSecretKey,
              region: azureRegion
            };
            break;
          } else {
            showWarning(
              'You must provide `azureSecretKey` and `azureRegion` parameters first in the extension settings.'
            );
            return;
          }
        }

        case 'DeepL': {
          if (deepLFreeSecretKey) {
            config.translationKeyInfo = {
              kind: 'deepLFree',
              secretKey: deepLFreeSecretKey
            };
            break;
          } else if (deepLProSecretKey) {
            config.translationKeyInfo = {
              kind: 'deepLPro',
              secretKey: deepLProSecretKey
            };
            break;
          } else {
            showWarning(
              'You must provide the `deepLFreeSecretKey` or `deepLProSecretKey` parameter first in the extension settings.'
            );
            return;
          }
        }

        case 'OpenAI': {
          if (openAIKey) {
            config.translationKeyInfo = {
              kind: 'openai',
              apiKey: openAIKey,
              baseUrl: openAIBaseURL || 'https://api.openai.com/v1',
              model: openAIModel || 'gpt-4.1-mini',
              maxTokens: openAIMaxTokens || 1000,
              temperature: openAITemperature,
              topP: 1,
              n: 1,
              frequencyPenalty: 0,
              presencePenalty: 0
            };
            break;
          } else {
            showWarning(
              'You must provide the `openAIKey` parameter first in the extension settings.'
            );
            return;
          }
        }

        default: {
          showWarning('Error: Invalid API Type');
          return;
        }
      }

      // ask user to pick options
      const keepTranslations = await askToPreserveTranslations();
      if (keepTranslations === null) {
        showWarning('You must select a translations option');
        return;
      }
      if (keepTranslations) {
        config.keepTranslations = 'keep';
      } else {
        config.keepTranslations = 'retranslate';
      }

      const keepExtras = await askToKeepExtra();
      if (keepExtras === null) {
        showWarning('You must select a keep option');
        return;
      }
      if (keepExtras) {
        config.keepExtraTranslations = 'keep';
      } else {
        config.keepExtraTranslations = 'remove';
      }
      await translate(resource.fsPath, config);

      showMessage('Translations have been added to the file', '');
    }
  );
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
