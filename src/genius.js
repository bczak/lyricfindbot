import Genius from "genius-lyrics";

export async function search(q, mongo, lyrics = true) {
	try {
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
				input_message_content: {message_text: lyrics ? await getLyrics(song, mongo) : "No lyrics found"},
			}
		}));

	} catch (e) {
		return []
	}
}

export async function getSong(id) {
	const Client = new Genius.Client("mql0WC9UpE8kttr0wyNSnUK_JGnS5lWxylxAPMXP-UdM7QAx3yQa_RtKimW67rFV");
	return await Client.songs.get(parseInt(id));
}


export async function getLyrics(song, mongo) {
	let lyrics = await mongo.collection("lyrics").find({id: song.id}).toArray()
	if (lyrics.length > 0) {
		console.log("got from db", song.id)
		return lyrics[0].lyrics
	}
	song = await getSong(song.id)
	lyrics = await song.lyrics()
	lyrics = (`${song.artist.name} - ${song.title}\n\n` + lyrics.toString().replace(/\[.*?]/g, "").replace("\n\n", "\n")).substring(0, 4096);
	await mongo.collection("lyrics").insertOne({id: song.id, lyrics: lyrics})
	return lyrics;
}
