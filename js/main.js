import '../scss/main.scss';
import numberAnimation from './numberAnimation';
import renderOption from './renderOption';
import drawCircle from './drawCircle';
import movieTemplate from './movieTemplate';
import {
	fetchData,
	fetchDataById
} from './api';
import { KOREAN, NO_POSTER_IMAGE, IMDB_BASE_URL, NOT_FOUND } from './constant';
const get = target => document.querySelector(target);
const searchSecEl = get("#search");
const formEl = searchSecEl.querySelector(".form");
const selectboxConEl = formEl.querySelector(".selectbox-container");
const selectBoxEls = document.querySelectorAll(".selectbox");
const searchInputEl = formEl.querySelector('.search-input');
const resultsSecEl = get('#results');
const messageEl = resultsSecEl.querySelector('.message');
const loaderEl = resultsSecEl.querySelector('.loader');
const targetEl = resultsSecEl.querySelector('.target-area');
const hiddenModalEl = get('.hidden-modal');
const modalCloseEl = hiddenModalEl.querySelector('.modal-close');
const modalCurtainEl = hiddenModalEl.querySelector('.modal-curtain');
const imageEl = hiddenModalEl.querySelector('.modal-image');
const plotEl = hiddenModalEl.querySelector('.modal-plot');
const titleEl = hiddenModalEl.querySelector('.modal-title');
const directorsEl = hiddenModalEl.querySelector('.modal-directors');
const actorsEl = hiddenModalEl.querySelector('.modal-actors');
const genresEl = hiddenModalEl.querySelector('.modal-genres');
const imdbLinkEl = hiddenModalEl.querySelector('.imdb-link'); 
const bodyLoaderConEl = get('.body-loader-container');
const videoWrapEl = get('.video-wrap');
const videoEl = videoWrapEl.querySelector('video');
const videoCloseEl = get('.video-close');
let gridConEl = resultsSecEl.querySelector('.grid-container');
let selectedBox, title, type, year, pageLength, currentPage;

const openOptions = e => {
	if (e.target.className !== "selectbox__displayWord") return;
	selectedBox = e.target.closest('.selectbox');
	selectedBox.classList.toggle('selectbox--active');
}
const handleLabels = e => {
	if (e.target.className !== "option-container__option") return;
	const option = e.target;
	const label = option.querySelector("label");
	const selectBox = option.parentNode.parentNode;
	const selectBoxDisplay = selectBox.querySelector(".selectbox__displayWord");
	selectBoxDisplay.innerHTML = label.innerHTML;
	selectBox.dataset.option = label.dataset.value;
	selectBox.classList.remove("selectbox--active", "selectbox--unselect");
}
const fetchMoreLoadingStart = () => loaderEl.classList.add('active');
const fetchMoreLoadingStop = () => loaderEl.classList.remove('active');
const bodyLoadingStart = () => bodyLoaderConEl.classList.add('active');
const bodyLoadingStop = () => bodyLoaderConEl.classList.remove('active');

const initApiParams = () => {
	title = searchInputEl.value;
	type = selectBoxEls[0].dataset.option || "";
	year = selectBoxEls[1].dataset.option || "";
	currentPage = 1;
	pageLength = 1;
}
const renderMovies = () => {
	initApiParams();
	searchInputEl.value = ""; // ????????? ????????? 
	gridConEl.innerHTML = ""; // ????????? ?????? ?????????
	setTimeout(bodyLoadingStart);
	fetchData(title, type, year, currentPage)
		.then(res => parseData(res.data))
		.then(res => bodyLoadingStop());
}
const parseData = resData => {
	/* ???????????? */
	if (resData.Error) {
		handleError(resData.Error);
		return;
	}
	/* ????????? ?????? ???????????? */
	pageLength = Math.ceil(+resData.totalResults / 10);
	/* ????????? */
	renderSearchResults(resData);
	updateGridHandler();
}
const renderSearchResults = data => {
	messageEl.innerHTML = `"${title}" ?????? ????????? <span>${data.totalResults.toLocaleString()}</span>??? ????????????.`
	const newItems = data.Search.reduce((movies, movie) => movies + movieTemplate(movie), "");
	gridConEl.insertAdjacentHTML("beforeend", newItems);
}

const handleError = error => {
	//const MANY_RESULT = "Too many results.";
	const errorMessage = (error === NOT_FOUND) ? `"${title}" ?????? ????????? ????????????.` : "?????? ????????? ?????? ????????????.";
	messageEl.textContent = errorMessage;
}

const io = new IntersectionObserver(([{
	isIntersecting
}]) => {
	if (!isIntersecting) return;
	if (pageLength > 1 && pageLength > currentPage) {
		setTimeout(fetchMoreLoadingStart);
		fetchData(title, type, year, ++currentPage)
			.then(res => parseData(res.data))
				.then(res => fetchMoreLoadingStop());
	}
});

const updateGridHandler = () => {
	// ????????? ????????? click ????????? ????????? ??????
	gridConEl.removeEventListener('click', handleGridClick);
	// .grid-container ?????? ?????? ?????? 
	gridConEl = get('.grid-container');
	// ?????? ?????? .grid-container ????????? click ????????? ????????? ??????
	gridConEl.addEventListener('click', handleGridClick);
}

const handleGridClick = e => {
	if (e.target.parentNode.className !== "contents-more") return;
	const movieId = e.target.closest(".contents-more").dataset.value;
	renderModal(movieId);
}

const renderModal = id => {
	fetchDataById(id)
		.then(res => parseModalData(res.data))
			.then(res => {
				/* ???????????? ????????? ?????? ?????? ????????? ?????? */
				document.body.style.overflow = "hidden";
				hiddenModalEl.classList.add('active');
			});
}

const parseModalData = async data => {
	const {
		Plot,
		Title,
		Director,
		Actors,
		Genre,
		imdbRating,
		imdbID
	} = data;
	imageEl.src = data.Poster !== 'N/A' ? data.Poster.replace('SX300', 'SX700') : NO_POSTER_IMAGE;
	plotEl.textContent = Plot;
	titleEl.textContent = Title;
	directorsEl.textContent = Director;
	actorsEl.textContent = Actors;
	genresEl.textContent = Genre;
	imdbLinkEl.setAttribute('href', IMDB_BASE_URL+imdbID);
	drawCircle(imdbRating);
}
const handleSelectBoxClick = (e) => {
	e.stopPropagation();
	openOptions(e);
	handleLabels(e);
}
const handleSelectBoxClose = () => {
	if (!selectedBox) return;
	// ?????? option ?????? 2??? ???????????? ???????????? ?????? ?????? 
	if (formEl.querySelectorAll('.selectbox--active').length > 1) {
		formEl.querySelectorAll('.selectbox').forEach(elem =>
			elem.classList.remove("selectbox--active")
		);
	}
	selectedBox.classList.remove("selectbox--active");
}
const handleSubmit = async (e) => {
	e.preventDefault();
	resultsSecEl.classList.add('active');
	const searched = searchInputEl.value;
	if (KOREAN.test(searched)) {
		messageEl.textContent = "????????? ???????????????.";
		return;
	}
	// ???????????? ?????????, select ????????? ???????????? ???????????? ?????? ???????????? ????????? ???????????? ?????? ?????? ??????
	const isInputEmpty = searched.replace(/ /gi,"") === "";
	const isNotChanged = title === searched && type === selectBoxEls[0].dataset.option && year === selectBoxEls[1].dataset.option;
	if (isInputEmpty || isNotChanged) return;
	renderMovies();
}
const handleModalClick = () => {
	/* ???????????? ????????? ?????? ?????? ????????? ?????? ?????? */
	document.body.style.overflow = "scroll";
	hiddenModalEl.classList.remove('active');
}
const handleVideoStop = () => {
	videoWrapEl.classList.add('inactive');
	searchSecEl.classList.add('ani-active');
	numberAnimation();
};
const handleVideoCloseClick = () => videoEl.pause();
const init = () => {
	renderOption();
	selectboxConEl.addEventListener("click", handleSelectBoxClick);
	document.body.addEventListener("click", handleSelectBoxClose);
	formEl.addEventListener('submit', handleSubmit);
	modalCloseEl.addEventListener('click', handleModalClick);
	modalCurtainEl.addEventListener('click', handleModalClick);
	videoEl.addEventListener("ended", handleVideoStop);
	videoEl.addEventListener("pause", handleVideoStop);
	videoCloseEl.addEventListener("click", handleVideoCloseClick);
	io.observe(targetEl);
};
init();