import React from "react";

const GateSymbol = ({ type, colorClass }) => {
  const stroke = "currentColor";

  const gate = {
    fill: "none",
    stroke,
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <svg
      viewBox="0 0 60 50"
      className={`w-full h-full ${colorClass}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ---------------- AND ---------------- */}
      {type === "AND" && (
        <path
          {...gate}
          d="
            M12 5
            L28 5
            A20 20 0 0 1 28 45
            L12 45
            Z
          "
        />
      )}

      {/* ---------------- OR ---------------- */}
      {type === "OR" && (
        <>
          {/* Rear curve */}
          <path
            {...gate}
            d="
              M10 5
              Q21 25 10 45
            "
          />

          {/* Upper */}
          <path
            {...gate}
            d="
              M10 5
              Q36 4 50 25
            "
          />

          {/* Lower */}
          <path
            {...gate}
            d="
              M10 45
              Q36 46 50 25
            "
          />
        </>
      )}

      {/* ---------------- XOR ---------------- */}
      {type === "XOR" && (
        <>
          {/* Extra XOR curve */}
          <path
            {...gate}
            d="
              M5 5
              Q16 25 5 45
            "
          />

          {/* Rear curve */}
          <path
            {...gate}
            d="
              M11 5
              Q22 25 11 45
            "
          />

          {/* Upper */}
          <path
            {...gate}
            d="
              M11 5
              Q37 4 50 25
            "
          />

          {/* Lower */}
          <path
            {...gate}
            d="
              M11 45
              Q37 46 50 25
            "
          />
        </>
      )}

      {/* ---------------- NOT ---------------- */}
      {type === "NOT" && (
        <>
          <path
            {...gate}
            d="
              M12 6
              L43 25
              L12 44
              Z
            "
          />

          <circle
            {...gate}
            cx="49"
            cy="25"
            r="3"
          />
        </>
      )}

      {/* ---------------- NAND ---------------- */}
      {type === "NAND" && (
        <>
          <path
            {...gate}
            d="
              M12 5
              L26 5
              A20 20 0 0 1 26 45
              L12 45
              Z
            "
          />

          <circle
            {...gate}
            cx="48"
            cy="25"
            r="3"
          />
        </>
      )}

      {/* ---------------- NOR ---------------- */}
      {type === "NOR" && (
        <>
          <path
            {...gate}
            d="M10 5 Q21 25 10 45"
          />

          <path
            {...gate}
            d="M10 5 Q34 4 44 25"
          />

          <path
            {...gate}
            d="M10 45 Q34 46 44 25"
          />

          <circle
            {...gate}
            cx="49"
            cy="25"
            r="3"
          />
        </>
      )}

      {/* ---------------- XNOR ---------------- */}
      {type === "XNOR" && (
        <>
          <path
            {...gate}
            d="M5 5 Q16 25 5 45"
          />

          <path
            {...gate}
            d="M11 5 Q22 25 11 45"
          />

          <path
            {...gate}
            d="M11 5 Q35 4 44 25"
          />

          <path
            {...gate}
            d="M11 45 Q35 46 44 25"
          />

          <circle
            {...gate}
            cx="49"
            cy="25"
            r="3"
          />
        </>
      )}
    </svg>
  );
};

export default GateSymbol;