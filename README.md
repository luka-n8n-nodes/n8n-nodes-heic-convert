# n8n-nodes-heic-convert

n8n 社区节点插件，用于将 HEIC/HEIF 格式图片转换为 PNG 或 JPEG 格式。

## 功能

- 支持 HEIC/HEIF 图片转 JPEG
- 支持 HEIC/HEIF 图片转 PNG
- 可调节 JPEG 输出质量（0-1）
- 自动保留原始文件名并更换扩展名
- 支持批量处理多个图片
- 支持 `continueOnFail` 错误处理

## 安装

在 n8n 的 **Settings > Community Nodes** 中搜索并安装：

```
@luka-cat-mimi/n8n-nodes-heic-convert
```

或通过命令行安装：

```bash
npm install @luka-cat-mimi/n8n-nodes-heic-convert
```

## 节点参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| Input Binary Field | string | `data` | 包含 HEIC 图片的二进制字段名 |
| Output Format | JPEG / PNG | `JPEG` | 输出图片格式 |
| Quality | number (0-1) | `0.92` | JPEG 压缩质量（仅 JPEG 格式时可用） |
| Output Binary Field | string | `data` | 输出二进制字段名 |

## 使用示例

1. 使用 **Read Binary File** 或 **HTTP Request** 节点获取 HEIC 图片
2. 连接 **HEIC Convert** 节点
3. 选择输出格式（JPEG 或 PNG）
4. 如选择 JPEG，可调整压缩质量
5. 输出的二进制数据可传递给后续节点使用

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（监听变更）
npm run dev

# 格式化代码
npm run format

# 代码检查
npm run lint
```

## 许可证

[MIT](LICENSE.md)
