# Auto Translate JSON

Adds a menu item to JSON files to automatically translate them into other languages using Google Translate, Aws Translate or Azure Translate.

## How it works

![demo](images/demo.gif)

When localizing an application, if you have a folder called something like `translations`, `languages`, or `i18n` that contains JSON files for each language, you can use this extension to right click on your primary language file and automatically create additional translations. It uses the Google/AWS/Azure Translate API to perform the translations, and you must have your own API key to make the calls.

Just create empty files with the locale names as filenames and this extension will generate their translations. For example, if you want French, create a file `fr.json`. Right click on `en.json`, pick "Auto Translate JSON" and voilà, you have a version in French.

## Features

- Option to keep existing translations, to cut down on data processing when adding new terms
- Option to keep extra translations, if one language has additional unique terms
- Supports nested JSON elements
- Supports named arguments such as: "Zip code {zip} is in {city}, {state}."
- processes all files simultaneously

## Supported languages

- Google: <https://cloud.google.com/translate/docs/languages>
- AWS: <https://docs.aws.amazon.com/translate/latest/dg/what-is.html#what-is-languages>
- Azure: <https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support>

## Requirements

Since translation services are not free, you must provide your own API key.

For Google API key you need to provide just API key. Luckily Google gives a decent amount of translations in a trial period. Go here to set up your account and request a key:
<https://console.developers.google.com/apis/library/translate.googleapis.com>

For AWS you need to provide your access key and secret key. Go here to set up your account and request an access key and secret key and region to use:
<https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/>

For Azure you need to provide your subscription key and region. Go here to set up your account and request a subscription key:
<https://azure.microsoft.com/en-us/free/>

## Getting Started

1. Request a Google/AWS/Azure Translate API key
2. Install this extension
3. Go to VSCode `Settings>Extensions>Auto Translate JSON`

   ![settings](images/settings.png)

4. Enter your Google/AWS/Azure API key / access key / subscription key / region
5. (optional) Change the `Source Locale` setting if you don't want English
6. Create empty files for each locale you want to translate into.
   Locale should correspond to the language code used by the translation service. For example, if you want French, create a file `fr.json`.If you use Azure and want to translate into Serbian , create a file `sr-Cyrl.json` for Serbian Cyrillic translation or `sr-Latn.json` for Serbian Latin translation.If you use AWS or Google and want to translate into Serbian , create a file `sr.json` for Serbian translation.

   ![files](images/files.png)

7. Right click the source .json file (en.json by default) and pick "Auto Translate JSON"
8. At the prompt decide if you want to preserve previously translated values (i.e. not reprocess)

   ![preserve-existing](images/preserve-existing.png)

9. At the prompt decide if you want to keep extra translations

   ![keep-existing](images/keep-extra.png)

10. Verify your language files have been updated

## Extension Settings

This extension contributes the following settings (Menu>Preferences>Settings):

- `auto-translate-json.sourceLocale`: A failsafe to prevent processing the wrong file. Defaults to "en" for english. You can change this to any valid two letter locale code you wish to use.

- `auto-translate-json.mode`: \"file\": files in same folder like \"en.json\"...; \"folder\": files in subfolders like \"en/translation.json\

### Google

- `auto-translate-json.googleApiKey`: Enter your Google API key in this setting.

### AWS

- `auto-translate-json.awsAccessKeyId`: Enter your AWS API access key Id in this setting.

- `auto-translate-json.awsSecretAccessKey`: Enter your AWS API secret access key in this setting.

- `auto-translate-json.awsRegion`: Enter your AWS region in this setting.

### Azure

- `auto-translate-json.azureSecurityKey`: Enter your Azure security key in this setting.

- `auto-translate-json.azureRegion`: Enter your Azure region in this setting.

### Mode

- `auto-translate-json.mode`: Enter \"file\" if translations are files in same folder like \"en.json\"
   or \"folder\" if translation files are in sub folders like \"en/translation.json\"

### Start delimiter

- `auto-translate-json.startDelimiter`: Start delimiter for named arguments. Defaults to \"{\"
if you use ngx-transate or ngx-transloco you should use \"{{\"

### End delimiter

- `auto-translate-json.endDelimiter`: End delimiter for named arguments. Defaults to \"}\"
if you use ngx-transate or ngx-transloco you should use \"}}\"

## Limitations

- files must be named with the locale code that may be different depending on the translation service that you use. Please see the supported languages above.

### Prices

- Google

<https://cloud.google.com/translate/pricing>

- AWS

<https://aws.amazon.com/translate/pricing/>

- Azure

<https://azure.microsoft.com/en-us/pricing/details/cognitive-services/translator/>

### WARNING

Keep your keys safe!
