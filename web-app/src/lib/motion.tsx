"use client";

import * as React from "react";

type WhileTapProps = {
  scale?: number;
};

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  whileTap?: WhileTapProps;
};

function withWhileTap<Tag extends keyof HTMLElementTagNameMap>(Tag: Tag) {
  return function MotionEl(props: MotionProps) {
    const { whileTap, style, onMouseDown, onMouseUp, ...rest } = props;
    const [pressed, setPressed] = React.useState(false);
    const scale = typeof whileTap?.scale === "number" ? whileTap.scale : 1;
    const handleDown: React.MouseEventHandler<HTMLElementTagNameMap[Tag]> = (e) => {
      setPressed(true);
      onMouseDown?.(e as React.MouseEvent<HTMLElement>);
    };
    const handleUp: React.MouseEventHandler<HTMLElementTagNameMap[Tag]> = (e) => {
      setPressed(false);
      onMouseUp?.(e as React.MouseEvent<HTMLElement>);
    };
    return React.createElement(
      Tag,
      {
        ...rest,
        onMouseDown: handleDown,
        onMouseUp: handleUp,
        style: {
          ...(style || {}),
          transform: pressed ? `scale(${scale})` : undefined,
          transition: "transform 120ms ease",
        },
      } as React.HTMLAttributes<HTMLElementTagNameMap[Tag]>
    );
  };
}

export const motion = {
  div: withWhileTap("div"),
  button: withWhileTap("button"),
};

export default motion;
