/**
 * /admin/subscriptions — subscription tier overview.
 * Server Component — purely static display.
 */

const TIERS = [
  {
    number: 0, name: 'Citizen', price: 0, capsPerDay: 5, maxCharacters: 1,
    color: '#888',
    features: ['1 Character slot', '5 CAPS per day', 'Generic character portrait', 'Access to free campaigns'],
  },
  {
    number: 1, name: 'Household Hero', price: 4.99, capsPerDay: 15, maxCharacters: 2,
    color: '#00D4FF',
    features: ['2 Character slots', '15 CAPS per day', 'Basic portrait customization', 'Upload your own photo', 'Stock travel/combat animations'],
  },
  {
    number: 2, name: 'Neighborhood Hero', price: 9.99, capsPerDay: 30, maxCharacters: 4,
    color: '#8844CC',
    features: ['4 Character slots', '30 CAPS per day', 'Greater portrait customization', 'Character-featured cutscenes', 'Custom transitions'],
  },
  {
    number: 3, name: 'Superhero', price: 14.99, capsPerDay: 60, maxCharacters: 999,
    color: '#B8860B',
    features: ['Unlimited characters', '60 CAPS per day', 'Text prompt portrait generation', 'Sidekick assistant (3×/day)', 'Enhanced animations'],
  },
  {
    number: 4, name: 'Archon', price: 24.99, capsPerDay: 120, maxCharacters: 999,
    color: '#CC0000',
    features: ['Unlimited characters', '120 CAPS per day', 'Full portrait customization', 'Team Up action (1×/day)', 'Best cutscenes & transitions', 'All Superhero perks'],
  },
]

export default function SubscriptionsPage() {
  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        SUBSCRIPTION TIERS
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>Tier configuration and feature overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {TIERS.map(tier => (
          <div key={tier.number} style={{
            background: '#1A1A1A', border: `1px solid #2A2A2A`,
            borderTop: `3px solid ${tier.color}`, borderRadius: '8px', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: tier.color, letterSpacing: '0.05em' }}>
                  {tier.name}
                </div>
                <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>Tier {tier.number}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: 'white' }}>
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                </div>
                {tier.price > 0 && <div style={{ color: '#666', fontSize: '11px' }}>/month</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div>
                <div style={{ color: '#888', fontSize: '10px', letterSpacing: '0.1em' }}>CAPS/DAY</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: tier.color }}>{tier.capsPerDay}</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '10px', letterSpacing: '0.1em' }}>MAX CHARS</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: tier.color }}>
                  {tier.maxCharacters === 999 ? '∞' : tier.maxCharacters}
                </div>
              </div>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {tier.features.map(f => (
                <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '12px', color: '#C0C0C0' }}>
                  <span style={{ color: tier.color, flexShrink: 0 }}>▸</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
