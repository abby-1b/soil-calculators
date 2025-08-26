import { DynamicTabs, Tab } from './dynamic-tabs.ts';

const COMPOST_TYPES: Record<string, unknown> = {
  
};

const tabInput = new Tab<{}>()
  .select('Compost Type', COMPOST_TYPES)
  .number('Amount of compost to apply (yds^3)')
  .number('Lot size (ft^2)')

  .horizontalNumbers('(% As Rcvd.)', [ 'N Total', 'Phosphorus', 'Potassium' ] as const)
  ;

const tabOutput = new Tab<{}>()
  .horizontalNumbers('Recommendation', [ 'N', 'P', 'K' ] as const, false)
  ;
tabOutput.element.classList.add('output-tab');
tabOutput.element.querySelectorAll('input').forEach((i, index) => {
  i.readOnly = true;
  i.tabIndex = -1;
  i.classList.add([ 'N-out', 'P-out', 'K-out' ][index]);
});
document.body.appendChild(tabOutput.element);

const tabs = new DynamicTabs<{}>(document.body)
  .addTab('Input', tabInput);
(window as any).tabs = tabs;
(window as any).tab = tabInput;

tabInput.addInputListener(() => {
  console.log('Input changed!');

  const cropInformation = tabInput.getValue('Crop');

  // Get nutrients
  const nutrients = tabInput.getValue('NPK (as rcvd.)');

  // TODO: Get nitrogen RangeValue (low/medium/high)
  let nitrogenLevel = RangeValue.MEDIUM;

  // Get phosphorus RangeValue (low/medium/high)
  const phosphorusRange = tabInput.getValue('Soil Test Method');
  let phosphorusLevel: RangeValue;
  if (nutrients[1] < phosphorusRange[0]) {
    phosphorusLevel = RangeValue.LOW;
  } else if (nutrients[1] <= phosphorusRange[1]) {
    phosphorusLevel = RangeValue.MEDIUM;
  } else {
    phosphorusLevel = RangeValue.HIGH;
  }

  // Get potassium RangeValue (low/medium/high)
  let potassiumLevel: RangeValue;
  if (nutrients[2] < 78) {
    potassiumLevel = RangeValue.LOW;
  } else if (nutrients[2] <= 157) {
    potassiumLevel = RangeValue.MEDIUM;
  } else {
    potassiumLevel = RangeValue.HIGH;
  }

  // Get the fertilizer recommendation
  const recommendation: NPK = [
    cropInformation.fertilizerRecom.n[nitrogenLevel],
    cropInformation.fertilizerRecom.p[phosphorusLevel],
    cropInformation.fertilizerRecom.k[potassiumLevel]
  ];

  console.log('Recommendation:', recommendation);

  // Output
  (tabOutput.element.querySelector('.N-out') as HTMLInputElement)
    .value = '' + recommendation[0];
  (tabOutput.element.querySelector('.P-out') as HTMLInputElement)
    .value = '' + recommendation[1];
  (tabOutput.element.querySelector('.K-out') as HTMLInputElement)
    .value = '' + recommendation[2];
  
  closestComposts(recommendation);
});

// Normalize NPK values
function normalizeNPK(npk: NPK): NPK {
  const mag = Math.hypot(...npk);
  if (mag == 0) return [ 0, 0, 0 ];
  return [
    npk[0] / mag,
    npk[1] / mag,
    npk[2] / mag,
  ];
}
function normalizedNPKDiff(a: NPK, b: NPK): number {
  // const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // return dot * 0.5 + 0.5;
  const diffSq =
    SCORE_COEFFICIENTS[0] * ((a[0] - b[0]) ** 2) +
    SCORE_COEFFICIENTS[1] * ((a[1] - b[1]) ** 2) +
    SCORE_COEFFICIENTS[2] * ((a[2] - b[2]) ** 2);
  return 1 / (1 + diffSq);
}

function closestComposts(npk: NPK): string[] {
  const inputNpk = normalizeNPK(npk);

  const composts = Object.entries(COMPOST_OPTIONS).map(compost => {
    return { name: compost[0], npk: normalizeNPK(compost[1]), score: -1 };
  });

  // Get scores
  for (let i = 0; i < composts.length; i++) {
    composts[i].score = normalizedNPKDiff(inputNpk, composts[i].npk);
  }

  composts.sort((a, b) => b.score - a.score);
  console.log(composts)

  return composts.map(c => c.name);
}

closestComposts([ 89, 18, 80 ]);
//  23.0  6.0 120.0
//   5.8  1.5  30.0
//  10.0  2.0  30.0

// Object.values(COMPOST_OPTIONS).forEach(v => console.log(normalizeNPK(v).join(', ')))
