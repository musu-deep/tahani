import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface FireworksCanvasHandle {
  launchBatch: (count?: number) => void;
}

export const FireworksCanvas = forwardRef<FireworksCanvasHandle, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const particlesRef = useRef<any[]>([]);
  const rocketsRef = useRef<any[]>([]);

  // Expose triggers to parent components via ref
  useImperativeHandle(ref, () => ({
    launchBatch(count = 5) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          createRocket(canvas.width, canvas.height);
        }, i * 250);
      }
    }
  }));

  const createRocket = (width: number, height: number) => {
    const startX = Math.random() * width * 0.8 + width * 0.1;
    const startY = height;
    const targetX = startX + (Math.random() * 200 - 100);
    const targetY = Math.random() * height * 0.5 + height * 0.1;
    const speed = Math.random() * 3 + 4;
    const angle = Math.atan2(targetY - startY, targetX - startX);

    rocketsRef.current.push({
      x: startX,
      y: startY,
      tx: targetX,
      ty: targetY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      hue: Math.random() * 360,
      size: 3,
    });
  };

  const explode = (x: number, y: number, hue: number) => {
    const count = 60;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.015,
        hue: hue + (Math.random() * 40 - 20),
        gravity: 0.06,
        size: Math.random() * 2 + 1.5,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial batch launch
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          createRocket(canvas.width, canvas.height);
        }, i * 400);
      }
    }, 1000);

    const updateAndDraw = () => {
      // Create trailing fading dark overlay for particle trails
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      // Update and draw rockets
      const rockets = rocketsRef.current;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${r.hue}, 100%, 70%)`;
        ctx.fill();

        // Check if rocket has reached its peak/target altitude
        if (r.vy >= 0 || r.y <= r.ty) {
          explode(r.x, r.y, r.hue);
          rockets.splice(i, 1);
        }
      }

      // Update and draw explosion particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.98; // Drag
        p.vy += p.gravity; // Gravity
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
});

FireworksCanvas.displayName = 'FireworksCanvas';
