import { describe, it, expect } from 'vitest';
import { SCHOLARSHIPS_DATA, CENTRAL_SCHOLARSHIPS, STATE_SCHOLARSHIPS, CSR_SCHOLARSHIPS } from '../data/scholarships';

describe('Scholarship Link & Data Audit', () => {
  const REFERENCE_DATE = new Date('2026-10-29T00:00:00Z');

  it('contains comprehensive scholarship schemes with unique IDs across all categories', () => {
    const totalSeparate = CENTRAL_SCHOLARSHIPS.length + STATE_SCHOLARSHIPS.length + CSR_SCHOLARSHIPS.length;
    expect(SCHOLARSHIPS_DATA.length).toBe(totalSeparate);
    expect(SCHOLARSHIPS_DATA.length).toBe(204);
    expect(CENTRAL_SCHOLARSHIPS.length).toBe(70);
    expect(STATE_SCHOLARSHIPS.length).toBe(67);
    expect(CSR_SCHOLARSHIPS.length).toBe(67);

    const ids = SCHOLARSHIPS_DATA.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(204);

    // Verify there are no duplicate names
    const names = SCHOLARSHIPS_DATA.map(s => s.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(204);
  });

  it('verifies that every scholarship has a valid, secure HTTPS official portal URL', () => {
    SCHOLARSHIPS_DATA.forEach(s => {
      expect(s.source.officialUrl, `Scholarship ${s.id} officialUrl must start with https://`).toMatch(/^https:\/\//);
      expect(s.source.officialUrl).not.toContain('example.com');
      expect(s.source.officialUrl).not.toContain('localhost');
      expect(s.source.portalName.trim().length).toBeGreaterThan(0);
      expect(s.source.issuingAuthority.trim().length).toBeGreaterThan(0);
      expect(s.source.isVerified).toBe(true);
      expect(s.source.lastVerifiedDate).toBeTruthy();
    });
  });

  it('ensures application URLs are either verified HTTPS URLs or explicitly marked unverified', () => {
    SCHOLARSHIPS_DATA.forEach(s => {
      if (s.source.isApplicationUrlVerified) {
        expect(s.source.applicationUrl, `Scholarship ${s.id} has verified applicationUrl`).toBeDefined();
        expect(s.source.applicationUrl).toMatch(/^https:\/\//);
      } else {
        // If not verified, applicationUrl should either be falsy (undefined, null, or empty string)
        expect(!s.source.applicationUrl, `Scholarship ${s.id} unverified applicationUrl should be falsy`).toBe(true);
      }
    });
  });

  it('validates status logic against reference date October 29, 2026', () => {
    SCHOLARSHIPS_DATA.forEach(s => {
      expect(['Open', 'Upcoming', 'Closed', 'Unconfirmed']).toContain(s.deadline.status);

      if (s.deadline.status === 'Closed' && s.deadline.closingDate) {
        const closeDate = new Date(s.deadline.closingDate);
        expect(closeDate.getTime(), `Closed scheme ${s.id} deadline must be <= Oct 29, 2026`).toBeLessThanOrEqual(REFERENCE_DATE.getTime());
      }

      if (s.deadline.status === 'Open' && s.deadline.closingDate) {
        const closeDate = new Date(s.deadline.closingDate);
        expect(closeDate.getTime(), `Open scheme ${s.id} deadline must be >= Oct 29, 2026`).toBeGreaterThanOrEqual(REFERENCE_DATE.getTime());
      }
    });
  });

  it('validates specific audited government and corporate scholarship entries', () => {
    // 1. LIC Golden Jubilee
    const lic = SCHOLARSHIPS_DATA.find(s => s.id === 'lic-golden-jubilee');
    expect(lic).toBeDefined();
    expect(lic?.source.officialUrl).toBe('https://licindia.in');
    expect(lic?.source.applicationUrl).toBe('https://gjss.licindia.in/GJSS/');
    expect(lic?.source.isApplicationUrlVerified).toBe(true);

    // 2. Aditya Birla Capital (closed on Oct 25, 2026)
    const birla = SCHOLARSHIPS_DATA.find(s => s.id === 'aditya-birla-capital');
    expect(birla).toBeDefined();
    expect(birla?.deadline.status).toBe('Closed');
    expect(birla?.deadline.closingDate).toBe('2026-10-25');

    // 3. Tata Trusts (no public open application link, unconfirmed)
    const tataMerit = SCHOLARSHIPS_DATA.find(s => s.id === 'tata-trusts-merit');
    expect(tataMerit).toBeDefined();
    expect(tataMerit?.deadline.status).toBe('Unconfirmed');
    expect(tataMerit?.source.isApplicationUrlVerified).toBe(false);

    // 4. Central Sector Scheme (NSP)
    const nsp = SCHOLARSHIPS_DATA.find(s => s.id === 'nsp-csss');
    expect(nsp).toBeDefined();
    expect(nsp?.source.officialUrl).toBe('https://www.education.gov.in/scholarships-education-loan-4');
    expect(nsp?.source.applicationUrl).toBe('https://scholarships.gov.in');
    expect(nsp?.deadline.status).toBe('Open');

    // 5. Siemens
    const siemens = SCHOLARSHIPS_DATA.find(s => s.id === 'siemens-scholarship');
    expect(siemens).toBeDefined();
    expect(siemens?.source.applicationUrl).toBe('https://www.ssp-india.co.in/');
  });

  it('ensures distinct official portal URLs across diverse providers', () => {
    const urls = SCHOLARSHIPS_DATA.map(s => s.source.officialUrl);
    const uniqueDomains = new Set(urls.map(u => new URL(u).hostname));
    const verifiedAppCount = SCHOLARSHIPS_DATA.filter(s => s.source.isApplicationUrlVerified).length;
    const unverifiedAppCount = SCHOLARSHIPS_DATA.filter(s => !s.source.isApplicationUrlVerified).length;
    expect(verifiedAppCount + unverifiedAppCount).toBe(204);

    const openCount = SCHOLARSHIPS_DATA.filter(s => s.deadline.status === 'Open').length;
    const closedCount = SCHOLARSHIPS_DATA.filter(s => s.deadline.status === 'Closed').length;
    const upcomingCount = SCHOLARSHIPS_DATA.filter(s => s.deadline.status === 'Upcoming').length;
    const unconfirmedCount = SCHOLARSHIPS_DATA.filter(s => s.deadline.status === 'Unconfirmed').length;
    expect(openCount + closedCount + upcomingCount + unconfirmedCount).toBe(204);

    console.log(`[AUDIT STATS] Total Unique Official Domains: ${uniqueDomains.size}`);
    console.log(`[AUDIT STATS] Verified Application URLs: ${verifiedAppCount}`);
    console.log(`[AUDIT STATS] Unverified Application URLs (Safely marked): ${unverifiedAppCount}`);
    console.log(`[AUDIT STATS] Status Breakdown - Open: ${openCount}, Closed: ${closedCount}, Upcoming: ${upcomingCount}, Unconfirmed: ${unconfirmedCount}`);
    expect(uniqueDomains.size).toBeGreaterThanOrEqual(50);
  });
});
