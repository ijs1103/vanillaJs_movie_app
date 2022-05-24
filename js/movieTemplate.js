import { NO_POSTER_IMAGE } from './constant';
const movieTemplate = movie =>
	`<div class="grid-item">
		<div class="contents-poster">
			<img src=${movie.Poster!=='N/A' ? movie.Poster : NO_POSTER_IMAGE} alt="poster" onerror="this.src='./images/noPoster.png'">
		</div>
		<div class="hover-contents">
			<div class="hover-inner">
				<div class="contents-title">${movie.Title}</div>
				<div class="contents-more" data-value=${movie.imdbID}>
					<span class="material-icons">expand_more</span>
				</div>
			</div>
		</div>
	</div>`;
export default movieTemplate;