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
import { ContentType, TooltipProps } from "recharts/types/component/Tooltip";

type CustomTooltipType = TooltipProps<ValueType, NameType> & {
    currencySymbol: string;
}

const CustomTooltip : ((props: CustomTooltipType) => ReactNode) = (props) => {
    if (props.payload == null || props.payload.length === 0) return null;
    const item = props.payload[0].payload;

    return (
        <div className="bg-black px-6 py-4 rounded-lg shadow-md border border-slate-500">
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