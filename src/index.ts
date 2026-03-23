import { Context, Schema, h } from "koishi";
import {} from "koishi-plugin-puppeteer";
import { registerToolsCommand } from "./commands/tools";
import { registerChatCommand } from "./commands/chat";
import { registerAgentCommand } from "./commands/agent";
import { chatResponseService } from "./services/chatServiceHTML";

export const name = "akane-agent";

export const inject = {
  required: ["puppeteer"],
  optional: [],
};

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context, config: Config) {
  // 基础命令
  // ctx.command("ping", "回复 pong").action(() => "pong");
  // ctx.command("test").action(async ({ session }) => {
  //   const mkd = `你好你好你好[[HTML]]
  //             <div style="color: red; font-size: 24px; font-weight: bold; text-align: center; padding: 20px; border: 2px solid #f00; border-radius: 10px; background: linear-gradient(135deg, #f00, #ff0);">
  //               这是一个测试HTML渲染的内容！
  //             </div>
  //             [[/HTML]]aaaaaaaaaaaaaaaaaaaaaa`;
  //   chatResponseService(mkd, session, ctx);
  //   return;
  // });

  // 注册命令
  registerChatCommand(ctx);
  registerToolsCommand(ctx);
  registerAgentCommand(ctx);
}
