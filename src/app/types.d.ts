/*
All Rights Reserved, (c) 2024 Martin Shaw

Author: Martin Shaw (developer@martinshaw.co)
File Name: types.d.ts
Created:  2024-07-13T21:41:19.986Z
Modified: 2024-07-13T21:41:19.986Z

Description: description
*/

type CompoundChartItemType = {
    year: string;
    yearsElapsed?: number;
    yAxisValue: number;
    amountOfMoney: number;
    interestEarned?: number;
    totalContributions?: number;
    totalInterest?: number;
}
  
type CompountChartDataType = CompoundChartItemType[];
