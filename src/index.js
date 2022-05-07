import {config} from "dotenv";
import {Telegraf} from "telegraf";
import {search} from "./genius.js";
import {MongoClient} from "mongodb";

config();

const bot = new Telegraf((process.env.BOT_TOKEN || "").toString());
const client = new MongoClient((process.env.MONGO_URL || "").toString());
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.catch((err) => {
	console.error(err);
})


bot.on("inline_query", async (ctx) => {
	console.log("here")
	const query = ctx.inlineQuery?.query || "AJR";
	try {
		let e = await ctx.answerInlineQuery(await search(query, ctx.mongodb));
		console.log(e)
	} catch (e) {
	}
})

const options = {}
if (process.env.MODE === "production") {
	options.webhook = {
		domain: process.env.WEBHOOK, port: process.env.PORT
	}
}
bot.launch(options).then(async () => {
	await client.connect();
	bot.context.mongodb = client.db("lyricfindbot");
	console.log("Bot started");
});
