
import { Printing } from "../printing";

// const tabInput = new Tab<{}>()
//   .select('Compost Type', COMPOST_TYPES)
//   .number('Amount of Compost to be Applied (yds&sup3;)')
//   .number('Lot Size (ft&sup2;)')
//   .number('C:N Ratio')

//   .horizontalNumbers('Percentages (As Rcvd)', [
//     'N Total',
//     'Phosphorus (% P2O5)',
//     'Potassium (% K2O)'
//   ] as const, true)
//   ;

const doc = new Printing();

doc
  .setTitle('Company Report')
  .header1('Annual Financial Report')
  .text('This report summarizes our company performance for the year.')
  .style({ bold: true, color: '#2c3e50' })
  .header2('Quarterly Results')
  .resetStyle()
  .table([
    ['Quarter', 'Test1', 'Test2'],
    ['Q1', '6789', '1234'],
    ['Q2', '6789', '1234'],
    ['Q3', '6789', '1234'],
    ['Q4', '6789', '1234']
  ], { headers: true })
  .image('/reports/chart.png', { 
    width: 600, 
    alignment: 'center',
    alt: 'Revenue Chart'
  }); // Opens print dialog

document.addEventListener('mousedown', () => {
  doc.print()
});

