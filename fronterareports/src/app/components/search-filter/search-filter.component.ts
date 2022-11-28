import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {

  @Output() FilterData = new EventEmitter<any>();

  searchFilterForm!: FormGroup;

  constructor(private builder: FormBuilder) { }

  ngOnInit() {
    this.searchFilterForm = this.builder.group({
        'balance_date': [null, [Validators.required]],
        'balance_type': [null, [Validators.required]],
        'balance_report': [null, [Validators.required]]
    },);
  }

  onSave(){
    let x = this.searchFilterForm.value;
    let filterData = {...this.searchFilterForm.value};
    let date: Date = filterData.balance_date;
    let dateString = date.toLocaleDateString();
    let dateStringArray = dateString.split('/');
    dateString = dateStringArray[2]+'-'+dateStringArray[1]+'-'+dateStringArray[0];
    filterData.balance_date = dateString;

    this.FilterData.emit(filterData);
  }
}
