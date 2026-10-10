import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, 
  GraduationCap, 
  Users, 
  Briefcase, 
  Rocket, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Layers
} from 'lucide-react';

const CATEGORY_HUBS = [
  {
    id: 'Farmers',
    icon: Sprout,
    tagKey: 'farmersTag',
    descKey: 'farmersDesc',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.05) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    activeBorder: 'rgba(16, 185, 129, 0.9)'
  },
  {
    id: 'Students',
    icon: GraduationCap,
    tagKey: 'studentsTag',
    descKey: 'studentsDesc',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(29, 78, 216, 0.05) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    activeBorder: 'rgba(59, 130, 246, 0.9)'
  },
  {
    id: 'Women',
    icon: Users,
    tagKey: 'womenTag',
    descKey: 'womenDesc',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.16) 0%, rgba(190, 24, 93, 0.05) 100%)',
    borderColor: 'rgba(236, 72, 153, 0.35)',
    activeBorder: 'rgba(236, 72, 153, 0.9)'
  },
  {
    id: 'Businesses',
    icon: Briefcase,
    tagKey: 'businessTag',
    descKey: 'businessDesc',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.05) 100%)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    activeBorder: 'rgba(245, 158, 11, 0.9)'
  },
  {
    id: 'Startups',
    icon: Rocket,
    tagKey: 'startupsTag',
    descKey: 'startupsDesc',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(109, 40, 217, 0.05) 100%)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    activeBorder: 'rgba(139, 92, 246, 0.9)'
  },
  {
    id: 'Senior Citizens',
    icon: ShieldCheck,
    tagKey: 'seniorCitizensTag',
    descKey: 'seniorCitizensDesc',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(14, 116, 144, 0.05) 100%)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    activeBorder: 'rgba(6, 182, 212, 0.9)'
  }
];

const CategoryHub = ({ schemes = [], selectedCategory, onSelectCategory }) => {
  const { t } = useLanguage();

  const getSchemeCount = (catId) => {
    if (!schemes || !Array.isArray(schemes)) return 0;
    return schemes.filter((s) => {
      const cat = (s.category || '').toLowerCase();
      const target = catId.toLowerCase();
      if (cat === target) return true;
      if (target === 'businesses' && (cat.includes('business') || cat.includes('msme'))) return true;
      if (target === 'farmers' && (cat.includes('farmer') || cat.includes('agriculture'))) return true;
      if (target === 'students' && (cat.includes('student') || cat.includes('education'))) return true;
      if (target === 'women' && cat.includes('women')) return true;
      if (target === 'startups' && cat.includes('startup')) return true;
      if (target === 'senior citizens' && (cat.includes('senior') || cat.includes('pension'))) return true;
      return false;
    }).length;
  };

  const handleCardClick = (catId) => {
    if (selectedCategory === catId) {
      onSelectCategory('All');
    } else {
      onSelectCategory(catId);
    }
  };

  return (
    <div style={{ marginBottom: '36px' }}>
      {/* Section Header */}
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
              {t('categoryHubTitle')}
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {t('categoryHubSubtitle')}
          </p>
        </div>

        {selectedCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            style={{
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {t('resetFilters')}
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {CATEGORY_HUBS.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = getSchemeCount(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => handleCardClick(cat.id)}
              style={{
                borderRadius: '16px',
                padding: '20px',
                background: isSelected 
                  ? `radial-gradient(circle at top right, ${cat.color}22 0%, rgba(15, 23, 42, 0.8) 100%)`
                  : cat.gradient,
                border: isSelected 
                  ? `2px solid ${cat.color}`
                  : `1px solid ${cat.borderColor}`,
                boxShadow: isSelected 
                  ? `0 8px 24px -6px ${cat.color}40`
                  : '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px -6px ${cat.color}33`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = cat.borderColor;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
            >
              {/* Card Header: Icon & Count Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: `${cat.color}22`,
                  border: `1px solid ${cat.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} color={cat.color} />
                </div>

                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: cat.color,
                  background: `${cat.color}18`,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: `1px solid ${cat.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={11} />
                  <span>{count > 0 ? `${count} ${t('schemesCount')}` : t('likelyEligible')}</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  color: '#fff',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{t(cat.id)}</span>
                  {isSelected && (
                    <span style={{
                      fontSize: '10px',
                      background: cat.color,
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {t('active')}
                    </span>
                  )}
                </h3>

                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: cat.color,
                  marginBottom: '8px',
                  letterSpacing: '0.2px'
                }}>
                  {t(cat.tagKey)}
                </div>

                <p style={{
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                  margin: '0 0 16px 0'
                }}>
                  {t(cat.descKey)}
                </p>
              </div>

              {/* Card Footer: Action */}
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
                  color: isSelected ? '#fff' : cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {isSelected ? `${t('active')} • ${t('viewCategorySchemes')}` : t('viewCategorySchemes')}
                </span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isSelected ? cat.color : `${cat.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s'
                }}>
                  <ArrowRight size={13} color={isSelected ? '#fff' : cat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryHub;
