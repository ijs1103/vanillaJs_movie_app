import axios from 'axios';

const BASE_URL = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`;

// export const fetchData = async (title, type, year, currentPage) =>
// 	await axios({
// 		method: 'GET',
// 		url: `${BASE_URL}&s=${title}&type=${type}&y=${year}&page=${currentPage}`
// 	});

// export const fetchDataById = async id =>
// 	await axios({
// 		method: 'GET',
// 		url: `${BASE_URL}&i=${id}`
// 	});
export const fetchData = async (title, type, year, currentPage) => {
  try {
    return await axios({
		method: 'GET',
		url: `${BASE_URL}&s=${title}&type=${type}&y=${year}&page=${currentPage}`
	});
  } catch(err) {
    alert(err);
  }
};
export const fetchDataById = async id => {
  try {
    return await axios({
		method: 'GET',
		url: `${BASE_URL}&i=${id}`
	});
  } catch(err) {
    alert(err);
  }
};