import axios from 'axios';

const BASE_URL = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`;

export const fetchData = async (title, type, year, currentPage) =>
	await axios({
		method: 'GET',
		url: `${BASE_URL}&s=${title}&type=${type}&y=${year}&page=${currentPage}`
	});

export const fetchDataById = async id =>
	await axios({
		method: 'GET',
		url: `${BASE_URL}&i=${id}`
	});