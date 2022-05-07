import Genius from "genius-lyrics";

export async function search(q, mongo) {
	console.log("start searching")
	const Client = new Genius.Client();
	const searches = await Client.songs.search(q);
	console.log("end searching")
	return Promise.all(searches.map(async (song, i) => {
		return {
			title: `${song.artist.name} - ${song.title}`,
			thumb_url: song.thumbnail,
			id: song.id.toString(),
			type: "article",
			input_message_content: {message_text: await getLyrics(song, mongo)},
		}
	}));
}


async function getLyrics(song, mongo) {
	console.log("start fetching", song.id)
	let lyrics = await mongo.collection("lyrics").find({id: song.id}).toArray()
	if (lyrics.length > 0) {
		console.log("got from db", song.id)
		return lyrics[0].lyrics
	}
	lyrics = await song.lyrics()
	console.log("end fetching", song.id)
	lyrics = (`${song.artist.name} - ${song.title}\n\n` + lyrics.toString().replace(/\[.*?]/g, "").replace("\n\n", "\n")).substring(0, 4096);
	await mongo.collection("lyrics").insertOne({id: song.id, lyrics: lyrics})
	return lyrics;
}
