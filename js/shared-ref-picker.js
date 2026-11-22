/**
 * Afterglow Studio Suite — Selective Reference Feature Transfer & AI Face Generation Engine
 * Shared universal module across all 7 studio applications:
 * photoshoot.html, salon.html, tattoo.html, makeup_spa.html, video.html, storyboard.html, romance.html
 */

(function(root) {
  'use strict';

  // Feature metadata
  const FEATURES = {
    haircut: {
      id: 'haircut',
      label: 'Hairstyle & Cut',
      icon: '💇‍♀️',
      desc: 'Replicate exact haircut, parting, length & silhouette from reference'
    },
    hairTexture: {
      id: 'hairTexture',
      label: 'Hair Texture',
      icon: '🧬',
      desc: 'Preserve natural hair strand thickness, follicle density & organic finish'
    },
    hairColor: {
      id: 'hairColor',
      label: 'Hair Color',
      icon: '🎨',
      desc: 'Replicate exact hair color, tones, and highlights from reference'
    },
    wardrobe: {
      id: 'wardrobe',
      label: 'Clothes & Wardrobe',
      icon: '👗',
      desc: 'Faithfully replicate clothing cut, garments, fabric & styling from reference'
    },
    makeup: {
      id: 'makeup',
      label: 'Makeup Styling',
      icon: '💄',
      desc: 'Replicate makeup, lip tone, eyeliner & skin finish from reference'
    },
    accessories: {
      id: 'accessories',
      label: 'Accessories & Jewelry',
      icon: '💎',
      desc: 'Preserve signature jewelry, piercings & accessories from reference'
    },
    pose: {
      id: 'pose',
      label: 'Pose & Stance',
      icon: '🧘',
      desc: 'Mirror exact body pose, shoulder angle & stance from reference'
    },
    background: {
      id: 'background',
      label: 'Setting & Background',
      icon: '🏛️',
      desc: 'Maintain exact background environment & setting from reference'
    }
  };

  // Fresh AI Face Archetypes for breaking reference face latent pull
  const FACE_ARCHETYPES = {
    auto: {
      id: 'auto',
      label: '✨ Auto Distinct',
      shortLabel: 'Auto Distinct',
      tokens: 'distinct high-fashion bone structure with defined cheekbones, sculpted facial anatomy with piercing almond eyes and refined eyelids, slender straight nose bridge with crisp defined tip, sculpted neutral lips with sharp Cupid\'s bow, and a clean tapered architectural jawline'
    },
    chiseled: {
      id: 'chiseled',
      label: '💎 Chiseled / Editorial',
      shortLabel: 'Chiseled',
      tokens: 'chiseled architectural bone structure with sharp prominent high cheekbones, elongated piercing almond eyes with lifted outer corners, narrow straight razor-defined nose bridge, sculpted architectural lips with sharp Cupid\'s bow, deep defined hollow cheek contours, and a razor-sharp editorial jawline'
    },
    soft_oval: {
      id: 'soft_oval',
      label: '🌸 Soft Oval / Almond Eyes',
      shortLabel: 'Soft Oval',
      tokens: 'classic soft oval facial silhouette with a gentle rounded jawline, harmonious facial geometry, luminous almond eyes with soft natural eyelids, slender gently sloping nose bridge with petite tip, petal-soft balanced lips with defined Cupid\'s bow, and a soft naturally rounded feminine chin'
    },
    heart: {
      id: 'heart',
      label: '💖 Heart-Shaped',
      shortLabel: 'Heart-Shaped',
      tokens: 'distinct heart-shaped face with a delicate tapered chin, high arched brows, radiant expressive wide doe eyes with lifted outer corners, delicate petite nose with narrow bridge and small refined tip, plush lips with heart-peaked Cupid\'s bow, and wide prominent high cheekbones tapering to a dainty chin'
    },
    square: {
      id: 'square',
      label: '🏛️ Square Runway',
      shortLabel: 'Square Runway',
      tokens: 'bold high-fashion square jawline with clean angular bone structure, commanding architectural geometry, intense deep-set almond eyes, strong straight nose bridge with uniform width, crisp defined lips, and structured flat cheek planes with clean bilateral jaw angles'
    },
    round: {
      id: 'round',
      label: '✨ Round Soft',
      shortLabel: 'Round Soft',
      tokens: 'youthful soft rounded facial contours, gently curved jawline, bright expressive eyes, short petite nose with gentle low bridge and soft rounded tip, natural plush lips with soft curving Cupid\'s bow, and supple rounded cheek planes'
    },
    diamond: {
      id: 'diamond',
      label: '💠 Diamond Sculpted',
      shortLabel: 'Diamond',
      tokens: 'diamond-shaped facial contour with narrow forehead, prominent wide cheekbones, dramatic slanted feline almond eyes with winged outer corners, slender high-contrast nose bridge with sculpted tapered tip, sharply contoured lips with sharp Cupid\'s bow, and a sharp narrow triangular V-line chin'
    }
  };

  // Field mapping across all studios
  const FIELD_FEATURE_MAP = {
    haircut: [
      'hair', 'salonHaircut', 'tattooHair', 'prepHair', 'vidHair', 'sbHair', 'romanceHair', 'gymHair',
      'hairCategory', 'salonHairCategory', 'tattooHairCategory', 'prepHairCategory',
      'vidHairCategory', 'sbHairCategory', 'romanceHairCategory', 'gymHairCategory',
      'fringe', 'parting', 'hairLength', 'hairVolume', 'fringeDetail', 'gymHairRestraint'
    ],
    hairTexture: [
      'hairTexture', 'salonHairTexture', 'prepHairTexture'
    ],
    hairColor: [
      'hairColor', 'hairColorTechnique', 'hairFinish', 'prepColorTechnique'
    ],
    wardrobe: [
      'outfit', 'outfitCategory', 'topCategory', 'topPiece', 'bottomCategory', 'bottomPiece',
      'midriffStyling', 'outfitFit', 'palette', 'fabric', 'neckline', 'sleeves', 'layering',
      'prepWardrobe', 'prepWardrobeCategory', 'prepTopPiece', 'prepBottomPiece',
      'vidOutfit', 'vidOutfitCategory', 'vidTopPiece', 'vidBottomPiece',
      'sbOutfit', 'sbOutfitCategory', 'sbTopPiece', 'sbBottomPiece',
      'romanceOutfit', 'romanceOutfitCategory', 'gymOutfit'
    ],
    makeup: [
      'makeup', 'lipLook', 'eyeLook', 'browStyle', 'complexion',
      'prepMakeupStage', 'prepLipStyle', 'prepEyeStyle', 'prepSkinFinish', 'prepFacialMask',
      'gymSweatLevel'
    ],
    accessories: [
      'accessories', 'eyewear', 'bag', 'footwear', 'nailStyle', 'hairAccessories',
      'gymFootwear', 'gymGearProp'
    ],
    pose: [
      'pose', 'poseCategory', 'tattooPose', 'romancePose', 'gesture', 'mood',
      'salonChairPose', 'salonBarberPose', 'salonIntimateHairAction', 'salonStoolModelPosture',
      'prepPose', 'vidFacialMicroMotion',
      'gymMovement', 'gymPhase'
    ],
    background: [
      'background', 'sceneCategory', 'placeDetail',
      'salonVenue', 'salonVenueCategory', 'salonDesign',
      'tattooLocation', 'tattooLocationCategory',
      'prepVenue', 'prepVenueCategory',
      'vidEnvironment', 'sbVenue', 'sbVenueCategory',
      'romanceScene', 'romanceDateVenue',
      'gymVenue', 'gymVenueCategory', 'gymSettingTime', 'gymAtmosphere', 'gymArchitecture'
    ]
  };

  // Global state
  const state = {
    faceMode: 'reference', // 'reference' | 'ai_generated'
    faceSynthesisMode: 'unrelated', // 'unrelated' | 'sibling' | 'reimagined'
    faceArchetype: 'auto', // 'auto' | 'chiseled' | 'soft_oval' | 'heart' | 'square' | 'round' | 'diamond'
    divergenceIntensity: 'distinct', // 'distinct' | 'dramatic'
    customFaceTraits: '',
    features: {
      haircut: false,
      hairTexture: false,
      hairColor: false,
      wardrobe: false,
      makeup: false,
      accessories: false,
      pose: false,
      background: false
    }
  };

  // Listeners
  const listeners = new Set();

  function updateHeaderSessionPill() {
    if (typeof document === 'undefined') return;
    const topMeta = document.querySelector('.top-meta');
    if (!topMeta) return;
    let pill = document.getElementById('afterglowFaceStatusPill');
    if (!pill) {
      pill = document.createElement('span');
      pill.id = 'afterglowFaceStatusPill';
      pill.className = 'pill';
      topMeta.appendChild(pill);
    }
    const isAi = (state.faceMode === 'ai_generated');
    const activeFeats = Object.keys(state.features).filter(k => state.features[k]);
    const isHairOnly = isAi && activeFeats.length > 0 && activeFeats.every(f => ['haircut', 'hairTexture', 'hairColor'].includes(f));

    if (isHairOnly) {
      pill.innerHTML = '✨ Hair-Only Transfer · Face Decoupled';
      pill.style.background = 'rgba(168, 85, 247, 0.18)';
      pill.style.borderColor = 'rgba(168, 85, 247, 0.35)';
      pill.style.color = '#e9d5ff';
      pill.title = 'AI Fresh Face mode active with hair attributes only. Reference face is completely decoupled with zero identity retention.';
    } else if (isAi) {
      pill.innerHTML = `✨ AI Fresh Face Active (${activeFeats.length} ref item${activeFeats.length === 1 ? '' : 's'})`;
      pill.style.background = 'rgba(168, 85, 247, 0.15)';
      pill.style.borderColor = 'rgba(168, 85, 247, 0.3)';
      pill.style.color = '#e9d5ff';
      pill.title = 'AI Fresh Face mode active. Face and identity are newly synthesized autonomously.';
    } else {
      pill.innerHTML = '👤 Reference Face Active';
      pill.style.background = '';
      pill.style.borderColor = '';
      pill.style.color = '';
      pill.title = 'Reference Face mode active. Preserves facial identity from reference image.';
    }
  }

  function notify() {
    updateHeaderSessionPill();
    listeners.forEach(cb => {
      try { cb(state); } catch (e) { console.error('RefPicker listener error:', e); }
    });
  }

  function getFaceMode() {
    return state.faceMode;
  }

  function setFaceMode(mode) {
    if (mode === 'ai_generated' || mode === 'reference') {
      state.faceMode = mode;
      save();
      notify();
    }
  }

  function getFaceSynthesisMode() {
    return state.faceSynthesisMode;
  }

  function setFaceSynthesisMode(mode) {
    if (['unrelated', 'sibling', 'reimagined'].includes(mode)) {
      state.faceSynthesisMode = mode;
      save();
      notify();
    }
  }

  function getFaceArchetype() {
    return state.faceArchetype;
  }

  function setFaceArchetype(arch) {
    if (arch in FACE_ARCHETYPES) {
      state.faceArchetype = arch;
      save();
      notify();
    }
  }

  function getDivergenceIntensity() {
    return state.divergenceIntensity || 'distinct';
  }

  function setDivergenceIntensity(intensity) {
    if (intensity === 'distinct' || intensity === 'dramatic') {
      state.divergenceIntensity = intensity;
      save();
      notify();
    }
  }

  function getDivergenceLevel() {
    return state.faceSynthesisMode === 'unrelated' ? 'maximum' : 'distinct';
  }

  function setDivergenceLevel(lvl) {
    setFaceSynthesisMode(lvl === 'maximum' ? 'unrelated' : 'sibling');
  }

  function getCustomFaceTraits() {
    return state.customFaceTraits;
  }

  function setCustomFaceTraits(str) {
    state.customFaceTraits = str || '';
    save();
    notify();
  }

  function isFeatureInherited(key) {
    return !!state.features[key];
  }

  function setFeature(key, val) {
    if (key in state.features) {
      state.features[key] = !!val;
      save();
      notify();
    }
  }

  function toggleFeature(key) {
    if (key in state.features) {
      state.features[key] = !state.features[key];
      save();
      notify();
      return state.features[key];
    }
    return false;
  }

  function getFeatureForField(fieldId) {
    if (!fieldId) return null;
    for (const [feat, fieldList] of Object.entries(FIELD_FEATURE_MAP)) {
      if (fieldList.includes(fieldId)) return feat;
    }
    return null;
  }

  function isFieldLocked(fieldId) {
    if (!fieldId) return false;
    for (const [feat, fieldList] of Object.entries(FIELD_FEATURE_MAP)) {
      if (state.features[feat] && fieldList.includes(fieldId)) {
        return true;
      }
    }
    return false;
  }

  function resetAll() {
    state.faceMode = 'reference';
    state.faceSynthesisMode = 'unrelated';
    state.faceArchetype = 'auto';
    state.divergenceIntensity = 'distinct';
    state.customFaceTraits = '';
    Object.keys(state.features).forEach(k => { state.features[k] = false; });
    save();
    notify();
  }

  function applyPreset(presetKey) {
    switch(presetKey) {
      case 'original_look_fresh_face':
        state.faceMode = 'ai_generated';
        state.faceSynthesisMode = 'unrelated';
        state.faceArchetype = 'auto';
        state.divergenceIntensity = 'distinct';
        Object.keys(state.features).forEach(k => { state.features[k] = true; });
        break;
      case 'retain_full_reference':
        state.faceMode = 'reference';
        Object.keys(state.features).forEach(k => { state.features[k] = true; });
        break;
      case 'keep_hair':
        state.faceMode = 'reference';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'haircut'); });
        break;
      case 'keep_clothes':
        state.faceMode = 'reference';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'wardrobe'); });
        break;
      case 'keep_hair_clothes':
        state.faceMode = 'reference';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'haircut' || k === 'wardrobe'); });
        break;
      case 'ai_face_hair':
        state.faceMode = 'ai_generated';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'haircut'); });
        break;
      case 'ai_face_hair_only':
      case 'ai_face_hair_bundle':
        state.faceMode = 'ai_generated';
        state.faceSynthesisMode = 'unrelated';
        state.divergenceIntensity = 'dramatic';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'haircut' || k === 'hairTexture' || k === 'hairColor'); });
        break;
      case 'ai_face_clothes':
        state.faceMode = 'ai_generated';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'wardrobe'); });
        break;
      case 'ai_face_hair_clothes':
        state.faceMode = 'ai_generated';
        Object.keys(state.features).forEach(k => { state.features[k] = (k === 'haircut' || k === 'wardrobe'); });
        break;
      case 'reset':
      default:
        resetAll();
        return;
    }
    save();
    notify();
  }

  function save(customKey) {
    try {
      const k = customKey || 'afterglow_ref_picker_v1';
      localStorage.setItem(k, JSON.stringify(state));
    } catch (e) {}
  }

  function load(customKey) {
    try {
      const k = customKey || 'afterglow_ref_picker_v1';
      const raw = localStorage.getItem(k);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === 'object') {
          if (d.faceMode === 'ai_generated' || d.faceMode === 'reference') {
            state.faceMode = d.faceMode;
          }
          if (d.faceArchetype && d.faceArchetype in FACE_ARCHETYPES) {
            state.faceArchetype = d.faceArchetype;
          }
          if (d.divergenceIntensity === 'distinct' || d.divergenceIntensity === 'dramatic') {
            state.divergenceIntensity = d.divergenceIntensity;
          }
          if (['unrelated', 'sibling', 'reimagined'].includes(d.faceSynthesisMode)) {
            state.faceSynthesisMode = d.faceSynthesisMode;
          } else if (d.divergenceLevel === 'maximum') {
            state.faceSynthesisMode = 'unrelated';
          } else if (d.divergenceLevel === 'distinct') {
            state.faceSynthesisMode = 'sibling';
          }
          if (typeof d.customFaceTraits === 'string') {
            state.customFaceTraits = d.customFaceTraits;
          }
          if (d.features && typeof d.features === 'object') {
            Object.keys(state.features).forEach(feat => {
              if (feat in d.features) state.features[feat] = !!d.features[feat];
            });
          }
        }
      }
    } catch (e) {}
  }

  function isFieldInherited(fieldId) {
    const feat = getFeatureForField(fieldId);
    return feat ? !!state.features[feat] : false;
  }

  function getInheritedFieldText(keyOrField, defaultVal) {
    let feat = keyOrField;
    if (!(feat in FEATURES)) {
      feat = getFeatureForField(keyOrField);
    }
    if (!feat || !state.features[feat]) {
      return defaultVal !== undefined ? defaultVal : '';
    }
    const isAi = (state.faceMode === 'ai_generated');
    switch (feat) {
      case 'haircut':
        return isAi
          ? 'Faithfully replicate the exact haircut silhouette, length, parting, and cut from the source hair styling onto this newly synthesized model (hair strands and fiber boundaries only; strictly do not copy any facial features).'
          : 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo (strictly do not substitute with custom haircuts).';
      case 'hairTexture':
        return isAi
          ? 'Faithfully replicate the natural hair strand texture, thickness, follicle density, and organic wave/curl pattern from the source hair, rendered cleanly on this newly synthesized model.'
          : 'Faithfully retain the authentic natural hair strand texture, thickness, follicle density, and organic wave/curl pattern directly from the reference photo.';
      case 'hairColor':
        return isAi
          ? 'Match the exact hair color, undertones, and highlights from the source hair, applied to this newly synthesized model\'s hair.'
          : 'Match the exact original hair color, undertones, and highlights from the reference photo.';
      case 'wardrobe':
        return 'Faithfully retain and replicate the exact original wardrobe, garments, tailoring, fabric weave, and color scheme worn in the reference photo (strictly do not substitute with custom garments).';
      case 'makeup':
        return isAi
          ? 'Apply elegant cosmetic makeup styling featuring neutral tones, subtle eyeliner, and natural satin lips tailored specifically to this newly synthesized model\'s unique facial anatomy, independent of the reference person\'s facial features (without copying the reference subject\'s lips, eye shape, or facial structure).'
          : 'Faithfully retain the exact original makeup styling, lip shade, eyeliner, and cosmetic skin finish from the reference photo.';
      case 'accessories':
        return isAi
          ? 'Style contemporary jewelry harmonized with the wardrobe (earrings and delicate accents), fitted naturally onto this new model\'s distinct proportions (strictly do not copy nose piercings, facial jewelry, or facial marks from the reference photo).'
          : 'Faithfully retain all signature jewelry, piercings, earrings, and accessories visible in the reference photo.';
      case 'pose':
        return isAi
          ? 'Faithfully mirror the subject\'s body posture and stance from the reference photo, while positioning this newly synthesized model\'s head and neck naturally with independent facial orientation (distinct head angle and independent jawline posture; zero facial identity transfer).'
          : 'Faithfully mirror the subject\'s exact original body pose, shoulder orientation, head angle, and stance from the reference photo.';
      case 'background':
        return 'Faithfully maintain the exact original background environment, room setting, and architectural ambiance from the reference photo.';
      default:
        return defaultVal !== undefined ? defaultVal : '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Generate prompt directives
  function getPromptDirectives(opts = {}) {
    const isAiFace = (state.faceMode === 'ai_generated');
    const activeFeats = Object.keys(state.features).filter(k => state.features[k]);
    const hasAnyFeature = activeFeats.length > 0;
    const isHairOnlySelection = isAiFace && hasAnyFeature && activeFeats.every(f => ['haircut', 'hairTexture', 'hairColor'].includes(f));
    const studio = opts.studio || 'photoshoot';
    const isFemaleModelBarber = !!opts.isFemaleModelBarber;

    // Header prefix
    let headerPrefix = '';
    if (isAiFace) {
      if (state.faceSynthesisMode === 'sibling') {
        headerPrefix = activeFeats.length === 8
          ? 'AI SIBLING VARIATION FACE WITH FULL REFERENCE LOOK RETENTION'
          : (hasAnyFeature ? 'AI SIBLING VARIATION FACE WITH SELECTIVE REFERENCE TRANSFER' : 'AI SIBLING VARIATION FACE & AUTONOMOUS STYLING');
      } else if (state.faceSynthesisMode === 'reimagined') {
        headerPrefix = activeFeats.length === 8
          ? 'AI RE-IMAGINED EDITORIAL FACE WITH FULL REFERENCE LOOK RETENTION'
          : (hasAnyFeature ? 'AI RE-IMAGINED EDITORIAL FACE WITH SELECTIVE REFERENCE TRANSFER' : 'AI RE-IMAGINED EDITORIAL FACE & AUTONOMOUS STYLING');
      } else {
        headerPrefix = activeFeats.length === 8
          ? 'AI-GENERATED FACE WITH FULL REFERENCE LOOK RETENTION'
          : (hasAnyFeature ? 'AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER' : 'AI-GENERATED FACE & AUTONOMOUS STYLING');
      }
    } else {
      headerPrefix = (activeFeats.length === 8)
        ? 'FULL REFERENCE LOOK & IDENTITY GUIDED PORTRAIT'
        : 'REFERENCE-IMAGE GUIDED PORTRAIT';
    }

    const primaryBullets = [];
    const negativeAdditions = [];
    let frontLoadedSubject = '';

    if (isAiFace) {
      const arch = FACE_ARCHETYPES[state.faceArchetype] || FACE_ARCHETYPES.auto;
      const isDramatic = (state.divergenceIntensity === 'dramatic');
      const DEFAULT_DISTINCT_TRAITS = 'refined facial contours, natural subtle brow asymmetry, sculpted cheek depth, and clean jawline definition';
      const customTraits = state.customFaceTraits
        ? ` Unique distinguishing facial details: ${state.customFaceTraits}.`
        : ` Distinct individual facial landmarks: ${DEFAULT_DISTINCT_TRAITS}.`;

      // Multimodal natural-language instruction for vision models (addresses uploaded photo directly)
      const scopeLabels = activeFeats.map(k => FEATURES[k]?.label || k);
      const multimodalScope = isHairOnlySelection
        ? 'hairstyle, hair texture, and hair color'
        : (hasAnyFeature ? `selected styling attributes (${scopeLabels.join(', ')}) — and body pose geometry only if Pose & Stance is selected` : 'non-facial styling and posture');

      const multimodalDirective = `[REFERENCE IMAGE USAGE DIRECTIVE: ASSET ROLE: INANIMATE STYLING SWATCH ONLY. The uploaded photo is provided EXCLUSIVELY for ${multimodalScope}. STRICTLY DO NOT copy, preserve, or replicate the face, facial features, expression, or facial identity of the person in the photo. Treat her face as fully redacted: do not use her facial pixels, facial identity embedding, character-reference lock, or face crop as a starting point. Synthesize a COMPLETELY DIFFERENT woman with an independent facial phenotype: high cheekbones, almond eyes, sculpted jawline, neutral closed lips (zero visible teeth), and zero nose jewelry. Build the new face from an independent anatomical specification so no eye spacing, nose length or width, lip shape, jaw angle, cheekbone placement, face width, or skin-tone pattern matches the reference. A side-by-side comparison must unmistakably show two entirely different people.]`;

      if (state.faceSynthesisMode === 'sibling') {
        frontLoadedSubject = `${multimodalDirective}\nA completely distinct female model, biological sister with unique personal facial architecture, ${arch.tokens}, neutral closed lips, calm composed gaze, zero visible teeth.`;
      } else if (state.faceSynthesisMode === 'reimagined') {
        frontLoadedSubject = `${multimodalDirective}\nHigh-fashion editorial facial remodeling, sculpted runway supermodel architecture, ${arch.tokens}, neutral closed lips, calm composed gaze, zero visible teeth.`;
      } else {
        frontLoadedSubject = `${multimodalDirective}\nAn entirely new female model, completely distinct individual woman, independent facial architecture, fresh unique person, ${arch.tokens}, closed mouth, neutral relaxed lips, calm composed gaze, zero visible teeth.`;
      }

      if (state.faceSynthesisMode === 'sibling') {
        // Sibling Variation: Biological sister with mandatory anatomical divergence
        const intensityClause = isDramatic
          ? ' Mandatory dramatic sibling divergence: render strong structural contrast in facial planes, an unmistakably distinct jawline angle, and altered facial proportions so she is unequivocally recognized as a separate sibling with her own individual face.'
          : ' A side-by-side comparison must unmistakably reveal two distinct sisters with unique facial structures, NEVER an identical twin, digital clone, or duplicate face.';

        primaryBullets.push(
          `• MANDATORY SIBLING DIFFERENTIATION (BIOLOGICAL SISTER, NOT A CLONE): The subject is her biological sister, NOT the same woman. While sharing her natural Indian heritage, eye coloration, and warm skin undertones, you MUST visibly and noticeably differentiate her facial anatomy: alter the jawline width and chin contour, reshape the eye contour and eyelid fold, sculpt a noticeably different nasal bridge and tip, and modify the lip fullness featuring ${arch.tokens}.${customTraits}${intensityClause}`
        );
        negativeAdditions.push(
          'cloned face, duplicate face, twin likeness, identical facial structure, duplicate facial geometry, artificial face twin, digital face swap mask, facial identity bleed, open mouth smile, visible teeth'
        );
      } else if (state.faceSynthesisMode === 'reimagined') {
        // Editorial Re-imagination: Haute couture runway remodeling & sculpted elevation (zero "preserve eye shape" blockers)
        const intensityClause = isDramatic
          ? ' Mandatory dramatic editorial transformation: apply extreme haute couture bone architecture with hyper-chiseled zygomatic arches, razor-sharp jawline definition, and dramatic avant-garde runway facial remodeling that radically transforms her casual facial structure into striking high-fashion perfection.'
          : ' The face must look unmistakably elevated, sculpted, and remodeled from any casual reference snapshot into striking high-fashion editorial perfection.';

        primaryBullets.push(
          `• HAUTE COUTURE EDITORIAL FACIAL RE-SCULPTING & STRUCTURAL REMODELING: Drastically elevate and structurally remodel the reference facial architecture into a world-class high-fashion runway supermodel. Transform the underlying bone structure: carve razor-sharp, prominent high cheekbones with sculpted hollows, chisel the jawline into a sleek, razor-defined editorial contour, reshape the eyes into an elongated, piercing editorial gaze with lifted outer corners, and sculpt an architectural slender nasal bridge featuring ${arch.tokens}.${customTraits}${intensityClause}`
        );
        negativeAdditions.push(
          'casual snapshot face, soft un-sculpted jawline, plain casual bone structure, un-chiseled face, un-elevated facial features, snapshot facial structure, rounded un-sculpted cheeks, plain un-sculpted face, distorted facial morphing, unnatural CGI smoothness, waxy plastic skin, warped facial features, unflattering facial distortion, digital doll face'
        );
      } else {
        // Unrelated Person (Default): 100% Face Swap, affirmative independent anatomy
        let intensityClause = '';
        const prefix = (isDramatic || isHairOnlySelection)
          ? ' Mandatory dramatic face swap: total anatomical decoupling'
          : ' Distinct autonomous facial architecture: complete anatomical decoupling';
        switch (state.faceArchetype) {
          case 'soft_oval':
            intensityClause = `${prefix} featuring an unmistakably distinct soft oval silhouette, gentle rounded jaw contours, distinct rounded-almond eyes, and unique individual facial proportions.`;
            break;
          case 'round':
            intensityClause = `${prefix} featuring distinctly soft rounded facial contours, gently curved jawline, large expressive bright rounded eyes, and natural full lips.`;
            break;
          case 'heart':
            intensityClause = `${prefix} featuring a delicate tapered chin, high arched brows, radiant expressive wide doe eyes, and softly defined cheekbones.`;
            break;
          case 'square':
            intensityClause = `${prefix} featuring a bold high-fashion square jawline with clean angular bone structure, piercing editorial gaze, and sculpted cheek contours.`;
            break;
          case 'diamond':
            intensityClause = `${prefix} featuring wide prominent cheekbones, narrow refined temple planes, and a sharp tapered chin.`;
            break;
          case 'chiseled':
            intensityClause = `${prefix} featuring extreme high-fashion bone architecture with sharp prominent cheekbones, razor-sharp jawline definition, and piercing wide-set eyes.`;
            break;
          case 'auto':
          default:
            intensityClause = `${prefix} with pronounced facial plane contrast, sculpted high-fashion cheekbones, wide-set luminous eyes with distinct orbital depth, a slender sculpted nasal bridge, and an elegant tapered jawline.`;
            break;
        }

        const decouplingClause = (isDramatic || isHairOnlySelection)
          ? ' Construct a visibly different identity with different eye shape and spacing, different nose length and width, different lip shape and mouth width, different jaw angle and chin shape, different cheekbone height and placement, and different face width; no facial feature or proportion may be reused from the reference person.'
          : '';

        primaryBullets.push(
          `• FULL AUTONOMOUS FACIAL ANATOMY (MANDATORY 100% INDEPENDENT IDENTITY): An entirely new female model, distinct unique face featuring ${arch.tokens}.${customTraits}${intensityClause}${decouplingClause} Authentic photographic skin rendering: natural micro-pores, realistic facial asymmetry, and dermal depth.`
        );
        negativeAdditions.push(
          'cloned face, duplicate face, twin likeness, identical facial structure, duplicate facial geometry, artificial face twin, digital face swap mask, facial identity bleed, face transplant, identity transfer, facial embedding reuse, character reference face lock, lookalike, open mouth smile, visible teeth'
        );
      }

      if (activeFeats.length === 8) {
        const modeDesc = (state.faceSynthesisMode === 'sibling')
          ? 'execute mandatory sibling facial reconstruction to synthesize a distinct biological sister with different facial geometry'
          : (state.faceSynthesisMode === 'reimagined')
            ? 'execute haute couture editorial remodeling to drastically elevate and re-sculpt her bone structure into a runway supermodel'
            : 'synthesize a completely fresh, photorealistic adult woman\'s face with unique, photorealistic facial architecture, authentic skin pores, and realistic bone structure possessing completely independent facial anatomy';
        primaryBullets.push(
          `• Master Synthesis Directive (Retain Original Look + Fresh AI Face): Strictly retain the complete original look—exact hairstyle silhouette, hair texture, hair color, wardrobe garments, makeup palette, jewelry, body pose, and background environment—from the reference photo, but ${modeDesc}.`
        );
      } else if (hasAnyFeature) {
        primaryBullets.push(
          '• Selective Reference Attributes Applied: Transfer and apply ONLY the specified reference attributes below onto this newly generated face. All non-selected attributes must follow the custom studio specifications below.'
        );
      } else {
        primaryBullets.push(
          '• Autonomous Styling: Synthesize a fresh, completely original appearance following all custom studio direction below, using zero reference photo elements.'
        );
      }

      if (isHairOnlySelection) {
        primaryBullets.push(
          '• CRITICAL FACE DECOUPLING & ZERO IDENTITY RETENTION: Only the specified hair attributes (haircut silhouette, strand texture, and hair color) are transferred from the source hair styling onto this newly synthesized AI face. Completely synthesize her eyes, eye shape, nose bridge, nostrils, lips, mouth, jawline, chin, and bone structure as an entirely new, independent adult woman\'s face possessing unique facial architecture. Strictly zero facial identity retention.'
        );
        primaryBullets.push(
          '• PORTRAIT-SAFE FACIAL DIVERGENCE (CLOSE-UP REFERENCE OVERRIDE): Generate an unmistakably distinct woman with completely independent facial anatomy: sculpted bone structure, unique eye aperture, custom nose bridge, and firm closed mouth with authentic photographic skin micro-pores and realistic facial asymmetry.'
        );
        primaryBullets.push(
          '• Isolated Hair Transfer Boundary: Treat the hairline as a strict anatomical boundary. Hair strands, roots, and edges transfer with precision, while skin, forehead curvature, brow ridges, temples, and cheekbones underneath must be synthesized entirely fresh for this new model.'
        );
        primaryBullets.push(
          '• Autonomous Facial Expression: Closed mouth, neutral relaxed lips, calm focused gaze, zero visible teeth.'
        );
      }
    } else {
      if (isFemaleModelBarber) {
        primaryBullets.push(
          '• Primary Face & Identity: Strictly preserve the adult woman from the reference image as the skilled female barber / practitioner with authentic Indian heritage facial structure, warm skin tone, and natural skin pores.'
        );
      } else {
        primaryBullets.push(
          '• Primary Face & Identity: Strictly preserve the facial identity, features, bone structure, and authentic Indian heritage characteristics of the adult woman in the reference photo.'
        );
      }

      if (hasAnyFeature) {
        const labels = activeFeats.map(k => FEATURES[k]?.label || k).join(', ');
        primaryBullets.push(
          `• Selective Reference Inheritance: In addition to her face, strictly transfer and preserve her [${labels}] from the reference image.`
        );
        primaryBullets.push(
          '• Custom Studio Modifications: All attributes not explicitly inherited from the reference image must strictly follow the studio choices specified below rather than the reference photo.'
        );
      }
    }

    // Detail bullets for individual active features
    if (state.features.haircut) {
      primaryBullets.push(
        isAiFace
          ? '• Hairstyle & Silhouette: Replicate the exact hairstyle, haircut, length, and parting seen in the source styling (hair strands only, draped naturally around this newly synthesized model\'s unique facial anatomy; zero face transfer).'
          : '• Hairstyle & Silhouette (From Reference Photo): Strictly replicate and sculpt the exact hairstyle, haircut, length, parting, and silhouette from the reference image.'
      );
    }
    if (state.features.hairTexture) {
      primaryBullets.push(
        isAiFace
          ? '• Hair Texture & Density: Render authentic natural hair strand texture, strand thickness, follicle density, and organic finish from the source hair styling on this newly synthesized model.'
          : '• Hair Texture & Density (From Reference Photo): Faithfully preserve the natural hair strand texture, thickness, follicle density, and organic finish visible in the reference image.'
      );
    }
    if (state.features.hairColor) {
      primaryBullets.push(
        isAiFace
          ? '• Hair Color: Match the exact natural hair color, undertones, and highlights from the source hair styling on this new model\'s hair.'
          : '• Hair Color (From Reference Photo): Match the exact natural hair color, undertones, and highlights shown in the reference image.'
      );
    }
    if (state.features.wardrobe) {
      primaryBullets.push(
        isAiFace
          ? '• Wardrobe & Clothing: Faithfully replicate the exact outfit, clothing design, tailoring, fabric weave, and color scheme worn in the reference image.'
          : '• Wardrobe & Clothing (From Reference Photo): Faithfully replicate the exact outfit, clothing design, tailoring, fabric weave, and color scheme worn in the reference image.'
      );
    }
    if (state.features.makeup) {
      primaryBullets.push(
        isAiFace
          ? '• Cosmetic Styling (Autonomous Face): Apply elegant makeup featuring neutral tones, subtle eyeliner, and natural satin lips tailored specifically to this newly synthesized model\'s unique facial anatomy, independent of the reference person\'s facial features (without copying the reference subject\'s lips, eye shape, or facial structure).'
          : '• Makeup Styling (From Reference Photo): Replicate the reference image\'s makeup styling, lip shade, eyeliner, and skin finish.'
      );
    }
    if (state.features.accessories) {
      primaryBullets.push(
        isAiFace
          ? '• Accessories & Jewelry (Autonomous Face): Style contemporary jewelry harmonized with the wardrobe (earrings and delicate accents), fitted naturally onto this new model\'s distinct proportions (strictly do not copy nose piercings, facial jewelry, or facial marks from the reference photo).'
          : '• Accessories & Jewelry (From Reference Photo): Preserve and transfer all signature jewelry, piercings, earrings, and accessories visible in the reference image.'
      );
    }
    if (state.features.pose) {
      primaryBullets.push(
        isAiFace
          ? '• Pose & Stance (Autonomous Model): Mirror the subject\'s body posture and stance from the reference photo, while positioning this newly synthesized model\'s head and neck naturally with independent facial orientation (distinct head angle and independent jawline posture; zero facial identity transfer).'
          : '• Pose & Stance (From Reference Photo): Mirror the subject\'s exact body pose, shoulder angle, and stance from the reference photo.'
      );
    }
    if (state.features.background) {
      primaryBullets.push(
        '• Setting & Background (From Reference Photo): Maintain the exact background environment, architectural ambiance, and setting from the reference photo.'
      );
    }

    const summaryText = activeFeats.length > 0
      ? activeFeats.map(k => FEATURES[k]?.label || k).join(', ')
      : 'autonomous styling';

    const allNegs = Array.from(new Set(negativeAdditions.flatMap(n => n.split(',').map(s => s.trim())).filter(Boolean)));
    const standaloneNegativePrompt = allNegs.join(', ');

    return {
      faceMode: state.faceMode,
      isAiFace,
      faceSynthesisMode: state.faceSynthesisMode,
      faceArchetype: state.faceArchetype,
      divergenceIntensity: getDivergenceIntensity(),
      divergenceLevel: getDivergenceLevel(),
      customFaceTraits: state.customFaceTraits,
      hasAnyFeature,
      activeFeatures: activeFeats,
      isHairOnlySelection,
      summaryText,
      headerPrefix,
      frontLoadedSubject: isAiFace ? (frontLoadedSubject || '') : '',
      primaryBullets,
      negativeAdditions,
      standaloneNegativePrompt,
      isLocked: isFieldLocked,
      isFieldInherited,
      getFieldText: getInheritedFieldText
    };
  }

  // Create UI card element
  function createRefPickerCard(onChangeCallback) {
    const card = document.createElement('div');
    card.className = 'ref-picker-card';
    card.id = 'refPickerCard';

    // Hair-Only Reference Sanitizer state
    let sanitizerImg = null;
    let sanitizerMaskCenter = { x: 0.5, y: 0.44 };
    let sanitizerMaskRadius = { rx: 0.22, ry: 0.30 };
    let sanitizerIsMasked = true;

    function renderContent() {
      const isAi = (state.faceMode === 'ai_generated');
      const activeCount = Object.values(state.features).filter(Boolean).length;

      card.innerHTML = `
        <div class="ref-card-header">
          <div class="ref-card-title-wrap">
            <span class="ref-card-icon">📷</span>
            <div>
              <strong class="ref-card-title">Reference Feature Transfer &amp; Face Direction</strong>
              <span class="ref-card-subtitle">Choose whether to keep the reference face or generate a new AI face, and select exactly which attributes to inherit from your reference image.</span>
            </div>
          </div>
          <span class="ref-active-badge">${isAi ? '✨ AI Generated Face' : '👤 Reference Face'} · ${activeCount} feature${activeCount === 1 ? '' : 's'} inherited</span>
        </div>

        <div class="ref-card-body">
          <div class="ref-section-row">
            <div class="ref-row-label">
              <strong>1. Face Identity Direction</strong>
              <small>${isAi ? '✨ AI invents an entirely new person with distinct facial architecture; selected reference items are applied onto her.' : '👤 Retains the actual face and identity of the woman from your reference photo.'}</small>
            </div>
            <div class="seg-control ref-face-seg">
              <button type="button" class="seg-btn ${!isAi ? 'active' : ''}" data-face="reference">👤 Retain Reference Face</button>
              <button type="button" class="seg-btn ${isAi ? 'active' : ''}" data-face="ai_generated">✨ AI Generate Fresh Face</button>
            </div>
          </div>

          ${isAi ? `
          <div class="ref-archetype-box">
            <div class="ref-archetype-head">
              <strong>Fresh AI Face Architecture &amp; Identity Relationship</strong>
              <small>Choose how the original face influences the new AI face</small>
            </div>

            <div class="ref-divergence-row">
              <span class="ref-divergence-label">Face Relationship to Reference:</span>
              <div class="ref-divergence-seg">
                <button type="button" class="ref-divergence-btn ${state.faceSynthesisMode === 'unrelated' ? 'active' : ''}" data-synthesismode="unrelated" title="100% Face Swap: Total brand new person, zero resemblance">⚡ Unrelated Person</button>
                <button type="button" class="ref-divergence-btn ${state.faceSynthesisMode === 'sibling' ? 'active' : ''}" data-synthesismode="sibling" title="Biological Sister: Mandatory structural differentiation (jaw, eyes, nose) with genetic heritage">🧬 Sibling Variation</button>
                <button type="button" class="ref-divergence-btn ${state.faceSynthesisMode === 'reimagined' ? 'active' : ''}" data-synthesismode="reimagined" title="Haute Couture Remodeling: Elevates cheekbones, jawline, and gaze into a runway supermodel">✨ Editorial Re-imagination</button>
              </div>
            </div>

            <div class="ref-shift-badge">
              ${state.faceSynthesisMode === 'sibling'
                ? '🧬 <strong>Sibling Shifts:</strong> Altered Jawline Width · Reshaped Eye Contour · Distinct Nose Bridge · Sister Genetics'
                : (state.faceSynthesisMode === 'reimagined'
                  ? '✨ <strong>Editorial Shifts:</strong> Razor-Sharp High Cheekbones · Sculpted Runway Jaw · Elongated Piercing Gaze · Architectural Bone Structure'
                  : '⚡ <strong>Unrelated Shifts:</strong> 100% Face Swap · Independent Facial Anatomy · Zero Reference Resemblance')
              }
            </div>

            <div class="ref-intensity-row">
              <span class="ref-intensity-label">Transformation Intensity:</span>
              <div class="ref-intensity-seg">
                <button type="button" class="ref-intensity-btn ${state.divergenceIntensity !== 'dramatic' ? 'active' : ''}" data-intensity="distinct" title="Distinct: Noticeable natural sister / editorial elevation">✦ Distinct (Natural)</button>
                <button type="button" class="ref-intensity-btn ${state.divergenceIntensity === 'dramatic' ? 'active' : ''}" data-intensity="dramatic" title="Dramatic: High-impact structural shift with amplified bone contour tokens">⚡ Dramatic (High-Impact)</button>
              </div>
            </div>

            <div style="margin-top: 4px;">
              <span style="font-size: 10.5px; color: #ccc; font-weight: 600; display: block; margin-bottom: 5px;">Facial Bone Structure Archetype:</span>
              <div class="ref-archetype-grid">
                ${Object.values(FACE_ARCHETYPES).map(a => {
                  const active = (state.faceArchetype === a.id);
                  return `<button type="button" class="ref-archetype-btn ${active ? 'active' : ''}" data-archetype="${a.id}">${a.label}</button>`;
                }).join('')}
              </div>
            </div>

            <input type="text" class="ref-custom-input" id="refCustomFaceTraits" placeholder="Optional specific facial features (e.g. sharp jawline, beauty mark, deep hazel eyes)" value="${escapeHtml(state.customFaceTraits || '')}">

            <div class="ref-tip-box">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <strong>💡 External Image Generator Setup Guide:</strong>
                  <span style="font-size: 9.5px; color: #a855f7; background: rgba(168,85,247,0.15); padding: 1px 6px; border-radius: 4px;">Prevent Face Bleed</span>
                </div>
              </div>
              <div style="font-size: 10px; line-height: 1.45; color: #cbd5e1;">
                • <strong>Why Close-Up Photos Bleed:</strong> If your reference photo is a tight close-up portrait, the face dominates the latent image embedding. In addition to our built-in portrait-override directives, apply these tool settings:<br>
                • <strong>Image Prompt Conditioning:</strong> Keep reference conditioning weight moderate (0.40–0.50, stop around 0.70–0.75). <em>Never</em> use face-swapping or face-cloning modules when you want a new face.<br>
                • <strong>Reference Parameter Tuning:</strong> When using character or style reference parameters in external image tools, use style conditioning or set character weight to zero (0) so the engine transfers styling without locking the face.<br>
                • <strong>Pose &amp; Structure Guidance:</strong> Use pose/skeleton guidance or depth conditioning for posture and hair boundaries rather than facial identity transfer.<br>
                • <strong>Multimodal &amp; Chat Vision Engines:</strong> Multimodal vision models prioritize natural-language directives over bracket weights. The studio automatically prepends a <code>[REFERENCE IMAGE USAGE DIRECTIVE]</code> at Line 1 instructing the vision system to decouple her face. If your generator still experiences stochastic fallback on certain seeds, download and upload the sanitized hair-only photo below for 100% deterministic fresh faces.<br>
                • <strong>Prompt Security:</strong> The studio prompt automatically injects high-priority face decoupling tokens, negative face tokens, and autonomous bone structure directives.
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                <button type="button" class="ref-preset-btn" id="btnRefCopyPositive" style="background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.4); color: #fff;">📋 Copy Clean Positive Only</button>
                <button type="button" class="ref-preset-btn" id="btnRefCopyNegative" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5;">🚫 Copy Negative Exclusions</button>
              </div>
            </div>

            <div class="ref-sanitizer-box" id="refSanitizerBox">
              <div class="ref-sanitizer-head">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">🎭</span>
                    <strong style="font-size: 11px; color: #6ee7b7;">Hair-Only Reference Sanitizer: 100% Guaranteed Face Bleed Fix</strong>
                  </div>
                  <span style="font-size: 9px; background: rgba(52,211,153,0.18); color: #6ee7b7; border: 1px solid rgba(52,211,153,0.35); padding: 1px 6px; border-radius: 4px; font-weight: 600;">PURE HAIR REFERENCE</span>
                </div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 3px; line-height: 1.4;">
                  If your generator preserves her face despite the prompt, mask her face here. The external tool's vision encoder will see <strong>ONLY</strong> her hair, strand texture, and hair color, making it impossible to clone her face.
                </div>
              </div>
              <div class="ref-sanitizer-body" style="margin-top: 8px;">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  <label class="ref-upload-btn" style="cursor: pointer; background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.4); padding: 5px 12px; border-radius: 6px; font-size: 11px; color: #a7f3d0; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                    <span>📁</span> Load Reference Photo
                    <input type="file" id="refSanitizerInput" accept="image/*" style="display: none;">
                  </label>
                  <button type="button" class="ref-preset-btn" id="btnToggleMask" style="display: none; background: rgba(168,85,247,0.25); border: 1px solid rgba(168,85,247,0.5); color: #fff;">🎭 Toggle Mask</button>
                  <button type="button" class="ref-preset-btn" id="btnMaskSizeDown" style="display: none; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #ccc;">Size −</button>
                  <button type="button" class="ref-preset-btn" id="btnMaskSizeUp" style="display: none; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #ccc;">Size +</button>
                  <button type="button" class="ref-preset-btn" id="btnDownloadSanitized" style="display: none; background: rgba(34,197,94,0.3); border: 1px solid rgba(34,197,94,0.6); color: #86efac; font-weight: 700;">💾 Download Sanitized Hair Photo</button>
                </div>
                <div id="refCanvasContainer" style="display: none; margin-top: 10px; text-align: center; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                  <canvas id="refSanitizerCanvas" style="max-width: 100%; max-height: 280px; border-radius: 6px; cursor: crosshair;"></canvas>
                  <div style="font-size: 9.5px; color: #94a3b8; margin-top: 5px;">Click anywhere on the image to center the mask on her face. Click <strong>Download Sanitized Hair Photo</strong> and upload THAT image to your generator.</div>
                </div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="ref-section-row" style="margin-top: 14px;">
            <div class="ref-row-label">
              <strong>2. Select Attributes to Inherit from Reference Image</strong>
              <small>Toggling an attribute ON locks its menu field in the builder to prevent conflicting selections.</small>
            </div>
            <div class="ref-chip-grid">
              ${Object.values(FEATURES).map(f => {
                const active = !!state.features[f.id];
                return `
                  <button type="button" class="ref-chip ${active ? 'active' : ''}" data-feature="${f.id}" title="${f.desc}">
                    <span class="ref-chip-icon">${f.icon}</span>
                    <span class="ref-chip-label">${f.label}</span>
                    <span class="ref-chip-check">${active ? '✓' : '+'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="ref-presets-row">
            <span class="ref-presets-label">Quick Presets:</span>
            <div class="ref-presets-buttons">
              <button type="button" class="ref-preset-btn" data-preset="original_look_fresh_face">✨ Original Look + Fresh AI Face</button>
              <button type="button" class="ref-preset-btn" data-preset="ai_face_hair_only">✨ New Face + Hair Only (Cut, Texture &amp; Color)</button>
              <button type="button" class="ref-preset-btn" data-preset="retain_full_reference">📷 Full Original Look + Ref Face</button>
              <button type="button" class="ref-preset-btn" data-preset="reset">✦ Default (Face only)</button>
              <button type="button" class="ref-preset-btn" data-preset="keep_hair">💇‍♀️ Keep Hair</button>
              <button type="button" class="ref-preset-btn" data-preset="keep_clothes">👗 Keep Clothes</button>
              <button type="button" class="ref-preset-btn" data-preset="keep_hair_clothes">✨ Keep Hair + Clothes</button>
              <button type="button" class="ref-preset-btn" data-preset="ai_face_hair">✨ New Face + Ref Hair</button>
              <button type="button" class="ref-preset-btn" data-preset="ai_face_clothes">✨ New Face + Ref Clothes</button>
              <button type="button" class="ref-preset-btn" data-preset="ai_face_hair_clothes">✨ New Face + Hair &amp; Clothes</button>
            </div>
          </div>
        </div>
      `;

      // Event listeners
      card.querySelectorAll('[data-face]').forEach(btn => {
        btn.addEventListener('click', () => {
          setFaceMode(btn.dataset.face);
          renderContent();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      });

      card.querySelectorAll('[data-synthesismode]').forEach(btn => {
        btn.addEventListener('click', () => {
          setFaceSynthesisMode(btn.dataset.synthesismode);
          renderContent();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      });

      card.querySelectorAll('[data-intensity]').forEach(btn => {
        btn.addEventListener('click', () => {
          setDivergenceIntensity(btn.dataset.intensity);
          renderContent();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      });

      card.querySelectorAll('[data-archetype]').forEach(btn => {
        btn.addEventListener('click', () => {
          setFaceArchetype(btn.dataset.archetype);
          renderContent();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      });

      const customInput = card.querySelector('#refCustomFaceTraits');
      if (customInput) {
        customInput.addEventListener('input', (e) => {
          state.customFaceTraits = e.target.value;
          save();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      }

      card.querySelectorAll('[data-feature]').forEach(btn => {
        btn.addEventListener('click', () => {
          toggleFeature(btn.dataset.feature);
          renderContent();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      });

      card.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          applyPreset(btn.dataset.preset);
          renderContent();
          if (typeof onChangeCallback === 'function') onChangeCallback();
        });
      });

      const btnRefPos = card.querySelector('#btnRefCopyPositive');
      if (btnRefPos) {
        btnRefPos.addEventListener('click', () => {
          const btnPage = document.getElementById('copyPositive');
          if (btnPage) {
            btnPage.click();
          } else {
            const promptEl = document.getElementById('prompt');
            if (promptEl) {
              const text = promptEl.value.split(/AVOID \/ NEGATIVE GUIDANCE/i)[0].trim();
              if (navigator.clipboard) navigator.clipboard.writeText(text);
            }
          }
        });
      }

      const btnRefNeg = card.querySelector('#btnRefCopyNegative');
      if (btnRefNeg) {
        btnRefNeg.addEventListener('click', () => {
          const btnPage = document.getElementById('copyNegative');
          if (btnPage) {
            btnPage.click();
          } else {
            const negPrompt = getPromptDirectives().standaloneNegativePrompt;
            if (navigator.clipboard) navigator.clipboard.writeText(negPrompt);
          }
        });
      }

      // Hair-Only Reference Sanitizer logic
      const fileInput = card.querySelector('#refSanitizerInput');
      const btnToggleMask = card.querySelector('#btnToggleMask');
      const btnMaskSizeDown = card.querySelector('#btnMaskSizeDown');
      const btnMaskSizeUp = card.querySelector('#btnMaskSizeUp');
      const btnDownloadSanitized = card.querySelector('#btnDownloadSanitized');
      const canvasContainer = card.querySelector('#refCanvasContainer');
      const canvas = card.querySelector('#refSanitizerCanvas');

      function drawSanitizer() {
        if (!canvas || !sanitizerImg) return;
        const ctx = canvas.getContext('2d');
        canvas.width = sanitizerImg.width;
        canvas.height = sanitizerImg.height;
        ctx.drawImage(sanitizerImg, 0, 0);

        if (sanitizerIsMasked) {
          const cx = sanitizerMaskCenter.x * canvas.width;
          const cy = sanitizerMaskCenter.y * canvas.height;
          const rx = sanitizerMaskRadius.rx * canvas.width;
          const ry = sanitizerMaskRadius.ry * canvas.height;

          ctx.save();
          const grad = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.2, cx, cy, Math.max(rx, ry));
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.98)');
          grad.addColorStop(0.85, 'rgba(15, 23, 42, 0.95)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
          ctx.lineWidth = Math.max(2, canvas.width * 0.005);
          ctx.setLineDash([8, 8]);
          ctx.stroke();
          ctx.restore();
        }

        if (btnToggleMask) btnToggleMask.style.display = 'inline-block';
        if (btnMaskSizeDown) btnMaskSizeDown.style.display = 'inline-block';
        if (btnMaskSizeUp) btnMaskSizeUp.style.display = 'inline-block';
        if (btnDownloadSanitized) btnDownloadSanitized.style.display = 'inline-block';
        if (canvasContainer) canvasContainer.style.display = 'block';
      }

      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (revt) => {
            const img = new Image();
            img.onload = () => {
              sanitizerImg = img;
              sanitizerIsMasked = true;
              drawSanitizer();
            };
            img.src = revt.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      if (canvas) {
        canvas.addEventListener('click', (e) => {
          if (!sanitizerImg) return;
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          sanitizerMaskCenter.x = ((e.clientX - rect.left) * scaleX) / canvas.width;
          sanitizerMaskCenter.y = ((e.clientY - rect.top) * scaleY) / canvas.height;
          sanitizerIsMasked = true;
          drawSanitizer();
        });
      }

      if (btnToggleMask) {
        btnToggleMask.addEventListener('click', () => {
          sanitizerIsMasked = !sanitizerIsMasked;
          drawSanitizer();
        });
      }

      if (btnMaskSizeDown) {
        btnMaskSizeDown.addEventListener('click', () => {
          sanitizerMaskRadius.rx = Math.max(0.10, sanitizerMaskRadius.rx * 0.85);
          sanitizerMaskRadius.ry = Math.max(0.12, sanitizerMaskRadius.ry * 0.85);
          drawSanitizer();
        });
      }

      if (btnMaskSizeUp) {
        btnMaskSizeUp.addEventListener('click', () => {
          sanitizerMaskRadius.rx = Math.min(0.45, sanitizerMaskRadius.rx * 1.15);
          sanitizerMaskRadius.ry = Math.min(0.55, sanitizerMaskRadius.ry * 1.15);
          drawSanitizer();
        });
      }

      if (btnDownloadSanitized) {
        btnDownloadSanitized.addEventListener('click', () => {
          if (!canvas) return;
          const link = document.createElement('a');
          link.download = 'sanitized_hair_reference.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      }

      if (sanitizerImg) {
        drawSanitizer();
      }
    }

    renderContent();
    return card;
  }

  // Initial load
  load();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateHeaderSessionPill);
    } else {
      updateHeaderSessionPill();
    }
  }

  // Export public API
  root.AfterglowRefPicker = {
    FEATURES,
    FACE_ARCHETYPES,
    FIELD_FEATURE_MAP,
    getState: () => ({ ...state, features: { ...state.features } }),
    getFaceMode,
    setFaceMode,
    getFaceSynthesisMode,
    setFaceSynthesisMode,
    getFaceArchetype,
    setFaceArchetype,
    getDivergenceIntensity,
    setDivergenceIntensity,
    getDivergenceLevel,
    setDivergenceLevel,
    getCustomFaceTraits,
    setCustomFaceTraits,
    isFeatureInherited,
    setFeature,
    toggleFeature,
    getFeatureForField,
    isFieldLocked,
    isFieldInherited,
    getInheritedFieldText,
    resetAll,
    applyPreset,
    save,
    load,
    addListener: (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getPromptDirectives,
    getNegativePrompt: (opts) => getPromptDirectives(opts).standaloneNegativePrompt,
    createRefPickerCard,
    updateHeaderSessionPill
  };

})(typeof window !== 'undefined' ? window : this);
