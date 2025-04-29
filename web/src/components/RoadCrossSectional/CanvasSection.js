import React, {useState } from 'react';
import Canvas from './Canvas';



const Section = ({contents, name}) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({width: 1000, height: 300})
    const handleMouseMove = (event) => {
      const rect = event.target.getBoundingClientRect();
      setMousePos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      console.log(`(${event.clientX}, ${event.clientY}) => ${event.clientX - rect.left}, ${event.clientY - rect.top}`)
    };
    const draw = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "20px serif";
        ctx.fillText(name, 0, 20);
        ctx.font = "12px serif";
        ctx.fillText(`(${mousePos.x}, ${mousePos.y})`, 0, size.height);
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2);
        ctx.fill();
        contents?.forEach(element => {
            element.draw(ctx)
        });
    };
    return <Canvas draw={draw}
        width={size.width}
        height={size.height}
        onMouseMove={handleMouseMove}
        style={{ border: '1px solid black' }}/>
}


export default Section