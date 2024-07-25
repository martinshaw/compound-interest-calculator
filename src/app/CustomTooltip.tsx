/*
All Rights Reserved, (c) 2024 Martin Shaw

Author: Martin Shaw (developer@martinshaw.co)
File Name: CustomTooltip.tsx
Created:  2024-07-13T22:29:25.917Z
Modified: 2024-07-13T22:29:25.917Z

Description: description
*/

import { ReactNode } from "react";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { TooltipProps } from "recharts/types/component/Tooltip";
import { useDarkMode } from "usehooks-ts";

type CustomTooltipType = TooltipProps<ValueType, NameType> & {
    currencySymbol: string;
}

const CustomTooltip : ((props: CustomTooltipType) => ReactNode) = (props) => {
    const { isDarkMode } = useDarkMode();

    if (props.payload == null || props.payload.length === 0) return null;
    const item = props.payload[0].payload;

    return (
        <div className="px-6 py-4 rounded-lg shadow-md border bg-slate-100 dark:bg-black border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-300">
            <div className="text-lg font-bold">{props.label}</div>
            <div className="text-sm">Amount: {props.currencySymbol}{item.amountOfMoney.toLocaleString({
                style: 'currency',
                currency: 'GBP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}</div>
        </div>
    );
}

export default CustomTooltip;