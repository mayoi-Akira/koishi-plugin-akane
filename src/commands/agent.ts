import { Context } from "koishi";
import { ApiResponse } from "../types";

const BaseUrl = "http://localhost:1145/agent";

export function registerAgentCommand(ctx: Context) {
  ctx
    .command("ag.reset", "重置 akane 对话状态")
    .action(async ({ session }, message) => {
      const url = `${BaseUrl}/reset`;
      const groupId = session?.channelId ?? session?.userId;
      try {
        const response = await ctx.http.get<ApiResponse<string>>(url, {
          params: {
            groupId: groupId,
            messageId: session?.messageId,
          },
        });
        return response?.message?.trim();
      } catch (error: unknown) {
        const err = error as {
          message?: string;
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          err?.response?.data?.message ??
          err?.message ??
          "与 akane 通信时发生错误，请稍后再试。";

        ctx
          .logger("akane-agent")
          .error("Error communicating with Akane: %o", error);
        return errorMessage;
      }
    });
}
