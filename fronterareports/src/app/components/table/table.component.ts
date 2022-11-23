import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as XLSX from 'xlsx';
import { FileSaverService } from 'ngx-filesaver';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';

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

  displayedColumns: string[] = [
    'position',
    'nodo',
    'idSocket',
    'propietario',
    'nodoDestino',];

  columnsList: any = [
  { columnDef: 'position', columnName:'Posición', columnType: ColumnTypeEnum.number, dataPosition: 0 },
  { columnDef: 'nodo', columnName:'Nodo', columnType: ColumnTypeEnum.string, dataPosition: 1 },
  { columnDef: 'idSocket', columnName:'Socket', columnType: ColumnTypeEnum.string, dataPosition: 2 },
  { columnDef: 'propietario', columnName:'Propietario', columnType: ColumnTypeEnum.string, dataPosition: 3 },
  { columnDef: 'nodoDestino', columnName:'Nodo de Destino', columnType: ColumnTypeEnum.string, dataPosition: 4 }];

  displayedColumns2: string[] = [
    'position',
    'nodo',
    'idSocket',
    'propietario',
    'propietario1',
    'propietario2',
    'nodoDestino',];

  columnsList2: any = [
  { columnDef: 'position', columnName:'XD', columnType: ColumnTypeEnum.number, dataPosition: 0 },
  { columnDef: 'nodo', columnName:'XD', columnType: ColumnTypeEnum.string, dataPosition: 1 },
  { columnDef: 'idSocket', columnName:'XD', columnType: ColumnTypeEnum.string, dataPosition: 2 },
  { columnDef: 'propietario', columnName:'XD', columnType: ColumnTypeEnum.string, dataPosition: 3 },
  { columnDef: 'propietario1', columnName:'XD2', columnType: ColumnTypeEnum.string, dataPosition: 3 },
  { columnDef: 'propietario2', columnName:'XD3', columnType: ColumnTypeEnum.string, dataPosition: 3 },
  { columnDef: 'nodoDestino', columnName:'XD de Destino', columnType: ColumnTypeEnum.string, dataPosition: 4 }];

  header: boolean = false;
  filterModeEnum = FilterModeEnum;
  columnTypeEnum = ColumnTypeEnum;

  dataSource: any;
  csvRecords: any;

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
    private snackBar: MatSnackBar) { }

  fileChangeListener(event: any): void {
    const files = event.srcElement.files;
    this.header = (this.header as unknown as string) === 'true' || this.header === true;

    this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ';', encoding: 'utf8' })
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
    this.asyncProcessManager('GenerateFilterList');
  }

  columnsListSelector(){
    /**
     * details_by_circuit: 10
     * summary_by_circuit: 7
     * summary_by_node: 9
     * summary_losses: 12
     */
    switch (this.csvRecords[1].length) {
      case 10:
        this.columnsList = [
          { columnDef: 'utc', columnName:'UTC', columnType: ColumnTypeEnum.datetime_local, dataPosition: 1 },
          { columnDef: 'horalocal', columnName:'Hora Local', columnType: ColumnTypeEnum.datetime_local, dataPosition: 2 },
          { columnDef: 'idsoc', columnName:'IdSoc', columnType: ColumnTypeEnum.string, dataPosition: 3 },
          { columnDef: 'idsocket', columnName:'IdSocket', columnType: ColumnTypeEnum.string, dataPosition: 4 },
          { columnDef: 'nodoorigen', columnName:'Nodo Origen', columnType: ColumnTypeEnum.string, dataPosition: 5 },
          { columnDef: 'nododestino', columnName:'Nodo Destino', columnType: ColumnTypeEnum.string, dataPosition: 6 },
          { columnDef: 'medido', columnName:'Medido [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 7 },
          { columnDef: 'estimado', columnName:'Estimado [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 8 },
          { columnDef: 'balanceado', columnName:'Balanceado', columnType: ColumnTypeEnum.number, dataPosition: 9 }];
        break;
      case 7:
        this.columnsList = [
          { columnDef: 'nodo', columnName:'Nodo', columnType: ColumnTypeEnum.string, dataPosition: 0 },
          { columnDef: 'idsoc', columnName:'IdSoc', columnType: ColumnTypeEnum.string, dataPosition: 1 },
          { columnDef: 'puntomedida', columnName:'Socket', columnType: ColumnTypeEnum.string, dataPosition: 2 },
          { columnDef: 'ultimalectura', columnName:'Última Lectura', columnType: ColumnTypeEnum.datetime_local, dataPosition: 3 },
          { columnDef: 'intervalostotales', columnName:'Intervalos Totales', columnType: ColumnTypeEnum.number, dataPosition: 4 },
          { columnDef: 'intervalosleidos', columnName:'Intervalos Leídos', columnType: ColumnTypeEnum.number, dataPosition: 5 },
          { columnDef: 'intervalosestimados', columnName:'Intervalos Estimados', columnType: ColumnTypeEnum.number, dataPosition: 6 }];
        break;
      case 9:
        this.columnsList = [
          { columnDef: 'nodo', columnName:'Nodo', columnType: ColumnTypeEnum.string, dataPosition: 0 },
          { columnDef: 'idsocket', columnName:'Id Socket', columnType: ColumnTypeEnum.string, dataPosition: 1 },
          { columnDef: 'propietario', columnName:'Propietario', columnType: ColumnTypeEnum.string, dataPosition: 2 },
          { columnDef: 'nododestino', columnName:'Nodo Destino', columnType: ColumnTypeEnum.string, dataPosition: 3 },
          { columnDef: 'ultimalectura', columnName:'Ultima Lectura', columnType: ColumnTypeEnum.datetime_local, dataPosition: 4 },
          { columnDef: 'medidareal', columnName:'Medida Real', columnType: ColumnTypeEnum.number, dataPosition: 5 },
          { columnDef: 'medidaestimada', columnName:'Medida Estimada', columnType: ColumnTypeEnum.number, dataPosition: 6 },
          { columnDef: 'medidabalanceada', columnName:'Medida Balanceada', columnType: ColumnTypeEnum.number, dataPosition: 7 },
          { columnDef: 'error', columnName:'Error', columnType: ColumnTypeEnum.number, dataPosition: 8 }];
        break;
      case 12:
        this.columnsList = [
          { columnDef: 'nodoa', columnName:'Nodo A', columnType: ColumnTypeEnum.string, dataPosition: 0 },
          { columnDef: 'puntomedidaa', columnName:'Punto de Medida A', columnType: ColumnTypeEnum.string, dataPosition: 1 },
          { columnDef: 'nodob', columnName:'Nodo B', columnType: ColumnTypeEnum.string, dataPosition: 2 },
          { columnDef: 'puntomedidab', columnName:'Punto de Medida B', columnType: ColumnTypeEnum.string, dataPosition: 3 },
          { columnDef: 'inyeccionaest', columnName:'Inyección en A est[kWh]', columnType: ColumnTypeEnum.number, dataPosition: 4 },
          { columnDef: 'retirobest', columnName:'Retiro en B est [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 5 },
          { columnDef: 'perdidasestimadaskwh', columnName:'Pérdidas est [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 6 },
          { columnDef: 'perdidasestpctg', columnName:'Pérdidas est[%]', columnType: ColumnTypeEnum.string, dataPosition: 7 },
          { columnDef: 'retiroabal', columnName:'Retiro en A bal [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 8 },
          { columnDef: 'retirobbal', columnName:'Retiro en B bal [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 9 },
          { columnDef: 'perdidasbalkwh', columnName:'Pérdidas bal [kWh]', columnType: ColumnTypeEnum.number, dataPosition: 10 },
          { columnDef: 'perdidasbalpctg', columnName:'Pérdidas bal [%]', columnType: ColumnTypeEnum.string, dataPosition: 11 }];
        break;
    }
    this.displayedColumns = this.columnsList.map((x: { columnDef: any; }) => x.columnDef);
    this.displayedColumns;
  }

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