import React, {useState} from "react";
import { callbackify } from "util";
import { GenericXPWindow } from "../GenericXPWindow";


type SliderParams = {
    label: string
    lowVal: number
    highVal: number
    valueToChange?: any
    lowValLabel?: string
    highValLabel?: string
}


const Slider = ({label, lowVal, highVal, valueToChange, lowValLabel, highValLabel}: SliderParams) => {

    const [localState, setLocalState] = useState<number>(0);

    const handleChange = (event: any) => {
        setLocalState(event.target.value);
        if (valueToChange) {
            valueToChange.current.z = event.target.value;
        }
    }

    const step = (highVal - lowVal) / 100;
    return (<div className="field-row" style={{"width": "100%", "display": "flex", "justifyContent": "space-evenly"}}>
        <div>{label}</div>
        <div className="slider" style={{"display": "flex", "justifyContent": "start"}}>
            <div>{lowValLabel ? lowValLabel : lowVal.toString()}</div>
            <input id="range26" type="range" min={lowVal.toString()} max={highVal.toString()} step={step} value={localState} onChange={handleChange}/>
            <label htmlFor="range27">{highValLabel ? highValLabel : highVal.toString()}</label>
        </div>
    </div>);
}



export type SliderDisplayParams = {
    sliders: SliderParams[], 
    text: string
}
export const SliderDisplay = ({sliders, text}: SliderDisplayParams) => {
    return (<GenericXPWindow width={300} height={300}
        text={text} offsetX={2000} offsetY={20}>
        <div className="slider_block" style={{"display": "flex", "flexDirection": "column", "alignItems": "center"}}>
            {sliders.map((slider) => (
                <Slider
                    lowVal={slider.lowVal}
                    highVal={slider.highVal}
                    label={slider.label}
                />
            ))}
        </div>
    </GenericXPWindow>);
}