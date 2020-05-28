// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { Files } from "./files";
import { GoogleTranslate } from "./google";

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
      var apikey = getApiKey();
      if (!apikey) {
        return;
      }
      var googleTranslate = new GoogleTranslate(apikey);

      var filePath = resource.path;
      var files = new Files(filePath);

      // log locale info
      console.log("Source locale = " + files.sourceLocale);
      console.log("Target locales = " + files.targetLocales);

      // enforce source locale if provided in settings
      var configLocale = getLocaleSetting(files.sourceLocale);
      if (!configLocale) {
        return;
      }

      // ask user to pick options
      var keepTranslations = await askToPreservevTranslations();
      var keepExtras = await askToKeepExtra();

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
    keepTranslations: boolean,
    keepExtras: boolean,
    locale: string,
    googleTranslate: GoogleTranslate
  ): Promise<any> {
    var destination: any = {};

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

function getApiKey(): string {
  var apikey = vscode.workspace
    .getConfiguration()
    .get("auto-translate-json.googleApiKey") as string;
  if (!apikey) {
    vscode.window.showErrorMessage(
      "You must provide a Google API key first in the extension settings."
    );
    return "";
  }
  return apikey;
}

function getLocaleSetting(sourceLocale: string): string {
  var configLocale = vscode.workspace
    .getConfiguration()
    .get("auto-translate-json.sourceLocale") as string;
  if (!configLocale || configLocale !== sourceLocale) {
    vscode.window.showErrorMessage(
      "You must use the " +
        configLocale +
        ".json file due to your Source Locale setting."
    );
    return "";
  }
  return configLocale;
}

function showError(error: Error, prefix: string = "") {
  var message = error.toString();
  if (error.message) {
    message = prefix + error.message;
  }
  console.error(message);
  vscode.window.showErrorMessage(message);
}

async function askToPreservevTranslations() {
  var keepTranslations = true;
  var optionKeep = "Preserve previous translations (default)";
  var optionReplace = "Retranslate previous translations";
  await vscode.window
    .showQuickPick([optionKeep, optionReplace])
    .then((selection) => {
      // the user canceled the selection
      if (!selection) {
        return;
      }
      if (selection === optionReplace) {
        keepTranslations = false;
      }
    });
  return keepTranslations;
}

async function askToKeepExtra() {
  var keepExtra = true;
  var optionKeep = "Keep extra translations (default)";
  var optionReplace = "Remove extra translations";
  await vscode.window
    .showQuickPick([optionKeep, optionReplace])
    .then((selection) => {
      // the user canceled the selection
      if (!selection) {
        return;
      }
      if (selection === optionReplace) {
        keepExtra = false;
      }
    });
  return keepExtra;
}

// this method is called when your extension is deactivated
export function deactivate() {}
