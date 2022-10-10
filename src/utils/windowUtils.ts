import React from "react";
import interact from "interactjs"
import {InteractEvent} from "@interactjs/core/InteractEvent"


export const dragRefWith = (
    draggedRef: React.RefObject<HTMLElement>, 
    draggedWith: React.RefObject<HTMLElement>,
): void => {
    if (!draggedRef.current || !draggedWith.current) {
      return;
    } 
    console.log("reffed")
    interact(draggedWith.current).draggable({
      maxPerElement: 10,
        listeners: {
          start(event) {

          },
          move(event: InteractEvent) {
            if (draggedRef.current) {
              const leftInt = parseInt(draggedRef.current.style.left.slice(0, -2))
              const topInt = parseInt(draggedRef.current.style.top.slice(0, -2))
              draggedRef.current.style.left = leftInt + event.dx + 'px';
              draggedRef.current.style.top = topInt + event.dy + 'px';
            }
          },
          
        }, 
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: {top: 0, left: 0, right: 1000, bottom: 900}
            })
        ]
    })
}


export const resizeRefWith = (
  resizedRef: React.RefObject<HTMLElement>, 
  resizeWith: React.RefObject<HTMLElement>,
  restrictX: number, 
  restrictY: number, 
  restrictWidth: number,
  restrictHeight: number, 
  startCallback?: React.Dispatch<React.SetStateAction<boolean>>,
  endCallback?: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  if (!resizedRef.current || !resizeWith.current) {
      return;
  }
  interact(resizeWith.current).resizable({
      edges: {bottom: true, right: true},
      listeners: {
        start(event: InteractEvent) {
          if (startCallback) {
            startCallback(true);
          }
        },
        move(event: InteractEvent) {
          if (resizedRef.current) {
            let {width, height} = event.rect;
            resizedRef.current.style.width = `${width}px`
            resizedRef.current.style.height = `${height}px`
          }
        },
        end(event: InteractEvent) {
          if (endCallback) {
            endCallback(false);
          }
        }
      }, 
      modifiers: [
          interact.modifiers.restrictSize({
              //Min bounds of resizable object
              min: {width: restrictX, height: restrictY},
              //Max bounds of resizable object
              max: {width: restrictWidth, height: restrictHeight}
          })
      ]
  })
}


export const disableResizeRefWith = (
  resizedRef: React.RefObject<HTMLElement>, 
) => {
  if (!resizedRef.current) {
    return;
  }
  interact(resizedRef.current).resizable(false);
}

export const disableDragRefWith = (
  resizedRef: React.RefObject<HTMLElement>
) => {
  if (!resizedRef.current) {
    return;
  }
  interact(resizedRef.current).draggable(false);
}
 