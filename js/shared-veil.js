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

function sanitizeHiddenFaceText(text, hideEyes, veilTier, obfuscMode){
  if(!text) return text;
  let out = text;
  const partialVeil = ['40_45', '50'].includes(veilTier);
  const deepVeil = ['65_70', '80_85', '95_100'].includes(veilTier);
  const isObfusc = !!(obfuscMode && obfuscMode !== 'none' && obfuscMode !== 'hair_veil');
  if(hideEyes || deepVeil || isObfusc){
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

function cleanClause(str){
  if(!str) return '';
  return String(str)
    .replace(/^(?:in-progress haircut action|haircut progress|salon moment|active moment)\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/, '')
    .trim();
}

function capFirst(str){
  if(!str) return '';
  const s = String(str).trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stripBuzzwords(str){
  if(!str) return '';
  return String(str)
    .replace(/\bhighly photorealistic,\s*detailed 4K-style image quality\b/gi, 'natural 35mm optical photograph with unclipped dynamic range and organic shadow grain')
    .replace(/\bdetailed 4K-style image quality\b/gi, 'natural optical sensor fidelity and gentle highlight roll-off')
    .replace(/\b4K-style\b/gi, 'high-resolution optical')
    .replace(/\bVector-grade single-needle ink crispness\b/gi, 'Subdermal single-needle micro-stippling with authentic skin pore integration')
    .replace(/\bvector-grade\b/gi, 'subdermal micro-precise')
    .replace(/Shop interior design:\s*harmonized with the selected establishment architectural style[.,;]?\s*/gi, '')
    .replace(/harmonized with the selected establishment architectural style[.,;]?\s*/gi, '');
}

function dedupeNegatives(arr){
  const seen = new Set();
  const out = [];
  (arr || []).forEach(item => {
    String(item || '').split(',').forEach(part => {
      const cleaned = part.trim().replace(/^•\s*/, '');
      const key = cleaned.toLowerCase();
      if(cleaned && !seen.has(key)){
        seen.add(key);
        out.push(cleaned);
      }
    });
  });
  return out;
}

function estimateTokens(text){
  if(!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  // Blended estimate: ~1.3 tokens per word or ~3.8 chars per token
  return Math.max(1, Math.round((words * 1.25 + chars / 4.0) / 2));
}

function extractPositivePrompt(fullText){
  if(!fullText) return '';
  return fullText
    .replace(/\n*(?:AVOID \/ NEGATIVE GUIDANCE:?|Avoid:)\s*[\s\S]*?(?=\n(?:OUTPUT INSTRUCTIONS|OUTPUT|COLOR HARMONY)\b|\n*(?:REFERENCE-IMAGE EDIT|Shot \d+|------------------------------------------------)|$)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractNegativePrompt(fullText){
  if(!fullText) return '';
  const m = fullText.match(/(?:AVOID \/ NEGATIVE GUIDANCE:?|Avoid:)\s*[\s\S]*?(?=\n\n(?:OUTPUT INSTRUCTIONS|OUTPUT|COLOR HARMONY)\b|\n*(?:REFERENCE-IMAGE EDIT|------------------------------------------------)|$)/);
  return m ? m[0].trim() : '';
}

function buildObfuscClause(mode, hairArch){
  const m = mode || 'none';
  if(m === 'none' || m === 'hair_veil') return '';
  switch(m){
    case 'hands_shield':
      return 'FACE CONCEALMENT — HAND & FINGER SHIELD: candid organic hand shielding gesture—she lifts one or both hands naturally toward her face with fingers softly splayed or palm turned inward to shield the eye-line, forehead, and bridge of nose; the gesture reads as an instinctive, unforced candid moment (shading eyes from warm sun or laughing shyly into her hands) rather than theatrical staging; tactile skin texture, delicate knuckle creases, and soft organic hand shadows cast across the concealed facial zone; ZERO bare wide-open eyes visible beneath the hand.';
    case 'prop_shield':
      return 'FACE CONCEALMENT — PROP & OBJECT OCCLUSION: purposeful editorial prop shielding—she holds a realistic storytelling prop directly in front of her facial identity zone: a vintage chrome 35mm rangefinder camera raised to one eye, a takeaway paper coffee cup tilted near the cheek, a dense rustic peony bouquet held high, an open folding silk fan, or oversized dark acetate sunglasses tilted forward; the prop is sharply rendered with crisp tactile material detail while the facial features behind it remain cleanly obscured and out of view.';
    case 'shutter_motion_blur':
      return 'FACE CONCEALMENT — SHUTTER MOTION BLUR: photographic shutter-drag facial blur—captured at an authentic 1/15s slow shutter speed as her head turns briskly mid-motion; her face dissolves into a directional, luminous lateral motion streak and soft kinetic camera-drag blur while her stationary torso, shoulders, and surrounding setting retain sharp focus; a genuine optical shutter-drag artifact with authentic photographic blur streaks, completely dissolving sharp facial identification without plastic artificial smudging.';
    case 'optical_gaussian_blur':
      return 'FACE CONCEALMENT — EDITORIAL GAUSSIAN DEPTH BLUR: soft optical frosted-glass Gaussian depth blur—a gentle, high-fashion circular privacy Gaussian blur disc smoothly envelops her central facial identity zone (eyes, nose bridge, and cheeks) as if diffused through a physical frosted optical filter or extreme focal falloff; her haircut silhouette, ear contours, neck, and outfit remain tack-sharp and crystalline in the foreground, creating a striking avant-garde contrast between razor-sharp hair textures and the silky blurred facial zone.';
    case 'minimalist_censor_bar':
      return 'FACE CONCEALMENT — EDITORIAL PRIVACY BAR: high-fashion editorial censor block—a crisp, matte-black horizontal privacy rectangle or high-resolution geometric pixel mosaic bar is precisely positioned across the eye-line and eyebrow plane; the graphic bar features razor-clean horizontal edges with zero feathering or spill into surrounding skin; her cheeks, nose tip, lips, jawline, and haircut remain photographically sharp and lifelike beneath and around the designer privacy element.';
    case 'chiaroscuro_shadow':
      return 'FACE CONCEALMENT — CHIAROSCURO SILHOUETTE: deep chiaroscuro facial shadow—extreme directional backlight and rim illumination leave the entire facial plane in deep, impenetrable photographic underexposure and velvet shadow; ZERO visible eyeballs, ZERO pupils, ZERO nose highlights, ZERO facial recognition; only the luminous golden rim light along her hair perimeter and shoulder contour defines her form against atmospheric darkness, preserving total facial anonymity through dramatic lighting contrast.';
    default:
      return '';
  }
}

function getObfuscNegatives(mode){
  const m = mode || 'none';
  if(m === 'none' || m === 'hair_veil') return [];
  const base = ['unobscured recognizable face', 'clear frontal facial portrait', 'identifiable face without privacy concealment'];
  switch(m){
    case 'hands_shield':
      return [...base, 'hands down by sides', 'unshielded open face', 'both eyes clearly looking at camera'];
    case 'prop_shield':
      return [...base, 'prop held down', 'unobstructed open face', 'clear face without prop'];
    case 'shutter_motion_blur':
      return [...base, 'pin-sharp frozen face', 'motionless static head', 'sharp eye pupils'];
    case 'optical_gaussian_blur':
      return [...base, 'sharp facial skin pores in blur zone', 'clear sharp eyes', 'unblurred open face'];
    case 'minimalist_censor_bar':
      return [...base, 'uncovered eyes', 'missing privacy bar', 'clear eyes visible'];
    case 'chiaroscuro_shadow':
      return [...base, 'front flash on face', 'brightly illuminated face', 'clear facial features in shadow'];
    default:
      return base;
  }
}

global.AfterglowVeil = {
  parseVeilTier,
  detectHairArchitecture,
  getVeilRule,
  sanitizeHairForVeil,
  sanitizeMakeupForVeil,
  sanitizeHiddenFaceText,
  cleanClause,
  capFirst,
  stripBuzzwords,
  dedupeNegatives,
  estimateTokens,
  extractPositivePrompt,
  extractNegativePrompt,
  buildObfuscClause,
  getObfuscNegatives
};
})(window);
