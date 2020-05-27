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
      var apikey = (await vscode.workspace
        .getConfiguration()
        .get("googleApiKey")) as string;
      if (!apikey) {
        vscode.window.showErrorMessage(
          "You must provide a Google API key first in the extension settings."
        );
        return;
      }

      var filePath = resource.path;
      var files = new Files(filePath);

      // log locale info
      console.log("Source locale = " + files.sourceLocale);
      console.log("Target locales = " + files.targetLocales);

      // enforce source locale if provided in settings
      var configLocale = (await vscode.workspace
        .getConfiguration()
        .get("sourceLocale")) as string;
      if (!configLocale || configLocale !== files.sourceLocale) {
        vscode.window.showErrorMessage(
          "You must use the " +
            configLocale +
            ".json file due to your Source Locale setting."
        );
        return;
      }

      // ask user to pick options
      var keepTranslations = await askToKeepTranslations();
      var keepExtras = await askToKeepExtra();

      // load source JSON
      var source = await files.loadJsonFromLocale(files.sourceLocale);

      // show status message while running
      var statusMessage = vscode.window.setStatusBarMessage("Translating...");
      var googleTranslate = new GoogleTranslate(apikey);

      // Iterate target Locales
      files.targetLocales.forEach(async (locale) => {
        console.log("Translating " + locale);

        var targetOriginal = await files.loadJsonFromLocale(locale);
        var targetNew: any = {};

        // Iterate source terms
        for (var term in source) {
          // if we already have a translation, keep it
          if (keepTranslations && targetOriginal[term]) {
            targetNew[term] = targetOriginal[term];
          } else {
            var value = source[term];

            var translation = await googleTranslate
              .translateText(value, locale)
              .catch((err) => vscode.window.showErrorMessage(err));

            targetNew[term] = translation;
          }
        }

        if (keepExtras) {
          // add back in any terms that were not in source
          for (var term in targetOriginal) {
            if (!targetNew[term]) {
              targetNew[term] = targetOriginal[term];
            }
          }
        }

        // save target
        files.saveJsonToLocale(locale, targetNew);
      });

      statusMessage.dispose();
    }
  );
}

async function askToKeepTranslations() {
  var keepTranslations = true;
  var optionKeep = "Keep existing translations";
  var optionReplace = "Replace existing translations";
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
  var optionKeep = "Keep extra translations";
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
