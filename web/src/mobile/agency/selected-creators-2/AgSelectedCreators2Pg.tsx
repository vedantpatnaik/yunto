import type { CSSProperties } from 'react';
import {
  ChevronLeft,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  Check,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  User,
  Phone,
  MessageCircle,
} from 'lucide-react';

const INTER = 'Inter, sans-serif';
const GEIST = 'Geist, sans-serif';

const abs = (
  left: number,
  top: number,
  width: number,
  height: number,
): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
  height,
  boxSizing: 'border-box',
});

const AVATAR_BG = 'linear-gradient(135deg,#E9E4F0,#D9CFEA)';

export default function AgSelectedCreators2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 876, background: '#F8F5EF', fontFamily: INTER }}
    >
      {/* ============ HEADER ============ */}
      {/* Back button */}
      <div
        style={{
          ...abs(16, 22, 36, 36),
          background: '#1F1A17',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" />
      </div>
      {/* Title */}
      <div
        style={{
          ...abs(72, 20, 192, 24),
          color: '#141311',
          fontFamily: GEIST,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '24px',
        }}
      >
        Creators
      </div>
      <div
        style={{
          ...abs(72, 49, 192, 11),
          color: '#000000',
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '10.4px',
        }}
      >
        Total: 49 Creators
      </div>

      {/* ============ ACTION BUTTONS ============ */}
      {/* Add Creator */}
      <div
        style={{
          ...abs(16, 107, 120.9, 32),
          background: '#141311',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(32, 117, 12, 12) }}>
        <Plus size={12} color="#FAF7F2" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(50, 115, 70.9, 16),
          color: '#FAF7F2',
          fontWeight: 700,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
        }}
      >
        Add Creator
      </div>
      {/* Filter */}
      <div
        style={{
          ...abs(144.9, 106, 77.5, 34),
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(159.9, 117, 12, 12) }}>
        <Filter size={12} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(177.9, 115, 29.5, 16),
          color: '#141311',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Filter
      </div>
      {/* Sort */}
      <div
        style={{
          ...abs(230.4, 106, 72.3, 34),
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(245.4, 117, 12, 12) }}>
        <ArrowUpDown size={12} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(263.4, 115, 24.3, 16),
          color: '#141311',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        Sort
      </div>

      {/* ============ SEARCH BAR ============ */}
      <div
        style={{
          ...abs(16, 160, 343, 46),
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      />
      <div style={{ ...abs(33, 175.5, 15, 15) }}>
        <Search size={15} color="#8C8A84" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(60, 173, 282, 20),
          color: '#8C8A84',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        Search creators, niches...
      </div>

      {/* ============ TABS ============ */}
      <div
        style={{
          ...abs(16, 216, 343, 59),
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      />
      {/* Active tab */}
      <div
        style={{
          ...abs(21, 221, 166.5, 49),
          background: '#141311',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      />
      <div
        style={{
          ...abs(67.8, 229, 73, 33),
          color: '#FAF7F2',
          fontWeight: 700,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {'My Creators\n10 Creators '}
      </div>
      {/* Inactive tab */}
      <div
        style={{
          ...abs(236.2, 229, 69, 33),
          color: '#8C8A84',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {'All Creators\n10 Creators'}
      </div>

      {/* ============ SELECTED BANNER ============ */}
      <div
        style={{
          ...abs(16, 284, 343, 42),
          background: '#F2EDFF',
          border: '1px solid #F2EDFF',
          borderRadius: 16,
        }}
      />
      <div
        style={{
          ...abs(33, 295, 20, 20),
          background: '#141311',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={11} color="#FAF7F2" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(61, 297, 120, 16),
          color: '#141311',
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        20 creators selected
      </div>

      {/* ============ LIST HEADING ============ */}
      <div
        style={{
          ...abs(16, 343, 77, 20),
          color: '#141311',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        10 Creators
      </div>
      <div
        style={{
          ...abs(309.9, 345, 49.1, 16),
          color: '#8C8A84',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        4 results
      </div>

      {/* ================= CARD 1 — Leena Sharma ================= */}
      <div
        style={{
          ...abs(16, 379, 343, 211.5),
          background:
            'linear-gradient(135deg, rgba(242,237,255,0.8), rgba(255,255,255,0.5))',
          borderRadius: 26,
        }}
      />
      {/* avatar */}
      <div
        style={{
          ...abs(32, 403, 48, 48),
          background: AVATAR_BG,
          border: '2px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(66, 437, 16, 16),
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={9} color="#141311" strokeWidth={2} />
      </div>
      {/* name + handle */}
      <div
        style={{
          ...abs(92, 395, 95, 18),
          color: '#141311',
          fontWeight: 800,
          fontSize: 14,
          lineHeight: '17.5px',
        }}
      >
        Leena Sharma
      </div>
      <div
        style={{
          ...abs(92, 417.5, 70.4, 15),
          color: '#8C8A84',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        @leenasharma
      </div>
      {/* category pill */}
      <div
        style={{
          ...abs(168.4, 415, 52.1, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(175.4, 418, 38.1, 14),
          color: '#8C8A84',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        Lifestyle
      </div>
      {/* badge pill 1 */}
      <div
        style={{
          ...abs(92, 439, 125, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(101, 444.5, 9, 9) }}>
        <TrendingUp size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(113, 442, 95, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        +35% Above Average
      </div>
      {/* badge pill 2 */}
      <div
        style={{
          ...abs(224, 439, 128, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(233, 444.5, 9, 9) }}>
        <Lightbulb size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(245, 442, 98, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        {' Suggestion:  Increase'}
      </div>
      {/* select button (selected) */}
      <div
        style={{
          ...abs(320, 397, 24, 24),
          background: '#141311',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={11} color="#FAF7F2" strokeWidth={2} />
      </div>
      {/* stats strip */}
      <div
        style={{
          ...abs(32, 473, 311, 53.5),
          background: '#F2EDFF',
          borderRadius: 16,
        }}
      />
      <StatLabel left={48.5} top={483} width={58.9} text="FOLLOWERS" />
      <StatValue left={61.4} top={496.5} width={33.2} text="1.2M" />
      <Divider left={114} top={487.8} />
      <StatLabel left={136} top={483} width={30} text="VIEWS" />
      <StatValue left={131.5} top={496.5} width={39} text="840K" />
      <Divider left={187} top={487.8} />
      <StatLabel left={208.4} top={483} width={31.2} text="LEADS" />
      <StatValue left={216.4} top={496.5} width={15.1} text="12" />
      <Divider left={260} top={487.8} />
      <StatLabel left={283.6} top={485} width={26.8} text="PERF." />
      <PerfValue left={274} top={498.5} width={46.1} text="+18.4%" />
      {/* action row */}
      <ActionRow y={543.5} borderTop={540.5} />

      {/* ================= CARD 2 — Diya Kapoor ================= */}
      <div
        style={{
          ...abs(16, 606.5, 343, 211.5),
          background:
            'linear-gradient(135deg, rgba(255,236,243,0.8), rgba(255,255,255,0.5))',
          borderRadius: 26,
        }}
      />
      <div
        style={{
          ...abs(32, 630.5, 48, 48),
          background: AVATAR_BG,
          border: '2px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(66, 664.5, 16, 16),
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(92, 622.5, 80.8, 18),
          color: '#141311',
          fontWeight: 800,
          fontSize: 14,
          lineHeight: '17.5px',
        }}
      >
        Diya Kapoor
      </div>
      <div
        style={{
          ...abs(92, 645, 62.4, 15),
          color: '#8C8A84',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        @diyakapoor
      </div>
      <div
        style={{
          ...abs(160.4, 642.5, 48.6, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(167.4, 645.5, 34.6, 14),
          color: '#8C8A84',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        Fashion
      </div>
      {/* single badge */}
      <div
        style={{
          ...abs(92, 666.5, 101, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(101, 672, 9, 9) }}>
        <TrendingDown size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(113, 669.5, 71, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        {' -15% below avg  '}
      </div>
      {/* select button (unselected) */}
      <div
        style={{
          ...abs(318, 623.5, 26, 26),
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 9999,
        }}
      />
      {/* stats strip */}
      <div
        style={{
          ...abs(32, 700.5, 311, 53.5),
          background: '#FFECF3',
          borderRadius: 16,
        }}
      />
      <StatLabel left={48.5} top={710.5} width={58.9} text="FOLLOWERS" />
      <StatValue left={58.9} top={724} width={38.2} text="620K" />
      <Divider left={114} top={715.2} />
      <StatLabel left={136} top={710.5} width={30} text="VIEWS" />
      <StatValue left={131.8} top={724} width={38.5} text="390K" />
      <Divider left={187} top={715.2} />
      <StatLabel left={208.4} top={710.5} width={31.2} text="LEADS" />
      <StatValue left={219.3} top={724} width={9.3} text="8" />
      <Divider left={260} top={715.2} />
      <StatLabel left={283.6} top={712.5} width={26.8} text="PERF." />
      <PerfValue left={275.5} top={726} width={43.1} text="+11.2%" />
      <ActionRow y={771} borderTop={768} />

      {/* ================= CARD 3 — Aryan Seth ================= */}
      <div
        style={{
          ...abs(16, 834, 343, 211.5),
          background:
            'linear-gradient(135deg, rgba(232,243,255,0.8), rgba(255,255,255,0.5))',
          borderRadius: 26,
        }}
      />
      <div
        style={{
          ...abs(32, 858, 48, 48),
          background: AVATAR_BG,
          border: '2px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(66, 892, 16, 16),
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(92, 850, 74, 18),
          color: '#141311',
          fontWeight: 800,
          fontSize: 14,
          lineHeight: '17.5px',
        }}
      >
        Aryan Seth
      </div>
      <div
        style={{
          ...abs(92, 872.5, 56.6, 15),
          color: '#8C8A84',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        @aryanseth
      </div>
      <div
        style={{
          ...abs(154.6, 870, 63.5, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(161.6, 873, 49.5, 14),
          color: '#8C8A84',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        Tech Setup
      </div>
      <div
        style={{
          ...abs(92, 894, 125, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(101, 899.5, 9, 9) }}>
        <TrendingUp size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(113, 897, 95, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        +35% Above Average
      </div>
      <div
        style={{
          ...abs(224, 894, 128, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(233, 899.5, 9, 9) }}>
        <Lightbulb size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(245, 897, 98, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        {' Suggestion:  Increase'}
      </div>
      {/* select button (unselected) */}
      <div
        style={{
          ...abs(318, 851, 26, 26),
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 9999,
        }}
      />
      {/* stats strip */}
      <div
        style={{
          ...abs(32, 928, 311, 53.5),
          background: '#E8F3FF',
          borderRadius: 16,
        }}
      />
      <StatLabel left={48.5} top={938} width={58.9} text="FOLLOWERS" />
      <StatValue left={58.6} top={951.5} width={38.9} text="340K" />
      <Divider left={114} top={942.8} />
      <StatLabel left={136} top={938} width={30} text="VIEWS" />
      <StatValue left={131.7} top={951.5} width={38.6} text="200K" />
      <Divider left={187} top={942.8} />
      <StatLabel left={208.4} top={938} width={31.2} text="LEADS" />
      <StatValue left={219.6} top={951.5} width={8.9} text="5" />
      <Divider left={260} top={942.8} />
      <StatLabel left={283.6} top={940} width={26.8} text="PERF." />
      <PerfValue left={277} top={953.5} width={40} text="+6.8%" />
      <ActionRow y={998.5} borderTop={995.5} />

      {/* ================= CARD 4 — Mia Chen ================= */}
      <div
        style={{
          ...abs(16, 1061.5, 343, 211.5),
          background:
            'linear-gradient(135deg, rgba(233,246,237,0.8), rgba(255,255,255,0.5))',
          borderRadius: 26,
        }}
      />
      <div
        style={{
          ...abs(32, 1085.5, 48, 48),
          background: AVATAR_BG,
          border: '2px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(66, 1119.5, 16, 16),
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(92, 1077.5, 62.3, 18),
          color: '#141311',
          fontWeight: 800,
          fontSize: 14,
          lineHeight: '17.5px',
        }}
      >
        Mia Chen
      </div>
      <div
        style={{
          ...abs(92, 1100, 49.8, 15),
          color: '#8C8A84',
          fontWeight: 400,
          fontSize: 10,
          lineHeight: '15px',
        }}
      >
        @miachen
      </div>
      <div
        style={{
          ...abs(147.8, 1097.5, 54.2, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          ...abs(154.8, 1100.5, 40.2, 14),
          color: '#8C8A84',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        Wellness
      </div>
      <div
        style={{
          ...abs(92, 1121.5, 125, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(101, 1127, 9, 9) }}>
        <TrendingUp size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(113, 1124.5, 95, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        +35% Above Average
      </div>
      <div
        style={{
          ...abs(224, 1121.5, 128, 20),
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
        }}
      />
      <div style={{ ...abs(233, 1127, 9, 9) }}>
        <Lightbulb size={9} color="#141311" strokeWidth={2} />
      </div>
      <div
        style={{
          ...abs(245, 1124.5, 98, 14),
          color: '#141311',
          fontWeight: 700,
          fontSize: 9,
          lineHeight: '13.5px',
        }}
      >
        {' Suggestion:  Increase'}
      </div>
      {/* select button (selected) */}
      <div
        style={{
          ...abs(319, 1079.5, 24, 24),
          background: '#141311',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={11} color="#FAF7F2" strokeWidth={2} />
      </div>
      {/* stats strip */}
      <div
        style={{
          ...abs(32, 1155.5, 311, 53.5),
          background: '#E9F6ED',
          borderRadius: 16,
        }}
      />
      <StatLabel left={48.5} top={1165.5} width={58.9} text="FOLLOWERS" />
      <StatValue left={58.7} top={1179} width={38.6} text="980K" />
      <Divider left={114} top={1170.2} />
      <StatLabel left={136} top={1165.5} width={30} text="VIEWS" />
      <StatValue left={133.8} top={1179} width={34.4} text="710K" />
      <Divider left={187} top={1170.2} />
      <StatLabel left={208.4} top={1165.5} width={31.2} text="LEADS" />
      <StatValue left={216.1} top={1179} width={15.8} text="14" />
      <Divider left={260} top={1170.2} />
      <StatLabel left={283.6} top={1167.5} width={26.8} text="PERF." />
      <PerfValue left={274.9} top={1181} width={44.1} text="+22.1%" />
      <ActionRow y={1226} borderTop={1223} />

      {/* ============ SHARE BUTTON (fixed CTA on top) ============ */}
      <div
        style={{
          ...abs(24, 784, 327, 54.5),
          background: '#312B28',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 15,
            lineHeight: '22.5px',
          }}
        >
          Share Selected Creators
        </span>
      </div>
    </div>
  );
}

/* ---------- small internal render helpers (layout only) ---------- */

function StatLabel(props: { left: number; top: number; width: number; text: string }) {
  return (
    <div
      style={{
        ...abs(props.left, props.top, props.width, 14),
        color: '#8C8A84',
        fontWeight: 400,
        fontSize: 9,
        lineHeight: '13.5px',
        textAlign: 'center',
      }}
    >
      {props.text}
    </div>
  );
}

function StatValue(props: { left: number; top: number; width: number; text: string }) {
  return (
    <div
      style={{
        ...abs(props.left, props.top, props.width, 20),
        color: '#141311',
        fontWeight: 800,
        fontSize: 14,
        lineHeight: '20px',
        textAlign: 'center',
      }}
    >
      {props.text}
    </div>
  );
}

function PerfValue(props: { left: number; top: number; width: number; text: string }) {
  return (
    <div
      style={{
        ...abs(props.left, props.top, props.width, 16),
        color: '#23C16B',
        fontWeight: 800,
        fontSize: 12,
        lineHeight: '16px',
        textAlign: 'center',
      }}
    >
      {props.text}
    </div>
  );
}

function Divider(props: { left: number; top: number }) {
  return <div style={{ ...abs(props.left, props.top, 1, 24), background: '#141311' }} />;
}

function ActionRow(props: { y: number; borderTop: number }) {
  const { y, borderTop } = props;
  return (
    <>
      {/* top separator line */}
      <div style={{ ...abs(32, borderTop, 311, 1), background: '#FFFFFF' }} />
      {/* Profile */}
      <div
        style={{
          ...abs(32, y, 98.3, 31),
          background: '#FFFFFF',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <User size={11} color="#141311" strokeWidth={2} />
        <span style={{ color: '#141311', fontWeight: 600, fontSize: 10, lineHeight: '15px' }}>
          Profile
        </span>
      </div>
      {/* Call */}
      <div
        style={{
          ...abs(138.3, y, 98.3, 31),
          background: '#FFFFFF',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Phone size={13} color="#141311" strokeWidth={1.6} />
        <span style={{ color: '#141311', fontWeight: 600, fontSize: 10, lineHeight: '15px' }}>
          Call
        </span>
      </div>
      {/* Chat */}
      <div
        style={{
          ...abs(244.7, y, 98.3, 31),
          background: '#FFFFFF',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <MessageCircle size={11} color="#141311" strokeWidth={2} />
        <span style={{ color: '#141311', fontWeight: 600, fontSize: 10, lineHeight: '15px' }}>
          Chat
        </span>
      </div>
    </>
  );
}
