import React, { useRef, useEffect } from 'react';

const Canvas = ({ draw, ...rest }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
  }, [canvasRef])
    
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      draw(context);
      //animationFrameId = requestAnimationFrame(render);
    };
    render();

    //return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;