import { Context, Schema } from "koishi";
import {} from "koishi-plugin-puppeteer";
import { registerToolsListCommand} from "./commands/toolsList";
import { registerChatCommand } from "./commands/chat";

export const name = "akane-agent";

export const inject = {
  required: ["puppeteer"],
  optional: [],
};

export interface Config {}

export const Config: Schema<Config> = Schema.object({});


export function apply(ctx: Context, config: Config) {
  // 基础命令
  ctx.command("ping", "回复 pong").action(() => "pong");


  // 注册命令
  registerChatCommand(ctx);
  registerToolsListCommand(ctx);
}
