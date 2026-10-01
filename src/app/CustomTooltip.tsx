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
import { formatMoney } from "../lib/calculateCompoundInterest";

type CustomTooltipType = TooltipProps<ValueType, NameType> & {
    currencySymbol: string;
}

const CustomTooltip : ((props: CustomTooltipType) => ReactNode) = (props) => {
    if (props.payload == null || props.payload.length === 0) return null;
    const item = props.payload[0].payload;

    return (
        <div className="max-w-[min(90vw,20rem)] px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-md border bg-slate-100 dark:bg-black border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-300 pointer-events-none">
            <div className="text-base sm:text-lg font-bold">{props.label}</div>
            <div className="text-sm">Amount: {props.currencySymbol}{formatMoney(item.amountOfMoney)}</div>
            {item.totalInterest != null && item.yearsElapsed > 0 && (
                <div className="text-sm mt-1">Interest earned: {props.currencySymbol}{formatMoney(item.totalInterest)}</div>
            )}
            {item.totalContributions != null && item.totalContributions > 0 && (
                <div className="text-sm mt-1">Contributions: {props.currencySymbol}{formatMoney(item.totalContributions)}</div>
            )}
        </div>
    );
}

export default CustomTooltip;
