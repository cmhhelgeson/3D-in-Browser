import React, {useEffect, useRef, useState} from "react"

import { dragRefWith, resizeRefWith} from '../../utils/windowUtils';


//Possible ways to forward ref of the window to the App component
//Method 1 Failed
//2. Forward the ref from app using React.forwardRef

type GenericXPWindowProps = {
    text: string
    children?: React.ReactNode
    width?: number
    height?: number
    
}

export const GenericXPWindow = (
    {text, children, width, height}: GenericXPWindowProps, 
) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const titleBarRef = useRef<HTMLDivElement>(null);

    const [isWindowResizing, setIsWindowResizing] = useState<boolean>(false);

    //TODO: Find way to change restrictions when browser window is resized
    useEffect(() => {
        dragRefWith(windowRef, titleBarRef)
        if (windowRef.current) {
            resizeRefWith(windowRef, windowRef, 
                parseInt(windowRef.current.style.width.slice(0, -2)), 
                parseInt(windowRef.current.style.height.slice(0, -2)),
                window.innerWidth - 100, window.innerHeight - 100,
                setIsWindowResizing, setIsWindowResizing 
            );
        }
    }, [])

    useEffect(() => {
        if (isWindowResizing || !windowRef.current) {
            return;
        }
    }, [isWindowResizing])

    return (
        <div className="window" style={{
            "height": height ? `${height}px`: "500px", 
            "width": width ? `${width}px` : "500px", 
            "position": "relative", 
            "top": "10px",
            "left": "10px"}} ref={windowRef}>
            <div className='title-bar' ref={titleBarRef}>
                <div className='title-bar-text' style={{"margin": "0.25rem"}}>{text}</div>
                <div className="title-bar-controls">
                    <button aria-label="Close" />
                </div>
            </div>
            {children}
        </div>
    );
}
