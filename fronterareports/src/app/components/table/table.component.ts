import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as XLSX from 'xlsx';
import { FileSaverService } from 'ngx-filesaver';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ServicesService } from 'src/app/services/services.service';


export enum FilterModeEnum {
  na = 'na',/*No Selection */
  ct = 'ct',/*Contains */
  gt = 'gt',/*Greater */
  st = 'st',/*Smallest */
  eq = 'eq',/*Equals */
  t = 't',/*True */
  f = 'f',/*False */
  bt = 'bt',/*Between */
  ilst = 'ilst'/*List of non-repeating items */
}

export enum ColumnTypeEnum {
  na = 'na',
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  datetime_local = 'datetime_local',
  datetime = 'datetime'
}

export interface FilterDataListItem {
  dataFilter: string;
  checked: boolean;
}

export interface SelectedFilter {
  ColumnIndex: number,
  ColumnType: ColumnTypeEnum,
  FilterMode: FilterModeEnum,
  FilterValue: any,
  SecondFilterValue: any,
  FilterDataList: FilterDataListItem[]
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent {
  dataLength!: number;
  pageSize: number = 5;
  pageSizeOptions: number[] = [5,10,15,20];

  lowValue: number = 0;
  highValue: number = 5;

  displayedColumns: string[] = [];
  columnsList: any = [];
  dataSource: any;
  csvRecords: any;

  header: boolean = false;
  filterModeEnum = FilterModeEnum;
  columnTypeEnum = ColumnTypeEnum;


  GeneralListFilterList: any[] = [];
  filtersData: any[] = [];

  FilterMode: FilterModeEnum = FilterModeEnum['na'];
  FilterValue: any = null;
  SecondFilterValue: any = null;
  FilterDataList: FilterDataListItem[] = [];

  selectedFilter: SelectedFilter = {
    ColumnIndex: 0,
    ColumnType: this.columnTypeEnum.na,
    FilterMode: this.FilterMode,
    FilterValue: this.FilterValue,
    SecondFilterValue: this.SecondFilterValue,
    FilterDataList: this.FilterDataList
  };

  @ViewChild('fileImportInput') fileImportInput: any;

  constructor(private filerSaver: FileSaverService,
    private ngxCsvParser: NgxCsvParser,
    private snackBar: MatSnackBar,
    private service: ServicesService) { }

  //#region table creation  
  onGetData(event: any){
    event;
    this.service.post(event).
    subscribe({
      next: response => {
        this.dataChangeListener(response);
      },
      error: error => {
        console.log(error);
      }
    })
  }

  dataChangeListener(response: any): void {

    this.header = (this.header as unknown as string) === 'true' || this.header === true;
    
    const myBlob = new Blob([response], { type: 'text/csv' });
    const file = new File([myBlob], "file.csv");

    this.ngxCsvParser.parse(file, { header: this.header, delimiter: ';', encoding: 'utf8' })
    .pipe().subscribe({
      next: (result): void => {
        this.tableBuilder(result);
      },
      error: (error: NgxCSVParserError): void => {
        console.log('Error', error);
      }
    });
  }

  tableBuilder(result: any): void{
    this.filtersData = [];
    this.csvRecords = result;
    this.columnsListSelector();
    this.dataSource = this.csvRecords;
    this.dataSource.splice(0, 1);
    this.dataLength = this.dataSource.length;
    this.asyncProcessManager('GenerateFilterList');
  }

  columnsListSelector(){
    switch (this.csvRecords[1].length) {
      case 11:
        this.columnsList = [
          { columnDef: 'balance_date', columnName:'Fecha de Informe', columnType: ColumnTypeEnum.datetime, dataPosition: 0 },
          { columnDef: 'node', columnName:'Nodo', columnType: ColumnTypeEnum.string, dataPosition: 1 },
          { columnDef: 'id_soc', columnName:'IdSoc', columnType: ColumnTypeEnum.string, dataPosition: 2 },
          { columnDef: 'idsocket', columnName:'Id Socket', columnType: ColumnTypeEnum.string, dataPosition: 3 },
          { columnDef: 'owner', columnName:'Dueño', columnType: ColumnTypeEnum.string, dataPosition: 4 },
          { columnDef: 'node_destiny', columnName:'Nodo Destino', columnType: ColumnTypeEnum.string, dataPosition: 5 },
          { columnDef: 'last_reading', columnName:'Ultima Lectura', columnType: ColumnTypeEnum.datetime_local, dataPosition: 6 },
          { columnDef: 'real_meas', columnName:'Medida Real', columnType: ColumnTypeEnum.number, dataPosition: 7 },
          { columnDef: 'est_meas', columnName:'Medida Estimada', columnType: ColumnTypeEnum.number, dataPosition: 8 },
          { columnDef: 'bal_meas', columnName:'Medida Informada', columnType: ColumnTypeEnum.number, dataPosition: 9 },
          { columnDef: 'error', columnName:'Error', columnType: ColumnTypeEnum.number, dataPosition: 10 }];
        break;
      case 8:
        this.columnsList = [
          { columnDef: 'balance_date', columnName:'Fecha de Informe', columnType: ColumnTypeEnum.datetime, dataPosition: 0 },
          { columnDef: 'node', columnName:'Nodo', columnType: ColumnTypeEnum.string, dataPosition: 1 },
          { columnDef: 'id_soc', columnName:'IdSoc', columnType: ColumnTypeEnum.string, dataPosition: 2 },
          { columnDef: 'idsocket', columnName:'Id Socket', columnType: ColumnTypeEnum.string, dataPosition: 3 },
          { columnDef: 'last_reading', columnName:'Ultima Lectura', columnType: ColumnTypeEnum.datetime_local, dataPosition: 4 },
          { columnDef: 'intervals_total', columnName:'Intervalos Totales', columnType: ColumnTypeEnum.number, dataPosition: 5 },
          { columnDef: 'intervals_read', columnName:'Intervalos Leídos', columnType: ColumnTypeEnum.number, dataPosition: 6 },
          { columnDef: 'intervals_est', columnName:'Intervalos Estimados', columnType: ColumnTypeEnum.number, dataPosition: 7 }];
        break;
      case 13:
        this.columnsList = [
          { columnDef: 'balance_date', columnName:'Fecha de Informe', columnType: ColumnTypeEnum.datetime, dataPosition: 0 },
          { columnDef: 'node_a', columnName:'Nodo A', columnType: ColumnTypeEnum.string, dataPosition: 1 },
          { columnDef: 'idsocket_a', columnName:'Id Socket A', columnType: ColumnTypeEnum.string, dataPosition: 2 },
          { columnDef: 'node_b', columnName:'Nodo B', columnType: ColumnTypeEnum.string, dataPosition: 3 },
          { columnDef: 'idsocket_b', columnName:'Id Socket B', columnType: ColumnTypeEnum.string, dataPosition: 4 },
          { columnDef: 'flow_a_est', columnName:'Flujo Estimado (A)', columnType: ColumnTypeEnum.number, dataPosition: 5 },
          { columnDef: 'flow_b_est', columnName:'Flujo Estmado (B)', columnType: ColumnTypeEnum.number, dataPosition: 6 },
          { columnDef: 'losses_est', columnName:'Perdidas Estimadas', columnType: ColumnTypeEnum.number, dataPosition: 7 },
          { columnDef: 'losses_est_perc', columnName:'Perdidas Estimadas Percibidas', columnType: ColumnTypeEnum.number, dataPosition: 8 },
          { columnDef: 'flow_a_bal', columnName:'Flujo Informado (A)', columnType: ColumnTypeEnum.number, dataPosition: 9 },
          { columnDef: 'flow_b_bal', columnName:'Flujo Informado (B)', columnType: ColumnTypeEnum.number, dataPosition: 10 },
          { columnDef: 'losses_bal', columnName:'Perdidas Informadas', columnType: ColumnTypeEnum.number, dataPosition: 11 },
          { columnDef: 'losses_bal_perc', columnName:'Perdidas Percibidas Informadas', columnType: ColumnTypeEnum.number, dataPosition: 12 }];
        break;
    }
    this.displayedColumns = this.columnsList.map((x: { columnDef: any; }) => x.columnDef);
    this.displayedColumns;
  }

  onPageChange(event: PageEvent): PageEvent{
    this.pageSize = event.pageSize;
    this.lowValue = event.pageIndex * this.pageSize;
    this.highValue = this.lowValue + this.pageSize;
    return event;
  }
  //#endregion
  //#region filters creation and elimination
  onSelectColumnFilter(columnIndex: number, columnType: ColumnTypeEnum): void{
    let filterExists: boolean = false;
    this.filtersData.forEach(filter => {
      if (filter.ColumnIndex == columnIndex) {
        filterExists = true;
        this.FilterMode = filter.FilterMode;
        this.FilterValue = filter.FilterValue;
        this.SecondFilterValue = filter.SecondFilterValue;
        this.FilterDataList = filter.FilterDataList;
        this.selectedFilter = filter;
      }
    });
    if (filterExists) return;

    this.FilterValue = columnType == this.columnTypeEnum.number ? 0 : '';
    this.SecondFilterValue = columnType == this.columnTypeEnum.number ? 0 : '';
    this.FilterMode = FilterModeEnum.na;
    let tempFilterDataList = this.GeneralListFilterList[columnIndex];
    this.FilterDataList = tempFilterDataList;

    this.selectedFilter = {
      ColumnIndex: columnIndex,
      ColumnType: columnType,
      FilterMode: this.FilterMode,
      FilterValue: this.FilterValue,
      SecondFilterValue: this.SecondFilterValue,
      FilterDataList: this.FilterDataList
    };
  }

  onCreateFilter() {
    this.selectedFilter.FilterMode = this.FilterMode;
    this.selectedFilter.FilterValue = this.FilterValue;
    this.selectedFilter.SecondFilterValue = this.SecondFilterValue;
    this.selectedFilter.FilterDataList = this.FilterDataList;
    if (!this.isFilterValid() || this.FilterMode == this.filterModeEnum.na) {
      this.onClearFilter()
      return;
    }

    let filterExists: boolean = false;
    this.filtersData.forEach(filter => {
      if (filter.ColumnIndex == this.selectedFilter.ColumnIndex) {
        filterExists = true;
        filter = this.selectedFilter;
      }
    });

    if (!filterExists) {
      this.filtersData.push(this.selectedFilter);
    }

    this.onFilter();
  }

  onClearFilter() {
    for (let i = 0; i < this.filtersData.length; i++) {
      if (this.filtersData[i].ColumnIndex == this.selectedFilter.ColumnIndex) {
        let tempFilterList: FilterDataListItem[] = this.GeneralListFilterList[this.selectedFilter.ColumnIndex];
        if (tempFilterList) {
          tempFilterList.forEach(element => {
            element.checked = false;
          });
        }
        this.filtersData.splice(i, 1);
      }
    }
    this.onFilter();
  }

  async asyncProcessManager(process: string) {
    switch (process) {
      case 'GenerateFilterList':
        this.GeneralListFilterList = [];
        this.GeneralListFilterList = await this.onDataListOfFiltersGeneration();
        break;

      default:
        break;
    }
  }

  async onDataListOfFiltersGeneration() {
    return new Promise<any[]>((resolve, reject) => {
      if (this.dataSource.length <= 0) {
        reject('No se encontraron datos');
      }

      let colHeaders: any[] = this.csvRecords[0];
      let data: any[] = this.dataSource;
      if ((colHeaders.length + 1) == data[0].length) {
        colHeaders.unshift('id');
      }

      let tempColHeaders: any[] = [];
      colHeaders.forEach(element => {
        if (element != '') {
          tempColHeaders.push(element);
        }
      })

      colHeaders = tempColHeaders;
      let filtersDataList: any[] = [];
      colHeaders.forEach(() => {
        filtersDataList.push([]);
      })

      data.forEach(row => {
        for (let i = 0; i < filtersDataList.length; i++) {
          filtersDataList[i].push(row[i]);
        }
      });

      let tempFilterDataList: any[] = [];
      filtersDataList.forEach(element => {
        let tempDataFilterList: any[] = [];
        let filteredData: any[] = element.reduce((acc: any[], item: any[]) => {
          if (!tempDataFilterList.includes(item)) {
            tempDataFilterList.push(item);
            acc.push({
              dataFilter: item,
              checked: false
            });
          }
          return acc;
        }, []);
        tempFilterDataList.push(filteredData);
      });
      filtersDataList = tempFilterDataList;
      resolve(filtersDataList);
    });

  }
  //#endregion
  //#region it is validated that the filter parameters are correct

  isFilterValid() {
    let isValid: boolean = true;
    switch (this.selectedFilter.ColumnType) {
      case this.columnTypeEnum.number:
        isValid = this.filtersDataValidation(this.columnTypeEnum.number);
        break;
      case this.columnTypeEnum.string:
        isValid = this.filtersDataValidation(this.columnTypeEnum.string);
        break;
      case this.columnTypeEnum.boolean:
        isValid = this.filtersDataValidation(this.columnTypeEnum.boolean);
        break;
      case this.columnTypeEnum.datetime_local:
        isValid = this.filtersDataValidation(this.columnTypeEnum.datetime_local);
        break;
    }
    return isValid;
  }

  filtersDataValidation(columnType: ColumnTypeEnum) {
    if (this.selectedFilter.FilterMode == this.filterModeEnum.ilst) {
      let isValid: boolean = false;
      this.selectedFilter.FilterDataList.forEach(filterData => {
        if (filterData.checked) isValid = true;
      });
      if (isValid) {
        return true;
      }
    }


    if (this.selectedFilter.FilterMode == undefined ||
      this.selectedFilter.FilterMode == null ||
      this.selectedFilter.FilterMode == this.filterModeEnum.na) {
      return false;
    }

    if (columnType == this.columnTypeEnum.datetime || columnType == this.columnTypeEnum.datetime_local) {
      if (this.selectedFilter.FilterMode == this.filterModeEnum.bt &&
        (this.selectedFilter.SecondFilterValue == '' || this.selectedFilter.SecondFilterValue == null)) {
        this.openNotificationDangerToast('Datos incorrectos o incompletos', '', 'dangerSnackBar');
        return false;
      }
      if (this.selectedFilter.FilterValue == '' || this.selectedFilter.FilterValue == null) {
        this.openNotificationDangerToast('Datos incorrectos o incompletos', '', 'dangerSnackBar');
        return false;
      }
    }

    if (this.selectedFilter.FilterMode == this.filterModeEnum.bt) {
      switch (columnType) {
        case this.columnTypeEnum.number:
          if (this.FilterValue > this.SecondFilterValue) {
            this.openNotificationDangerToast('Valor inicial menor que valor final', '', 'dangerSnackBar');
            return false;
          }
          break;
        case this.columnTypeEnum.datetime_local:
        case this.columnTypeEnum.datetime:
          let initDate: Date = new Date(this.FilterValue);
          let finalDate: Date = new Date(this.SecondFilterValue);
          if (initDate > finalDate) {
            this.openNotificationDangerToast('Valor inicial menor que valor final', '', 'dangerSnackBar');
            return false;
          }
          break;
      }
    }
    if (columnType != this.columnTypeEnum.boolean &&
      this.selectedFilter.FilterValue == undefined) {
      return false;
    }

    if (columnType == this.columnTypeEnum.string &&
      (this.selectedFilter.FilterValue == null ||
        this.selectedFilter.FilterValue == '')) {
      return false;
    }
    return true;
  }

  isFilterActive(index: number) {
    let filterExists: boolean = false;
    this.filtersData.forEach(filter => {
      if (filter.ColumnIndex == index) {
        filterExists = true;
      }
    })
    return filterExists;
  }
  //#endregion
  //#region the filtering process is done

  onFilter() {
    if (this.filtersData.length == null) {
      this.dataSource = this.csvRecords;
      return;
    }

    this.dataSource = [];
    let data: any[] = this.csvRecords;

    this.filtersData.forEach(filter => {
      let filteredData: any[] = [];
      data.forEach(row => {
        if (this.rowMeetsFilter(row, filter)) {
          filteredData.push(row);
        }
      })
      data = filteredData;
    })
    this.dataSource = data;
    this.asyncProcessManager('GenerateFilterList');
  }

  rowMeetsFilter(row: any, filter: any) {
    switch (filter.FilterMode) {
      case this.filterModeEnum.ct:
        if (filter.ColumnType == this.columnTypeEnum.number) {
          filter.FilterValue = filter.FilterValue.toString();
        }
        if (row[filter.ColumnIndex].toLowerCase().includes(filter.FilterValue.toLowerCase())) {
          return true;
        }
        break;
      case this.filterModeEnum.gt:
        if (parseFloat(row[filter.ColumnIndex]) > filter.FilterValue) {
          return true;
        }
        break;
      case this.filterModeEnum.st:
        if (parseFloat(row[filter.ColumnIndex]) < filter.FilterValue) {
          return true;
        }
        break;
      case this.filterModeEnum.eq:
        if (parseFloat(row[filter.ColumnIndex]) == filter.FilterValue) {
          return true;
        }
        break;
      case this.filterModeEnum.bt:
        return this.rangeFilter(row, filter);
      case this.filterModeEnum.t:
        if (row[filter.ColumnIndex].toLowerCase() == 'true') {
          return true;
        }
        break;
      case this.filterModeEnum.f:
        if (row[filter.ColumnIndex].toLowerCase() == 'false') {
          return true;
        }
        break;
      case this.filterModeEnum.ilst:
        return this.listFilter(row, filter);
    }
    return false;
  }

  rangeFilter(row: any, filter: any) {
    switch (filter.ColumnType) {
      case this.columnTypeEnum.number:
        if (parseFloat(row[filter.ColumnIndex]) >= filter.FilterValue &&
          parseFloat(row[filter.ColumnIndex]) <= filter.SecondFilterValue) {
          return true;
        }
        break;
      case this.columnTypeEnum.datetime:
      case this.columnTypeEnum.datetime_local:
        let rowDate: Date = new Date(row[filter.ColumnIndex]);
        let filterStartDate: Date = new Date(this.FilterValue);
        let filterEndDate: Date = new Date(this.SecondFilterValue);
        if (rowDate >= filterStartDate && rowDate <= filterEndDate) {
          return true;
        }
        break;
    }
    return false;
  }

  listFilter(row: any, filter: SelectedFilter) {
    let isValid: boolean = false;
    filter.FilterDataList.forEach(filterItem => {
      if (filterItem.checked && row[filter.ColumnIndex] === filterItem.dataFilter) {
        isValid = true;
      }
    });
    if (isValid) return true;
    return false;
  }
  //#endregion
  //#region Events
  onFilterDataListChange(filterDataElement: FilterDataListItem) {
    if (filterDataElement) {
      this.FilterDataList.forEach(element => {
        if (element.dataFilter === filterDataElement.dataFilter) {
          element.checked = !element.checked;
        }
      })
    }
  }
  //#endregion

  openNotificationDangerToast(message: string, action?: string, tipo?: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
      panelClass: tipo,
    });
  }

  //#endregion

  //#region Funciones que depronto utilice mas adelante
  // xlsxReader(_event: any){
  //   const selectedFile = _event.target.files[0];
  //   const fileReader = new FileReader();
  //   fileReader.readAsBinaryString(selectedFile);
  //   fileReader.onload = (event:any) => {
  //     let binaryData = event.target.result;
  //     let workbook = XLSX.read(binaryData,{type: 'binary'});
  //     workbook.SheetNames.forEach(sheet => {
  //       const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
  //       this.csvRecords = data;
  //     })
  //   }
  //   this.csvRecords;
  // }

  // dataConversorToExcel(): void {

  //   const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
  //   const EXCEL_EXTENSION = '.xlsx';

  //   const worksheet = XLSX.utils.json_to_sheet(this.dataSource);

  //   const workbook = {
  //     Sheets:{
  //       'testingSheet': worksheet
  //     },
  //     SheetNames:['testingSheet']
  //   }

  //   const excelBuffer = XLSX.write(workbook,{bookType:'xlsx',type:'array'});

  //   const blobData = new Blob([excelBuffer],{type:EXCEL_TYPE});
  //   this.filerSaver.save(blobData,'demoFile');
  // }
  //#endregion
}
