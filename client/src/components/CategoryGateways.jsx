import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Rocket, 
  Sprout, 
  Users, 
  BookOpen, 
  HeartPulse, 
  ArrowRight, 
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

const GATEWAYS = [
  {
    id: 'Exams',
    title: 'Competitive Exams',
    hindiTitle: 'प्रतियोगी परीक्षाएं',
    description: 'National entrance & recruitment examinations including JEE Main, NEET, UPSC CSE, SSC CGL, GATE, CAT, and NDA.',
    examples: 'JEE Main, NEET-UG, UPSC CSE, GATE, CAT, CLAT',
    icon: GraduationCap,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(126, 34, 206, 0.04) 100%)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badge: '18+ National Exams'
  },
  {
    id: 'Jobs',
    title: 'Government Jobs',
    hindiTitle: 'सरकारी भर्तियां',
    description: 'Official recruitment notices across Central Ministries, UPSC, SSC, Railways (RRB), Public Sector Banks, and State PSCs.',
    examples: 'UPSC Civil Services, SSC CGL, RRB NTPC, IBPS PO, Defence',
    icon: Briefcase,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(29, 78, 216, 0.04) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    badge: '31+ Live Openings'
  },
  {
    id: 'Schemes',
    title: 'Government Schemes',
    hindiTitle: 'सरकारी योजनाएं',
    description: 'Central & State direct benefit transfer (DBT) initiatives, PM Surya Ghar solar aid, housing subsidies, and public welfare.',
    examples: 'PM-Kisan, PM Surya Ghar, Ayushman Bharat, PMAY Housing',
    icon: FileText,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.04) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badge: '55+ Public Schemes'
  },
  {
    id: 'Startups',
    title: 'Startups & MSME Grants',
    hindiTitle: 'स्टार्टअप और अनुदान',
    description: 'Early-stage seed capital, collateral-free credit guarantees, DPIIT tax benefits, and MSME working capital loans.',
    examples: 'Startup India Seed Fund, Stand-Up India, Mudra Yojana, CGTMSE',
    icon: Rocket,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.04) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badge: '₹50L Max Grant / Loan'
  },
  {
    id: 'Farmers',
    title: 'Farmers & Agriculture',
    hindiTitle: 'किसान कल्याण',
    description: 'Direct agricultural income support, crop insurance coverage (PMFBY), solar irrigation pumps, and low-interest credit.',
    examples: 'PM-KISAN, PM Kusum Solar, PM Fasal Bima, Kisan Credit',
    icon: Sprout,
    color: '#059669',
    gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.18) 0%, rgba(4, 120, 87, 0.04) 100%)',
    borderColor: 'rgba(5, 150, 105, 0.35)',
    glowColor: 'rgba(5, 150, 105, 0.4)',
    badge: 'Agricultural Aid'
  },
  {
    id: 'Women',
    title: 'Women & Child Welfare',
    hindiTitle: 'महिला सशक्तिकरण',
    description: 'Direct monthly transfers, girl child education savings, maternal assistance, and collateral-free self-help group loans.',
    examples: 'Sukanya Samriddhi, Ladli Bahna, Lakhpati Didi, PMMVY',
    icon: Users,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.18) 0%, rgba(190, 24, 93, 0.04) 100%)',
    borderColor: 'rgba(236, 72, 153, 0.35)',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    badge: 'Women Empowerment'
  },
  {
    id: 'Students',
    title: 'Students & Scholarships',
    hindiTitle: 'छात्रवृत्तियां व शिक्षा',
    description: 'National and state merit scholarships, overseas master/Ph.D fellowships, and subsidized educational credit.',
    examples: 'NSP Scholarships, National Overseas Scheme, AICTE Fellowships',
    icon: BookOpen,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(79, 70, 229, 0.04) 100%)',
    borderColor: 'rgba(99, 102, 241, 0.35)',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    badge: 'Education Support'
  },
  {
    id: 'Healthcare',
    title: 'Healthcare & Medical Aid',
    hindiTitle: 'स्वास्थ्य एवं चिकित्सा',
    description: 'Cashless hospital treatment up to ₹5 Lakhs, subsidized generic medicine stores, and universal healthcare security.',
    examples: 'Ayushman Bharat PM-JAY, Jan Aushadhi Stores, Free Treatment',
    icon: HeartPulse,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(14, 116, 144, 0.04) 100%)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    badge: 'Up to ₹5L Cashless'
  }
];

const CategoryGateways = ({ activeCategory, onSelectCategory }) => {
  return (
    <div style={{ marginBottom: '36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={16} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Official Category Portals (नागरिक सेवा श्रेणियां)
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Select your desired portal below to explore opportunities organized in alphabetical order (A–Z).
          </p>
        </div>

        {activeCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            style={{
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Show All Portals</span>
          </button>
        )}
      </div>

      {/* Grid of Gateways */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {GATEWAYS.map((gate) => {
          const Icon = gate.icon;
          const isSelected = activeCategory === gate.id;

          return (
            <div
              key={gate.id}
              onClick={() => onSelectCategory(isSelected ? 'All' : gate.id)}
              style={{
                borderRadius: '18px',
                padding: '22px',
                background: isSelected
                  ? `radial-gradient(circle at top right, ${gate.color}25 0%, rgba(15, 23, 42, 0.85) 100%)`
                  : gate.gradient,
                border: isSelected
                  ? `2px solid ${gate.color}`
                  : `1px solid ${gate.borderColor}`,
                boxShadow: isSelected
                  ? `0 10px 28px -6px ${gate.color}45`
                  : '0 4px 14px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = gate.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 10px 24px -6px ${gate.color}35`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = gate.borderColor;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              {/* Header: Icon & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${gate.color}22`,
                  border: `1px solid ${gate.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} color={gate.color} />
                </div>

                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: gate.color,
                  background: `${gate.color}18`,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: `1px solid ${gate.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={11} />
                  <span>{gate.badge}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  color: '#fff',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{gate.title}</span>
                  {isSelected && (
                    <span style={{
                      fontSize: '10px',
                      background: gate.color,
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Active
                    </span>
                  )}
                </h3>

                <div style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  color: gate.color,
                  marginBottom: '8px'
                }}>
                  {gate.hindiTitle}
                </div>

                <p style={{
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                  margin: '0 0 12px 0'
                }}>
                  {gate.description}
                </p>

                <div style={{
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <strong style={{ color: '#cbd5e1' }}>Popular:</strong> {gate.examples}
                </div>
              </div>

              {/* Footer Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: isSelected ? '#fff' : gate.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {isSelected ? `Active • Browsing A-Z List` : `Enter Section (A-Z)`}
                </span>

                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: isSelected ? gate.color : `${gate.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowRight size={14} color={isSelected ? '#fff' : gate.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGateways;
