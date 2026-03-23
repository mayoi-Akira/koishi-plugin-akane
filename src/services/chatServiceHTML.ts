import { Context, h } from "koishi";
import { renderHtmlToImage } from "../utils/htmlRenderer";

export interface ChatHtmlResponseParts {
  textBefore: string;
  htmlImage: Buffer | null;
  textAfter: string;
}

function buildHtmlDocument(htmlFragment: string): string {
  const hasHtmlRoot = /<html[\s>]/i.test(htmlFragment);
  if (hasHtmlRoot) {
    return htmlFragment;
  }

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
			line-height: 1.6;
			word-break: break-word;
		}
		img {
			max-width: 100%;
			height: auto;
		}
		table {
			border-collapse: collapse;
			width: 100%;
		}
	</style>
</head>
<body>
	${htmlFragment}
</body>
</html>`;
}

function estimateHtmlImageHeight(html: string): number {
  // 1️⃣ 先处理 table（重点优化）
  let tableHeight = 0;

  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];

  for (const table of tables) {
    const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    for (const row of rows) {
      const cells = row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || [];
      let rowMaxHeight = 0;

      for (const cell of cells) {
        const text = cell
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const len = text.length;
        // 每个单元格估算高度（更保守一点）
        const cellHeight = 20 + Math.ceil(len / 20) * 14;
        rowMaxHeight = Math.max(rowMaxHeight, cellHeight);
      }
      tableHeight += rowMaxHeight + 6; // 行间距
    }
  }
  // 2️⃣ 去掉 table 再算普通内容（避免重复计算）
  const htmlWithoutTable = html.replace(/<table[\s\S]*?<\/table>/gi, "");
  const textContent = htmlWithoutTable
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const textLength = textContent.length;
  const blockCount = (
    htmlWithoutTable.match(
      /<(p|div|li|h[1-6]|pre|blockquote|section|article|ul|ol|br)\b/gi,
    ) || []
  ).length;
  const baseHeight = 260 + Math.ceil(textLength / 30) * 18 + blockCount * 28;
  const estimated = baseHeight + tableHeight;
  return Math.max(320, Math.min(8000, estimated));
}

export async function chatResponseService(
  message: string,
  session: any,
  ctx: Context,
): Promise<ChatHtmlResponseParts | void> {
  const htmlPattern = /\[\[HTML\]\]([\s\S]*?)\[\[\/HTML\]\]/i;
  const match = message.match(htmlPattern);

  if (!match || typeof match.index !== "number") {
    await session.send(message);
    return;
  }

  const fullMatch = match[0];
  const htmlSource = (match[1] ?? "").trim();
  const startIndex = match.index;
  const endIndex = startIndex + fullMatch.length;

  const textBefore = message.slice(0, startIndex).trim();
  const textAfter = message.slice(endIndex).trim();

  if (!htmlSource) {
    await session.send(message);
    return;
  }

  const htmlDocument = buildHtmlDocument(htmlSource);
  const imageHeight = estimateHtmlImageHeight(htmlSource);
  const htmlImage = await renderHtmlToImage(
    htmlDocument,
    900,
    imageHeight,
    ctx,
  );

  if (textBefore) {
    await session.sendQueued(textBefore);
  }
  if (htmlImage) {
    await session.sendQueued(h.image(htmlImage, "image/png"));
  }
  if (textAfter) {
    await session.sendQueued(textAfter);
  }

  return {
    textBefore,
    htmlImage,
    textAfter,
  };
}
