(function(global){
'use strict';

function parseVeilTier(label){
  const l = label || '';
  if(!l || l.startsWith('Auto')) return 'auto';
  if(l.startsWith('0%')) return '0';
  if(/10–15%|10-15%/i.test(l)) return '10_15';
  if(/25–30%|25-30%/i.test(l)) return '25_30';
  if(/40–45%|40-45%/i.test(l)) return '40_45';
  if(/50%/i.test(l)) return '50';
  if(/65–70%|65-70%/i.test(l)) return '65_70';
  if(/80–85%|80-85%/i.test(l)) return '80_85';
  if(/95–100%|95-100%/i.test(l)) return '95_100';
  return 'auto';
}

function detectHairArchitecture(hairObj, hairText){
  const cat = (hairObj?.cat || '').toLowerCase();
  const blob = ((hairObj?.label || '') + ' ' + (hairText || '')).toLowerCase();
  if(cat === 'pony' || cat === 'braid' || /ponytail|\bpony\b|\bbun\b|chignon|\bbraid|updo|french twist|topknot|claw clip|slicked[- ]back|comb[- ]back/i.test(blob)){
    return 'tied_slick';
  }
  if(cat === 'pixie' || /\bpixie\b|\bbixie\b|\bmixie\b|garçonne|short textured crop|short side-part crop/i.test(blob)){
    return 'pixie_crop';
  }
  if(/\bmicro bob\b|french bob|\bchin-length\b|\bchin-grazing\b|\bchin bob\b|\bbox bob\b|\bpageboy\b|\bwedge bob\b|\bear-length\b/i.test(blob) || (cat === 'bob' && !/lob|shoulder|collarbone|clavicle|waterfall|long|midi/i.test(blob))){
    return 'chin_bob';
  }
  return 'long_layered';
}

function getVeilRule(tier, hairArch){
  const archNotes = {
    tied_slick: ' HAIRCUT ARCHITECTURE RULE: Keep the ponytail, bun, braid, or slicked back crown 100% neatly secured at the back crown—achieve this exact facial coverage via wide, sleek, fine-tooth-combed front/side bang panels draped cleanly across the specified facial landmarks plus a 3/4 chin-tucked head angle.',
    pixie_crop: ' HAIRCUT ARCHITECTURE RULE: Keep the crisp cropped pixie crown & nape true to cut—achieve coverage via heavy sleek forward-combed side-swept crop fringe firmly covering the specified facial landmarks plus a 3/4 chin-tucked angle (never grow long chest strings).',
    chin_bob: ' HAIRCUT ARCHITECTURE RULE: Strictly keep the bob hem ending crisply at chin/jawline level—achieve coverage via a continuous, glossy, fine-tooth-combed satin bob front/side sheet ending cleanly at the jawline (never sprout stray chest-length strings below the chin).',
    long_layered: ' HAIRCUT ARCHITECTURE RULE: Integrate coverage seamlessly into the layered/long cut using a continuous, glossy, fine-tooth-combed Veronica-Lake satin sweep or dense aligned front cascade stopping cleanly at the cut perimeter.'
  };
  const ribbonCohesion = ' RIBBON COHESION RULE: Hair covering the face MUST read as a continuous, smooth, fine-tooth-combed glossy satin sheet with crisp combed alignment and zero thin patchy skin gaps—NEVER separated messy wet spaghetti strings or scraggly uneven tendrils dangling over mouth and chin.';
  const aNote = (archNotes[hairArch] || '') + ribbonCohesion;
  const RULES = {
    '0': {
      strict: 'MANDATORY ZERO-VEIL ENFORCEMENT: 100% unobstructed full facial visibility. Every front strand is swept back, tucked cleanly behind ears, or styled completely away from forehead, eyes, cheeks, and jawline. ZERO hair strands crossing or touching the face.',
      primary: '',
      neg: 'hair strands covering eyes, hair falling across cheeks or obscuring forehead, messy bangs touching eyes, hair obstructing face'
    },
    '10_15': {
      strict: 'MANDATORY TEMPLE WISPS ENFORCEMENT: Crisp dark temple wisps and cheekbone-skimming front locks frame both outer edges (~10–15% facial perimeter framing), leaving eyes, brows, nose bridge, and cheeks clearly open.',
      primary: '',
      neg: 'hair pulled strictly behind ears with zero temple strands, heavy hair curtain blocking face, obscured eyes, heavy bangs covering forehead'
    },
    '25_30': {
      strict: `MANDATORY ASYMMETRIC SWEEP (25–30% VEILED): Smooth continuous glossy diagonal side-part swoop or crisp heavy side bang MUST physically overlap and hide one eyebrow and upper outer eye corner (~25–30% solid coverage) seamlessly integrated into her chosen haircut.${aNote}`,
      primary: '• Mandatory Asymmetric Hair-Veil Lock (25–30%): Sculpt a continuous, glossy diagonal hair sweep that physically overlaps and hides one eyebrow and outer eye quadrant cleanly within the haircut silhouette.',
      neg: 'both eyebrows and eyes completely uncovered with zero hair touching brow, separated wispy noodles hanging over mouth, cheap stringy wet hair pasted over open face'
    },
    '40_45': {
      strict: `MANDATORY ONE-EYE OCCLUSION (40–45% VEILED): A lush, continuous, glossy Veronica-Lake diagonal wave or sleek fine-tooth-combed front panel MUST physically cover 100% of ONE full eye, its eyebrow, temple, and cheekbone—ZERO eyeball, pupil, or eyelashes visible on that covered eye—matched strictly to the haircut's real length while the opposite eye remains sharp.${aNote}`,
      primary: '• Mandatory One-Eye Hair-Veil Lock (40–45%): ONE ENTIRE EYE and its eyebrow MUST BE 100% HIDDEN (zero eyeball/pupil visible on the covered side) behind a smooth, continuous, fine-tooth-combed glossy hair wave/panel matching her haircut length; only the opposite eye stays visible.',
      neg: 'both eyes visible simultaneously, covered eye peeking through thin transparent bangs, separated messy wet spaghetti strings over mouth and chin, Sadako horror-movie unkempt hair, mismatched chest-length front strings'
    },
    '50': {
      strict: `MANDATORY 50/50 VERTICAL FACE SPLIT: A continuous, solid, fine-tooth-combed diagonal satin hair sheet MUST glide from a deep side part across 100% of ONE ENTIRE VERTICAL HALF (50%) of the face—covered eye, eyebrow, cheek, and nostril wall MUST be 100% invisible (ZERO eyeball/skin peeking through gaps), matched strictly to her haircut length.${aNote}`,
      primary: '• Mandatory 50/50 Split Hair-Veil Lock (50%): ONE FULL VERTICAL HALF OF HER FACE (that entire eye, brow, cheek) MUST BE 100% HIDDEN behind a continuous, sleek, fine-tooth-combed satin hair sheet matched to her haircut length, zero skin peeking through.',
      neg: 'both eyes visible simultaneously, symmetrical open face, thin translucent wisps showing covered eye underneath, separated messy wet spaghetti strings over nose and lips, Sadako unkempt hair, mismatched front length past cut hem'
    },
    '65_70': {
      strict: `MANDATORY TWO-THIRDS HEAVY OCCLUSION (65–70% VEILED): A thick, continuous, fine-tooth-combed satin front cascade + diagonal cheek sweep combined with a 3/4 chin-dipped pose MUST cover 100% of her forehead, BOTH eyebrows, nose bridge, and ONE FULL EYE—ZERO wide-open eyes visible (at most a faint dark corner lash glimpse + lower lips exposed, zero patchy skin gaps).${aNote}`,
      primary: '• Mandatory Two-Thirds Hair-Veil Lock (65–70%): Forehead, BOTH eyebrows, nose bridge, and one full eye MUST BE 100% HIDDEN (zero open wide eyes) behind a sleek, continuous, fine-tooth-combed satin hair sweep matched strictly to her haircut length paired with a 3/4 chin dip.',
      neg: 'both eyes clearly visible, bare open forehead or visible eyebrows, thin transparent bangs showing eyeballs underneath, separated messy wet spaghetti strings dangling over mouth and chin, Sadako unkempt hair'
    },
    '80_85': {
      strict: `ABSOLUTE ZERO VISIBLE EYES RULE (80–85% UPPER-FACE LOCKDOWN): ZERO eyeballs, ZERO pupils, ZERO eyelashes, ZERO eyebrows, and ZERO bare forehead anywhere in frame. A solid, continuous, fine-tooth-combed glossy satin sheet of front/diagonal hair (matched strictly to the haircut's true hem length, paired with slight chin dip) cleanly covers 100% of forehead, both eyebrows, both eyes, and nose bridge down to upper-lip level—exclusively lower lips and chin peek cleanly below the smooth hair edge.${aNote}`,
      primary: '• ABSOLUTE ZERO-EYES HAIR SHIELD (80–85%): ZERO visible eyeballs, ZERO pupils, ZERO eyebrows, ZERO bare forehead anywhere in frame—100% of her upper face (forehead, both eyes, nose bridge) MUST BE HIDDEN behind a sleek, continuous, fine-tooth-combed glossy hair sheet/bangs matched to her haircut length + slight chin dip, leaving only lower lips and chin below.',
      neg: 'visible eyes, visible eyeballs or pupils, peeking eye through thin bangs, visible eyebrows, bare open forehead, separated messy wet spaghetti strings hanging over mouth and chin, thin patchy strands showing eyes underneath, Sadako horror-movie hair, mismatched long chest strings past cut hem'
    },
    '95_100': {
      strict: `ABSOLUTE ZERO VISIBLE FACIAL FEATURES RULE (95–100% FULL SILHOUETTE & HAIR VEIL): ZERO eyes, ZERO eyeballs, ZERO eyebrows, ZERO forehead, ZERO nose tip, and ZERO mouth/lips visible anywhere in frame. Achieve 95–100% total facial concealment cleanly by combining a continuous, sleek, fine-tooth-combed glossy satin cascade tailored strictly to the chosen haircut's true hem length WITH a chin-tucked / 3/4-angled head pose so her entire face sits cleanly hidden without sloppy dangling wet noodles over open lips.${aNote}`,
      primary: '• ABSOLUTE ZERO-FACE CONCEALMENT LOCK (95–100%): ZERO visible eyes, ZERO eyebrows, ZERO forehead, ZERO nose, ZERO mouth/lips anywhere in frame—95–100% of her face MUST be cleanly hidden behind a continuous, sleek, fine-tooth-combed glossy hair veil matched strictly to her haircut length + chin-tucked / 3/4-angled poise.',
      neg: 'hair pulled behind ears exposing bare forehead, visible eyes, visible eyeballs, visible nose tip, visible lips or open mouth, bare open forehead, thin patchy strands revealing eyes, separated messy wet spaghetti strings over open face, Sadako or The Ring horror-movie unkempt strings'
    }
  };
  return RULES[tier] || null;
}

function sanitizeHairForVeil(hairText, tier){
  // Intentionally preserve 100% of the chosen haircut's true architecture & length (no loose-string overwrites)
  return hairText;
}

function sanitizeMakeupForVeil(makeupText, tier){
  if(!makeupText || !['65_70', '80_85', '95_100'].includes(tier)) return makeupText;
  return makeupText
    .replace(/\b(?:winged black eyeliner|winged eyeliner|dramatic eyeliner|smoky eye shadow|smoky eyes|kohl-rimmed eyes|kohl-lined eyes|mascara|defined dark eyebrows|sculpted brows)\b/gi, 'subtle skin-matched finish')
    .replace(/\beyes\b/gi, 'skin');
}

function sanitizeHiddenFaceText(text, hideEyes, veilTier){
  if(!text) return text;
  let out = text;
  const partialVeil = ['40_45', '50'].includes(veilTier);
  const deepVeil = ['65_70', '80_85', '95_100'].includes(veilTier);
  if(hideEyes || deepVeil){
    out = out
      .replace(/holding direct, confident eye contact with [^,.]+,?/gi, 'keeping serene facial composure,')
      .replace(/holding direct, confident eye contact/gi, 'keeping serene facial composure')
      .replace(/direct eye contact/gi, 'relaxed serene composure')
      .replace(/eye contact/gi, 'poised composure')
      .replace(/watching [^,.]*in the mirror/gi, 'reclining calmly')
      .replace(/glancing [^,.]*toward the lens[^,.]*/gi, 'angled quietly with unforced poise')
      .replace(/bright, candid dark eyes looking [^,.]*/gi, 'soft, serene expression')
      .replace(/bright natural eyes/gi, 'serene expression')
      .replace(/bright eyes,/gi, 'relaxed expression,')
      .replace(/crinkled eyes/gi, 'warm natural smile')
      .replace(/attentive, appreciative gaze focused on[^,.]+/gi, 'calm, contented expression');
  } else if(partialVeil){
    out = out
      .replace(/both eyes/gi, 'her single uncovered eye')
      .replace(/symmetrical/gi, 'asymmetric veiled')
      .replace(/hair tucked behind ears/gi, 'thick front hair pulled forward over one eye')
      .replace(/eye contact/gi, 'one-eyed gaze from behind the asymmetric hair curtain');
  }
  return out.replace(/ {2,}/g, ' ').trim();
}

function extractPositivePrompt(fullText){
  if(!fullText) return '';
  return fullText
    .replace(/\n*AVOID \/ NEGATIVE GUIDANCE:?[\s\S]*?(?=\n(?:OUTPUT INSTRUCTIONS|OUTPUT|COLOR HARMONY)\b|\n*REFERENCE-IMAGE EDIT|$)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractNegativePrompt(fullText){
  if(!fullText) return '';
  const m = fullText.match(/AVOID \/ NEGATIVE GUIDANCE:?[\s\S]*?(?=\n\n(?:OUTPUT INSTRUCTIONS|OUTPUT|COLOR HARMONY)\b|\n*REFERENCE-IMAGE EDIT|$)/);
  return m ? m[0].trim() : '';
}

global.AfterglowVeil = {
  parseVeilTier,
  detectHairArchitecture,
  getVeilRule,
  sanitizeHairForVeil,
  sanitizeMakeupForVeil,
  sanitizeHiddenFaceText,
  extractPositivePrompt,
  extractNegativePrompt
};
})(window);
