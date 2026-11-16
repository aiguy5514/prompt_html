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
    Object.keys(state.features).forEach(k => { state.features[k] = false; });
    save();
    notify();
  }

  function applyPreset(presetKey) {
    switch(presetKey) {
      case 'original_look_fresh_face':
        state.faceMode = 'ai_generated';
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
          ? 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo onto this new face (strictly do not substitute with custom haircuts).'
          : 'Faithfully retain and replicate the exact original haircut silhouette, length, parting, and cut directly from the reference photo (strictly do not substitute with custom haircuts).';
      case 'hairTexture':
        return 'Faithfully retain the authentic natural hair strand texture, thickness, follicle density, and organic wave/curl pattern directly from the reference photo.';
      case 'hairColor':
        return 'Match the exact original hair color, undertones, and highlights from the reference photo.';
      case 'wardrobe':
        return 'Faithfully retain and replicate the exact original wardrobe, garments, tailoring, fabric weave, and color scheme worn in the reference photo (strictly do not substitute with custom garments).';
      case 'makeup':
        return 'Faithfully retain the exact original makeup styling, lip shade, eyeliner, and cosmetic skin finish from the reference photo.';
      case 'accessories':
        return 'Faithfully retain all signature jewelry, piercings, earrings, and accessories visible in the reference photo.';
      case 'pose':
        return 'Faithfully mirror the subject\'s exact original body pose, shoulder orientation, head angle, and stance from the reference photo.';
      case 'background':
        return 'Faithfully maintain the exact original background environment, room setting, and architectural ambiance from the reference photo.';
      default:
        return defaultVal !== undefined ? defaultVal : '';
    }
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
      if (activeFeats.length === 8) {
        headerPrefix = 'AI-GENERATED FACE WITH FULL REFERENCE LOOK RETENTION';
      } else if (hasAnyFeature) {
        headerPrefix = 'AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER';
      } else {
        headerPrefix = 'AI-GENERATED FACE & AUTONOMOUS STYLING';
      }
    } else {
      headerPrefix = (activeFeats.length === 8)
        ? 'FULL REFERENCE LOOK & IDENTITY GUIDED PORTRAIT'
        : 'REFERENCE-IMAGE GUIDED PORTRAIT';
    }

    const primaryBullets = [];
    const negativeAdditions = [];

    if (isAiFace) {
      primaryBullets.push(
        '• AI-Generated Face (Do NOT copy reference face): Synthesize a fresh, completely original, photorealistic adult woman\'s face with natural skin pores, authentic Indian heritage features, realistic symmetry, and expressive eyes. Strictly do NOT clone, replicate, or copy the facial identity, features, or bone structure of the woman in the reference photo.'
      );
      negativeAdditions.push('cloned reference face, copied reference facial identity, identical face to reference photo, duplicate reference face');

      if (activeFeats.length === 8) {
        primaryBullets.push(
          '• Master Synthesis Directive (Retain Original Look + Fresh AI Face): Strictly retain the complete original look—exact hairstyle, hair texture, hair color, wardrobe garments, makeup, jewelry, body pose, and background environment—from the reference photo, but synthesize a completely fresh, photorealistic adult woman\'s face with unique facial features, authentic skin pores, and realistic bone structure that does not clone the reference face.'
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
        '• Hairstyle & Silhouette (From Reference Photo): Strictly replicate and sculpt the exact hairstyle, haircut, length, parting, and silhouette from the reference image' + (isAiFace ? ' onto the new face.' : '.')
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
        '• Makeup Styling (From Reference Photo): Replicate the reference image\'s makeup styling, lip shade, eyeliner, and skin finish.'
      );
    }
    if (state.features.accessories) {
      primaryBullets.push(
        '• Accessories & Jewelry (From Reference Photo): Preserve and transfer all signature jewelry, piercings, earrings, and accessories visible in the reference image.'
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
              <small>${isAi ? '✨ AI generates a fresh, unique face on the model. Her outfit, hair, pose, and setting will be preserved from your reference photo per the chips selected below.' : '👤 Retains the actual face and identity of the woman from your reference photo.'}</small>
            </div>
            <div class="seg-control ref-face-seg">
              <button type="button" class="seg-btn ${!isAi ? 'active' : ''}" data-face="reference">👤 Retain Reference Face</button>
              <button type="button" class="seg-btn ${isAi ? 'active' : ''}" data-face="ai_generated">✨ AI Generate Fresh Face</button>
            </div>
          </div>

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
    FIELD_FEATURE_MAP,
    getState: () => ({ ...state, features: { ...state.features } }),
    getFaceMode,
    setFaceMode,
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
