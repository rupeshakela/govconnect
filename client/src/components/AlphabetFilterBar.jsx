import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const AlphabetFilterBar = ({ 
  selectedLetter = 'ALL', 
  onSelectLetter, 
  availableLetters = new Set(),
  totalCount = 0,
  activeCount = 0
}) => {
  const { t } = useLanguage();

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '14px 18px',
      marginBottom: '24px'
    }}>
      {/* Top Label & Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
            {t('alphabeticalDirectory', 'Alphabetical Directory (A to Z)')}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            &bull; {t('alphabeticalHint', 'Click any letter to jump directly (e.g. click "J" for JEE Main)')}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {t('showingItems', 'Showing')} <strong style={{ color: '#fff' }}>{activeCount}</strong> {t('ofItems', 'of')} {totalCount} {t('items', 'items')}
          {selectedLetter !== 'ALL' && (
            <span style={{ color: 'var(--accent-primary)', marginLeft: '6px', fontWeight: '700' }}>
              ({t('startingWith', 'Starting with')} "{selectedLetter}")
            </span>
          )}
        </div>
      </div>

      {/* Letters Row */}
      <div 
        className="notranslate" 
        translate="no"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin'
        }}
      >
        {ALPHABET.map((letter) => {
          const isSelected = selectedLetter === letter;
          const hasItems = letter === 'ALL' || availableLetters.has(letter);
          const displayLabel = letter === 'ALL' ? t('allLetters', 'ALL') : letter;

          return (
            <button
              key={letter}
              onClick={() => onSelectLetter(letter)}
              disabled={!hasItems && letter !== 'ALL'}
              className="notranslate"
              translate="no"
              style={{
                minWidth: letter === 'ALL' ? '48px' : '30px',
                height: '32px',
                padding: letter === 'ALL' ? '0 10px' : '0',
                borderRadius: '8px',
                border: isSelected 
                  ? '1px solid var(--accent-primary)' 
                  : (hasItems ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.02)'),
                background: isSelected 
                  ? 'var(--accent-gradient)' 
                  : (hasItems ? 'rgba(255, 255, 255, 0.03)' : 'transparent'),
                color: isSelected 
                  ? '#fff' 
                  : (hasItems ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.18)'),
                fontWeight: isSelected ? '800' : (hasItems ? '600' : '400'),
                fontSize: letter === 'ALL' ? '11px' : '12px',
                cursor: hasItems ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              title={hasItems ? `Filter items starting with ${letter}` : `No items starting with ${letter}`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlphabetFilterBar;
