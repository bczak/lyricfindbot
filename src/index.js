import {config} from "dotenv";
import {Telegraf} from "telegraf";
import {getLyrics, search} from "./genius.js";
import {MongoClient} from "mongodb";

config();

const bot = new Telegraf((process.env.BOT_TOKEN || "").toString());
const client = new MongoClient((process.env.MONGO_URL || "").toString());
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.use((ctx, next) => {
	try {
		ctx.mongodb.collection("users").updateOne({id: ctx.from.id}, {
			$set: {
				id: ctx.from.id, username: ctx.from.username, name: ctx.from.first_name + (ctx.from.last_name)
			}
		}, {upsert: true});
	} catch (e) {
		console.error(e);
	}
	return next();
})

bot.catch((err) => {
	console.error(err);
})

bot.command("start", (ctx) => {
	ctx.reply("Hello, I'm @LyricFindBot. I'm a bot that will search for lyrics for you.\n\n" + "Send me a song title and I'll search for it.\n\n" + "Did you know that I can also search for lyrics outside this chat? Just type @LyricFindBot in another chat and " + "I'll search for it there.");
})

bot.on("message", async (ctx) => {
	if (ctx.chat.type === "private") {
		let message = await ctx.reply("Searching for lyrics...");
		if (message.length > 50) {
			return await ctx.reply("Sorry, Search text is too long");
		}
		const lyrics = await search(ctx.message.text, ctx.mongodb, false);
		await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
		if (lyrics.length === 0) {
			ctx.reply("I couldn't find any lyrics for that song.");
		} else {
			ctx.reply("*Results:*\n\n", {
				parse_mode: "markdown",
				reply_markup: {inline_keyboard: lyrics.map((lyric) => [{text: lyric.title, callback_data: lyric.id}])}
			});
		}
	}
})

bot.on("callback_query", async (ctx) => {
	const lyrics = await getLyrics({id: ctx.update.callback_query.data}, ctx.mongodb);
	console.log(lyrics)
	ctx.reply(lyrics);
	ctx.answerCbQuery()
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
