import React, { useState, useRef } from 'react';

function SupportButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.target.setPointerCapture(e.pointerId); 
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    hasMoved.current = true;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <a
      href="/dashboard/support"
      onClick={(e) => { 
        if (hasMoved.current) e.preventDefault(); 
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} 
      className="btn-primary btn-hover"
      style={{ 
        position: "fixed", 
        bottom: "24px", 
        right: "24px", 
        transform: `translate(${pos.x}px, ${pos.y}px)`, 
        borderRadius: "50px", 
        padding: "14px 20px", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        zIndex: 9999, 
        boxShadow: isDragging ? "0 15px 35px -5px rgba(0,0,0,0.4)" : "0 10px 25px -5px rgba(0,0,0,0.3)", 
        textDecoration: "none", 
        touchAction: "none", 
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        color: "#FFFFFF",
        backgroundColor: "#000000",
        fontFamily: "inherit"
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg> 
      <span className="support-text-mobile" style={{ fontWeight: "700" }}>Support</span>
    </a>
  );
}

export default SupportButton;
