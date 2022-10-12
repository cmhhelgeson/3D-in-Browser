import React, {useState} from "react";
import { GenericXPWindow } from "../GenericXPWindow";
import styles from "./SliderDisplay.module.css"


type SliderParams = {
    label: string
    lowVal: number
    highVal: number
    valueToChange?: any,
    setState?: any
    lowValLabel?: string
    highValLabel?: string
}


const Slider = ({label, lowVal, highVal, setState, valueToChange, lowValLabel, highValLabel}: SliderParams) => {

    const [localState, setLocalState] = useState<number>(0);

    const handleChange = (event: any) => {
        setLocalState(event.target.value);
        setState([0, -5.0, -1.0])
    }

    const step = (highVal - lowVal) / 100;
    return (<div className={`field-row ${styles.field_row_adjust}`}>
        <div>{label}</div>
        <div className={`slider ${styles.slider_adjust}`}>
            <div>{lowValLabel ? lowValLabel : lowVal.toString()}</div>
            <input id="range26" type="range" min={lowVal.toString()} max={highVal.toString()} step={step} value={localState} onChange={handleChange}/>
            <label htmlFor="range27">{highValLabel ? highValLabel : highVal.toString()}</label>
        </div>
    </div>);
}



export type SliderDisplayParams = {
    sliders: SliderParams[], 
    windowText: string,
    additionalText?: string[]
}
export const SliderDisplay = ({sliders, windowText, additionalText}: SliderDisplayParams) => {
    return (<GenericXPWindow width={300} height={300}
        text={windowText} offsetX={1000} offsetY={20}>
        <div className="slider_block" style={{"display": "flex", "flexDirection": "column", "alignItems": "center"}}>
            {sliders.map((slider) => (
                <Slider
                    lowVal={slider.lowVal}
                    highVal={slider.highVal}
                    label={slider.label}
                />
            ))}
            {additionalText ? 
                additionalText.map((textBlock) => (
                    <p>{additionalText}</p>
                )) 
                : null
            }
        </div>
    </GenericXPWindow>);
}