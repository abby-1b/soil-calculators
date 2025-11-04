import { DynamicTabs, Tab, Translation } from '../dynamic-tabs.ts';

const AVAILABILITY_P2O5 = 0.7;
const AVAILABILITY_K2O = 0.9;

Translation.useLanguage(await (await fetch('./langs.json')).json());

const COMPOST_TYPES: Record<string, number> = {
  'Composta de madera': 1010,
  'Composta de gallinaza': 1333,
  'Composta de setas': 1333,
  'Composta de pulpa de café': 626,
  'Composta de estiercol de caballo': 866,
  'Composta de estiércol de vaca': 1131,
  'Biosólidos compostados': 1131,
};

const tabInput = new Tab<{}>()
  .select('Compost Type', COMPOST_TYPES)
  .number('Amount of Compost to be Applied (yds&sup3;)')
  .number('Lot Size (ft&sup2;)')
  .number('C:N Ratio')

  .horizontalNumbers('Percentages (As Rcvd)', [
    'N Total',
    'Phosphorus (% P2O5)',
    'Potassium (% K2O)'
  ] as const, true)
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

  const lotSize = tabInput.getValue('Lot Size (ft&sup2;)');
  const tonsAppliedToLot = (
    tabInput.getValue('Amount of Compost to be Applied (yds&sup3;)') *
    tabInput.getValue('Compost Type')
  ) / 2000;

  // Nitrogen

  const lbsNPerTonCompost = tabInput.getValue('Percentages (As Rcvd)')[0] * 20;
  const lbsNTotalApplied = tonsAppliedToLot * lbsNPerTonCompost;
  const percentAvailabilityN = (-0.0085 * tabInput.getValue('C:N Ratio')) + 0.2106;

  const lbsNAvailablePerLot = lbsNTotalApplied * percentAvailabilityN;
  const equivalenceLbsNPerAcre = (lbsNAvailablePerLot * 43500) / lotSize;

  // Phosphorus

  const lbsP2O5PerLbCompost = tabInput.getValue('Percentages (As Rcvd)')[1] / 100;
  const lbsP2O5AppliedToLot = (lbsP2O5PerLbCompost * 2000) * tonsAppliedToLot;

  const lbsP2O5AvailablePerLot = lbsP2O5AppliedToLot * AVAILABILITY_P2O5;
  const equivalenceLbsP2O5PerAcre = (lbsP2O5AvailablePerLot * 43500) / lotSize;

  // Potassium

  const lbsK2OPerLbCompost = tabInput.getValue('Percentages (As Rcvd)')[2] / 100;
  const lbsK2OAppliedToLot = (lbsK2OPerLbCompost * 2000) * tonsAppliedToLot;

  const lbsK2OAvailablePerLot = lbsK2OAppliedToLot * AVAILABILITY_K2O;
  const equivalenceLbsK2OPerAcre = (lbsK2OAvailablePerLot * 43500) / lotSize;

  (tabOutput.element.querySelector('.N-out') as HTMLInputElement)
    .value = '' + lbsNAvailablePerLot.toFixed(1);
  (tabOutput.element.querySelector('.P-out') as HTMLInputElement)
    .value = '' + lbsP2O5AvailablePerLot.toFixed(1);
  (tabOutput.element.querySelector('.K-out') as HTMLInputElement)
    .value = '' + lbsK2OAvailablePerLot.toFixed(1);
});
