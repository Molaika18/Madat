"use client";

import { useState } from "react";
import { submitReport } from "../../lib/api";
import {
  Apple,
  Tent,
  Stethoscope,
  Droplets,
  BrushCleaning,
  Truck,
} from "lucide-react";

const requestOptions = [
  { id: "food", label: "Food", icon: Apple },
  { id: "shelter", label: "Shelter", icon: Tent },
  { id: "medical", label: "Medical Help", icon: Stethoscope },
  { id: "water", label: "Clean Water", icon: Droplets },
  { id: "sanitation", label: "Sanitation", icon: BrushCleaning },
  { id: "rescue", label: "Rescue", icon: Truck },
];

export default function RequestForm() {
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selected.length === 0) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      for (const need of selected) {
        await submitReport({
          need_type: need,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          people_count: 1,
        });
      }

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSelected([]);
      }, 3000);
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Request Help</h1>

      {requestOptions.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            style={{ margin: 5 }}
          >
            <Icon size={20} /> {opt.label}
          </button>
        );
      })}

      <br />
      <br />

      <button onClick={handleSend}>
        {sent ? "✓ Sent" : "Send SOS"}
      </button>
    </div>
  );
}