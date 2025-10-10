// app/tour/_aframe/register.client.js
"use client";
import "aframe";

if (!AFRAME.components["spin"]) {
  AFRAME.registerComponent("spin", {
    schema: { speed: { type: "number", default: 0.5 } },
    tick(time, dt) {
      const r = this.el.getAttribute("rotation");
      this.el.setAttribute("rotation", {
        x: r.x,
        y: r.y + (this.data.speed * dt) / 16.666,
        z: r.z,
      });
    },
  });
}

// Ensure an entity and its children render on top of the scene by
// disabling depthTest and bumping renderOrder. Helpful for HUD/UI.
if (!AFRAME.components["ui-overlay"]) {
  AFRAME.registerComponent("ui-overlay", {
    schema: { order: { type: "number", default: 9999 } },
    init() {
      this.until = (typeof performance !== "undefined" ? performance.now() : Date.now()) + 1500;
    },
    tick() {
      const now = (typeof performance !== "undefined" ? performance.now() : Date.now());
      if (now <= this.until) this.applyOverlay();
    },
    applyOverlay() {
      this.el.object3D.traverse((obj) => {
        if (!obj) return;
        obj.renderOrder = this.data.order; // bring to front
        if (obj.material) {
          const apply = (m) => {
            // Keep material transparency as defined, but ensure depthTest stays on
            // so children honor their z layering and don't hide each other.
            m.depthTest = true;
            m.needsUpdate = true;
          };
          if (Array.isArray(obj.material)) obj.material.forEach(apply);
          else apply(obj.material);
        }
      });
    },
  });
}
