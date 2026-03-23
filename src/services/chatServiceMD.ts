import { Context, h } from "koishi";
import { renderHtmlToImage } from "../utils/htmlRenderer";
import { marked } from "marked";
import { before } from "node:test";

export interface ChatResponseParts {
  textBefore: string;
  markdownImage: Buffer | null;
  textAfter: string;
}

function buildMarkdownHtml(markdownHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
      background: #ffffff;
      color: #1f2937;
      font-size: 14px;
      line-height: 1.7;
      word-break: break-word;
    }
    h1, h2, h3, h4, h5, h6 {
      margin: 12px 0 8px;
      line-height: 1.4;
    }
    p {
      margin: 8px 0;
    }
    ul, ol {
      margin: 8px 0;
      padding-left: 20px;
    }
    li {
      margin: 4px 0;
    }
    code {
      background: #f3f4f6;
      border-radius: 4px;
      padding: 1px 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.92em;
    }
    pre {
      background: #111827;
      color: #f9fafb;
      border-radius: 8px;
      padding: 12px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    blockquote {
      margin: 8px 0;
      padding: 6px 12px;
      border-left: 3px solid #d1d5db;
      color: #4b5563;
      background: #f9fafb;
    }
  </style>
</head>
<body>
  ${markdownHtml}
</body>
</html>`;
}

function estimateMarkdownImageHeight(markdownSource: string): number {
  const lineCount = markdownSource.split(/\r?\n/).length;
  const estimated = lineCount * 30 + 200;
  return Math.max(220, Math.min(2000, estimated));
}

export async function chatResponseService(
  message: string,
  session: any,
  ctx: Context,
) {
  //agent发回来的消息中可能存在部分需要markdown渲染的内容
  //markdown部分我已要求让他使用[markdown]...[/markdown]标签包裹起来了
  //所以只需要把这些内容提取出来，进行markdown渲染后再替换回去就行了
  //最后分三段返回：文本内容、markdown渲染后的图片、剩余文本内容，每一段内容都可能为空

  const markdownPattern = /\[markdown\]([\s\S]*?)\[\/markdown\]/i;
  const match = message.match(markdownPattern);

  if (!match || typeof match.index !== "number") {
    session.send(message);
    return;
  }

  const fullMatch = match[0];
  const markdownSource = (match[1] ?? "").trim();
  const startIndex = match.index;
  const endIndex = startIndex + fullMatch.length;

  const textBefore = message.slice(0, startIndex).trim();
  const textAfter = message.slice(endIndex).trim();

  if (!markdownSource) {
    session.send(message);
    return;
  }

  const markdownHtml = marked(markdownSource);
  const html = buildMarkdownHtml(markdownHtml);
  const imageHeight = estimateMarkdownImageHeight(markdownSource);
  const markdownImage = await renderHtmlToImage(html, 720, imageHeight, ctx);

  if (textBefore) session.sendQueued(textBefore);
  if (markdownImage) {
    session?.sendQueued(h.image(markdownImage, "image/png"));
  }
  if (textAfter) session.sendQueued(textAfter);
  return;
}
