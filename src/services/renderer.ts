import { Context } from "koishi";
import { ToolInfo } from "../types";

/**
 * 渲染工具列表为图片
 */
export async function renderToolsListImage(
  tools: ToolInfo[],
  ctx: Context,
): Promise<Buffer> {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: #ffffff;
            padding: 24px;
        }
        .container {
            max-width: 700px;
        }
        .header {
            margin-bottom: 24px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 16px;
        }
        .header h1 {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }
        .header p {
            font-size: 13px;
            color: #6b7280;
        }
        .tools-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .tool-item {
            padding: 14px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #ffffff;
        }
        .tool-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .tool-name-id {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .tool-name {
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
        }
        .tool-id {
            font-size: 12px;
            color: #9ca3af;
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
        }
        .tool-status {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .tool-status.enabled {
            background: #ecfdf5;
            color: #047857;
        }
        .tool-status.disabled {
            background: #fef2f2;
            color: #dc2626;
        }
        .tool-desc {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #9ca3af;
        }
        .empty-state p {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tools List</h1>
            <p>共 ${tools.length} 个工具</p>
        </div>
        <div class="tools-list">
            ${
              tools.length > 0
                ? tools
                    .map(
                      (tool) => `
                <div class="tool-item">
                    <div class="tool-meta">
                        <div class="tool-name-id">
                            <div class="tool-name">${tool.toolName}</div>
                            <div class="tool-id">ID: ${tool.toolCode}</div>
                        </div>
                        <div class="tool-status ${tool.status == "DISENABLE" ? "disabled" : "enabled"}">
                            ${tool.status == "DISENABLE" ? "禁用" : "启用"}
                        </div>
                    </div>
                    <div class="tool-desc">${tool.description}</div>
                </div>
            `,
                    )
                    .join("")
                : '<div class="empty-state"><p>No tools available</p></div>'
            }
        </div>
    </div>
</body>
</html>`;

  const page = await ctx.puppeteer.page();
  try {
    await page.setContent(html);
    await page.setViewport({
      width: 750,
      height: Math.max(400, tools.length * 90 + 120),
    });
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
    });
    return screenshot as Buffer;
  } finally {
    await page.close();
  }
}
