import axios from 'axios';

const searchUrl = 'https://api.spotify.com/v1/search'
const tokenUrl = 'https://accounts.spotify.com/api/token'

export async function searchForSongs(q: string, store: any): Promise<any[]> {
	try {
		const result = await axios.get(searchUrl, {
			params: {q, type: 'track'},
			headers: {Authorization: `Bearer ${store.token}`}
		});
		return (await Promise.all(result.data.tracks.items.map(async (track: any) => {
			console.log('fetching')
			return {
				name: track.name,
				artist: track.artists[0].name,
				id: track.id,
				thumb: track.album.images[track.album.images.length - 1].url,
				lyrics: await fetchLyrics(track.artists[0].name, track.name)
			}
		}))).filter((track: any) => track.lyrics !== null);
	} catch (e: any) {
		if (e.response.data.error.status === 401) {
			store.token = await getToken();
			return searchForSongs(q, store);
		}
	}
	return []
}


export async function fetchLyrics(artist: string, song: string) {
	const url = `https://api.lyrics.ovh/v1/${artist}/${song}`;
	try {
		const result = await axios.get(url);
		return result.data.lyrics;
	} catch (e: any) {
		console.error(e.response.data.error)
		return null
	}
}


export async function getToken(): Promise<string> {
	const token = btoa(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET);
	try {
		const result = await axios(
				{
					url: tokenUrl,
					method: 'post',
					headers: {
						'Authorization': 'Basic ' + token,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					params: {
						grant_type: 'client_credentials'
					},
				}
		);
		console.log()
		return result.data.access_token;
	} catch (e: any) {
		return "";
	}
}


