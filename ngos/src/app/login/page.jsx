'use client'
import { useState } from "react";
import { 
  Apple, 
  Tent, 
  Stethoscope, 
  Droplets, 
  BrushCleaning,
  Truck 
} from "lucide-react";

const requestOptions = [
  { id: "food",       label: "Food",        icon: Apple },
  { id: "shelter",    label: "Shelter",     icon: Tent            },
  { id: "medical",    label: "Medical Help",icon: Stethoscope     },
  { id: "water",      label: "Clean Water", icon: Droplets        },
  { id: "sanitation", label: "Sanitation",  icon: BrushCleaning       },
  { id: "rescue",     label: "Rescue",      icon: Truck           },
];

function RequestForm() {
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selected.length === 0) return;
    if (typeof window !== "undefined") {
        localStorage.setItem("requestedNeeds", JSON.stringify(selected));
    }
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); }, 3000);
  };

  return (
    <div style={{
        background: "#000",
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    }}>
    <div style={{
      background: "#000",
      borderRadius: 16,
      padding: 24,
      maxWidth: 500,
      height: "fit-content",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      border: "1px solid rgba(255,179,67,0.15)",
    }}>

      {/* Header */}
      <div>
        <div style={{ color: "#FFB343", fontSize: 18, fontWeight: 700 }}>
          Request Help
        </div>
        <div style={{ color: "rgba(255,179,67,0.4)", fontSize: 12, marginTop: 4 }}>
          Select what you need — choose multiple
        </div>
      </div>

      {/* Option Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
      }}>
        {requestOptions.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => toggle(opt.id)}
              style={{
                background: isSelected ? "rgba(255,179,67,0.1)" : "#0a0a0a",
                border: `2px solid ${isSelected ? "#FFB343" : "rgba(255,179,67,0.15)"}`,
                borderRadius: 12,
                padding: "16px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {/* Checkmark */}
              {isSelected && (
                <div style={{
                  position: "absolute", top: 6, right: 6,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#FFB343",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#000", fontWeight: 700,
                }}>✓</div>
              )}

              <Icon
                size={32}
                color={isSelected ? "#FFB343" : "rgba(255,179,67,0.3)"}
                strokeWidth={1.5}
                style={{ transition: "all 0.2s ease" }}
              />

              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: isSelected ? "#FFB343" : "rgba(255,179,67,0.35)",
                textAlign: "center",
              }}>
                {opt.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {selected.length > 0 && (
        <div style={{
          background: "rgba(255,179,67,0.05)",
          border: "1px solid rgba(255,179,67,0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}>
          {selected.map(id => {
            const opt = requestOptions.find(o => o.id === id);
            const Icon = opt.icon;
            return (
              <span key={id} style={{
                background: "rgba(255,179,67,0.12)",
                border: "1px solid rgba(255,179,67,0.3)",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                color: "#FFB343",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <Icon size={11} color="#FFB343" />
                {opt.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Nothing selected warning
      {selected.length === 0 && (
        <div style={{
          fontSize: 11,
          color: "#ff0000",
          textAlign: "center",
          opacity: 0.7,
        }}>
          ⚠ Please select at least one option
        </div>
      )} */}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={selected.length === 0}
        style={{
          background: selected.length > 0 ? "#FFB343" : "#0a0a0a",
          color: selected.length > 0 ? "#000" : "#ff000066",
          border: `1px solid ${selected.length > 0 ? "#FFB343" : "#ff000033"}`,
          borderRadius: 10,
          padding: "13px",
          fontSize: 14,
          fontWeight: 700,
          cursor: selected.length > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          letterSpacing: "0.03em",
        }}
      >
        {sent
          ? "✓ Request Sent!"
          : `Send Request${selected.length > 0 ? ` (${selected.length})` : ""}`
        }
      </button>

    </div>
    </div>
  );
}

export default RequestForm;