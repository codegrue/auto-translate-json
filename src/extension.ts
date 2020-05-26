// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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

      // load source JSON
      var source = await files.loadJsonFromLocale(files.sourceLocale);

      var googleTranslate = new GoogleTranslate(apikey);

      // Iterate target Locales
      files.targetLocales.forEach(async (locale) => {
        console.log("Translating " + locale); //TODO: show in bottom bar

        var targetOriginal = await files.loadJsonFromLocale(locale);
        var targetNew: any = {};

        // Iterate source terms
        for (var term in source) {
          // if we already have a translation, keep it
          // TODO: control with input parameter, dialog, allow cancel
          if (targetOriginal[term]) {
            targetNew[term] = targetOriginal[term];
          } else {
            var value = source[term];

            var translation = await googleTranslate
              .translateText(value, locale)
              .catch((err) => vscode.window.showErrorMessage(err));

            targetNew[term] = translation;
          }
        }

        // save target
        files.saveJsonToLocale(locale, targetNew);
      });
    }
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
