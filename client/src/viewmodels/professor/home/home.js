import { inject } from 'aurelia-framework';
import config from 'services/config';
import AuthService from 'services/AuthService';
import AsyncHttpClient from 'services/async-http-client';
import AvailableClassroomStudy from 'model/available-classroom-study';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import jsZip from 'jszip/dist/jszip.min.js';
import 'pdfmake/build/pdfmake.min.js'
import pdfFonts from "pdfmake/build/vfs_fonts";
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4';
import 'datatables.net-buttons/js/buttons.html5.min.js';
import 'datatables.net-buttons/js/buttons.print.min.js';
import 'datatables.net-buttons/js/buttons.colVis.min.js';

@inject(AuthService, AsyncHttpClient)
export class Home {

  constructor(authService, asyncHttpClient) {
    this.studies = [];
    this.ahc = asyncHttpClient;
    this.authService = authService;
  }

  attached() {
    this.ahc.get(config.entryPointUrl, { 'role': this.authService.session.role })
      .then((response) => response.content)
      .then((url) => {
        this.ahc.get(url)
          .then((response) => response.content)
          .then((data) => {
            this.availableClassroomStudies = data.map((classStudy) => AvailableClassroomStudy.toObject(classStudy));
          })
          .then((data) => {
            $.fn.dataTable.Buttons.jszip(jsZip);
            $('.table').DataTable({
              dom: "<'row'<'col-6'B><'col-6'f>>" +
                    "<'row'<'col-12'tr>>" +
                    "<'row'<'col-4'l><'col-4'p><'col-4 text-right'i>>",
              pageLength: 20,
              buttons: ['copyHtml5', 'excelHtml5', 'pdfHtml5', 'print']
            });
          });
      });
  }

}
