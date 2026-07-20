import { LogOut, X, Check } from "lucide-react";

export default function AgLogoutPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: "#F8F5EF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Background gradient overlay (full) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 375,
          height: 876,
          background:
            "linear-gradient(135deg, rgba(235,230,255,0.35), rgba(255,220,235,0.25))",
        }}
      />
      {/* Soft gradient blob (bottom-right) */}
      <div
        style={{
          position: "absolute",
          left: 112.5,
          top: 525.6,
          width: 262.5,
          height: 350.4,
          background:
            "radial-gradient(circle at 60% 40%, rgba(255,205,220,0.4), rgba(255,205,220,0.0) 70%)",
        }}
      />
      {/* Overlay + Blur circle (left) */}
      <div
        style={{
          position: "absolute",
          left: -37.5,
          top: 481.8,
          width: 168.8,
          height: 245.3,
          borderRadius: 9999,
          background: "rgba(215,205,255,0.35)",
          filter: "blur(40px)",
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 76,
          width: 335,
          height: 651.5,
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 36,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      />
      {/* Radial glow (top) inside card */}
      <div
        style={{
          position: "absolute",
          left: 146,
          top: 77,
          width: 208,
          height: 208,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(215,205,255,0.45), rgba(215,205,255,0.0) 70%)",
        }}
      />
      {/* Radial glow (bottom) inside card */}
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 534.5,
          width: 192,
          height: 192,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(255,210,225,0.3), rgba(255,210,225,0.0) 70%)",
        }}
      />

      {/* Icon container */}
      <div
        style={{
          position: "absolute",
          left: 132.5,
          top: 109,
          width: 110,
          height: 110,
          background:
            "linear-gradient(135deg, rgba(235,230,255,0.8), rgba(255,220,235,0.6))",
          border: "1px solid #C8BEF0",
          borderRadius: 30,
        }}
      />
      {/* ID badge outer */}
      <div
        style={{
          position: "absolute",
          left: 164.5,
          top: 135,
          width: 46,
          height: 58,
          background: "#C8BEF0",
          border: "1px solid #A096DC",
          borderRadius: "8px 8px 4px 4px",
        }}
      />
      {/* ID badge inner */}
      <div
        style={{
          position: "absolute",
          left: 171.5,
          top: 140,
          width: 36.7,
          height: 50,
          background: "#F0ECFF",
          border: "1px solid #A096DC",
          borderRadius: "6px 6px 3px 3px",
        }}
      />
      {/* Divider line on badge */}
      <div
        style={{
          position: "absolute",
          left: 182.5,
          top: 158,
          width: 32,
          height: 2,
          background: "#8C78C8",
          borderRadius: 9999,
        }}
      />
      {/* Small border box */}
      <div
        style={{
          position: "absolute",
          left: 216.5,
          top: 154,
          width: 7,
          height: 10,
          border: "1px solid #A096DC",
          borderRadius: 2,
        }}
      />
      {/* Person head */}
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 132,
          width: 20,
          height: 20,
          background: "#A08CDC",
          borderRadius: 9999,
        }}
      />
      {/* Person body */}
      <div
        style={{
          position: "absolute",
          left: 211.5,
          top: 154,
          width: 12,
          height: 20,
          background: "#A08CDC",
          borderRadius: 6,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          left: 129.7,
          top: 239,
          width: 118,
          height: 35,
          color: "#111111",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 28,
          lineHeight: "35px",
          textAlign: "center",
        }}
      >
        Log Out?
      </div>

      {/* Description */}
      <div
        style={{
          position: "absolute",
          left: 60.5,
          top: 293.2,
          width: 254,
          height: 85,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "21.1px",
          textAlign: "center",
        }}
      >
        You&rsquo;re about to sign out of your agency account. You can sign back
        in anytime to continue managing campaigns, creators, leads, and team
        activities.
      </div>

      {/* Profile card */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 398.5,
          width: 285,
          height: 80,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 22,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      />
      {/* Avatar placeholder */}
      <div
        style={{
          position: "absolute",
          left: 63,
          top: 414.5,
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
          border: "1px solid #EEEEEE",
        }}
      />
      {/* Name */}
      <div
        style={{
          position: "absolute",
          left: 124,
          top: 417.2,
          width: 85,
          height: 23,
          color: "#111111",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "left",
        }}
      >
        Rohit Kumar
      </div>
      {/* Role */}
      <div
        style={{
          position: "absolute",
          left: 124,
          top: 440.8,
          width: 74,
          height: 18,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "18px",
          textAlign: "left",
        }}
      >
        Super Admin
      </div>
      {/* ID badge pill */}
      <div
        style={{
          position: "absolute",
          left: 243,
          top: 424,
          width: 70,
          height: 29,
          background: "#C8D2FF",
          border: "1px solid #A0AAFF",
          borderRadius: 9999,
        }}
      />
      {/* Badge dot */}
      <div
        style={{
          position: "absolute",
          left: 256,
          top: 435.5,
          width: 6,
          height: 6,
          background: "#7A8AE8",
          borderRadius: 9999,
        }}
      />
      {/* Badge number */}
      <div
        style={{
          position: "absolute",
          left: 268,
          top: 431,
          width: 32,
          height: 15,
          color: "#5560CC",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 10,
          lineHeight: "15px",
          textAlign: "left",
        }}
      >
        55678
      </div>

      {/* Green info bar */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 492.5,
          width: 285,
          height: 59,
          background: "#D2F0DC",
          border: "1px solid #8CBE9B",
          borderRadius: 18,
        }}
      />
      {/* Green check circle */}
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 510,
          width: 24,
          height: 24,
          background: "#3E7D52",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
      </div>
      {/* Green bar text */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 504.8,
          width: 204,
          height: 33,
          color: "#3E5C45",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16.5px",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
        }}
      >
        Your data, campaigns, and creator records will remain securely saved.
      </div>

      {/* Log Out button */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 575.5,
          width: 285,
          height: 54.5,
          background: "linear-gradient(135deg, #F4A0B0, #E87090, #D85070)",
          borderRadius: 9999,
          boxShadow: "0 8px 24px rgba(216,80,112,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 145.1,
          top: 593.8,
          width: 18,
          height: 18,
        }}
      >
        <LogOut size={18} color="#FFFFFF" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 173.1,
          top: 590.5,
          width: 58.2,
          height: 23,
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "center",
        }}
      >
        Log Out
      </div>

      {/* Stay Logged In button */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 642,
          width: 285,
          height: 56.5,
          background: "#FFFFFF",
          border: "1px solid #000000",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 119.6,
          top: 661.2,
          width: 18,
          height: 18,
        }}
      >
        <X size={16} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 147.6,
          top: 658,
          width: 108.2,
          height: 23,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "22.5px",
          textAlign: "center",
        }}
      >
        Stay Logged In
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          left: 128,
          top: 751.5,
          width: 119,
          height: 17,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 11,
          lineHeight: "16.5px",
          textAlign: "center",
        }}
      >
        Stelllar Agency &middot; v2.4.1
      </div>
    </div>
  );
}
