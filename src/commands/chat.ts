import { Context } from "koishi";
import { ApiResponse, AkaneChatResponse } from "../types";

export function registerChatCommand(ctx: Context) {
  ctx
    .command("ag <message:text>", "与akane对话")
    .action(async ({ session }, message) => {
      const url = "http://localhost:1145/chat";
      const groupId = session?.channelId ?? session?.userId;

      if (!message?.trim()) {
        return "请输入要发送给 akane 的内容。";
      }
      if (message.length > 1000) {
        return "消息过长，akane 读不过来了，请限制在1000个字以内";
      }
      const userId = session?.userId;
      if (userId) {
        message = `用户${userId}说：${message}`;
      }
      try {
        const response = await ctx.http.post<ApiResponse<AkaneChatResponse>>(
          url,
          {
            groupId: groupId,
            userInput: message,
          },
        );
        // console.log(session?.userId);

        const reply = response?.data?.reply?.trim();
        if (!reply) {
          return "akane 没有返回有效内容，请稍后重试。";
        }
        return reply;
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
