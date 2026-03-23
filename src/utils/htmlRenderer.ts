import { Context } from "koishi";

/**
 * 将 HTML 文本渲染为 PNG 图片。
 */
export async function renderHtmlToImage(
  html: string,
  width: number,
  height: number,
  ctx: Context,
): Promise<Buffer> {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeHeight = Math.max(1, Math.floor(height));

  const page = await ctx.puppeteer.page();
  try {
    await page.setViewport({
      width: safeWidth,
      height: safeHeight,
    });
    await page.setContent(html);
    const screenshot = await page.screenshot({
      type: "png",
    });
    return screenshot as Buffer;
  } finally {
    await page.close();
  }
}
