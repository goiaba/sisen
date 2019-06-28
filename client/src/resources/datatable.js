import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4';
import 'datatables.net-rowgroup';
import 'datatables.net-buttons/js/buttons.html5.min.js';
import 'datatables.net-buttons/js/buttons.print.min.js';
import 'datatables.net-buttons/js/buttons.colVis.min.js';

$.extend(true, $.fn.dataTable.defaults, {
  dom: "<'row'<'col-6'B><'col-6'f>>" +
        "<'row'<'col-12 overflow-auto'tr>>" +
        "<'row'<'col-4'l><'col-4'p><'col-4 text-right'i>>",
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
