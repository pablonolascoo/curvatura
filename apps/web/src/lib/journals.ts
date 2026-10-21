import "server-only";

/** Nombre canónico de revista a partir de venues de arXiv (abreviados) y OpenAlex (largos). */
const RULES: [RegExp, string][] = [
  [/^phys(ical)?\.?\s*rev(iew)?\.?\s*d\b|physical review\. d/i, "Physical Review D"],
  [/^phys(ical)?\.?\s*rev(iew)?\.?\s*lett/i, "Physical Review Letters"],
  [/^phys(ical)?\.?\s*rev(iew)?\.?\s*a\b|physical review\. a/i, "Physical Review A"],
  [/class(ical)?\.?\s*(and|&)?\s*quant(um)?\.?\s*grav/i, "Classical and Quantum Gravity"],
  [/gen(eral)?\.?\s*rel(ativity)?\.?\s*(and)?\s*grav/i, "General Relativity and Gravitation"],
  [/eur(opean)?\.?\s*phys(ical)?\.?\s*j(ournal)?\.?\s*c\b/i, "The European Physical Journal C"],
  [/^j(ournal)?\.?\s*(of)?\s*high\s*energy\s*phys|^jhep/i, "Journal of High Energy Physics"],
  [/^phys(ics)?\.?\s*lett(ers)?\.?\s*b\b/i, "Physics Letters B"],
  [/cosmol(ogy)?\.?\s*(and)?\s*astropart|^jcap/i, "Journal of Cosmology and Astroparticle Physics"],
  [/int(ernational)?\.?\s*j(ournal)?\.?\s*(of)?\s*mod(ern)?\.?\s*phys(ics)?\.?\s*d/i, "International Journal of Modern Physics D"],
  [/^universe\b/i, "Universe"],
  [/^ann(als)?\.?\s*(of)?\s*phys/i, "Annals of Physics"],
  [/living\s*rev(iews)?\.?\s*(in)?\s*rel/i, "Living Reviews in Relativity"],
  [/^nature\b/i, "Nature"],
  [/^phys(ics)?\.?\s*dark\s*univ/i, "Physics of the Dark Universe"],
  [/^symmetry\b/i, "Symmetry"],
  [/open\s*j(ournal)?\.?\s*(of)?\s*astrophys/i, "The Open Journal of Astrophysics"],
  [/new\s*j(ournal)?\.?\s*(of)?\s*phys/i, "New Journal of Physics"],
  [/am(erican)?\.?\s*j(ournal)?\.?\s*(of)?\s*phys/i, "American Journal of Physics"],
  [/fortschr|fortschritte/i, "Fortschritte der Physik"],
  [/^j(ournal)?\.?\s*(of)?\s*phys(ics)?\.?\s*a\b/i, "Journal of Physics A"],
];

export function canonicalJournal(venue: string): string | null {
  const v = venue.trim();
  for (const [re, name] of RULES) if (re.test(v)) return name;
  return null;
}

export function topJournals(venues: string[], n: number): string[] {
  const count = new Map<string, number>();
  for (const v of venues) {
    const c = canonicalJournal(v);
    if (c) count.set(c, (count.get(c) ?? 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}
