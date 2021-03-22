// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { Files } from "./files";
import { GoogleTranslate } from "./google";

const NAME = "AutoTranslateJSON";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Extension "auto-translate-json" is active');

  vscode.commands.registerCommand(
    "extension.autotranslate",
    async (resource: vscode.Uri) => {
      // check that we have a google api key
      var apikey = vscode.workspace
        .getConfiguration()
        .get("auto-translate-json.googleApiKey") as string;
      if (!apikey) {
        showWarning(
          "You must provide a Google API key first in the extension settings."
        );
        return;
      }

      var googleTranslate = new GoogleTranslate(apikey);

      // inform user if runnign the extension from the command bar
      if (resource == null) { 
        showMessage("You must run this extension by right clicking on a .json file", ""); 
        return;
      }

      var filePath: string;
      var files: Files;
      try {
        filePath = resource.fsPath;
        files = new Files(filePath);

        // log locale info
        showMessage("Source locale = " + files.sourceLocale);
        showMessage("Target locales = " + files.targetLocales);
      } catch (error) {
        showError(error, "Opening Files: ");
        return;
      }

      // enforce source locale if provided in settings
      var configLocale = vscode.workspace
        .getConfiguration()
        .get("auto-translate-json.sourceLocale") as string;
      if (!configLocale || configLocale !== files.sourceLocale) {
        showWarning(
          "You must use the " +
            configLocale +
            ".json file due to your Source Locale setting."
        );
        return;
      }

      // ask user to pick options
      var keepTranslations = await askToPreservevTranslations();
      if (keepTranslations === null) {
        showWarning("You must select a translations option");
        return;
      }
      var keepExtras = await askToKeepExtra();
      if (keepExtras === null) {
        showWarning("You must select a keep option");
        return;
      }

      // load source JSON
      try {
        var source = await files.loadJsonFromLocale(files.sourceLocale);
      } catch (error) {
        showError(error, "Source file malfored");
        return;
      }

      // Iterate target Locales
      files.targetLocales.forEach(async (targetLocale) => {
        try {
          var isValid = await googleTranslate.isValidLocale(targetLocale);
          if (!isValid) {
            throw Error(targetLocale + " is not supported. Skipping.");
          }

          var targetOriginal = await files.loadJsonFromLocale(targetLocale);

          // Iterate source terms
          var targetNew = await recurseNode(
            source,
            targetOriginal,
            keepTranslations,
            keepExtras,
            targetLocale,
            googleTranslate
          );

          // save target
          files.saveJsonToLocale(targetLocale, targetNew);

          var feedback = "Translated locale '" + targetLocale + "'";
          console.log(feedback);
          vscode.window.showInformationMessage(feedback);
        } catch (error) {
          showError(error.message);
          return;
        }
      });
    }
  );

  async function recurseNode(
    source: any,
    original: any,
    keepTranslations: boolean | null,
    keepExtras: boolean | null,
    locale: string,
    googleTranslate: GoogleTranslate
  ): Promise<any> {
    var destination: any = {};

    // defaults
    if (keepTranslations === null) {
      keepTranslations = true;
    }
    if (keepExtras === null) {
      keepExtras = true;
    }

    for (var term in source) {
      var node = source[term];

      if (node instanceof Object && node !== null) {
        destination[term] = await recurseNode(
          node,
          original[term] ?? {},
          keepTranslations,
          keepExtras,
          locale,
          googleTranslate
        );
      } else {
        // if we already have a translation, keep it
        if (keepTranslations && original[term]) {
          destination[term] = original[term];
        } else {
          var translation = await googleTranslate
            .translateText(node, locale)
            .catch((err) => showError(err));
          destination[term] = translation;
        }
      }
    }

    if (keepExtras) {
      // add back in any terms that were not in source
      for (var term in original) {
        if (!destination[term]) {
          destination[term] = original[term];
        }
      }
    }

    return destination;
  }
}

function showError(error: Error, prefix: string = "") {
  var message = error.toString();
  if (error.message) {
    message = NAME + ": " + prefix + error.message;
  } else {
    message = NAME + ": " + prefix + message;
  }
  console.error(message);
  vscode.window.showErrorMessage(message);
}

function showWarning(message: string, prefix: string = "") {
  message = NAME + ": " + prefix + message;
  console.log(message);
  vscode.window.showWarningMessage(message);
}

function showMessage(message: string, prefix: string = "") {
  message = NAME + ": " + prefix + message;
  console.log(message);
  vscode.window.showInformationMessage(message);
}

async function askToPreservevTranslations(): Promise<boolean | null> {
  var keepTranslations: boolean | null = null;
  var optionKeep = "Preserve previous translations (default)";
  var optionReplace = "Retranslate previous translations";
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
  var keepExtra: boolean | null = null;
  var optionKeep = "Keep extra translations (default)";
  var optionReplace = "Remove extra translations";
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
