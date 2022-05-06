import {config} from "dotenv";
import {Telegraf} from "telegraf";
import {search} from "./genius.js";

config();

const bot = new Telegraf((process.env.BOT_TOKEN || "").toString());

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.catch((err) => {
	console.error(err);
})


bot.on("inline_query", async (ctx) => {
	console.log("here")
	const query = ctx.inlineQuery?.query || "AJR";
	try {
		let e = await ctx.answerInlineQuery(await search(query));
		console.log(e)
	} catch (e) {
	}
})


bot.launch({
	webhook: {
		domain: process.env.WEBHOOK, port: process.env.PORT, path: "/webhook"
	}
}).then(() => {
	console.log("Bot started");
});
