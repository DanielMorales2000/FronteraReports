import { Component, OnInit } from '@angular/core';
import { ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-line-graphic',
  templateUrl: './line-graphic.component.html',
  styleUrls: ['./line-graphic.component.css']
})
export class LineGraphicComponent implements OnInit {

  constructor() { }

  multi = [
    {
      "name": "USA",
      "series": [
        {
          "name": "1991",
          "value": 1
        },
        {
          "name": "1992",
          "value": 10
        },
        {
          "name": "1993",
          "value": 5
        },
        {
          "name": "1994",
          "value": 7
        },
        {
          "name": "1995",
          "value": 2
        },
        {
          "name": "1996",
          "value": 0
        },
        {
          "name": "1997",
          "value": 11
        },
        {
          "name": "1998",
          "value": 15
        },
        {
          "name": "2000",
          "value": 1
        },
        {
          "name": "2001",
          "value": 3
        },
        {
          "name": "2002",
          "value": 7
        },
        {
          "name": "2003",
          "value": 11
        },
        {
          "name": "2004",
          "value": 17
        },
        {
          "name": "2005",
          "value": 16
        },
        {
          "name": "2006",
          "value": 12
        },
        {
          "name": "2007",
          "value": 11
        },
        {
          "name": "2008",
          "value": 9
        }
      ]
    },
  ];

  view: [number, number] = [700, 300];

    // options
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    xAxis: boolean = true;
    yAxis: boolean = true;
    showYAxisLabel: boolean = true;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = 'Year';
    yAxisLabel: string = 'Population';
    timeline: boolean = true;
  
    colorScheme = {
      name: 'myScheme',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };
  
  
    onSelect(data: any): void {
      console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }
  
    onActivate(data: any): void {
      console.log('Activate', JSON.parse(JSON.stringify(data)));
    }
  
    onDeactivate(data: any): void {
      console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }
  ngOnInit(): void {
  }

}
