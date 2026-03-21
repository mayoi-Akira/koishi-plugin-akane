import { Context, h } from "koishi";
import { ToolListResponse } from "../types";
import { renderToolsListImage } from "../services/renderer";

/**
 * 注册工具列表命令
 */
export function registerToolsCommand(ctx: Context) {
  ctx.command("ag.tools.list", "列出可用工具").action(async ({ session }) => {
    const groupId = session?.channelId;
    if (!groupId) {
      return "获取群聊ID失败，无法查询工具列表。";
    }

    const url = "http://localhost:1145/tools/list";

    try {
      const response = await ctx.http.get<ToolListResponse>(url, {
        params: {
          groupId: groupId,
        },
      });

      if (response.code !== 200) {
        return `获取工具列表失败: ${response.message}`;
      }

      if (!response.data || response.data.length === 0) {
        return "暂无可用工具";
      }
      //只留下status字段为"ENABLE"或"DISENABLE"的工具
      const data = response.data.filter(
        (tool) => tool.status === "ENABLE" || tool.status === "DISENABLE",
      );
      console.log("Filtered tools list:", data);
      // 渲染为图片
      const imageBuffer = await renderToolsListImage(data, ctx);
      return h.image(imageBuffer, "image/png");
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        "获取工具列表时发生错误，请稍后再试。";

      ctx.logger("akane-agent").error("Error fetching tools list: %o", error);
      return errorMessage;
    }
  });
}
