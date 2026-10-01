/*
All Rights Reserved, (c) 2024 Martin Shaw

Author: Martin Shaw (developer@martinshaw.co)
File Name: Chart.tsx
Created:  2024-07-13T21:37:10.046Z
Modified: 2024-07-13T21:37:10.046Z

Description: description
*/

import { FC } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import CustomTooltip from "./CustomTooltip";
import { useDarkMode } from "usehooks-ts";

type ChartPropsType = {
    data: CompountChartDataType;
    currencySymbol: string;
}

const Chart: FC<ChartPropsType> = (props) => {
    const { isDarkMode } = useDarkMode();

    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
            <LineChart
                data={props.data}
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
            >
                <XAxis
                    dataKey="year"
                    stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                    tick={{ fontSize: 11 }}
                    minTickGap={28}
                    interval="preserveStartEnd"
                />
                <Tooltip
                    content={<CustomTooltip currencySymbol={props.currencySymbol} />}
                    // Prefer touch + click over hover-only on mobile
                    trigger="click"
                    wrapperStyle={{ outline: 'none' }}
                />
                <Line
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    type="monotone"
                    dataKey="yAxisValue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default Chart;
