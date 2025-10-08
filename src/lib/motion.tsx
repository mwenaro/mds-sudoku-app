"use client";

import * as React from "react";

type MotionProps = React.HTMLAttributes<any> & {
  initial?: any;
  animate?: any;
  transition?: any;
  whileTap?: any;
};

function withWhileTap<Tag extends keyof HTMLElementTagNameMap>(Tag: Tag) {
  return function MotionEl(props: MotionProps) {
    const { whileTap, style, onMouseDown, onMouseUp, ...rest } = props as any;
    const [pressed, setPressed] = React.useState(false);
    const scale = typeof whileTap?.scale === "number" ? whileTap.scale : 1;
    const handleDown: React.MouseEventHandler = (e) => {
      setPressed(true);
      onMouseDown?.(e);
    };
    const handleUp: React.MouseEventHandler = (e) => {
      setPressed(false);
      onMouseUp?.(e);
    };
    return React.createElement(
      Tag as any,
      {
        ...(rest as any),
        onMouseDown: handleDown,
        onMouseUp: handleUp,
        style: {
          ...(style || {}),
          transform: pressed ? `scale(${scale})` : undefined,
          transition: "transform 120ms ease",
        },
      }
    );
  };
}

export const motion = {
  div: withWhileTap("div"),
  button: withWhileTap("button"),
};

export default motion;
