import { RoomConfig } from "../gameConfig";

export function drawShip(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: {
    WALKABLE_REGIONS: any[];
    SPACESHIP_ROOMS: Record<string, RoomConfig>;
    completedTasks: Record<string, boolean>;
    doors: any[];
    doorProgress: Record<string, number>;
    FLOATING_VENTS: any[];
    nearestRoom: RoomConfig | null;
    playerPos: { x: number; y: number };
    targetPos: { x: number; y: number } | null;
  }
) {
  const { WALKABLE_REGIONS, SPACESHIP_ROOMS, completedTasks, doors, doorProgress, FLOATING_VENTS, nearestRoom, playerPos, targetPos } = state;


    // 1. Clear canvas and draw cartoon cosmic starfield
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic tiny stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 45; i++) {
      const starX = (i * 269 + 53) % canvas.width;
      const starY = (i * 181 + 79) % canvas.height;
      const radius = ((i % 4) === 0) ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(starX, starY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw outer thick cartoon black silhouette boundary to frame the ship layout
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    
    WALKABLE_REGIONS.forEach((reg) => {
      ctx.beginPath();
      ctx.rect(reg.x - 6, reg.y - 6, reg.w + 12, reg.h + 12);
      ctx.fill();
      ctx.stroke();
    });

    // 2.5 Draw inner slate-grey cartoon trim border
    ctx.strokeStyle = '#3e414c';
    ctx.lineWidth = 4;
    WALKABLE_REGIONS.forEach((reg) => {
      ctx.strokeRect(reg.x - 2, reg.y - 2, reg.w + 4, reg.h + 4);
    });

    // 3. Draw corridors/connecting hallways with authentic industrial metal panels
    WALKABLE_REGIONS.forEach((reg) => {
      if (!reg.name) {
        // High fidelity steel-grey hallway flooring
        ctx.fillStyle = '#7a8e9e'; 
        ctx.fillRect(reg.x, reg.y, reg.w, reg.h);

        // Cartoon metal plate dividers
        ctx.strokeStyle = '#5a6d7c';
        ctx.lineWidth = 2;
        for (let lx = reg.x + 20; lx < reg.x + reg.w; lx += 24) {
          ctx.beginPath(); ctx.moveTo(lx, reg.y); ctx.lineTo(lx, reg.y + reg.h); ctx.stroke();
        }
        for (let ly = reg.y + 20; ly < reg.y + reg.h; ly += 24) {
          ctx.beginPath(); ctx.moveTo(reg.x, ly); ctx.lineTo(reg.x + reg.w, ly); ctx.stroke();
        }

        // Classic yellow safety edge markings
        ctx.fillStyle = '#ebaf17';
        if (reg.w > reg.h) {
          ctx.fillRect(reg.x, reg.y, reg.w, 3);
          ctx.fillRect(reg.x, reg.y + reg.h - 3, reg.w, 3);
        } else {
          ctx.fillRect(reg.x, reg.y, 3, reg.h);
          ctx.fillRect(reg.x + reg.w - 3, reg.y, 3, reg.h);
        }
      }
    });

    // Stenciled directions on the hall floors (Reactor, Security)
    ctx.fillStyle = '#546675';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REACTOR', 150, 335);
    ctx.fillText('SECURITY', 150, 345);
    ctx.fillText('CORRIDOR', 450, 350);

    // 4. Draw rooms with highly authentic Skeld thematic flat-shaded styles
    Object.values(SPACESHIP_ROOMS).forEach((room) => {
      const { minX, maxX, minY, maxY } = room.bounds;
      const width = maxX - minX;
      const height = maxY - minY;

      ctx.save();
      
      // Choose real Skeld background styled floors
      if (room.id === 'cafeteria') {
        // Cream & teal diamond checkered tiles
        ctx.fillStyle = '#e5decd';
        ctx.fillRect(minX, minY, width, height);

        ctx.fillStyle = '#b6c8cc';
        const tSize = 18;
        for (let x = minX; x < maxX; x += tSize * 2) {
          for (let y = minY; y < maxY; y += tSize * 2) {
            ctx.fillRect(x, y, tSize, tSize);
            ctx.fillRect(x + tSize, y + tSize, tSize, tSize);
          }
        }
      } else if (room.id === 'medbay') {
        // Sterile light-teal floor tiles
        ctx.fillStyle = '#9bdcd1';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#e0f7f3';
        ctx.lineWidth = 1.5;
        for (let x = minX + 24; x < maxX; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
        for (let y = minY + 24; y < maxY; y += 24) {
          ctx.beginPath(); ctx.moveTo(minX, y); ctx.lineTo(maxX, y); ctx.stroke();
        }
      } else if (room.id === 'reactor') {
        // Deep purple atomic engine tiles
        ctx.fillStyle = '#31283c';
        ctx.fillRect(minX, minY, width, height);

        ctx.strokeStyle = '#1d1726';
        ctx.lineWidth = 2;
        for (let x = minX + 25; x < maxX; x += 25) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
        // Cyber orange electrical conduit pipelines trailing down
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(minX, minY + height - 10, width, 5);
      } else if (room.id === 'admin') {
        // Corporate forest teal/navy panels
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1.5;
        for (let x = minX + 35; x < maxX; x += 35) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
      } else if (room.id === 'weapons') {
        // Gunmetal slate with diagonal gridlines
        ctx.fillStyle = '#3a3d45';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#2c2e36';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = minX; x < maxX; x += 40) {
          ctx.moveTo(x, minY); ctx.lineTo(x + width, maxY);
        }
        ctx.stroke();
      } else if (room.id === 'security') {
        // Sage camera monitors green
        ctx.fillStyle = '#5c7d6c';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#435e51';
        ctx.strokeRect(minX + 5, minY + 5, width - 10, height - 10);
      } else if (room.id === 'storage') {
        // Dusty cargo brown plates
        ctx.fillStyle = '#5c4d3f';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#3e342b';
        ctx.lineWidth = 2;
        for (let y = minY + 30; y < maxY; y += 30) {
          ctx.beginPath(); ctx.moveTo(minX, y); ctx.lineTo(maxX, y); ctx.stroke();
        }
      } else if (room.id === 'electrical') {
        // Distressed amber iron plating
        ctx.fillStyle = '#4c4a41';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#2d2c27';
        ctx.lineWidth = 1.5;
        for (let x = minX + 20; x < maxX; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
      } else if (room.id === 'comms') {
        // Space communications cobalt panels
        ctx.fillStyle = '#293542';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1.5;
        for (let y = minY + 20; y < maxY; y += 20) {
          ctx.beginPath(); ctx.moveTo(minX, y); ctx.lineTo(maxX, y); ctx.stroke();
        }
      } else if (room.id === 'navigation') {
        // High cockpit deep indigo
        ctx.fillStyle = '#1c2833';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#17202a';
        ctx.lineWidth = 1;
        ctx.strokeRect(minX + 6, minY + 6, width - 12, height - 12);
      } else if (room.id === 'shields') {
        // Metallic mesh cobalt floor
        ctx.fillStyle = '#3a4959';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.fillStyle = '#455566';
        ctx.fillRect(minX + 10, minY + 10, width - 20, height - 20);
      } else if (room.id === 'o2') {
        // Soft white cream tiling
        ctx.fillStyle = '#dee5e5';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1;
        for (let x = minX + 20; x < maxX; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
      } else {
        // Standard metal plating
        ctx.fillStyle = '#505a69';
        ctx.fillRect(minX, minY, width, height);
      }

      // Draw thick black outline contour directly on individual room walls to simulate actual hand-drawn asset limits
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(minX, minY, width, height);

      // Flash green frame when tasks in room are cleared completely (beautiful visual cue)
      const isCompleted = completedTasks[room.id] !== undefined ? completedTasks[room.id] : true;
      if (isCompleted) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(minX + 2, minY + 2, width - 4, height - 4);
      }

      // Large faded Room backdrop name label (cartoony block styled)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.font = '900 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(room.name.toUpperCase(), minX + width / 2, minY + height / 2 + 4);

      // --- Room Furniture Props (High visual fidelity flat cartoon design) ---
      if (room.id === 'cafeteria') {
        // 1. Primary Emergency Meeting round platform
        const epX = 450;
        const epY = 150;

        // Base grey trim
        ctx.fillStyle = '#4c5e5c';
        ctx.beginPath(); ctx.arc(epX, epY, 34, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Safety yellow outer border
        ctx.fillStyle = '#ebaf17';
        ctx.beginPath(); ctx.arc(epX, epY, 26, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();

        // Center glass dome
        ctx.fillStyle = 'rgba(92, 242, 242, 0.55)';
        ctx.beginPath(); ctx.arc(epX, epY, 15, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();

        // Red emergency button
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(epX - 6, epY - 6, 12, 12);
        ctx.strokeRect(epX - 6, epY - 6, 12, 12);

        // Stools around meeting table
        const stoolsList = [
          { x: 412, y: 150 }, { x: 488, y: 150 }, 
          { x: 450, y: 112 }, { x: 450, y: 188 },
          { x: 425, y: 125 }, { x: 475, y: 125 },
          { x: 425, y: 175 }, { x: 475, y: 175 }
        ];
        ctx.fillStyle = '#2c3e50';
        stoolsList.forEach(st => {
          ctx.beginPath(); ctx.arc(st.x, st.y, 6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeRect(st.x - 6, st.y - 6, 12, 12); // Square base
        });

        // 2. Extra Dining Counters (Long horizontal tables)
        const tablesList = [{ x: 350, y: 100 }, { x: 550, y: 100 }, { x: 350, y: 200 }, { x: 550, y: 200 }];
        tablesList.forEach(tb => {
          const tWidth = 60;
          const tHeight = 24;
          // Table rim
          ctx.fillStyle = '#415b70';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(tb.x - tWidth/2, tb.y - tHeight/2, tWidth, tHeight, 10) : ctx.rect(tb.x - tWidth/2, tb.y - tHeight/2, tWidth, tHeight);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Table top surface
          ctx.fillStyle = '#5dade2';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(tb.x - tWidth/2 + 2, tb.y - tHeight/2 + 2, tWidth - 4, tHeight - 4, 8) : ctx.rect(tb.x - tWidth/2 + 2, tb.y - tHeight/2 + 2, tWidth - 4, tHeight - 4);
          ctx.fill();

          // Draw tiny yellow pizza slice triangle on dining table!
          ctx.fillStyle = '#faeb70';
          ctx.beginPath();
          ctx.moveTo(tb.x - 10, tb.y - 3);
          ctx.lineTo(tb.x - 1, tb.y - 5);
          ctx.lineTo(tb.x - 6, tb.y + 6);
          ctx.closePath();
          ctx.fill();
          // Pizza crust and pepperonis
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(tb.x - 6, tb.y - 2, 2, 2);
          
          // Drink cup
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(tb.x + 10, tb.y, 4, 0, Math.PI * 2); ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#3498db';
          ctx.beginPath(); ctx.arc(tb.x + 10, tb.y, 2, 0, Math.PI * 2); ctx.fill();
          
          // Draw small stools around this long table
          ctx.fillStyle = '#2c3e50';
          [-20, 0, 20].forEach(ox => {
            // Top stools
            ctx.beginPath(); ctx.arc(tb.x + ox, tb.y - tHeight/2 - 8, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeRect(tb.x + ox - 5, tb.y - tHeight/2 - 13, 10, 10);
            // Bottom stools
            ctx.beginPath(); ctx.arc(tb.x + ox, tb.y + tHeight/2 + 8, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeRect(tb.x + ox - 5, tb.y + tHeight/2 + 3, 10, 10);
          });
        });
      } else if (room.id === 'medbay') {
        // Biometric Scanning Pad with nice rotating scanner beam!
        const padX = 240;
        const padY = 180;
        const scanPulse = Math.abs(Math.sin(Date.now() / 250));

        // Scanning Ring
        ctx.fillStyle = 'rgba(56, 211, 159, 0.15)';
        ctx.beginPath(); ctx.ellipse(padX, padY, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38d39f';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(padX, padY, 18, 12, 0, 0, Math.PI * 2); ctx.stroke();

        // Biometric beam sweeps
        ctx.strokeStyle = `rgba(56, 211, 159, ${0.4 + scanPulse * 0.5})`;
        ctx.lineWidth = 1.5;
        const sweepAngle = (Date.now() / 400) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(padX, padY);
        ctx.lineTo(padX + Math.cos(sweepAngle) * 18, padY + Math.sin(sweepAngle) * 12);
        ctx.stroke();

        // Medbay Beds
        const bedsList = [{ x: 180, y: 105 }, { x: 232, y: 105 }];
        bedsList.forEach(bd => {
          ctx.fillStyle = '#eaeaea';
          ctx.fillRect(bd.x, bd.y, 22, 40);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(bd.x, bd.y, 22, 40);

          // Pillow
          ctx.fillStyle = '#a9c4cc';
          ctx.fillRect(bd.x + 2, bd.y + 2, 18, 9);
          ctx.strokeRect(bd.x + 2, bd.y + 2, 18, 9);

          // Blue bed sheet
          ctx.fillStyle = '#4fa8e2';
          ctx.fillRect(bd.x + 1, bd.y + 14, 20, 25);
          ctx.strokeRect(bd.x + 1, bd.y + 14, 20, 25);
        });
      } else if (room.id === 'reactor') {
        // Pulsing atomic fission core pillar
        const coreX = 90;
        const coreY = 360;
        const pLevel = Math.abs(Math.sin(Date.now() / 280));

        // Core containment base
        ctx.fillStyle = '#1c1c24';
        ctx.fillRect(coreX - 25, coreY - 25, 50, 50);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(coreX - 25, coreY - 25, 50, 50);

        // Pulsing glowing center beam of plasma!
        ctx.fillStyle = `rgba(41, 128, 185, ${0.2 + pLevel * 0.4})`;
        ctx.fillRect(coreX - 20, coreY - 20, 40, 40);

        ctx.fillStyle = '#3498db';
        ctx.fillRect(coreX - 4, coreY - 20, 8, 40);

        // Core glass housing reflections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(coreX - 18, coreY - 18);
        ctx.lineTo(coreX - 12, coreY + 18);
        ctx.stroke();
      } else if (room.id === 'security') {
        // Monitoring Desk
        ctx.fillStyle = '#2c2e36';
        ctx.fillRect(200, 310, 50, 24);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(200, 310, 50, 24);

        // Monitors display with glowing grid sweep
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(204, 314, 18, 16);
        ctx.fillRect(228, 314, 18, 16);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(204, 314, 18, 16);
        ctx.strokeRect(228, 314, 18, 16);

        // Live oscilloscope scan lines
        ctx.strokeStyle = '#2ecc71';
        ctx.beginPath();
        for (let ix = 0; ix < 18; ix++) {
          const cy = 322 + Math.cos(ix * 0.6 + Date.now() / 120) * 3;
          if (ix === 0) ctx.moveTo(204 + ix, cy);
          else ctx.lineTo(204 + ix, cy);
        }
        ctx.stroke();
      } else if (room.id === 'admin') {
        // Grand Central Admin Map Table
        ctx.fillStyle = '#4c5e5c';
        ctx.beginPath(); ctx.ellipse(585, 405, 50, 35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = '#2980b9'; // Glowing map screen on table
        ctx.beginPath(); ctx.ellipse(585, 405, 42, 28, 0, 0, Math.PI * 2); ctx.fill();

        // Holographic grid on admin table
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = -30; i <= 30; i+= 15) {
           ctx.beginPath(); ctx.moveTo(585 + i, 380); ctx.lineTo(585 + i, 430); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(545, 405 + i/1.5); ctx.lineTo(625, 405 + i/1.5); ctx.stroke();
        }

        // Little blinking marker on map
        ctx.fillStyle = '#f1c40f';
        const b = Math.sin(Date.now() / 200) > 0;
        if(b) ctx.fillRect(595, 400, 5, 5);

      } else if (room.id === 'storage') {
        // Main Storage Table/Crate Block in Center
        ctx.fillStyle = '#5c4d3f';
        ctx.fillRect(room.cx - 25, room.cy - 20, 50, 40);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(room.cx - 25, room.cy - 20, 50, 40);

        // Warning wire tape across boxes
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(room.cx - 25, room.cy - 20); ctx.lineTo(room.cx + 25, room.cy + 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(room.cx - 25, room.cy); ctx.lineTo(room.cx + 10, room.cy + 20); ctx.stroke();
        
        // Mini Map/Checklist document on storage crate
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(room.cx + 5, room.cy - 10, 14, 18);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(room.cx + 7, room.cy - 8, 10, 3);
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(room.cx + 7, room.cy - 3, 10, 2);
        ctx.fillRect(room.cx + 7, room.cy + 1, 10, 2);

        // Round green cargo barrels stacked on the side
        const barrelsList = [{ x: room.bounds.maxX - 15, y: room.bounds.maxY - 15 }, { x: room.bounds.maxX - 15, y: room.bounds.maxY - 35 }, { x: room.bounds.maxX - 30, y: room.bounds.maxY - 25 }];
        barrelsList.forEach(br => {
          ctx.fillStyle = '#27ae60';
          ctx.beginPath(); ctx.ellipse(br.x, br.y, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(br.x, br.y, 8, 10, 0, 0, Math.PI * 2); ctx.stroke();
        });
      } else if (room.id === 'electrical') {
        const topY = room.bounds.minY;
        
        // Electrical box attached to top wall
        ctx.fillStyle = '#4c4a41'; 
        ctx.fillRect(room.cx - 15, topY, 30, 15);
        
        ctx.fillStyle = '#f1c40f'; // Yellow top box
        ctx.fillRect(room.cx - 12, topY + 2, 24, 12);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(room.cx - 12, topY + 2, 24, 12);
        
        // Wire down to the console
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(room.cx, topY + 14);
        ctx.lineTo(room.cx, room.cy - 15);
        ctx.stroke();

        // The console under the button (like the screenshot)
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(room.cx - 20, room.cy - 20, 40, 40);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.cx - 20, room.cy - 20, 40, 40);

      } else if (room.id === 'navigation') {
        // Navigation console square underneath the orb
        ctx.fillStyle = '#1a1d24';
        ctx.fillRect(room.cx - 25, room.cy - 20, 50, 40);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.cx - 25, room.cy - 20, 50, 40);
        
        // A little screen element in the console
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(room.cx - 15, room.cy - 12, 30, 24);

      } else if (room.id === 'comms') {
        // Servers stack bays containing twinkling LEDs on top wall
        const minX = room.bounds.minX;
        const topY = room.bounds.minY;
        
        for (let ix = 0; ix < 2; ix++) {
          const sx = minX + 25 + ix * 22;
          ctx.fillStyle = '#34495e';
          ctx.fillRect(sx, topY, 16, 35);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(sx, topY, 16, 35);

          // twinkle multi-lights
          const sT = Math.sin(Date.now() / 200 + ix);
          ctx.fillStyle = sT > 0.4 ? '#2ecc71' : (sT > -0.4 ? '#f1c40f' : '#e74c3c');
          ctx.fillRect(sx + 3, topY + 5, 10, 6);
          ctx.fillStyle = sT < 0.2 ? '#2ecc71' : '#e74c3c';
          ctx.fillRect(sx + 3, topY + 15, 10, 6);
          ctx.fillStyle = '#3498db';
          ctx.fillRect(sx + 3, topY + 25, 10, 6);
        }

        // Space dish base near console
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(room.cx - 22, room.cy - 22, 44, 44);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(room.cx - 22, room.cy - 22, 44, 44);
        
      } else if (room.id === 'shields') {
        // Shield console block under button
        ctx.fillStyle = '#111';
        ctx.fillRect(room.cx - 20, room.cy - 20, 40, 40);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.cx - 20, room.cy - 20, 40, 40);

        // A small cyan strip on the block
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(room.cx - 10, room.cy - 12, 20, 6);

      } else if (room.id === 'weapons') {
        
        // Artillery Seating / Desk Console near center
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(room.cx - 24, room.cy - 15, 48, 30);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(room.cx - 24, room.cy - 15, 48, 30);

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(room.cx, room.cy, 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(room.cx, room.cy, 10, 0, Math.PI * 2); ctx.stroke();
        
        // Gunner Operator Chair
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath(); ctx.ellipse(room.cx - 35, room.cy, 12, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
      } else if (room.id === 'o2') {
        // Biological leaf plant cylinders
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(660, 270, 35, 30);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(660, 270, 35, 30);

        // Translucent bio sphere with tiny leaf icons inside
        ctx.fillStyle = 'rgba(46, 204, 113, 0.35)';
        ctx.fillRect(663, 273, 29, 24);
        // Draw green flower leaves
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath(); ctx.arc(672, 285, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(682, 282, 5, 0, Math.PI * 2); ctx.fill();
      }

      // 5. Drawing active clickable console coordinate indicators (yellow glossy spheres)
      const isCompletedRoom = completedTasks[room.id] !== undefined ? completedTasks[room.id] : true;
      const isNear = nearestRoom?.id === room.id;
      
      ctx.beginPath();
      ctx.arc(room.cx, room.cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = isNear ? '#f1c40f' : (isCompletedRoom ? '#2ecc71' : '#e67e22');
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Mirror reflection glass overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath(); ctx.arc(room.cx - 3, room.cy - 3, 3, 0, Math.PI * 2); ctx.fill();

      // Bouncing WARNING Exclamation badge above console
      if (completedTasks[room.id] === false) {
        const bounceAmount = Math.sin(Date.now() / 150) * 4;
        ctx.fillStyle = '#ebaf17';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeText('TASK', room.cx, room.cy - 30 + bounceAmount);
        ctx.fillText('TASK', room.cx, room.cy - 30 + bounceAmount);
      }

      ctx.restore();
    });

    // 5.5 Draw high fidelity mechanical sliding gates!
    doors.forEach((door) => {
      ctx.save();
      ctx.translate(door.x, door.y);

      const isVert = !door.horizontal;

      // Outer track frame in black
      ctx.fillStyle = '#111218';
      ctx.fillRect(-door.w / 2, -door.h / 2, door.w, door.h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(-door.w / 2, -door.h / 2, door.w, door.h);

      // Slide amount progress (0 to 1) helper
      const openPct = doorProgress[door.id] || 0;
      ctx.fillStyle = '#566573'; // steel door plate
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      if (isVert) {
        const hHeight = door.h / 2;
        const slideShift = hHeight * openPct;
        
        // draw top sliding slab panel
        ctx.fillRect(-door.w / 2 + 1, -hHeight, door.w - 2, hHeight - slideShift);
        ctx.strokeRect(-door.w / 2 + 1, -hHeight, door.w - 2, hHeight - slideShift);

        // draw bottom sliding slab panel
        ctx.fillRect(-door.w / 2 + 1, slideShift, door.w - 2, hHeight - slideShift);
        ctx.strokeRect(-door.w / 2 + 1, slideShift, door.w - 2, hHeight - slideShift);
      } else {
        const hWidth = door.w / 2;
        const slideShift = hWidth * openPct;

        // draw left sliding slab panel
        ctx.fillRect(-hWidth, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);
        ctx.strokeRect(-hWidth, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);

        // draw right sliding slab panel
        ctx.fillRect(slideShift, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);
        ctx.strokeRect(slideShift, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);
      }

      // Central indicator LED (Red when shut, green when open)
      ctx.fillStyle = door.isOpen ? '#2ecc71' : '#e74c3c';
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    });

    // 6. Draw floor Vents grates outline (heavy iron styled with red rivets)
    FLOATING_VENTS.forEach((vent) => {
      // Carbon vent base
      ctx.fillStyle = '#151515';
      ctx.fillRect(vent.x - 14, vent.y - 10, 28, 20);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(vent.x - 14, vent.y - 10, 28, 20);
      
      // Slats inside
      ctx.fillStyle = '#2d3e50';
      ctx.fillRect(vent.x - 10, vent.y - 6, 4, 12);
      ctx.fillRect(vent.x - 2, vent.y - 6, 4, 12);
      ctx.fillRect(vent.x + 6, vent.y - 6, 4, 12);

      // Red active vent outline indicators
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1;
      ctx.strokeRect(vent.x - 11, vent.y - 7, 22, 14);
    });

    // 6.5 Draw real-time dramatic Sight Spotlight Darkness Mask following player
    ctx.save();
    const px = playerPos.x;
    const py = playerPos.y;
    
    // Smooth translucent gradient to solid deep space dark shadow
    const innerRadius = 130;
    const outerRadius = 250;
    const shadowGrad = ctx.createRadialGradient(px, py, innerRadius, px, py, outerRadius);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
    shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.72)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
    
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 7. Draw guidance yellow autopilot arrow if target position is set
    if (targetPos) {
      ctx.strokeStyle = '#ebaf17';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.moveTo(playerPos.x, playerPos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

}
