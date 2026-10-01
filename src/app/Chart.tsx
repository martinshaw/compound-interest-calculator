/*
All Rights Reserved, (c) 2024 Martin Shaw

Author: Martin Shaw (developer@martinshaw.co)
File Name: Chart.tsx
Created:  2024-07-13T21:37:10.046Z
Modified: 2024-07-13T21:37:10.046Z

Description: description
*/

import { FC, useCallback, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { CategoricalChartState } from "recharts/types/chart/types";
import type { Coordinate } from "recharts/types/util/types";
import CustomTooltip from "./CustomTooltip";
import { useDarkMode } from "usehooks-ts";

type ChartPropsType = {
    data: CompountChartDataType;
    currencySymbol: string;
};

type TooltipViewState = {
    active: boolean;
    payload?: CategoricalChartState["activePayload"];
    label?: string | number;
    coordinate?: Partial<Coordinate>;
    /** Keep showing after pointer leaves / lifts (set on mouse/touch up). */
    pinned: boolean;
};

const emptyTooltip: TooltipViewState = { active: false, pinned: false };

const Chart: FC<ChartPropsType> = (props) => {
    const { isDarkMode } = useDarkMode();
    const [tooltip, setTooltip] = useState<TooltipViewState>(emptyTooltip);

    const handleMove = useCallback((state: CategoricalChartState) => {
        // Follow cursor / finger like classic hover; unpin while moving so leave can hide
        // if the user never released on a point.
        if (state?.isTooltipActive && state.activePayload?.length) {
            setTooltip({
                active: true,
                payload: state.activePayload,
                label: state.activeLabel,
                coordinate: state.activeCoordinate,
                pinned: false,
            });
            return;
        }

        setTooltip((prev) => (prev.pinned ? prev : emptyTooltip));
    }, []);

    const handleUp = useCallback((state: CategoricalChartState) => {
        // Persist the last hovered/touched point after mouse/touch up (desktop + mobile).
        if (state?.isTooltipActive && state.activePayload?.length) {
            setTooltip({
                active: true,
                payload: state.activePayload,
                label: state.activeLabel,
                coordinate: state.activeCoordinate,
                pinned: true,
            });
            return;
        }

        setTooltip((prev) => (prev.active ? { ...prev, pinned: true } : emptyTooltip));
    }, []);

    const handleLeave = useCallback(() => {
        setTooltip((prev) => (prev.pinned ? prev : emptyTooltip));
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
            <LineChart
                data={props.data}
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                onMouseMove={handleMove}
                onMouseUp={handleUp}
                onMouseLeave={handleLeave}
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
                    active={tooltip.active}
                    payload={tooltip.payload}
                    label={tooltip.label}
                    coordinate={tooltip.coordinate}
                    wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                    cursor={{ stroke: isDarkMode ? '#64748b' : '#94a3b8', strokeDasharray: '4 4' }}
                    isAnimationActive={false}
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
