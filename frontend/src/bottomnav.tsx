// BottomNav.tsx
import React from "react";
import { Link } from "react-router-dom";

interface BottomNavProps {
  backTo: string;
  backLabel: string;
  forwardTo?: string;
  forwardLabel?: string;
  backInstruction?: string;
  forwardInstruction?: string;
}

function BottomNav({
  backTo,
  backLabel,
  forwardTo,
  forwardLabel,
  backInstruction,
  forwardInstruction,
}: BottomNavProps) {
  return (
    <section className="py-4" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="container d-flex justify-content-between align-items-center flex-wrap px-0 px-md-4">
        <div className="text-start mb-3 mb-md-0">
          {backInstruction && (
            <small className="text-muted d-block mb-1 px-0">{backInstruction}</small>
          )}
          <Link
            to={backTo}
            className="btn"
            style={{
              backgroundColor: "#ffffff",
              color: "#0d6efd",
              border: "2px solid #0d6efd",
              padding: "6px 18px",
              fontWeight: 600,
            }}
          >
            {backLabel}
          </Link>
        </div>

        {forwardTo && forwardLabel && (
          <div className="text-end">
            {forwardInstruction && (
              <small className="text-muted d-block mb-1 px-0">{forwardInstruction}</small>
            )}
            <Link
              to={forwardTo}
              className="btn"
              style={{
                backgroundColor: "#ffffff",
                color: "#0d6efd",
                border: "2px solid #0d6efd",
                padding: "6px 18px",
                fontWeight: 600,
              }}
            >
              {forwardLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default BottomNav;