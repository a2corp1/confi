import { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, content, position = 'top', delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top - 5;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + 5;
            break;
          case 'left':
            x = rect.left - 5;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 5;
            y = rect.top + rect.height / 2;
            break;
          default:
            x = rect.left + rect.width / 2;
            y = rect.top - 5;
        }
        
        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // Adjust tooltip position after it's rendered
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Adjust position to keep tooltip within viewport
      let { x, y } = coords;
      
      // Horizontal adjustment
      if (x + tooltipRect.width / 2 > window.innerWidth) {
        x = window.innerWidth - tooltipRect.width / 2 - 10;
      } else if (x - tooltipRect.width / 2 < 0) {
        x = tooltipRect.width / 2 + 10;
      }
      
      // Vertical adjustment
      if (position === 'top' && y - tooltipRect.height < 0) {
        y = tooltipRect.height + 5;
      } else if (position === 'bottom' && y + tooltipRect.height > window.innerHeight) {
        y = window.innerHeight - tooltipRect.height - 5;
      }
      
      setCoords({ x, y });
    }
  }, [isVisible, coords, position]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getTooltipStyle = () => {
    let style = {
      position: 'fixed',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
    };
    
    switch (position) {
      case 'top':
        style.left = `${coords.x}px`;
        style.top = `${coords.y - 5}px`;
        style.transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        style.left = `${coords.x}px`;
        style.top = `${coords.y + 5}px`;
        style.transform = 'translate(-50%, 0)';
        break;
      case 'left':
        style.left = `${coords.x - 5}px`;
        style.top = `${coords.y}px`;
        style.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        style.left = `${coords.x + 5}px`;
        style.top = `${coords.y}px`;
        style.transform = 'translate(0, -50%)';
        break;
      default:
        style.left = `${coords.x}px`;
        style.top = `${coords.y - 5}px`;
        style.transform = 'translate(-50%, -100%)';
    }
    
    return style;
  };

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="tooltip bg-dark-800 text-dark-200 p-2 rounded shadow-lg text-xs max-w-xs"
          style={getTooltipStyle()}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default Tooltip;
