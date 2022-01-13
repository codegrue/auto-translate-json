export function replaceArgumentsWithNumbers(
  args: RegExpMatchArray | null,
  result: string
) {
  if (args) {
    let i = 0;
    for (let arg of args) {
      result = result.replace('{' + i + '}', arg);
      i++;
    }
  }
  return result;
}

export function replaceContextVariables(text: string) {
  const pattern = /{(.*?)}/g;
  const args = text.match(pattern);

  // replace arguments with numbers
  if (args) {
    let i = 0;
    for (let arg of args) {
      text = text.replace(arg, '{' + i + '}');
      i++;
    }
  }
  return { args, text };
}
