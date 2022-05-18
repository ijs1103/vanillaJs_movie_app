/* circle-progress */
const barEl = document.querySelector('.circle-bar');
const vauleEl = document.querySelector('.circle-value');
const RADIUS = barEl.getAttribute('r');
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const drawCircle = score => {
  console.log(RADIUS);
	let progress = +score / 10;
  let dashoffset = CIRCUMFERENCE * (1 - progress);
  vauleEl.textContent=score;
  barEl.style.strokeDashoffset = dashoffset;
	barEl.style.strokeDasharray = CIRCUMFERENCE;
}
export default drawCircle;