import {
  Mail,
  Bell,
  Users,
  ChevronRight,
  IndianRupee,
  ArrowUp,
  Target,
  Video,
  Scissors,
  Check,
  X,
  ChevronDown,
  Home,
  Briefcase,
  Plus,
  MessageCircle,
  User,
} from 'lucide-react';

/**
 * AgTargetPg — Yunto agency home screen (node 7756:12488) with the
 * "Set Your Revenue Target" bottom-sheet modal open over the dimmed page.
 * All nodes absolutely positioned with exact frame-relative coordinates.
 */
export default function AgTargetPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 876, background: '#F8F5EF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ===== BACKGROUND / SCROLLING CONTENT ===== */}

      {/* Top gradient wash */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 375,
          height: 256,
          background: 'linear-gradient(135deg, rgba(249,228,232,0.2), rgba(249,228,232,0.0))',
        }}
      />

      {/* ---- Header ---- */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 58,
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 56,
          width: 132,
          height: 32,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 24,
          lineHeight: '32px',
        }}
      >
        Rohit Kumar
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 88,
          width: 56,
          height: 20,
          color: '#1E1E1E',
          fontWeight: 300,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        Manager
      </div>

      {/* Message button */}
      <div
        style={{
          position: 'absolute',
          left: 267,
          top: 62,
          width: 40,
          height: 40,
          background: '#1F1A17',
          border: '1px solid #E8E2D9',
          borderRadius: 9999,
          boxShadow: '0 4px 10px rgba(31,26,23,0.18)',
        }}
      />
      <Mail size={20} color="#F1EEE8" style={{ position: 'absolute', left: 277, top: 72 }} />

      {/* Notification button + badge */}
      <div
        style={{
          position: 'absolute',
          left: 315,
          top: 62,
          width: 40,
          height: 40,
          background: '#1F1A17',
          border: '1px solid #E8E2D9',
          borderRadius: 9999,
          boxShadow: '0 4px 10px rgba(31,26,23,0.18)',
        }}
      />
      <Bell size={20} color="#F1EEE8" style={{ position: 'absolute', left: 325, top: 72 }} />
      <div
        style={{
          position: 'absolute',
          left: 342,
          top: 63,
          width: 12,
          height: 12,
          background: '#FFCDEA',
          border: '2px solid #F9F6EE',
          borderRadius: 9999,
        }}
      />

      {/* ---- Status pill ---- */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 137.5,
          width: 335,
          height: 42,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 153.5,
          width: 10,
          height: 10,
          background: '#05DF72',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 57,
          top: 147.8,
          width: 39,
          height: 20,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 13,
          lineHeight: '19.5px',
        }}
      >
        Active
      </div>
      {/* Toggle (on) */}
      <div
        style={{
          position: 'absolute',
          left: 302,
          top: 148.5,
          width: 36,
          height: 20,
          background: '#1F1A17',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 322,
          top: 152.5,
          width: 12,
          height: 12,
          background: '#FFFFFF',
          borderRadius: 9999,
        }}
      />

      {/* ---- "3 new leads" card ---- */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 199.5,
          width: 335,
          height: 83.5,
          background: '#E2EBE2',
          border: '1px solid #E8E2D9',
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 254,
            top: -15,
            width: 96,
            height: 96,
            background: '#D4E2D4',
            borderRadius: 9999,
            filter: 'blur(18px)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 221.2,
          width: 40,
          height: 40,
          background: '#FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <Users size={19.8} color="#1E1E1E" style={{ position: 'absolute', left: 51.1, top: 231.3 }} />
      <div
        style={{
          position: 'absolute',
          left: 97,
          top: 220.5,
          width: 149,
          height: 24,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '24px',
        }}
      >
        3 new leads waiting
      </div>
      <div
        style={{
          position: 'absolute',
          left: 97,
          top: 246,
          width: 124,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Tap to review pipeline
      </div>
      <div
        style={{
          position: 'absolute',
          left: 302,
          top: 225.2,
          width: 32,
          height: 32,
          background: '#1F1A17',
          borderRadius: 9999,
        }}
      />
      <ChevronRight size={16} color="#F9F6EE" style={{ position: 'absolute', left: 310, top: 233.2 }} />

      {/* ---- Performance section ---- */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 303,
          width: 200,
          height: 33,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          lineHeight: '33px',
        }}
      >
        Performance
      </div>
      {/* Stat card 1 */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 352,
          width: 161.5,
          height: 130,
          background: '#F6F3E6',
          border: '1px solid #E8E2D9',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 373,
          width: 119.5,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        This Month
      </div>
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 408,
          width: 119.5,
          height: 32,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '32px',
        }}
      >
        8,400k
      </div>
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 444,
          width: 119.5,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        Expected this week
      </div>
      {/* Stat card 2 */}
      <div
        style={{
          position: 'absolute',
          left: 193.5,
          top: 352,
          width: 161.5,
          height: 130,
          background: '#E4ECF4',
          border: '1px solid #E8E2D9',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 214.5,
          top: 373,
          width: 119.5,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Last Month
      </div>
      <div
        style={{
          position: 'absolute',
          left: 214.5,
          top: 408,
          width: 119.5,
          height: 32,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '32px',
        }}
      >
        2,400k
      </div>

      {/* ---- Revenue card (Total Revenue + Monthly Target) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 505,
          width: 335,
          height: 314,
          background: '#F2EFF6',
          border: '1px solid #E6E1F9',
          borderRadius: 32,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -39,
            top: 160.5,
            width: 192,
            height: 192,
            background: '#FFFFFF',
            borderRadius: 9999,
            filter: 'blur(30px)',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 206,
            top: 1,
            width: 128,
            height: 128,
            background: '#F2EFF6',
            borderRadius: 9999,
            filter: 'blur(24px)',
          }}
        />
      </div>
      {/* Total revenue row */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 530,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <IndianRupee size={14} color="#1E1E1E" style={{ position: 'absolute', left: 52, top: 537 }} />
      <div
        style={{
          position: 'absolute',
          left: 81,
          top: 535.5,
          width: 104.7,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        TOTAL REVENUE
      </div>
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 566,
          width: 120,
          height: 44,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 44,
          lineHeight: '44px',
        }}
      >
        42k
      </div>
      {/* change pill */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 622,
          width: 182.6,
          height: 34,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 629,
          width: 20,
          height: 20,
          background: '#BEE3B0',
          borderRadius: 9999,
        }}
      />
      <ArrowUp size={12} color="#1E1E1E" style={{ position: 'absolute', left: 62, top: 633 }} />
      <div
        style={{
          position: 'absolute',
          left: 84,
          top: 628.2,
          width: 49,
          height: 20,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 13,
          lineHeight: '19.5px',
        }}
      >
        +12.4%
      </div>
      <div
        style={{
          position: 'absolute',
          left: 141,
          top: 631.5,
          width: 73.7,
          height: 15,
          borderLeft: '1px solid #E8E2D9',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 631.5,
          width: 64.7,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        vs last month
      </div>
      {/* inner white target box */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 676,
          width: 285,
          height: 117.5,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 20,
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 693,
          width: 107.3,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        MONTHLY TARGET
      </div>
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 712,
          width: 88,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        42.8k / 50.0k
      </div>
      {/* Set Target chip */}
      <div
        style={{
          position: 'absolute',
          left: 206,
          top: 704,
          width: 107,
          height: 29,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      />
      <Target size={10} color="#1E1E1E" style={{ position: 'absolute', left: 219, top: 713.5 }} />
      <div
        style={{
          position: 'absolute',
          left: 233,
          top: 711,
          width: 67,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
          textAlign: 'center',
        }}
      >
        Set Target
      </div>
      {/* progress bar */}
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 745,
          width: 251,
          height: 10,
          background: '#FFFFFF',
          borderRadius: 9999,
          boxShadow: 'inset 0 0 0 1px #EFEBF4',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 63,
          top: 746,
          width: 213.4,
          height: 8,
          background: '#1E1E1E',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 268.4,
          top: 748,
          width: 4,
          height: 4,
          background: '#FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 66,
          top: 763,
          width: 83.4,
          height: 14,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        85% COMPLETE
      </div>
      <div
        style={{
          position: 'absolute',
          left: 242.8,
          top: 763,
          width: 66.2,
          height: 14,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
          textAlign: 'right',
        }}
      >
        5 DAYS LEFT
      </div>

      {/* ---- Top Creators (edge of viewport) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 847,
          width: 200,
          height: 33,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          lineHeight: '33px',
        }}
      >
        Top Creators
      </div>
      <div
        style={{
          position: 'absolute',
          left: 306.4,
          top: 860,
          width: 44.6,
          height: 20,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        See all
      </div>
      {/* Creators container (below fold) */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 896,
          width: 335,
          height: 174,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 28,
        }}
      />
      {/* creator row 1 */}
      <div
        style={{
          position: 'absolute',
          left: 29,
          top: 905,
          width: 317,
          height: 74,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 918,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 106,
          top: 921.8,
          width: 105,
          height: 23,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '22.5px',
        }}
      >
        Leena Sharma
      </div>
      <div
        style={{
          position: 'absolute',
          left: 106,
          top: 945.2,
          width: 130,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Lifestyle &amp; Wellness
      </div>
      <div
        style={{
          position: 'absolute',
          left: 285.7,
          top: 922.2,
          width: 39.3,
          height: 23,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '22.5px',
          textAlign: 'right',
        }}
      >
        4.2%
      </div>
      <div
        style={{
          position: 'absolute',
          left: 285.7,
          top: 945.8,
          width: 39.3,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 10,
          lineHeight: '15px',
          textAlign: 'right',
        }}
      >
        ENG
      </div>
      {/* creator row 2 */}
      <div
        style={{
          position: 'absolute',
          left: 29,
          top: 987,
          width: 317,
          height: 74,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 1000,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 106,
          top: 1003.8,
          width: 93,
          height: 23,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '22.5px',
        }}
      >
        Diya Sharma
      </div>
      <div
        style={{
          position: 'absolute',
          left: 106,
          top: 1027.2,
          width: 42,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Fitness
      </div>
      <div
        style={{
          position: 'absolute',
          left: 286,
          top: 1004.2,
          width: 39,
          height: 23,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '22.5px',
          textAlign: 'right',
        }}
      >
        3.8%
      </div>
      <div
        style={{
          position: 'absolute',
          left: 286,
          top: 1027.8,
          width: 39,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 10,
          lineHeight: '15px',
          textAlign: 'right',
        }}
      >
        ENG
      </div>

      {/* ---- Live Campaigns (below fold) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 1094,
          width: 327,
          height: 33,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          lineHeight: '33px',
        }}
      >
        Live Campaigns
      </div>
      {/* campaign card 1 */}
      <div
        style={{
          position: 'absolute',
          left: 26,
          top: 1143,
          width: 280,
          height: 182,
          background: '#FDEBF0',
          border: '1px solid #F9E4E8',
          borderRadius: 28,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 183,
            top: 1,
            width: 96,
            height: 96,
            background: '#FFFFFF',
            borderRadius: 9999,
            filter: 'blur(20px)',
            opacity: 0.6,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 47,
          top: 1164.5,
          width: 79.4,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        LUMINA SKIN
      </div>
      <div
        style={{
          position: 'absolute',
          left: 134.5,
          top: 1164,
          width: 36.8,
          height: 18,
          background: '#FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 142.5,
          top: 1166,
          width: 20.8,
          height: 14,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        PAID
      </div>
      <div
        style={{
          position: 'absolute',
          left: 47,
          top: 1187.2,
          width: 143,
          height: 45,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 18,
          lineHeight: '22.5px',
          whiteSpace: 'pre-line',
        }}
      >
        {'Summer Launch\nSeries'}
      </div>
      {/* ring 80% */}
      <div
        style={{
          position: 'absolute',
          left: 237,
          top: 1164,
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: 'conic-gradient(#FF8EAA 0% 80%, #FFFFFF 80% 100%)',
        }}
      >
        <div style={{ position: 'absolute', inset: 4, borderRadius: 9999, background: '#FDEBF0' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 248.1,
          top: 1179.8,
          width: 25.8,
          height: 16.5,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        80%
      </div>
      <div
        style={{
          position: 'absolute',
          left: 47,
          top: 1249,
          width: 238,
          height: 0,
          borderTop: '1px solid #F9E4E8',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 47,
          top: 1266,
          width: 45,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        BUDGET
      </div>
      <div
        style={{
          position: 'absolute',
          left: 47,
          top: 1283,
          width: 60,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        ₹1,25L
      </div>
      <div
        style={{
          position: 'absolute',
          left: 172,
          top: 1266,
          width: 51,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        TIMELINE
      </div>
      <div
        style={{
          position: 'absolute',
          left: 172,
          top: 1283,
          width: 76.4,
          height: 18,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '18px',
        }}
      >
        Oct 1 - Oct 31
      </div>
      {/* campaign card 2 (offscreen right) */}
      <div
        style={{
          position: 'absolute',
          left: 322,
          top: 1143,
          width: 280,
          height: 161,
          background: '#E2EBE2',
          border: '1px solid #D4E2D4',
          borderRadius: 28,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 183,
            top: 1,
            width: 96,
            height: 96,
            background: '#FFFFFF',
            borderRadius: 9999,
            filter: 'blur(20px)',
            opacity: 0.6,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 343,
          top: 1164.5,
          width: 55.4,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        AURA FIT
      </div>
      <div
        style={{
          position: 'absolute',
          left: 406.4,
          top: 1164,
          width: 52,
          height: 18,
          background: '#FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 414.4,
          top: 1166,
          width: 36,
          height: 14,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        BARTER
      </div>
      <div
        style={{
          position: 'absolute',
          left: 343,
          top: 1187,
          width: 142,
          height: 23,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 18,
          lineHeight: '22.5px',
        }}
      >
        Q3 Ambassador
      </div>
      <div
        style={{
          position: 'absolute',
          left: 485,
          top: 1164,
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: 'conic-gradient(#8DBA8E 0% 33%, #FFFFFF 33% 100%)',
        }}
      >
        <div style={{ position: 'absolute', inset: 4, borderRadius: 9999, background: '#E2EBE2' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 496.3,
          top: 1179.8,
          width: 25.4,
          height: 16.5,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        33%
      </div>
      <div
        style={{
          position: 'absolute',
          left: 343,
          top: 1245,
          width: 44.4,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        BUDGET
      </div>
      <div
        style={{
          position: 'absolute',
          left: 343,
          top: 1262,
          width: 89.1,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        Product Only
      </div>
      <div
        style={{
          position: 'absolute',
          left: 468,
          top: 1245,
          width: 51,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        TIMELINE
      </div>
      <div
        style={{
          position: 'absolute',
          left: 468,
          top: 1262,
          width: 88.2,
          height: 18,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '18px',
        }}
      >
        Sep 15 - Nov 15
      </div>

      {/* ---- Explore Services (below fold) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 27,
          top: 1373,
          width: 327,
          height: 33,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          lineHeight: '33px',
        }}
      >
        Explore Services
      </div>
      {/* explore card 1 */}
      <div
        style={{
          position: 'absolute',
          left: 23,
          top: 1422,
          width: 161.5,
          height: 110,
          background: '#E4ECF4',
          border: '1px solid #D9E8F5',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 1439,
          width: 32,
          height: 32,
          background: '#FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <Video size={16} color="#1E1E1E" style={{ position: 'absolute', left: 48, top: 1447 }} />
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 1475,
          width: 127.5,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        Videographers
      </div>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 1498,
          width: 127.5,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        Find local talent
      </div>
      {/* explore card 2 */}
      <div
        style={{
          position: 'absolute',
          left: 196.5,
          top: 1422,
          width: 161.5,
          height: 110,
          background: '#F6F3E6',
          border: '1px solid #FCF4D9',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 213.5,
          top: 1439,
          width: 32,
          height: 32,
          background: '#FFFFFF',
          borderRadius: 9999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <Scissors size={16} color="#1E1E1E" style={{ position: 'absolute', left: 221.5, top: 1447 }} />
      <div
        style={{
          position: 'absolute',
          left: 213.5,
          top: 1475,
          width: 127.5,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        Video Editors
      </div>
      <div
        style={{
          position: 'absolute',
          left: 213.5,
          top: 1498,
          width: 127.5,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        Post-production
      </div>

      {/* ---- Reminders (below fold) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 27,
          top: 1576,
          width: 106,
          height: 33,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          lineHeight: '33px',
        }}
      >
        Reminders
      </div>
      <div
        style={{
          position: 'absolute',
          left: 309.4,
          top: 1589,
          width: 44.6,
          height: 20,
          color: '#1E1E1E',
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        See all
      </div>
      {/* reminder 1 */}
      <div
        style={{
          position: 'absolute',
          left: 23,
          top: 1625,
          width: 335,
          height: 63.5,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 36,
          top: 1647,
          width: 20,
          height: 20,
          border: '2px solid #1E1E1E',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 1638,
          width: 277,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        Approve Lumina drafts
      </div>
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 1659,
          width: 277,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        Due today at 5 PM
      </div>
      {/* reminder 2 (completed) */}
      <div
        style={{
          position: 'absolute',
          left: 23,
          top: 1697,
          width: 335,
          height: 63.5,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 36,
          top: 1719,
          width: 20,
          height: 20,
          background: '#1E1E1E',
          borderRadius: 9999,
        }}
      />
      <Check size={12} color="#F9F6EE" style={{ position: 'absolute', left: 40, top: 1723 }} />
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 1710,
          width: 277,
          height: 21,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '21px',
        }}
      >
        Send contracts to Meena
      </div>
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 1731,
          width: 277,
          height: 17,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '16.5px',
        }}
      >
        Completed
      </div>

      {/* ---- Recent Activity (below fold) ---- */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 1786,
          width: 327,
          height: 33,
          color: '#1E1E1E',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          lineHeight: '33px',
        }}
      >
        Recent Activity
      </div>
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 1835,
          width: 335,
          height: 273.2,
          background: '#FFFFFF',
          border: '1px solid #E8E2D9',
          borderRadius: 28,
        }}
      />
      {/* timeline vertical line */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 1880,
          width: 0,
          height: 160,
          borderLeft: '1px solid #E8E2D9',
        }}
      />
      {/* item 1 */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 1856,
          width: 24,
          height: 24,
          background: '#E6E1F9',
          border: '2px solid #F9F6EE',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 1865,
          width: 6,
          height: 6,
          background: '#1E1E1E',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 1855,
          width: 252,
          height: 19,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '18.8px',
        }}
      >
        Contract Signed
      </div>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 1876.8,
          width: 252,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Elena R. agreed to terms for Lumina.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 1896.8,
          width: 252,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        2H AGO
      </div>
      {/* item 2 */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 1935.8,
          width: 24,
          height: 24,
          background: '#FCF4D9',
          border: '2px solid #F9F6EE',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 1944.8,
          width: 6,
          height: 6,
          background: '#1E1E1E',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 1934.8,
          width: 252,
          height: 19,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '18.8px',
        }}
      >
        Campaign Launched
      </div>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 1956.5,
          width: 252,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Aura Fit Q3 program is now live.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 1976.5,
          width: 252,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        5H AGO
      </div>
      {/* item 3 */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 2015.5,
          width: 24,
          height: 24,
          background: '#E8E2D9',
          border: '2px solid #F9F6EE',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 2024.5,
          width: 6,
          height: 6,
          background: '#1E1E1E',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 2014.5,
          width: 252,
          height: 19,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 15,
          lineHeight: '18.8px',
        }}
      >
        Pitch Sent
      </div>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 2036.2,
          width: 252,
          height: 16,
          color: '#1E1E1E',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Sent proposals to 5 new creators.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 2056.2,
          width: 252,
          height: 15,
          color: '#1E1E1E',
          fontWeight: 700,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        YESTERDAY
      </div>
      <div
        style={{
          position: 'absolute',
          left: 21,
          top: 2011.2,
          width: 333,
          height: 96,
          background: 'linear-gradient(135deg, rgba(249,246,238,0.8), rgba(249,246,238,0.0))',
        }}
      />

      {/* ===== BOTTOM NAV BAR ===== */}
      <div
        style={{
          position: 'absolute',
          left: 9,
          top: 794,
          width: 357,
          height: 72,
          background: '#FFFFFF',
          border: '1px solid #F9F8F6',
          borderRadius: 32,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        }}
      />
      <Home size={24} color="#E36EB2" style={{ position: 'absolute', left: 34, top: 818 }} />
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 846,
          width: 4,
          height: 4,
          background: '#E36EB2',
          borderRadius: 9999,
        }}
      />
      <Briefcase size={24} color="#9A8EA3" style={{ position: 'absolute', left: 115, top: 818 }} />
      {/* center FAB */}
      <div
        style={{
          position: 'absolute',
          left: 157,
          top: 765,
          width: 60,
          height: 60,
          background: '#F8F5EF',
          borderRadius: 9999,
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 163,
          top: 771,
          width: 48,
          height: 48,
          background: '#FFCDEA',
          borderRadius: 9999,
        }}
      />
      <Plus size={24} color="#1C1C1E" style={{ position: 'absolute', left: 175, top: 783 }} />
      <MessageCircle size={24} color="#9A8EA3" style={{ position: 'absolute', left: 236, top: 818 }} />
      <User size={24} color="#9A8EA3" style={{ position: 'absolute', left: 317, top: 818 }} />

      {/* ===== MODAL: scrim + Set Revenue Target bottom sheet ===== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 375,
          height: 876,
          background: 'rgba(181,180,185,0.6)',
        }}
      />
      {/* bottom sheet */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 494,
          width: 375,
          height: 383,
          background: '#FFFFFF',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 167.5,
          top: 510,
          width: 40,
          height: 4,
          background: '#E5E5E5',
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 538,
          width: 280,
          height: 31,
          color: '#111111',
          fontWeight: 600,
          fontSize: 24,
          lineHeight: '29px',
        }}
      >
        Set Your Revenue Target
      </div>
      <div
        style={{
          position: 'absolute',
          left: 315,
          top: 538,
          width: 36,
          height: 36,
          background: '#F8F8F8',
          borderRadius: 18,
        }}
      />
      <X size={20} color="#555555" style={{ position: 'absolute', left: 323, top: 546 }} />

      {/* amount field */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 600,
          width: 323,
          height: 17,
          color: '#6B7280',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '16.9px',
        }}
      >
        How much do you want to earn?
      </div>
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 625,
          width: 327,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #E8E8E8',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 642,
          width: 268,
          height: 18,
          color: '#111827',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
        }}
      >
        ₹&nbsp;&nbsp;e.g. 5000
      </div>

      {/* frequency field */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 694,
          width: 323,
          height: 17,
          color: '#6B7280',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '16.9px',
        }}
      >
        Choose Frequency
      </div>
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 719,
          width: 327,
          height: 52,
          background: '#FFFFFF',
          border: '1px solid #E5E5E5',
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 736,
          width: 268,
          height: 18,
          color: '#111827',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '18.2px',
        }}
      >
        Monthly
      </div>
      <ChevronDown size={20} color="#6B7280" style={{ position: 'absolute', left: 313, top: 735 }} />

      {/* submit */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 793.7,
          width: 301,
          height: 55,
          background: '#312B28',
          borderRadius: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 147,
          top: 811.7,
          width: 81,
          height: 19,
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '19.4px',
          textAlign: 'center',
        }}
      >
        Set Target
      </div>
    </div>
  );
}
