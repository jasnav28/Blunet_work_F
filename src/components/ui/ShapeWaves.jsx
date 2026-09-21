import React, { useEffect, useRef } from 'react';
import './ShapeWaves.css';

const parseHexColor = (hex, fallback = '#929292') => {
  if (!hex || typeof hex !== 'string') hex = fallback;
  hex = hex.trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) hex = '929292';
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
};

export default function ShapeWaves({
  text = 'BLUNET',
  fontFamily = 'Inter, "Geist Sans", system-ui, sans-serif',
  fontWeight = 900,
  textSize = 0.5,
  shapes = 'mixed',
  cellSize = 9,
  dotSize = 0.8,
  color = '#929292',
  hoverColor = '#ffffff',
  backgroundColor = '#0c0d12',
  speed = 1,
  scale = 1,
  contrast = 1.2,
  brightness = 0.45,
  flow = 0,
  direction = 0,
  fade = 0.25,
  interactive = true,
  splashRadius = 45,
  splashStrength = 0.4,
  glow = 0.35,
  intro = true,
  introDuration = 1.6,
  introKey = 0,
  paused = false,
  onError,
  className = ''
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const propsRef = useRef({});
  propsRef.current = {
    text,
    fontFamily,
    fontWeight,
    textSize,
    shapes,
    cellSize: Math.max(4, cellSize),
    dotSize,
    color,
    hoverColor,
    backgroundColor,
    speed,
    scale,
    contrast,
    brightness,
    flow,
    direction,
    fade,
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration,
    paused
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let time = 0;
    let disposed = false;

    // Mouse tracking for cursor splash ripples
    const mouse = { x: -1000, y: -1000, inside: false };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.inside = true;
    };

    const handleMouseLeave = () => {
      mouse.inside = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Offscreen mask canvas for text cutout
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');

    const updateMask = (w, h, p) => {
      if (!p.text || !p.text.trim()) return null;
      const maskW = Math.max(1, Math.floor(w));
      const maskH = Math.max(1, Math.floor(h));
      maskCanvas.width = maskW;
      maskCanvas.height = maskH;
      if (!maskCtx) return null;

      maskCtx.fillStyle = '#000000';
      maskCtx.fillRect(0, 0, maskW, maskH);

      let fontPx = Math.max(16, Math.floor(maskH * p.textSize));
      const fontFam = p.fontFamily || 'system-ui, sans-serif';
      maskCtx.font = `${p.fontWeight} ${fontPx}px ${fontFam}`;

      let measured = maskCtx.measureText(p.text).width;
      const maxW = maskW * 0.85;
      if (measured > maxW && measured > 0) {
        fontPx = Math.max(12, Math.floor((fontPx * maxW) / measured));
        maskCtx.font = `${p.fontWeight} ${fontPx}px ${fontFam}`;
      }

      maskCtx.textAlign = 'center';
      maskCtx.textBaseline = 'middle';
      maskCtx.fillStyle = '#ffffff';
      maskCtx.fillText(p.text, maskW / 2, maskH / 2);

      return {
        data: maskCtx.getImageData(0, 0, maskW, maskH).data,
        w: maskW,
        h: maskH
      };
    };

    let maskInfo = null;
    let lastW = 0;
    let lastH = 0;

    const render = () => {
      if (disposed) return;
      const p = propsRef.current;

      const rect = container.getBoundingClientRect();
      const cssW = Math.max(200, Math.round(rect.width || container.offsetWidth || 600));
      const cssH = Math.max(200, Math.round(rect.height || container.offsetHeight || 600));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr || cssW !== lastW || cssH !== lastH) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        lastW = cssW;
        lastH = cssH;
        maskInfo = updateMask(cssW, cssH, p);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      if (!p.paused && p.speed > 0) {
        time += 0.025 * p.speed;
      }

      // Base background fill
      ctx.fillStyle = p.backgroundColor;
      ctx.fillRect(0, 0, cssW, cssH);

      const cellPx = p.cellSize;
      const cols = Math.floor(cssW / cellPx);
      const rows = Math.floor(cssH / cellPx);
      const originX = (cssW - cols * cellPx) / 2;
      const originY = (cssH - rows * cellPx) / 2;
      const maxRadius = cellPx * 0.5 * p.dotSize;

      const baseRGB = parseHexColor(p.color, '#929292');
      const hoverRGB = parseHexColor(p.hoverColor, '#ffffff');

      const centerX = cssW / 2;
      const centerY = cssH / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = originX + (c + 0.5) * cellPx;
          const cy = originY + (r + 0.5) * cellPx;

          // Check text mask: if inside text glyph, carve out cell
          if (maskInfo) {
            const mx = Math.floor(cx);
            const my = Math.floor(cy);
            if (mx >= 0 && mx < maskInfo.w && my >= 0 && my < maskInfo.h) {
              const idx = (my * maskInfo.w + mx) * 4;
              if (maskInfo.data[idx] > 100) {
                continue; // Cell under text stays empty cutout!
              }
            }
          }

          // Cursor splash interaction
          let splashFactor = 0;
          if (mouse.inside && p.interactive) {
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < p.splashRadius) {
              splashFactor = Math.pow(1 - dist / p.splashRadius, 2) * p.splashStrength;
            }
          }

          // Wave morphing formulas
          const waveScale = p.scale * 0.08;
          const w1 = Math.sin(c * waveScale + time * 0.8) * Math.cos(r * waveScale + time * 0.6);
          const w2 = Math.sin((c * 0.6 + r * 0.8) * waveScale - time * 0.5);
          const w3 = Math.cos(Math.hypot(c - cols / 2, r - rows / 2) * waveScale * 0.8 - time);

          const combined = w1 * 0.45 + w2 * 0.35 + w3 * 0.2;
          // High minimum tone floor so wave troughs never get pitch dark
          let tone = Math.min(1, Math.max(0.4, (combined + 0.5 + p.brightness - 0.4) * p.contrast + splashFactor));

          // Gentle fade towards edges with high floor (0.7) so left & right edges stay bright & visible
          let fadeFactor = 1.0;
          if (p.fade > 0) {
            const normX = (cx - centerX) / (cssW / 2);
            const normY = (cy - centerY) / (cssH / 2);
            const distCenter = Math.hypot(normX, normY);
            fadeFactor = Math.max(0.7, 1 - Math.pow(distCenter, 1.6) * p.fade * 0.5);
          }

          // Determine color & alpha with bright shape luminosity floor
          const blend = Math.min(1, splashFactor * 2.5);
          const shapeLum = 0.6 + tone * 0.4;
          const cr = Math.round(baseRGB.r * shapeLum + (hoverRGB.r - baseRGB.r * shapeLum) * blend);
          const cg = Math.round(baseRGB.g * shapeLum + (hoverRGB.g - baseRGB.g * shapeLum) * blend);
          const cb = Math.round(baseRGB.b * shapeLum + (hoverRGB.b - baseRGB.b * shapeLum) * blend);
          const alpha = (0.5 + tone * 0.5) * fadeFactor;

          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;

          // Shape selection in mixed mode
          const band = Math.min(2, Math.floor(tone * 3));
          let shapeType = p.shapes;
          if (shapeType === 'mixed') {
            const pattern = (r + c + band) % 3;
            shapeType = pattern === 0 ? 'squares' : pattern === 1 ? 'circles' : 'triangles';
          }

          const sz = maxRadius * (0.5 + tone * 0.5);

          ctx.beginPath();
          if (shapeType === 'squares') {
            ctx.rect(cx - sz, cy - sz, sz * 2, sz * 2);
          } else if (shapeType === 'circles') {
            ctx.arc(cx, cy, sz, 0, Math.PI * 2);
          } else {
            ctx.moveTo(cx, cy - sz);
            ctx.lineTo(cx - sz * 0.9, cy + sz * 0.9);
            ctx.lineTo(cx + sz * 0.9, cy + sz * 0.9);
            ctx.closePath();
          }
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      disposed = true;
      if (animId) cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`shape-waves-wrapper ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: 1
        }}
      />
    </div>
  );
}
