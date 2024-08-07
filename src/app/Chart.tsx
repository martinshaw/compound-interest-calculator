/*
All Rights Reserved, (c) 2024 Martin Shaw

Author: Martin Shaw (developer@martinshaw.co)
File Name: Chart.tsx
Created:  2024-07-13T21:37:10.046Z
Modified: 2024-07-13T21:37:10.046Z

Description: description
*/

import { FC } from "react";
import { Line, LineChart, Tooltip, XAxis } from "recharts";
import CustomTooltip from "./CustomTooltip";
import { useDarkMode } from "usehooks-ts";

type ChartPropsType = {
    data: CompountChartDataType;
    width: number;
    height: number;
    currencySymbol: string;
}

const Chart: FC<ChartPropsType> = (props) => {
    const { isDarkMode } = useDarkMode()

    return (
        <LineChart
            width={props.width}
            height={props.height}
            data={props.data}
        >
            <XAxis dataKey="year" stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
            <Tooltip content={<CustomTooltip currencySymbol={props.currencySymbol} />} />
            <Line
                dot={false}
                type="monotone"
                dataKey="yAxisValue"
                stroke="#8884d8"
            />
        </LineChart>
    );
}

export default Chart;