import { DynamicTabs, Tab, Translation } from '../dynamic-tabs.ts';
import { Printing } from '../printing.ts';

const AVAILABILITY_P2O5 = 0.7;
const AVAILABILITY_K2O = 0.9;

Translation.currentLanguage = 'es';
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
  .select('Compost Type', COMPOST_TYPES, true)
  .number('Amount of Compost to be Applied (yds&sup3;)')
  .number('Lot Size (ft&sup2;)')
  
  .header('info')
  .header('info_sub', (el) => {
    el.classList.add('header-sub')
  })
  
  .number('N Total')
  .number('Phosphorus (% P2O5)')
  .number('Potassium (% K2O)')
  .number('C:N Ratio')
  // .horizontalNumbers('Percentages (As Rcvd)', [
  //   'N Total',
  //   'Phosphorus (% P2O5)',
  //   'Potassium (% K2O)'
  // ] as const, true)
  ;
tabInput.element.style.fontSize = '.43em';

const outputElements: HTMLHeadingElement[] = [];
const tabOutput = new Tab<{}>()
  .header('Results', e => {
    e.classList.add('strong-header');
  })
  .raw(tab => {
    const partsContainer = document.createElement('div');
    partsContainer.classList.add('parts-container');

    for (let p = 0; p < 3; p++) {
      const part = document.createElement('div');
      
      const header = document.createElement('h3');
      header.innerHTML = Translation.getLabel('AUTO-HEAD');
      part.appendChild(header);

      const resultsContainer = document.createElement('div');

      for (let i = 0; i < 2; i++) {
        const result = document.createElement('h4');
        result.innerHTML = Translation.getLabel('AUTO-LABEL');
        resultsContainer.appendChild(result);
        
        const value = document.createElement('h5');
        value.innerHTML = 'N/A';
        resultsContainer.appendChild(value);
        outputElements.push(value);
      }

      part.appendChild(resultsContainer);
      partsContainer.appendChild(part);
    }

    const disclaimer = document.createElement('p');
    disclaimer.classList.add('disclaimer-text');
    disclaimer.innerHTML = Translation.getLabel('DISCLAIMER');
    partsContainer.appendChild(disclaimer);
    
    const report = document.createElement('button');
    report.classList.add('text-input');
    report.classList.add('report-button');
    report.innerText = Translation.getLabel('GEN-REPORT');

    {
      const downloadIcon = document.createElement('img');
      downloadIcon.src = 'https://www.uprm.edu/hortalizasygranosbasicos/wp-content/uploads/sites/330/2026/03/cc-download-icon.png';
      downloadIcon.style.height = '50%';
      downloadIcon.style.width = 'unset';
      downloadIcon.style.display = 'block';
      downloadIcon.style.position = 'absolute';
      downloadIcon.style.top = '50%';
      downloadIcon.style.transform = 'translate(0, -50%)';
      report.appendChild(downloadIcon);
    }

    report.addEventListener('pointerup', () => {
      generateReport();
    });

    return [ partsContainer, report ];
  })
  ;
tabOutput.element.classList.add('tab-output');

const tabs = new DynamicTabs<{}>(document.querySelector('#centered')!)
  .addTab('Input', tabInput);
// (window as any).tabs = tabs;
// (window as any).tab = tabInput;
document.querySelector('#centered')!.appendChild(tabOutput.element);

tabInput.addInputListener(() => {
  console.log('Input changed!');

  const lotSize = tabInput.getValue('Lot Size (ft&sup2;)');
  const tonsAppliedToLot = (
    tabInput.getValue('Amount of Compost to be Applied (yds&sup3;)') *
    tabInput.getValue('Compost Type')
  ) / 2000;

  // Nitrogen

  const lbsNPerTonCompost = tabInput.getValue('N Total') * 20;
  const lbsNTotalApplied = tonsAppliedToLot * lbsNPerTonCompost;
  const percentAvailabilityN = (-0.0085 * tabInput.getValue('C:N Ratio')) + 0.2106;

  const lbsNAvailablePerLot = lbsNTotalApplied * percentAvailabilityN;
  const equivalenceLbsNPerAcre = (lbsNAvailablePerLot * 43500) / lotSize;

  // Phosphorus

  const lbsP2O5PerLbCompost = tabInput.getValue('Phosphorus (% P2O5)') / 100;
  const lbsP2O5AppliedToLot = (lbsP2O5PerLbCompost * 2000) * tonsAppliedToLot;

  const lbsP2O5AvailablePerLot = lbsP2O5AppliedToLot * AVAILABILITY_P2O5;
  const equivalenceLbsP2O5PerAcre = (lbsP2O5AvailablePerLot * 43500) / lotSize;

  // Potassium

  const lbsK2OPerLbCompost = tabInput.getValue('Potassium (% K2O)') / 100;
  const lbsK2OAppliedToLot = (lbsK2OPerLbCompost * 2000) * tonsAppliedToLot;

  const lbsK2OAvailablePerLot = lbsK2OAppliedToLot * AVAILABILITY_K2O;
  const equivalenceLbsK2OPerAcre = (lbsK2OAvailablePerLot * 43500) / lotSize;

  outputElements[0].innerText = lbsNAvailablePerLot.toFixed(1);
  outputElements[1].innerText = equivalenceLbsNPerAcre.toFixed(1);
  outputElements[2].innerText = lbsP2O5AvailablePerLot.toFixed(1);
  outputElements[3].innerText = equivalenceLbsP2O5PerAcre.toFixed(1);
  outputElements[4].innerText = lbsK2OAvailablePerLot.toFixed(1);
  outputElements[5].innerText = equivalenceLbsK2OPerAcre.toFixed(1);
});

function generateReport() {
  const printer = new Printing();

  // Use localized button label for title if available
  printer.setTitle(Translation.getLabel('GEN-REPORT') || 'Report');

  // --- Inject print_styles.css as a <style> tag at the top ---
  const styleTag = document.createElement('style');
  styleTag.textContent = `/* Print styles for compost calculator report */\n\n.tab-output {\n  background-color: var(--light-gray);\n  height: fit-content;\n  border-radius: 0 0 20px 20px;\n}\n\n.tab-output > .strong-header {\n  background-color: var(--green);\n  color: white;\n  width: 100%;\n  margin: 0;\n  padding-top: 18px;\n  padding-left: 29px;\n  padding-bottom: 14px;\n  font-size: .86em;\n  box-sizing: border-box;\n}\n\n.tab-output > .parts-container {\n  display: grid;\n  gap: 2px;\n  margin: 29px;\n  margin-top: 14px;\n  margin-bottom: 0;\n}\n\n.tab-output > .parts-container > div {\n  border-bottom: 2px solid var(--green);\n}\n.tab-output > .parts-container > div:nth-child(3) {\n  border-bottom: none;\n}\n.tab-output > .parts-container > div:nth-child(5) {\n  border-bottom: none;\n}\n\n.tab-output > .parts-container > div div {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  margin-top: 12px;\n  margin-bottom: 12px;\n}\n\n.tab-output > .parts-container > div h3 {\n  font-size: .74em;\n  margin-top: 27px;\n  margin-bottom: 9px;\n}\n.tab-output > .parts-container > div h4 {\n  font-size: .495em;\n  margin-top: 4px;\n  margin-bottom: 19px;\n}\n\n.tab-output > .parts-container > div h5 {\n  font-size: .75em;\n  margin-top: 0;\n  margin-bottom: 0;\n  margin-left: 5px;\n  text-align: right;\n}\n\n.disclaimer-text {\n  font-size: .1em;\n}\n\n.report-button {\n  background-color: var(--green);\n  border: none;\n  color: white;\n  height: 50px;\n  width: 87%;\n  margin: 0;\n  padding: 14px;\n  position: relative;\n  left: 50%;\n  transform: translate(-50%, 50%);\n  font-size: .6em;\n}\n`;
  printer.rawHTML(styleTag);

  // Header image (relative path as requested)
  printer.image('header.png', { alignment: 'center', alt: 'Header' });

  // Clone the output tab element so we don't mutate the live DOM
  const outputClone = tabOutput.element.cloneNode(true) as HTMLElement;

  // Remove interactive controls from the clone for a cleaner report
  const reportButton = outputClone.querySelector('.report-button');
  if (reportButton) reportButton.remove();

  // Add cloned output and print
  printer.rawHTML(outputClone).print();
}
