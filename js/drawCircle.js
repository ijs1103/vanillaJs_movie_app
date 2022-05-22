/* circle-progress */
const barEl = document.querySelector('.circle-bar');
const vauleEl = document.querySelector('.circle-value');
const radius = barEl.getAttribute('r');
const circumference = 2 * Math.PI * radius;
const drawCircle = score => {
	const progress = +score / 10;
  const dashoffset = circumference * (1 - progress);
  vauleEl.textContent = score;
  barEl.style.strokeDashoffset = dashoffset;
	barEl.style.strokeDasharray = circumference;
}
export default drawCircle;