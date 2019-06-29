import 'datatables.net';
import 'datatables.net-bs4';
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4';
import 'datatables.net-rowgroup';
import 'datatables.net-buttons/js/buttons.html5.min.js';
import 'datatables.net-buttons/js/buttons.print.min.js';
import 'datatables.net-buttons/js/buttons.colVis.min.js';

$.extend(true, $.fn.dataTable.defaults, {
  dom: "<'row'<'col-md-6 col-sm-12'B><'col-md-6 col-sm-12'f>>" +
        "<'row'<'col-12 overflow-auto'tr>>" +
        "<'row'<'col-md-4 col-6'l><'col-md-4 col-6'p>" +
        "<'col-md-4 col-sm-12 text-right'i>>",
  pageLength: 25,
  scrollX: true,
  buttons: [{
    extend: 'copyHtml5',
    text: 'Copiar'
  },{
    extend: 'csvHtml5',
    text: 'CSV'
  },{
    extend: 'print',
    text: 'Imprimir',
    autoPrint: false,
    title: function() {
      // elements on current page with table-title class
      // will be used to build the table title on print view
      return $('.table-title').toArray().map((el) => $(el).text()).join('<br>');
    }
  },{
    extend: 'colvis',
    text: 'Colunas'
  }],
});
