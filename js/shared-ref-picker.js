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
      tokens: 'distinct high-fashion bone structure with defined cheekbones, ((sculpted facial anatomy: wide-set luminous almond eyes with defined supratarsal double-eyelid crease:1.2)), ((slender straight nasal bridge with refined supratip break and sculpted gently upturned tip:1.15)), ((crisp pronounced Cupid\'s bow with defined vertical philtral columns and plush lower vermilion border:1.15)), ((high sculpted zygomatic cheekbones tapering cleanly to an elegant defined jawline and delicate tapered chin with a soft submental crease:1.25))'
    },
    chiseled: {
      id: 'chiseled',
      label: '💎 Chiseled / Editorial',
      shortLabel: 'Chiseled',
      tokens: 'chiseled architectural bone structure with sharp prominent high cheekbones, haute-couture bone structure: ((elongated feline-angled piercing almond eyes with taut upper lid crease and wide intercanthal spacing:1.2)), ((razor-straight ultra-narrow nasal bridge with chiseled pinpoint-projected tip:1.2)), ((sculpted architectural lips with razor-delineated geometric Cupid\'s bow and flat vermilion contours:1.15)), ((deep sunken submalar hollows, razor-sharp 115-degree mandibular jawline, and a firm chiseled square-tapered chin:1.25))'
    },
    soft_oval: {
      id: 'soft_oval',
      label: '🌸 Soft Oval / Almond Eyes',
      shortLabel: 'Soft Oval',
      tokens: 'classic soft oval facial silhouette with a gentle rounded jawline, harmonious facial geometry: ((large warm luminous rounded-almond eyes with soft delicate double eyelid folds and balanced symmetrical spacing:1.2)), ((slender gently sloping nasal bridge with smooth continuous dorsal lines and soft naturally rounded petite tip:1.15)), ((petal-soft balanced lips with smooth curving Cupid\'s bow and even vermilion fullness:1.15)), ((seamless curved oval jawline with zero harsh angles, and a soft naturally rounded feminine chin:1.2))'
    },
    heart: {
      id: 'heart',
      label: '💖 Heart-Shaped',
      shortLabel: 'Heart-Shaped',
      tokens: 'distinct heart-shaped face with a delicate tapered chin, high arched brows, ((radiant expressive wide doe eyes with deep supratarsal crease and lifted outer corners:1.2)), ((delicate petite nose with narrow slightly scooped concave bridge and tiny perky upturned button tip:1.2)), ((plush doll-like pout with accentuated heart-peaked Cupid\'s bow:1.15)), ((wide prominent anterior cheekbones tapering steeply inward to a dainty pointed micro-chin:1.25))'
    },
    square: {
      id: 'square',
      label: '🏛️ Square Runway',
      shortLabel: 'Square Runway',
      tokens: 'bold high-fashion square jawline with clean angular bone structure, commanding square facial architecture: ((intense deep-set horizontal eyes under a structured straight brow ridge with taut hooded upper eyelid crease:1.2)), ((strong broad straight nasal bridge with uniform width and firm squared-off tip profile:1.2)), ((wide horizontal lip span with crisp wide-peaked Cupid\'s bow:1.15)), ((flat structured cheek planes, sharp bilateral mandibular angles, and a wide flat chiseled square chin:1.25))'
    },
    round: {
      id: 'round',
      label: '✨ Round Soft',
      shortLabel: 'Round Soft',
      tokens: 'youthful soft rounded facial contours, gently curved jawline, ((large bright circular rounded eyes with wide-open aperture and prominent curved lower lid contour:1.2)), ((short petite nose with gentle low bridge and cute softly rounded fleshy button tip:1.2)), ((ultra-full plush cushion lips with pillowy lower lip volume and soft curving Cupid\'s bow:1.15)), ((supple rounded apple cheeks and a short rounded button chin:1.2))'
    },
    diamond: {
      id: 'diamond',
      label: '💠 Diamond Sculpted',
      shortLabel: 'Diamond',
      tokens: 'diamond-shaped facial contour with narrow forehead, prominent wide cheekbones, ((dramatic slanted feline almond eyes with tight epicanthal taper and deep outer orbital recess:1.2)), ((slender high-contrast nasal bridge with sharp geometric facets and an acutely sculpted tapered tip:1.2)), ((sharply contoured angular lips with an ultra-defined sharp V-notch Cupid\'s bow:1.15)), ((ultra-wide high-projecting zygomatic arches and a sharp narrow triangular V-line chin:1.25))'
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
      'pose', 'poseCategory', 'tattooPose', 'romancePose', 'expression', 'gesture', 'mood',
      'salonChairPose', 'tattooExpression', 'gymMovement', 'gymPhase', 'gymExpression'
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
          ? 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo, draped and styled naturally around this newly synthesized face (strictly do not substitute with custom haircuts, and do not copy the reference face).'
          : 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo (strictly do not substitute with custom haircuts).';
      case 'hairTexture':
        return isAi
          ? 'Faithfully retain the authentic natural hair strand texture, thickness, follicle density, and organic wave/curl pattern directly from the reference photo, rendered cleanly on this newly synthesized model.'
          : 'Faithfully retain the authentic natural hair strand texture, thickness, follicle density, and organic wave/curl pattern directly from the reference photo.';
      case 'hairColor':
        return isAi
          ? 'Match the exact original hair color, undertones, and highlights from the reference photo, applied to this newly synthesized model\'s hair.'
          : 'Match the exact original hair color, undertones, and highlights from the reference photo.';
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

    if (isAiFace) {
      const arch = FACE_ARCHETYPES[state.faceArchetype] || FACE_ARCHETYPES.auto;
      const isDramatic = (state.divergenceIntensity === 'dramatic');
      const DEFAULT_DISTINCT_TRAITS = 'a sharply defined vertical philtrum column groove, photorealistic subtle facial asymmetry between brow arches, refined infraorbital contour depth, and a clean distinct submental chin crease';
      const customTraits = state.customFaceTraits
        ? ` Unique distinguishing facial details: ${state.customFaceTraits}.`
        : ` Distinct individual facial landmarks: ${DEFAULT_DISTINCT_TRAITS}.`;

      if (state.faceSynthesisMode === 'sibling') {
        // Sibling Variation: Biological sister with mandatory anatomical divergence
        const intensityClause = isDramatic
          ? ' Mandatory dramatic sibling divergence: render strong structural contrast in facial planes, an unmistakably distinct jawline angle, and altered facial proportions so she is unequivocally recognized as a separate sibling with her own individual face.'
          : ' A side-by-side comparison must unmistakably reveal two distinct sisters with unique facial structures, NEVER an identical twin, digital clone, or duplicate face.';

        primaryBullets.push(
          `• MANDATORY SIBLING DIFFERENTIATION (BIOLOGICAL SISTER, NOT A CLONE): The subject is her biological sister, NOT the same woman. While sharing her natural Indian heritage, eye coloration, and warm skin undertones, you MUST visibly and noticeably differentiate her facial anatomy: alter the jawline width and chin contour, reshape the eye contour and eyelid fold, sculpt a noticeably different nasal bridge and tip, and modify the lip fullness featuring ${arch.tokens}.${customTraits}${intensityClause}`
        );
        negativeAdditions.push(
          'cloned face, duplicate face, identical face structure, 100% clone, identical twin copy, facial identity clone, twin likeness, duplicate facial geometry, digital clone face, twin copy, identical eye shape, identical nose bridge, identical jawline, identical facial proportions'
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
        if (isDramatic) {
          switch (state.faceArchetype) {
            case 'soft_oval':
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling featuring an unmistakably distinct soft oval silhouette, gentle rounded jaw contours, distinct rounded-almond eyes, and unique individual facial proportions.';
              break;
            case 'round':
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling featuring distinctly soft rounded facial contours, gently curved jawline, large expressive bright rounded eyes, and natural full lips.';
              break;
            case 'heart':
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling featuring a delicate tapered chin, high arched brows, radiant expressive wide doe eyes, and softly defined cheekbones.';
              break;
            case 'square':
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling featuring a bold high-fashion square jawline with clean angular bone structure, piercing editorial gaze, and sculpted cheek contours.';
              break;
            case 'diamond':
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling featuring wide prominent cheekbones, narrow refined temple planes, and a sharp tapered chin.';
              break;
            case 'chiseled':
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling featuring extreme high-fashion bone architecture with sharp prominent cheekbones, razor-sharp jawline definition, and piercing wide-set eyes.';
              break;
            case 'auto':
            default:
              intensityClause = ' Mandatory dramatic face swap: total anatomical decoupling with pronounced facial plane contrast, sculpted high-fashion cheekbones, wide-set luminous eyes with distinct orbital depth, a slender sculpted nasal bridge, and an elegant tapered jawline.';
              break;
          }
        } else {
          intensityClause = ' Render distinct, natural facial geometry with an independently proportioned jawline, custom eyelid contour, and unique facial symmetry.';
        }

        primaryBullets.push(
          `• FULL AUTONOMOUS FACIAL ANATOMY (MANDATORY 100% INDEPENDENT IDENTITY): ((A completely different female model, entirely new face:1.35)) featuring ${arch.tokens}.${customTraits}${intensityClause} Authentic photographic skin rendering: natural micro-pores, realistic facial asymmetry, and dermal depth.`
        );
        negativeAdditions.push(
          'cloned face, duplicate face, twin likeness, identical facial structure, duplicate person, facial replica, repeated facial features, lookalike, digital face mask, identity clone, duplicate facial geometry, identical bone structure, artificial face twin, digital face swap mask, face clone, duplicate model face, generic face clone, identical facial symmetry copy, same face as reference, reference facial likeness, duplicate facial features of reference, reference face clone, identical twin to reference, same person as reference, duplicate woman face, matching reference face, facial identity bleed'
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
          '• CRITICAL FACE DECOUPLING & ZERO IDENTITY RETENTION: Only the specified hair attributes (haircut silhouette, strand texture, and hair color) are transferred from the reference photo onto this newly synthesized AI face. The woman\'s face visible in the reference photo must NOT be used: completely replace her eyes, eye shape, nose bridge, nostrils, lips, mouth, jawline, chin, and bone structure with an entirely new, independent adult woman\'s face possessing unique facial architecture. Strictly zero facial identity retention from the reference photo.'
        );
        negativeAdditions.push(
          'original face from reference, reference photo face, reference image face, reference woman face, identical face to reference, face from reference photo, face from reference image, face likeness of reference woman, facial resemblance to reference subject, facial feature transfer from reference, reference facial bone structure, face preservation, identity retention'
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
          ? '• Hairstyle & Silhouette: Strictly replicate and sculpt the exact hairstyle, haircut, length, parting, and silhouette from the reference image onto the new face (draped naturally around her new, independent facial anatomy; do not copy the reference face).'
          : '• Hairstyle & Silhouette (From Reference Photo): Strictly replicate and sculpt the exact hairstyle, haircut, length, parting, and silhouette from the reference image.'
      );
    }
    if (state.features.hairTexture) {
      primaryBullets.push(
        isAiFace
          ? '• Hair Texture & Density: Faithfully preserve the natural hair strand texture, thickness, follicle density, and organic finish visible in the reference image (rendered on this newly synthesized model).'
          : '• Hair Texture & Density (From Reference Photo): Faithfully preserve the natural hair strand texture, thickness, follicle density, and organic finish visible in the reference image.'
      );
    }
    if (state.features.hairColor) {
      primaryBullets.push(
        isAiFace
          ? '• Hair Color: Match the exact natural hair color, undertones, and highlights shown in the reference image (applied to this new model\'s hair).'
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
        isAiFace
          ? '• Pose & Stance: Mirror the subject\'s exact body pose, shoulder angle, and stance from the reference photo.'
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
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <strong>💡 Pro-Tip for External Image Generators:</strong>
                <span style="font-size: 9.5px; color: #a855f7; background: rgba(168,85,247,0.15); padding: 1px 6px; border-radius: 4px;">Fresh Face Setup Guide</span>
              </div>
              <div style="font-size: 10px; line-height: 1.45; color: #cbd5e1;">
                • <strong>Avoid Face-Cloning Tools:</strong> Turn OFF FaceSwap, FaceID, or InstantID (which forcibly clone the reference face).<br>
                • <strong>Transfer Hair &amp; Pose Cleanly:</strong> Use <em>Image Prompt / Style Conditioning</em> (weight 0.4–0.5) or <em>ControlNet (OpenPose)</em>. Do NOT use Character Reference with face-locking parameters.<br>
                • <strong>Seed Stabilization:</strong> The prompt specifies strong distinct facial landmarks and negative tokens to guarantee a completely new person across seeds.
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
