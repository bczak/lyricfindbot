import Genius from "genius-lyrics";

export async function search(q) {
	const Client = new Genius.Client();
	const searches = await Client.songs.search(q);
	return Promise.all(searches.map(async song => {
		return {
			title: `${song.artist.name} - ${song.title}`,
			thumb_url: song.thumbnail,
			id: song.id.toString(),
			type: "article",
			input_message_content: {message_text: await getLyrics(song)},
		}
	}));
}


async function getLyrics(song) {
	let lyrics = await song.lyrics()
	return (`${song.artist.name} - ${song.title}\n\n` + lyrics.toString().replace(/\[.*?]/g, "")).substring(0, 4093) + '...';
}
