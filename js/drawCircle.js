/* circle-progress */
const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const drawCircle = score => {
	const barEl = document.querySelector('.circle-bar');
	const vauleEl = document.querySelector('.circle-value');
	let progress = +score / 10;
  let dashoffset = CIRCUMFERENCE * (1 - progress);
  vauleEl.innerHTML=score;
  barEl.style.strokeDashoffset = dashoffset;
	barEl.style.strokeDasharray = CIRCUMFERENCE;
}
export default drawCircle;