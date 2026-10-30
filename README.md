# Text Tool

日常开发文本转换工具。安装后，在编辑器中点击右键会出现 **text tool** 菜单，鼠标移上去展开子选项。

## 功能

### python to json

将 python2 打印的 dict 数据转为 json：

1. 将 `u'` 替换为 `'`
2. 将 `'` 替换为 `"`
3. 将 unicode 编码（`\uXXXX`）转为 utf-8 字符

### list to sql

将列表数据转为 sql 列表查询数据：每行开头结尾加上 `'`，换行替换为 `,`，若最后一个字符为 `,` 则删除。

### duplicate

去重：先去除全部空白行（只有换行符/空白），再对剩余行去重，保留首次出现的顺序。

## 使用

1. 选中要转换的文本（未选中则处理整个文档）。
2. 右键 → **text tool** → 选择 `python to json` 或 `list to sql`。

## 本地调试

```bash
npm install -g @vscode/vsce   # 如需打包
```

在 VS Code 中打开本目录，按 `F5` 启动扩展开发宿主窗口即可测试。
