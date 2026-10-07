"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface ParticleBackgroundProps {
  particleCount?: number;
  particleColor?: string;
  connectionColor?: string;
  repulseDistance?: number;
  speed?: number;
}

export function ParticleBackground({
  particleCount = 70,
  particleColor,
  connectionColor,
  repulseDistance = 120,
  speed = 1,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Tentukan warna berdasarkan tema jika tidak ada prop warna eksplisit
    const isDark = resolvedTheme === "dark";
    const defaultParticleColor = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(79, 70, 229, 0.4)"; // Indigo/White
    const defaultLineColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(79, 70, 229, 0.15)";
    
    const pColor = particleColor || defaultParticleColor;
    const lColor = connectionColor || defaultLineColor;

    // State kursor
    let mouse = {
      x: -1000,
      y: -1000,
      radius: repulseDistance,
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      vx: number;
      vy: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.density = (Math.random() * 30) + 1;
        // Kecepatan dan arah acak
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = pColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        // Gerakan natural
        this.x += this.vx;
        this.y += this.vy;

        // Pantulan di tepi layar
        if (this.x >= canvas!.width || this.x <= 0) this.vx = -this.vx;
        if (this.y >= canvas!.height || this.y <= 0) this.vy = -this.vy;

        // Logika tolakan kursor (Repulsion)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Jarak interaksi
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    const init = () => {
      particles = [];
      // Sesuaikan jumlah partikel dengan ukuran layar
      const count = Math.floor((canvas.width * canvas.height) / 15000) * (particleCount / 50);
      for (let i = 0; i < count; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Gambar garis antar partikel yang berdekatan
        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = lColor;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme, particleCount, particleColor, connectionColor, repulseDistance, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
