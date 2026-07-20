import type { CSSProperties } from 'react';
import { ChevronLeft, Users, MoreVertical } from 'lucide-react';

/**
 * Agency › Operations (Team) screen — pixel-exact to Figma node 7808:23677.
 * Static, self-contained. All coordinates are frame-relative (px).
 */

type Member = {
  name: string;
  top: number; // top of the 70px card
  status: 'active' | 'offline';
};

const MEMBERS: Member[] = [
  { name: 'Riya Verma', top: 387, status: 'active' },
  { name: 'Lisa Rai', top: 473, status: 'active' },
  { name: 'Sanjay Sharma', top: 559, status: 'active' },
  { name: 'Rahul Singh', top: 645, status: 'active' },
  { name: 'Sonal Soni', top: 731, status: 'offline' },
  { name: 'Kunal Singh', top: 817, status: 'offline' },
];

export default function AgOperationsPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: '#F8F5EF',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Decorative gradient circle (fill not specified in outline — approximated) */}
      <div
        style={{
          position: 'absolute',
          left: 240.6,
          top: -57.6,
          width: 192,
          height: 192,
          borderRadius: 9999,
          background:
            'linear-gradient(135deg, rgba(199,210,254,0.55), rgba(224,231,255,0.25))',
        }}
      />

      {/* ===== Header ===== */}
      {/* Back button */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: '#1F1A17',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      />
      <ChevronLeft
        size={16}
        color="#FAF7F2"
        strokeWidth={1.35}
        style={{ position: 'absolute', left: 25.9, top: 31.9 }}
      />
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 28,
          width: 222,
          height: 24,
          color: '#141311',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '24px',
          textAlign: 'left',
        }}
      >
        Team
      </div>

      {/* Header divider */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 80,
          width: 335,
          height: 1,
          background: '#E2E8F0',
        }}
      />

      {/* ===== Operations team card ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 101,
          width: 335,
          height: 222,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
          boxShadow: '0 8px 24px rgba(17,17,17,0.06)',
        }}
      />

      {/* Icon background (gradient rounded) */}
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 122,
          width: 48,
          height: 48,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #C7D2FE, #E0E7FF)',
        }}
      />
      <Users
        size={20}
        color="#4F39F6"
        strokeWidth={2}
        style={{ position: 'absolute', left: 55, top: 136 }}
      />

      {/* Card title + subtitle */}
      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 126,
          width: 173,
          height: 24,
          color: '#111111',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '24px',
        }}
      >
        Operations
      </div>
      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 150,
          width: 173,
          height: 16,
          color: '#64748B',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        10 Members
      </div>

      {/* Toggle switch (on) */}
      <div
        style={{
          position: 'absolute',
          left: 286,
          top: 134,
          width: 48,
          height: 24,
          borderRadius: 9999,
          background: '#7C86FF',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 314,
          top: 138,
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />

      {/* Card inner divider */}
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 186,
          width: 293,
          height: 1,
          background: '#E2E8F0',
        }}
      />

      {/* ===== Stats box ===== */}
      <div
        style={{
          position: 'absolute',
          left: 27,
          top: 203,
          width: 311,
          height: 103,
          borderRadius: 24,
          border: '1px solid #FFFFFF',
          background:
            'linear-gradient(135deg, rgba(209,250,229,0.55), rgba(187,247,208,0.3))',
        }}
      />

      {/* Stat col 1 — All Campaigns */}
      <div style={statValue(44)}>20</div>
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 242,
          width: 59,
          height: 30,
          color: '#64748B',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '15px',
          whiteSpace: 'pre-line',
        }}
      >
        {'All\nCampaigns'}
      </div>

      {/* Stat col 2 — Completed */}
      <div style={statValue(115.2)}>10</div>
      <div style={statLabel(115.2, 54.2)}>Completed</div>
      <div style={statPercent(115.2)}>20%</div>
      <div style={progressTrack(115.2, 54.2)} />
      <div style={progressFill(115.2, 10.8, '#34D399')} />

      {/* Stat col 3 — Ongoing */}
      <div style={statValue(186.5)}>7</div>
      <div style={statLabel(186.5, 54.2)}>Ongoing</div>
      <div style={statPercent(186.5)}>60%</div>
      <div style={progressTrack(186.5, 54.2)} />
      <div style={progressFill(186.5, 32.5, '#A3E635')} />

      {/* Stat col 4 — Successful */}
      <div style={{ ...statValue(257.8), width: 55.2 }}>3</div>
      <div style={statLabel(257.8, 55.2)}>Successful</div>
      <div style={statPercent(257.8)}>90%</div>
      <div style={progressTrack(257.8, 55.2)} />
      <div style={progressFill(257.8, 49.7, '#4ADE80')} />

      {/* ===== Members section header ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 345,
          width: 74,
          height: 24,
          color: '#111111',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '24px',
        }}
      >
        Members
      </div>
      {/* Add Members button */}
      <div
        style={{
          position: 'absolute',
          left: 251.1,
          top: 343,
          width: 105,
          height: 28,
          borderRadius: 9999,
          background: '#111111',
          boxShadow: '0 2px 6px rgba(17,17,17,0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 263.1,
          top: 349,
          width: 81,
          height: 16,
          color: '#F4F6F8',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
        }}
      >
        Add Members
      </div>

      {/* ===== Member cards ===== */}
      {MEMBERS.map((m) => {
        const isActive = m.status === 'active';
        return (
          <div key={m.name}>
            {/* Card */}
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: m.top,
                width: 335,
                height: 70,
                borderRadius: 40,
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                boxShadow: '0 6px 18px rgba(17,17,17,0.05)',
              }}
            />
            {/* Avatar */}
            <div
              style={{
                position: 'absolute',
                left: 37,
                top: m.top + 13,
                width: 44,
                height: 44,
                borderRadius: 9999,
                border: '2px solid #FFFFFF',
                background: 'linear-gradient(135deg, #E9E4F0, #D9CFEA)',
              }}
            />
            {/* Name */}
            <div
              style={{
                position: 'absolute',
                left: 93,
                top: m.top + 17,
                width: 142,
                height: 20,
                color: '#111111',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: '20px',
              }}
            >
              {m.name}
            </div>
            {/* Role */}
            <div
              style={{
                position: 'absolute',
                left: 93,
                top: m.top + 37,
                width: 142,
                height: 16,
                color: '#64748B',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: '16px',
              }}
            >
              Operations
            </div>

            {/* Status badge */}
            <div
              style={{
                position: 'absolute',
                left: isActive ? 247 : 241,
                top: m.top + 22,
                width: isActive ? 59 : 65,
                height: 26,
                borderRadius: 9999,
                background: isActive ? '#F0FDF4' : '#F1F5F9',
                border: `1px solid ${isActive ? '#7BF1A8' : '#E2E8F0'}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: isActive ? 257 : 251,
                top: m.top + 32,
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: isActive ? '#05DF72' : '#D1D5DC',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: isActive ? 267 : 261,
                top: m.top + 27,
                width: isActive ? 31 : 32,
                height: 16,
                color: isActive ? '#00A63E' : '#64748B',
                fontWeight: 500,
                fontSize: 10,
                lineHeight: '16px',
              }}
            >
              {isActive ? 'Active' : 'Offline'}
            </div>

            {/* More button */}
            <MoreVertical
              size={16}
              color="#64748B"
              strokeWidth={2}
              style={{ position: 'absolute', left: 322, top: m.top + 27 }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ---- style helpers for the stat columns ---- */

function statValue(left: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 220,
    width: 54.2,
    height: 18,
    color: '#111111',
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '18px',
  };
}

function statLabel(left: number, width: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 242,
    width,
    height: 15,
    color: '#64748B',
    fontWeight: 400,
    fontSize: 10,
    lineHeight: '15px',
  };
}

function statPercent(left: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 261,
    width: 54.2,
    height: 16,
    color: '#00A63E',
    fontWeight: 600,
    fontSize: 12,
    lineHeight: '16px',
  };
}

function progressTrack(left: number, width: number): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 285,
    width,
    height: 4,
    borderRadius: 9999,
    background: '#E5E7EB',
  };
}

function progressFill(
  left: number,
  width: number,
  color: string,
): CSSProperties {
  return {
    position: 'absolute',
    left,
    top: 285,
    width,
    height: 4,
    borderRadius: 9999,
    background: color,
  };
}
