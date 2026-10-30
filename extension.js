const vscode = require('vscode');

/**
 * 将 python2 打印的 dict 数据转为 json
 * 第一步：将 u' 替换为 '
 * 第二步：将 ' 替换为 "
 * 第三步：将 unicode 编码（\uXXXX）转为 utf-8
 * @param {string} input
 * @returns {string}
 */
function pythonToJson(input) {
  // 第一步：去掉 python2 的 unicode 前缀 u
  let text = input.replace(/u'/g, "'");
  // 第二步：单引号替换为双引号
  text = text.replace(/'/g, '"');
  // 第三步：将 \uXXXX 转为对应字符（utf-8）
  text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );
  return text;
}

/**
 * 将列表数据转为 sql 列表查询数据
 * 每行开头结尾加上 '，换行替换为 ,，若最后一个字符为 , 则删除
 * @param {string} input
 * @returns {string}
 */
function listToSql(input) {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => `'${l}'`);
  return lines.join(',');
}

/**
 * 去重：先去除全部空白行（只有换行符/空白），再对剩余行去重。
 * 保留首次出现的顺序。
 * @param {string} input
 * @returns {string}
 */
function duplicate(input) {
  const lines = input
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  const seen = new Set();
  const result = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result.join('\n');
}

/**
 * 获取当前编辑器选中的文本；未选中时返回整个文档内容。
 * @param {vscode.TextEditor} editor
 * @returns {{ text: string, range: vscode.Range | undefined }}
 */
function getTargetText(editor) {
  const selection = editor.selection;
  if (selection && !selection.isEmpty) {
    return { text: editor.document.getText(selection), range: selection };
  }
  const firstLine = editor.document.lineAt(0);
  const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
  const range = new vscode.Range(firstLine.range.start, lastLine.range.end);
  return { text: editor.document.getText(range), range };
}

function transform(command, converter) {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Text Tool: 请先打开一个文件');
      return;
    }
    const { text, range } = getTargetText(editor);
    if (!text) {
      vscode.window.showWarningMessage('Text Tool: 没有可转换的内容');
      return;
    }
    let result;
    try {
      result = converter(text);
    } catch (err) {
      vscode.window.showErrorMessage('Text Tool: 转换失败 - ' + err.message);
      return;
    }
    await editor.edit((editBuilder) => {
      editBuilder.replace(range, result);
    });
    vscode.window.showInformationMessage(`Text Tool: ${command} 完成`);
  };
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'textTool.pythonToJson',
      transform('python to json', pythonToJson)
    ),
    vscode.commands.registerCommand(
      'textTool.listToSql',
      transform('list to sql', listToSql)
    ),
    vscode.commands.registerCommand(
      'textTool.duplicate',
      transform('duplicate', duplicate)
    )
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  pythonToJson,
  listToSql,
  duplicate,
};
