import {config} from "dotenv";
import {Context, Telegraf} from "telegraf";
import {searchForSongs} from "./spotify";

config();

const store = {
	token: null
}


const bot = new Telegraf((process.env.BOT_TOKEN || "").toString());

bot.on('inline_query', async (ctx: Context) => {
	const result: any[] = await searchForSongs(ctx.inlineQuery?.query || "AJR", store);
	await ctx.answerInlineQuery(result.map((e: any) => {
		e.type = 'article';
		e.title = `${e.name} - ${e.artist}\n${e.lyrics.substring(0, 50)}...`;
		e.input_message_content = {
			message_text: `${e.name} - ${e.artist}\n\n${e.lyrics.split("\n\n").join("\n")}`,
		};
		e.thumb_url = e.thumb;
		return e
	}))
})

bot.launch({}).then(() => {
	console.log('Bot started');
});
