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
      tokens: 'distinct high-fashion bone structure with defined cheekbones, unique wide-set almond eyes, a slender sculpted nasal bridge, and an elegant tapered jawline; an entirely different person with zero resemblance to the reference image'
    },
    chiseled: {
      id: 'chiseled',
      label: '💎 Chiseled / Editorial',
      shortLabel: 'Chiseled',
      tokens: 'chiseled architectural bone structure with sharp prominent high cheekbones, wide-set cat-like almond eyes, a slender sculpted nasal bridge, and a razor-defined angular jawline'
    },
    soft_oval: {
      id: 'soft_oval',
      label: '🌸 Soft Oval / Almond Eyes',
      shortLabel: 'Soft Oval',
      tokens: 'classic soft oval facial silhouette, gentle rounded jawline, luminous warm almond eyes, and a delicate, straight nose bridge with natural symmetry'
    },
    heart: {
      id: 'heart',
      label: '💖 Heart-Shaped',
      shortLabel: 'Heart-Shaped',
      tokens: 'distinct heart-shaped face with a delicate tapered chin, high arched brows, radiant expressive wide eyes, and softly defined cheekbones'
    },
    square: {
      id: 'square',
      label: '🏛️ Square Runway',
      shortLabel: 'Square Runway',
      tokens: 'bold high-fashion square jawline with clean angular bone structure, piercing editorial gaze, defined temple planes, and sculpted cheek contours'
    },
    round: {
      id: 'round',
      label: '✨ Round Soft',
      shortLabel: 'Round Soft',
      tokens: 'youthful soft rounded facial contours, gently curved jawline, large expressive bright rounded eyes, and natural full lips'
    },
    diamond: {
      id: 'diamond',
      label: '💠 Diamond Sculpted',
      shortLabel: 'Diamond',
      tokens: 'diamond-shaped facial contour with narrow forehead, prominent wide cheekbones, and a sharp tapered chin'
    }
  };

  // Field mapping across all 7 studios
  const FIELD_FEATURE_MAP = {
    haircut: [
      'hair', 'salonHaircut', 'tattooHair', 'prepHair', 'vidHair', 'sbHair', 'romanceHair',
      'hairCategory', 'salonHairCategory', 'tattooHairCategory', 'prepHairCategory',
      'vidHairCategory', 'sbHairCategory', 'romanceHairCategory',
      'fringe', 'parting', 'hairLength', 'hairVolume', 'fringeDetail'
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
      'romanceOutfit', 'romanceOutfitCategory'
    ],
    makeup: [
      'makeup', 'lipLook', 'eyeLook', 'browStyle', 'complexion',
      'prepMakeupStage', 'prepLipStyle', 'prepEyeStyle', 'prepSkinFinish', 'prepFacialMask'
    ],
    accessories: [
      'accessories', 'eyewear', 'bag', 'footwear', 'nailStyle', 'hairAccessories'
    ],
    pose: [
      'pose', 'poseCategory', 'tattooPose', 'romancePose', 'expression', 'gesture', 'mood',
      'salonChairPose', 'tattooExpression'
    ],
    background: [
      'background', 'sceneCategory', 'placeDetail',
      'salonVenue', 'salonVenueCategory', 'salonDesign',
      'tattooLocation', 'tattooLocationCategory',
      'prepVenue', 'prepVenueCategory',
      'vidEnvironment', 'sbVenue', 'sbVenueCategory',
      'romanceScene', 'romanceDateVenue'
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

  function notify() {
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
          ? 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo, draped and styled naturally around this newly synthesized face (strictly do not substitute with custom haircuts).'
          : 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo (strictly do not substitute with custom haircuts).';
      case 'hairTexture':
        return 'Faithfully retain the authentic natural hair strand texture, thickness, follicle density, and organic wave/curl pattern directly from the reference photo.';
      case 'hairColor':
        return 'Match the exact original hair color, undertones, and highlights from the reference photo.';
      case 'wardrobe':
        return 'Faithfully retain and replicate the exact original wardrobe, garments, tailoring, fabric weave, and color scheme worn in the reference photo (strictly do not substitute with custom garments).';
      case 'makeup':
        return isAi
          ? 'Faithfully retain and apply the exact cosmetic makeup styling, lip color palette, eyeliner, and skin finish from the reference photo, adapted seamlessly onto this new model\'s distinct facial anatomy (without copying the reference subject\'s lips, eye shape, or facial structure).'
          : 'Faithfully retain the exact original makeup styling, lip shade, eyeliner, and cosmetic skin finish from the reference photo.';
      case 'accessories':
        return isAi
          ? 'Faithfully retain all signature jewelry, piercings, earrings, and accessories visible in the reference photo, fitted naturally onto this new model\'s distinct proportions.'
          : 'Faithfully retain all signature jewelry, piercings, earrings, and accessories visible in the reference photo.';
      case 'pose':
        return 'Faithfully mirror the subject\'s exact original body pose, shoulder orientation, head angle, and stance from the reference photo.';
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

    if (isAiFace) {
      const arch = FACE_ARCHETYPES[state.faceArchetype] || FACE_ARCHETYPES.auto;
      const isDramatic = (state.divergenceIntensity === 'dramatic');
      const customTraits = state.customFaceTraits ? ` Unique distinguishing facial details: ${state.customFaceTraits}.` : '';

      if (state.faceSynthesisMode === 'sibling') {
        // Sibling Variation: Biological sister with mandatory anatomical divergence
        const intensityClause = isDramatic
          ? ' Mandatory dramatic sibling divergence: render strong structural contrast in facial planes, an unmistakably distinct jawline angle, and altered facial proportions so she is unequivocally recognized as a separate sibling with her own individual face.'
          : ' A side-by-side comparison must unmistakably reveal two distinct sisters with unique facial structures, NEVER an identical twin, digital clone, or duplicate face.';

        primaryBullets.push(
          `• MANDATORY SIBLING DIFFERENTIATION (BIOLOGICAL SISTER, NOT A CLONE): The subject is her biological sister, NOT the same woman. While sharing her natural Indian heritage, eye coloration, and warm skin undertones, you MUST visibly and noticeably differentiate her facial anatomy: alter the jawline width and chin contour, reshape the eye contour and eyelid fold, sculpt a noticeably different nasal bridge and tip, and modify the lip fullness featuring ${arch.tokens}.${customTraits}${intensityClause}`
        );
        negativeAdditions.push(
          'same woman as reference photo, duplicate reference face, identical face structure, 100% clone, identical twin copy, photo duplicate, unmodified reference face, facial identity clone, twin likeness, identical eye shape, identical nose bridge, identical jawline, identical facial proportions, copied reference facial geometry, digital clone of reference photo, unmodified reference photo cutout'
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
          'unmodified reference face, casual snapshot face, soft un-sculpted jawline, plain casual bone structure, un-chiseled face, identical casual reference face, duplicate reference photo face, un-elevated facial features, snapshot facial structure, rounded un-sculpted cheeks, unmodified reference jaw, plain un-sculpted face, distorted facial morphing, unnatural CGI smoothness, waxy plastic skin, warped facial features, unflattering facial distortion, digital doll face'
        );
      } else {
        // Unrelated Person (Default): 100% Face Swap, zero resemblance
        const intensityClause = isDramatic
          ? ' Mandatory dramatic face swap: total anatomical decoupling with strongly contrasted facial planes, zero shared facial identity, and completely independent facial proportions from the reference woman.'
          : '';

        primaryBullets.push(
          `• COMPLETE FACIAL IDENTITY REPLACEMENT (MANDATORY — 100% DIFFERENT PERSON): The subject in this photograph is a COMPLETELY DIFFERENT WOMAN from the person in the reference photograph. You must 100% DISCARD, OVERWRITE, and REPLACE the facial identity, facial structure, eye shape, nose shape, lips, and bone architecture of the reference woman. Synthesize a fresh, photorealistic, unique face autonomously with natural skin pores, authentic Indian heritage features, realistic symmetry, and expressive eyes featuring ${arch.tokens}.${customTraits}${intensityClause} Radical Face Swap: Under NO circumstances should this image resemble, clone, or preserve the facial identity, eye contour, nose bridge, or jawline of the woman in the reference photo.`
        );
        negativeAdditions.push(
          'same woman as reference photo, cloned reference face, copied reference facial identity, identical face to reference photo, duplicate reference face, same person as reference image, reference model likeness, identical facial features, identical eyes and nose, resembling reference face, facial resemblance to reference photo, twin of reference subject, unmodified original face, reference photo facial structure, face duplicate, reference face bleed, identical facial bone structure, copied reference nose, copied reference eyes, copied reference lips, duplicate identity'
        );
      }

      if (activeFeats.length === 8) {
        const modeDesc = (state.faceSynthesisMode === 'sibling')
          ? 'execute mandatory sibling facial reconstruction to synthesize a distinct biological sister with different facial geometry'
          : (state.faceSynthesisMode === 'reimagined')
            ? 'execute haute couture editorial remodeling to drastically elevate and re-sculpt her bone structure into a runway supermodel'
            : 'synthesize a completely fresh, photorealistic adult woman\'s face with unique facial features, authentic skin pores, and realistic bone structure that does not clone the reference face';
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
          ? '• Hairstyle & Silhouette (From Reference Photo): Strictly replicate and sculpt the exact hairstyle, haircut, length, parting, and silhouette from the reference image onto the new face.'
          : '• Hairstyle & Silhouette (From Reference Photo): Strictly replicate and sculpt the exact hairstyle, haircut, length, parting, and silhouette from the reference image.'
      );
    }
    if (state.features.hairTexture) {
      primaryBullets.push(
        '• Hair Texture & Density (From Reference Photo): Faithfully preserve the natural hair strand texture, thickness, follicle density, and organic finish visible in the reference image.'
      );
    }
    if (state.features.hairColor) {
      primaryBullets.push(
        '• Hair Color (From Reference Photo): Match the exact natural hair color, undertones, and highlights shown in the reference image.'
      );
    }
    if (state.features.wardrobe) {
      primaryBullets.push(
        '• Wardrobe & Clothing (From Reference Photo): Faithfully replicate the exact outfit, clothing design, tailoring, fabric weave, and color scheme worn in the reference image.'
      );
    }
    if (state.features.makeup) {
      primaryBullets.push(
        isAiFace
          ? '• Makeup Styling (On New Face): Replicate the reference image\'s cosmetic makeup styling, lip shade, and eyeliner onto this new model\'s distinct facial anatomy, without copying the reference subject\'s facial features, eye contour, or lip shape.'
          : '• Makeup Styling (From Reference Photo): Replicate the reference image\'s makeup styling, lip shade, eyeliner, and skin finish.'
      );
    }
    if (state.features.accessories) {
      primaryBullets.push(
        isAiFace
          ? '• Accessories & Jewelry (On New Face): Preserve and transfer all signature jewelry, piercings, earrings, and accessories visible in the reference image, fitted cleanly to the new model\'s proportions.'
          : '• Accessories & Jewelry (From Reference Photo): Preserve and transfer all signature jewelry, piercings, earrings, and accessories visible in the reference image.'
      );
    }
    if (state.features.pose) {
      primaryBullets.push(
        '• Pose & Stance (From Reference Photo): Mirror the subject\'s exact body pose, shoulder angle, and stance from the reference photo.'
      );
    }
    if (state.features.background) {
      primaryBullets.push(
        '• Setting & Background (From Reference Photo): Maintain the exact background environment, architectural ambiance, and setting from the reference photo.'
      );
    }

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
      headerPrefix,
      primaryBullets,
      negativeAdditions,
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
              <strong>💡 Pro-Tip for External Image Generators:</strong> When your reference image has a very clear face, use this prompt with <em>Style Reference / Image Conditioning</em> instead of Face/Character Cloner tools so the AI transfers styling while generating this fresh face.
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
    }

    renderContent();
    return card;
  }

  // Initial load
  load();

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
    createRefPickerCard
  };

})(typeof window !== 'undefined' ? window : this);
