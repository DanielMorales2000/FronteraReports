import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {

  searchFilterForm!: FormGroup;

  constructor(private builder: FormBuilder) { }

  ngOnInit() {
    this.searchFilterForm = this.builder.group({
        'balance_date': [null, [Validators.required, Validators.pattern('^[0-9]+([0-9]*)?$')]],
        'balance_type': [null, [Validators.required, Validators.maxLength(10), Validators.pattern('^[A-Za-z0-9_]+$')]],
        'balance_report': [null, [Validators.required, Validators.maxLength(50), Validators.pattern('^([A-Za-z0-9_ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜàáâãäåèéêëìíîïðñòóôõöùúûüĀāĂăĄąēĔĕĖėĘęĚěĨĩīĪĬĭĮį \\-\\&\\´\\`\\^\\¨\\~\\¸\\˛\\,\\˝\\``\\˘\\•\\˚\'\\.]+)$')]]
    },);
  }

  onSave(){
    let x = this.searchFilterForm.value;
    x;
  }
}
