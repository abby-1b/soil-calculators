
declare let translations: Record<string, string[]>;

/** How many decimal digits to keep */
const MAX_PRECISION_DIGITS = 3;

/** What to display when a calculation returns nothing. */
const EMPTY_CALCULATION = "";

/** Converts a number to a string, but keeping it pretty. */
function stringify(n: number): string {
	const fixed = n.toFixed(MAX_PRECISION_DIGITS).replace(/,/g, ".");
	const normal = n.toString();
	return normal.length < fixed.length ? normal : fixed;
}

/** See below. */
const CALCULATION_DELAY = 10;

/*
Delaying the calculation gives the user time to notice that their change is
being accounted for. Without this simple timeout, the user might think "Oh, is
it not working? It's going too fast!"
It gives the impression that something heavier is being done on the backend,
some ingenious calculation that can solve all their problems.
If users complain that it's too slow, lower the delay above. If the app is
flooded with issues about slow internet or a bad calculator, lower the delay
above; but never make it zero. It's all about making the user feel safer knowing
that their calculations take time and effort.
*/
let timer: number | null = CALCULATION_DELAY;
let trueCalculation: [ string, string ] = [ EMPTY_CALCULATION, EMPTY_CALCULATION ];
setInterval(() => {
	if (timer != null && timer <= 1) {
		if (trueCalculation[0].length == 0) {
			(document.querySelector('#output')!.children[0] as HTMLDivElement).innerText = "";
			(document.querySelector('#output')!.children[1] as HTMLDivElement).innerText = "";
		} else {
			(document.querySelector('#output')!.children[0] as HTMLDivElement).innerHTML = "<a>" + trueCalculation[0].replace(/ /, "</a>&nbsp;&nbsp;<a>") + "</a>";
			(document.querySelector('#output')!.children[1] as HTMLDivElement).innerHTML = "<a>" + trueCalculation[1].replace(/ /, "</a>&nbsp;&nbsp;<a>") + "</a>";
		}
		timer = null;
	} else if (timer != null) {
		timer *= 0.9;
	}
}, 10)

// Get the output textboxes

// Get the input elements
const elementPpmAl: HTMLInputElement = document.querySelector('.input[purpose="ppmAl"] > input')!;
const elementCmolAlKg: HTMLInputElement = document.querySelector('.input[purpose="cmolAlKg"] > input')!;
const elementFactor: HTMLInputElement = document.querySelector('.input[purpose="factor"] > input')!;

// The text for the units
let textForPpmAl = "";
let textForCmolAlKg = "";

/** Called when any slider is changed */
function sliderChange(el: HTMLInputElement) {
	(el.nextElementSibling as HTMLDivElement).innerText = parseFloat(el.value).toFixed(2);
	inputChange(el);
}

// Initiate the sliders
const sliders = [...document.querySelectorAll('input[type="range"]')];
sliders.map(e => sliderChange(e as HTMLInputElement));

/** Called when any input is changed (including sliders) */
function inputChange(el: HTMLInputElement) {
	// Randomize the delay
	const randDelay = CALCULATION_DELAY * (0.9 + Math.random() * 0.3);
	timer = timer == null ? randDelay : timer + randDelay;

	// Get the element that we're changing (by purpose)
	const elPurpose = el.parentElement!.attributes.getNamedItem("purpose")!.value;
	
	// Get the Al ppm
	let ppmAl = elementPpmAl.value == "" ? -1 : parseFloat(elementPpmAl.value);
	
	// Get the Al/kg cmol of soil
	let cmolAlKg = elementCmolAlKg.value == "" ? -1 : parseFloat(elementCmolAlKg.value);

	// Get the factor
	let factor = elementFactor.value == "" ? -1 : parseFloat(elementFactor.value);

	// Put the processing dots...
	document.querySelector('#output')!.children[0].innerHTML = document.querySelector('#output')!.children[1].innerHTML = 
		"<a>" + String.fromCharCode(8226).repeat(3) + "</a>";

	if (ppmAl == -1 && cmolAlKg == -1) {
		trueCalculation = [ EMPTY_CALCULATION, EMPTY_CALCULATION ];
		return;
	}
	
	if (elPurpose == "ppmAl") {
		elementCmolAlKg.value = ppmAl == -1 ? "" : stringify(ppmAl / 90);
		cmolAlKg = ppmAl == -1 ? -1 : parseFloat(elementCmolAlKg.value);
	} else if (elPurpose == "cmolAlKg") {
		elementPpmAl.value = cmolAlKg == -1 ? "" : stringify(cmolAlKg * 90);
		ppmAl = cmolAlKg == -1 ? -1 : parseFloat(elementPpmAl.value);
	}

	if (ppmAl == -1 && cmolAlKg == -1) {
		trueCalculation = [ EMPTY_CALCULATION, EMPTY_CALCULATION ];
		return;
	}

	// CaCO3 (t/ha) = Factor x cmol Al/kg of soil
	// (ppm Al) or (mg/kg Al) / 90 = cmol Al/kg of soil

	const hectareToAcreConversion = 2.47105;

	const THA_TO_LBFTSQ_CONSTANT = 20.481606212;
	const tAc = factor * cmolAlKg / hectareToAcreConversion;
	const lbFtSq = tAc * THA_TO_LBFTSQ_CONSTANT;

	trueCalculation = [
		stringify( tAc ) + ` ${textForPpmAl}`,
		stringify( lbFtSq ) + ` ${textForCmolAlKg}\xb2`,
	];
}

// Get the "Switch Language" buton
const changeLanguageButton = document.querySelector("#switch-button") as HTMLInputElement;
changeLanguageButton.addEventListener('click', () => {
	if (lang == "es") {
		window.location.href = window.location.origin + window.location.pathname + "?lang=en";
	} else {
		window.location.href = window.location.origin + window.location.pathname + "?lang=es";
	}
});

// Translation targets
const translationTargets: Array<(t: string) => void> = [
	t => document.title = t,
	t => changeLanguageButton.value = t,
	t => document.querySelector('#title>h1')!.innerHTML = t,
	t => document.querySelector('[purpose="ppmAl"]>h2')!.innerHTML = t,
	t => document.querySelector('[purpose="cmolAlKg"]>h2')!.innerHTML = t,
	t => document.querySelector('[purpose="factor"]>h2')!.innerHTML = t,
	t => textForPpmAl = t,
	t => textForCmolAlKg = t,
];

// Translate (when URL points to translated version)
const searchParams = new URLSearchParams(window.location.search);
let lang = (searchParams.get("lang") ?? "en").toLowerCase();
if (!(lang in translations)) { lang = "en"; }

// Translate to the language!
const t = translations[lang];
for (let i = 0; i < t.length; i++) {
	translationTargets[i](t[i]);
}
