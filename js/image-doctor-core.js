/**
 * Afterglow Studio Suite — Image Doctor: Surgical Inpaint & Edit Engine
 * Module for image_doctor.html: targeted surgical editing of an existing reference photo.
 * Generates inpaint-ready and img2img prompts that modify only requested attributes
 * (haircut, nose, eyebrows, lips, eyes, clothes, etc.) while generating uncompromising
 * preservation locks for everything else.
 */

(function(root) {
  'use strict';

  const {
    O, makeOpts, addOptions,
    HAIR_FAMILIES, hair, hairFaceCoverageOpts,
    OUTFIT_FAMILIES, outfit,
    TOP_FAMILIES, topPieces,
    BOTTOM_FAMILIES, bottomPieces,
    midriffStylings
  } = window.AfterglowDatasets;

  const {
    parseVeilTier, detectHairArchitecture, getVeilRule,
    dedupeNegatives, estimateTokens,
    extractPositivePrompt, extractNegativePrompt
  } = window.AfterglowVeil;

  // =========================================================================
  // PRESERVATION LOCK DEFINITIONS
  // =========================================================================
  const PRESERVE_LOCKS = [
    {
      id: 'identity',
      label: 'Model Facial Identity & Architecture',
      desc: 'Preserves model bone structure and recognizable facial traits unless surgical face edits are picked below',
      icon: '👤',
      defaultVal: true,
      preserveText: 'Strictly preserve the same adult woman\'s recognizable facial identity, skull geometry, eye spacing, nose root position, and lip contours from the reference image without replacing her face or introducing identity drift.'
    },
    {
      id: 'skinTone',
      label: 'Skin Pigmentation & Pore Micro-Texture',
      desc: 'Preserves exact skin tone, authentic warm dermal undertones, visible micro-pores, and natural skin grain',
      icon: '✨',
      defaultVal: true,
      preserveText: 'Maintain exact skin tone, authentic warm Indian dermal undertones, visible micro-pores, and natural cellular skin texture without airbrushing, beauty filters, or waxy smoothing.'
    },
    {
      id: 'hair',
      label: 'Existing Hairstyle & Hair Color',
      desc: 'Locks current haircut shape, volume, length, and hair color exactly as seen in reference photo',
      icon: '💇‍♀️',
      defaultVal: true,
      preserveText: 'Strictly keep the existing hairstyle, haircut geometry, strand volume, hair length, and hair color exactly as seen in the reference image without alteration.'
    },
    {
      id: 'wardrobe',
      label: 'Existing Clothing & Garments',
      desc: 'Locks all clothing cuts, fabric textures, colors, and styling exactly as worn in reference',
      icon: '👗',
      defaultVal: true,
      preserveText: 'Keep all existing clothing, neckline cuts, garment fabric drape, patterns, and colors completely unchanged from the reference image.'
    },
    {
      id: 'body',
      label: 'Body Proportions & Physique',
      desc: 'Locks shoulder width, neck length, collarbone contours, and authentic natural body silhouette',
      icon: '🧍‍♀️',
      defaultVal: true,
      preserveText: 'Preserve her authentic natural body proportions, collarbone definition, shoulder width, and silhouette without slimming, reshaping, or anatomical exaggeration.'
    },
    {
      id: 'pose',
      label: 'Body Pose, Stance & Head Angle',
      desc: 'Locks body posture, head tilt, shoulder angle, neck rotation, and hand positions',
      icon: '↗',
      defaultVal: true,
      preserveText: 'Preserve exact body posture, head tilt, neck angle, shoulder orientation, and arm/hand placement from the reference photo.'
    },
    {
      id: 'background',
      label: 'Setting, Environment & Background',
      desc: 'Locks venue, background decor, depth-of-field blur, objects, and surrounding scene',
      icon: '🏛️',
      defaultVal: true,
      preserveText: 'Keep the original environment, background elements, depth-of-field bokeh, and surrounding scene 100% intact and unaltered.'
    },
    {
      id: 'lighting',
      label: 'Lighting Setup & Direction',
      desc: 'Locks directional key light, ambient shadow softness, color temperature, and highlight contours',
      icon: '💡',
      defaultVal: true,
      preserveText: 'Preserve the original lighting direction, ambient shadow softness, color temperature, and highlight falloff contours identical to the source image.'
    },
    {
      id: 'accessories',
      label: 'Jewelry, Eyewear & Props',
      desc: 'Locks earrings, nose rings, necklaces, watches, glasses, and hairpins',
      icon: '💎',
      defaultVal: true,
      preserveText: 'Keep all visible jewelry, earrings, nose rings, necklaces, bracelets, and accessories identical to the reference image.'
    },
    {
      id: 'expression',
      label: 'Facial Expression & Eye Gaze',
      desc: 'Locks candid expression, lip relaxation, subtle smile, and eye gaze direction',
      icon: '👁️',
      defaultVal: true,
      preserveText: 'Retain the exact mood, candid facial expression, relaxed mouth, and eye gaze direction from the reference photo.'
    }
  ];

  // =========================================================================
  // SURGICAL FACE EDITS DATASETS
  // =========================================================================
  const faceShapeOpts = [
    O('Keep reference face shape', 'keep_ref'),
    O('Refined high-fashion oval contour', 'surgically refine the facial contour into a balanced, elegant high-fashion oval silhouette with gentle curves and clean jaw taper'),
    O('Sculpted chiseled cheekbones', 'sculpt prominent high cheekbones with defined zygomatic arches and subtle submalar hollows'),
    O('Delicate heart-shaped contour', 'sculpt a delicate heart-shaped face with high cheekbones tapering cleanly to a dainty pointed chin'),
    O('Structured square runway jaw', 'sculpt a commanding structured jawline with crisp bilateral mandibular angles and strong horizontal symmetry'),
    O('Youthful soft rounded silhouette', 'sculpt a youthful soft rounded facial contour with gentle curves, supple cheeks, and zero harsh angles'),
    O('Sculpted diamond silhouette', 'sculpt a high-fashion diamond facial geometry with wide dramatic cheekbones and tapered jawline')
  ];

  const eyebrowOpts = [
    O('Keep reference eyebrows', 'keep_ref'),
    O('Full feathered natural arches', 'reshape eyebrows into full, soft feathered natural arches with realistic individual hair strokes and soft diffused heads'),
    O('Crisp microbladed defined arches', 'sculpt crisp, precisely defined microbladed eyebrows with sharp tail tapering and uniform dense pigmentation'),
    O('Brushed-up laminated fluffy brows', 'style eyebrows with modern brushed-up laminated texture, visible upward strand separation, and soft natural fullness'),
    O('Soft straight Korean-style brows', 'soften eyebrows into straight, gentle horizontal brows with minimal arch and youthful framing'),
    O('Dramatic high-arched editorial brows', 'shape into dramatic high-arched editorial eyebrows with clean, confident lines and lifted outer tails'),
    O('Darker filled defined arches', 'deepen eyebrow pigment with rich, natural depth and cleanly groomed, defined outer tails'),
    O('Slim sculpted 90s retro arches', 'reshape into slim, precisely defined 90s-inspired sculpted arches with clean brow bone highlight')
  ];

  const eyeShapeOpts = [
    O('Keep reference eye shape', 'keep_ref'),
    O('Alluring elongated almond cat-eye contour', 'surgically reshape eyes into alluring elongated almond eyes with subtle feline outer canthal lift'),
    O('Wide expressive luminous doe eyes', 'open eye aperture into luminous, expressive wide doe eyes with prominent supratarsal crease and soft lower lid contour'),
    O('Crisp defined double eyelid fold', 'sculpt clean, crisp double eyelid supratarsal creases with balanced upper lid exposure and clear eyelid crease definition'),
    O('Intense hooded smoldering eyes', 'refine upper eyelids with a subtle deep-set hooded contour for an intense, smoldering editorial gaze'),
    O('Upturned youthful outer canthal tilt', 'gently lift the lateral canthal angle for a youthful, confident upturned eye tilt with smooth symmetry')
  ];

  const eyeColorOpts = [
    O('Keep reference eye color', 'keep_ref'),
    O('Deep obsidian black irises', 'deep luminous obsidian-black irises with sharp pupil contrast and clear glassy cornea reflections'),
    O('Warm golden-amber hazel irises', 'warm hazel irises with rich honey and golden-amber radial undertones catching directional light'),
    O('Espresso chocolate brown irises', 'rich espresso chocolate brown irises with delicate radial striae and warm depth'),
    O('Olive green with amber flecks', 'deep olive-green irises with subtle amber flecks surrounding the pupil and dark limbal ring'),
    O('Caramel topaz warmth', 'clear warm caramel topaz brown irises with bright reflective catchlights and golden highlights')
  ];

  const noseOpts = [
    O('Keep reference nose', 'keep_ref'),
    O('Slender straight bridge + refined tip', 'surgically refine the nose to a slender straight nasal bridge with a defined, gently upturned refined tip and crisp supratip break'),
    O('Petite upturned button nose', 'sculpt a petite nose with a gently scooped concave dorsal bridge and cute rounded button tip'),
    O('Slim sculpted dorsal bridge', 'narrow the nasal bridge with clean, straight dorsal aesthetic lines and refined symmetry'),
    O('Subtle natural soft slope', 'smooth the nasal profile with an organic, natural soft slope and balanced nostril proportion'),
    O('Aristocratic defined straight profile', 'sculpt a noble, defined straight nasal profile with commanding architectural precision and clean columella support'),
    O('Narrowed refined nostril wings', 'refine and narrow the nasal alar base and nostril contours with clean symmetry and soft shadowing')
  ];

  const lipOpts = [
    O('Keep reference lips', 'keep_ref'),
    O('Plush natural volume + crisp Cupid\'s bow', 'refine lips into plush natural volume with a crisply delineated Cupid\'s bow, defined philtral columns, and soft lower vermilion pillowing'),
    O('Full pillowy satin lips', 'increase lip fullness into soft, pillowy contours with smooth horizontal symmetry and hydrated fullness'),
    O('Subtle elegant lip volume', 'gently enhance lip borders with restrained, natural fullness and soft healthy hydration'),
    O('Sculptural sharp Cupid\'s bow peak', 'accentuate the vertical philtral columns and sharp peaked Cupid\'s bow with sculptural clarity'),
    O('Soft natural berry-tinted pout', 'tint and plump lips with a soft natural berry flush and gentle rested parting'),
    O('Understated French natural lip', 'refine lips into an understated Parisian natural aesthetic with soft matte edges and balanced fullness')
  ];

  const jawlineOpts = [
    O('Keep reference jawline & chin', 'keep_ref'),
    O('Razor-sharp defined mandibular jawline', 'sculpt a crisp, razor-sharp jawline contour from ear to chin with clean shadow separation from the neck'),
    O('Soft feminine tapered jaw & petite chin', 'soften jawline into a graceful feminine taper leading to a delicate, rounded chin with smooth contours'),
    O('Sculpted 115-degree editorial jaw angle', 'carve a structured 115-degree mandibular jaw angle with clean editorial authority and defined submental plane'),
    O('Dainty pointed micro-chin', 'refine the lower face with a dainty tapered micro-chin and smooth submental transition'),
    O('Defined square runway chin', 'sculpt a firm, slightly squared-off runway chin profile with clean horizontal symmetry'),
    O('Subtle cleft chin indentation', 'add a faint, elegant central cleft chin indentation with realistic natural skin shadowing')
  ];

  const cheekOpts = [
    O('Keep reference cheeks', 'keep_ref'),
    O('High sculpted zygomatic cheekbones', 'sculpt high, pronounced zygomatic cheekbones with elegant angular definition and luminous light catch'),
    O('Soft youthful apple cheeks', 'enhance cheeks with gentle, supple apple cheek volume and radiant youthful fullness'),
    O('Subtle editorial hollows beneath cheekbones', 'sculpt subtle submalar cheek hollows that accentuate facial bone structure with soft gradient shading')
  ];

  const skinFinishOpts = [
    O('Keep reference skin finish', 'keep_ref'),
    O('Pristine glass-skin with visible micro-pores', 'refine complexion into ultra-hydrated glass skin with luminous dewiness while strictly keeping natural micro-pores and realistic skin texture'),
    O('Velvety soft-focus matte finish', 'render a smooth, soft-focus velvet matte complexion with clean oil-free texture and visible pores'),
    O('Sun-kissed warm golden radiance', 'impart a healthy, sun-kissed golden radiance with warm natural dermal flush on cheeks and nose bridge'),
    O('Fresh post-spa dewy glow', 'infuse skin with a fresh post-facial dewy glow, subtle moisture sheen on high points, and zero artificial plastic shine'),
    O('Raw unfiltered natural realism', 'keep raw unfiltered authentic skin with natural skin grain, subtle tone variations, and fine facial micro-details')
  ];

  // =========================================================================
  // HAIR EDITS DATASETS
  // =========================================================================
  const hairEditActionOpts = [
    O('Complete haircut replacement', 'surgically replace the existing hair with the chosen new haircut while perfectly integrating the natural hairline with her forehead'),
    O('Subtle trim & ends reshaping', 'subtly reshape the existing haircut, evening out the hemline and dusting split ends while maintaining current length'),
    O('Face-framing layers & curtain bangs', 'carve soft face-framing layers and wispy curtain bangs into the existing hair, blending seamlessly'),
    O('Full eyebrow-grazing blunt fringe', 'add crisp, precisely cut eyebrow-grazing blunt bangs onto the forehead while keeping the rest of the hair length intact'),
    O('Voluminous salon blowout restyling', 'restyle the existing haircut with soaring root lift, bouncy barrel-waved volume, and airy salon movement')
  ];

  const hairColorOpts = [
    O('Keep reference hair color', 'keep_ref'),
    O('Deep natural obsidian black', 'deep natural obsidian-black hair with subtle realistic cool highlights'),
    O('Rich espresso brunette', 'rich espresso brunette hair with dimensional warm undertones'),
    O('Warm chocolate brown', 'warm chocolate brown hair with soft chestnut depth'),
    O('Soft chestnut brown', 'soft chestnut brown with natural tone variations'),
    O('Caramel ribbons balayage', 'subtle caramel ribbons blended naturally through the mid-lengths and ends'),
    O('Cool ash brown', 'cool ash brown hair with restrained, muted dimensional sheen'),
    O('Rich copper auburn', 'rich vibrant copper auburn hair with dimensional fiery undertones'),
    O('Deep burgundy wine tint', 'deep burgundy-tinted brunette hair with luminous jewel-toned highlights'),
    O('Honey blonde balayage + dark roots', 'honey-blonde balayage with believable root depth and soft gradient transition'),
    O('Champagne platinum blonde', 'cool champagne platinum blonde with realistic shadow root depth'),
    O('Rose gold brown tint', 'subtle rose gold brown tint with delicate warm shimmer')
  ];

  const hairLengthOpts = [
    O('Keep haircut default length', 'keep_ref'),
    O('Cropped pixie ear-level length', 'cropped pixie length grazing the upper ear'),
    O('Chin / jawline bob length', 'ending crisply at chin and jawline level'),
    O('Collarbone lob length', 'grazing the collarbones with relaxed movement'),
    O('Armpit / upper chest length', 'falling past collarbones to upper chest level'),
    O('Mid-back bra-strap length', 'flowing down to mid-back level with healthy weight'),
    O('Waist-grazing long hair', 'flowing all the way down to the waistline with luxurious density'),
    O('Hip-length flowing locks', 'dramatic hip-length flowing locks with rich weight and movement')
  ];

  const hairTextureOpts = [
    O('Keep haircut default texture', 'keep_ref'),
    O('Pin-straight sleek glass hair', 'pin-straight hair with sleek glass-smooth alignment and clean reflection'),
    O('Lived-in soft undone waves', 'lived-in, soft undone S-waves with natural strand separation'),
    O('Defined bouncy corkscrew curls', 'defined, bouncy corkscrew curls with elastic spring and zero frizz'),
    O('Glossy Hollywood glamour waves', 'sculpted, uniform glossy Hollywood waves with continuous undulating ridges'),
    O('Airy piecey textured strands', 'piecey, textured strands with defined separation and light movement'),
    O('Textured beachy crimp', 'textured beach-blown crimp with subtle organic volume')
  ];

  const hairFinishOpts = [
    O('Keep default finish', 'keep_ref'),
    O('Fresh salon blow-dry finish', 'freshly blown-out salon finish with natural soft silkiness and organic sheen'),
    O('Glossy editorial shine', 'glossy editorial finish with clean light catches and zero plastic sheen'),
    O('Touchably soft natural matte', 'touchably soft natural finish with organic hair fiber texture'),
    O('Subtle wind-blown movement', 'subtle wind-touched movement with delicate micro-flyaways catching light'),
    O('Wet-look hydro sheen', 'soaked wet-look hair styling with sleek damp separation and glossy moisture sheen')
  ];

  // =========================================================================
  // WARDROBE & STYLING EDITS DATASETS
  // =========================================================================
  const outfitFitOpts = [
    O('Keep believable garment fit', 'natural garment fit with realistic tailoring and fabric tension'),
    O('Relaxed oversized editorial fit', 'relaxed oversized editorial fit with believable folds and effortless drape'),
    O('Crisp structured tailored fit', 'crisp structured tailored fit with clean seams and sharp silhouette lines'),
    O('Flowing organic movement', 'flowing fabric movement with graceful drapery captured naturally'),
    O('Sleek body-contouring fit', 'sleek body-contouring silhouette following her natural form with clean seams')
  ];

  const makeupOpts = [
    O('Keep reference makeup', 'keep_ref'),
    O('Clean bare-faced no-makeup makeup', 'clean no-makeup makeup look with fresh bare skin, natural lip tint, and groomed brows'),
    O('Soft glam with defined lashes', 'soft glam makeup with warm neutral eyeshadow, defined lashes, and soft satin nude lips'),
    O('Classic sharp black winged liner', 'sharp black winged liquid eyeliner with clean feline flick and natural satin lips'),
    O('Smoky charcoal eyes + nude satin lip', 'smoky charcoal eyeshadow with blended pencil liner paired with an understated nude lip'),
    O('Statement bold matte crimson red lip', 'statement velvety matte crimson red lip with clean restrained eye makeup'),
    O('Warm bronzed goddess makeup', 'warm bronzed makeup with sun-kissed terracotta tones and soft golden highlights'),
    O('Fresh rose-petal monochrome makeup', 'fresh rose-petal monochrome flush across cheeks, lips, and eyelids with soft dewy finish'),
    O('Dewy glass-skin highlight makeup', 'dewy glass-skin beauty makeup with radiant high points and glossy hydrated lips')
  ];

  const accessoriesOpts = [
    O('Keep reference accessories', 'keep_ref'),
    O('Remove all accessories (clean minimal look)', 'no visible jewelry or accessories; keep collarbones, neck, and ears completely clean and bare'),
    O('Delicate gold micro-hoop earrings', 'delicate fine gold micro-hoop earrings hugging the earlobes'),
    O('Sculptural bold gold statement earrings', 'sculptural bold modern gold statement earrings with architectural curve'),
    O('Fine layered gold chain necklaces', 'fine delicate layered gold chain necklaces resting gracefully on the collarbones'),
    O('Classic single pearl pendant & studs', 'classic luminous single pearl pendant necklace paired with matching pearl stud earrings'),
    O('Sleek minimalist steel watch', 'sleek minimalist steel wrist watch with understated bracelet styling'),
    O('Modern tortoiseshell designer sunglasses', 'modern tortoiseshell designer sunglasses worn or held casually as a fashion prop'),
    O('Traditional gold jhumka earrings', 'intricately crafted traditional gold jhumka earrings with delicate jingle beads')
  ];

  // =========================================================================
  // INPAINT & EDIT METHOD DEFINITIONS
  // =========================================================================
  const editModeOpts = [
    O('Surgical Inpaint (Region-Locked)', 'inpaint', 'Targeted replacement prompt optimized for inpainting brush masks, regional canvas inpainting, and generative fill tools.'),
    O('Global img2img (Full Frame Edit)', 'img2img', 'Comprehensive prompt with weighted preservation clauses for untouched areas and explicit transform clauses for modified features.'),
    O('Creative Restyle (Preserve Face & Pose)', 'restyle', 'Bold stylistic transformation that strictly anchors the model\'s identity and pose while reinventing hair, wardrobe, and mood.')
  ];

  const inpaintMaskTargetOpts = [
    O('Auto-detect from selected edits', 'auto'),
    O('Face Features Mask (Nose, Brows, Eyes, Lips, Skin)', 'face_features'),
    O('Hair & Scalp Area Mask', 'hair_scalp'),
    O('Wardrobe & Clothing Area Mask', 'wardrobe_only'),
    O('Face + Hair Combined Mask', 'face_hair'),
    O('Full Subject (Everything except Background)', 'full_subject')
  ];

  // =========================================================================
  // STARTER EDIT PRESETS
  // =========================================================================
  const STARTER_PRESETS = [
    {
      id: 'haircut_bob_only',
      title: 'Haircut Swap: French Bob',
      sub: 'Change haircut only · Lock face, skin, clothes & scene',
      icon: '✂️',
      edits: {
        hairCutAction: 'Complete haircut replacement',
        haircut: 'Chin-length French bob with soft eyebrow-grazing fringe',
        hairColor: 'Deep natural obsidian black',
        hairLength: 'Chin / jawline bob length'
      },
      locks: { hair: false, wardrobe: true, identity: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'nose_brow_refine',
      title: 'Surgical Nose & Brow Refine',
      sub: 'Button nose + Brushed laminated brows · Lock everything else',
      icon: '👃',
      edits: {
        nose: 'Petite upturned button nose',
        eyebrows: 'Brushed-up laminated fluffy brows',
        skinFinish: 'Pristine glass-skin with visible micro-pores'
      },
      locks: { identity: true, hair: true, wardrobe: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'doe_eyes_lip_plump',
      title: 'Doe Eyes & Plush Lips',
      sub: 'Open eye contour + Plush lips · Lock hair, outfit & scene',
      icon: '👁️',
      edits: {
        eyeShape: 'Wide expressive luminous doe eyes',
        lips: 'Plush natural volume + crisp Cupid\'s bow',
        makeup: 'Soft glam with defined lashes'
      },
      locks: { identity: true, hair: true, wardrobe: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'wardrobe_linen_swap',
      title: 'Wardrobe Swap: Linen & Denim',
      sub: 'White linen shirt + Straight-leg jeans · Lock face & hair',
      icon: '👚',
      wardrobeMode: 'separates',
      edits: {
        topPiece: 'Crisp oversized white linen button-down with rolled cuffs',
        bottomPiece: 'Classic high-waisted medium-wash straight-leg denim jeans',
        midriffStyling: 'Tucked in with clean leather belt (classic structured waist)'
      },
      locks: { wardrobe: false, hair: true, identity: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'voluminous_blowout',
      title: 'Hair Makeover: Hollywood Blowout',
      sub: 'Glossy voluminous waves + Caramel balayage · Lock face',
      icon: '💇‍♀️',
      edits: {
        hairCutAction: 'Voluminous salon blowout restyling',
        haircut: 'Voluminous 90s bombshell layered blowout',
        hairColor: 'Caramel ribbons balayage',
        hairTexture: 'Glossy Hollywood glamour waves',
        hairFinish: 'Fresh salon blow-dry finish'
      },
      locks: { hair: false, wardrobe: true, identity: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'chiseled_jaw_sculpt',
      title: 'Facial Sculpt: Jaw & Cheekbones',
      sub: 'Chiseled cheekbones + Sharp jawline · Lock hair & scene',
      icon: '💎',
      edits: {
        faceShape: 'Sculpted chiseled cheekbones',
        jawline: 'Razor-sharp defined mandibular jawline',
        cheeks: 'High sculpted zygomatic cheekbones',
        eyebrows: 'Crisp microbladed defined arches'
      },
      locks: { identity: true, hair: true, wardrobe: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'natural_bare_refresh',
      title: 'Natural Bare-Faced Refresh',
      sub: 'Glass skin + Feathered brows + Bare lips · Lock all else',
      icon: '🌿',
      edits: {
        skinFinish: 'Pristine glass-skin with visible micro-pores',
        eyebrows: 'Full feathered natural arches',
        makeup: 'Clean bare-faced no-makeup makeup',
        lips: 'Subtle elegant lip volume'
      },
      locks: { identity: true, hair: true, wardrobe: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    },
    {
      id: 'cozy_knitwear_swap',
      title: 'Wardrobe Swap: Soft Knitwear',
      sub: 'Slouchy ribbed sweater + Tailored slacks · Lock face & hair',
      icon: '🧶',
      wardrobeMode: 'separates',
      edits: {
        topPiece: 'Oversized ribbed knit crewneck sweater in warm oatmeal cream',
        bottomPiece: 'Relaxed wide-leg pleated wool-blend trousers in charcoal',
        midriffStyling: 'Untucked hem falling past hips (relaxed effortless drape)'
      },
      locks: { wardrobe: false, hair: true, identity: true, skinTone: true, background: true, lighting: true, pose: true, accessories: true, expression: true, body: true }
    }
  ];

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const el = id => document.getElementById(id);

  let currentSection = 'doctorPreserveSec';
  let wardrobeMode = 'outfit'; // 'outfit' | 'separates'
  let editMode = 'inpaint';    // 'inpaint' | 'img2img' | 'restyle'
  let inpaintMaskTarget = 'auto';
  let activeHairMoisture = 'dry';
  let customPresets = [];
  let promptHistory = [];

  const lockState = {};
  PRESERVE_LOCKS.forEach(l => { lockState[l.id] = l.defaultVal; });

  const values = {
    // Face
    faceShape: faceShapeOpts[0],
    eyebrows: eyebrowOpts[0],
    eyeShape: eyeShapeOpts[0],
    eyeColor: eyeColorOpts[0],
    nose: noseOpts[0],
    lips: lipOpts[0],
    jawline: jawlineOpts[0],
    cheeks: cheekOpts[0],
    skinFinish: skinFinishOpts[0],
    customFaceNote: '',

    // Hair
    hairCutAction: hairEditActionOpts[0],
    haircut: O('Keep reference haircut', 'keep_ref'),
    hairColor: hairColorOpts[0],
    hairLength: hairLengthOpts[0],
    hairTexture: hairTextureOpts[0],
    hairFinish: hairFinishOpts[0],
    hairFaceCoverage: hairFaceCoverageOpts[0],

    // Wardrobe
    outfit: O('Keep reference clothing', 'keep_ref'),
    topPiece: O('Keep reference top', 'keep_ref'),
    bottomPiece: O('Keep reference bottom', 'keep_ref'),
    outfitFit: outfitFitOpts[0],
    midriffStyling: midriffStylings[0],
    makeup: makeupOpts[0],
    accessories: accessoriesOpts[0],

    // Finish
    editMode: editModeOpts[0],
    inpaintMaskTarget: inpaintMaskTargetOpts[0],
    customDirection: '',
    extraNegative: ''
  };

  const fields = {
    faceShape: { label: 'Face Shape & Contour', opts: faceShapeOpts, cat: 'face' },
    eyebrows: { label: 'Eyebrow Architecture', opts: eyebrowOpts, cat: 'face' },
    eyeShape: { label: 'Eye Shape & Eyelid Crease', opts: eyeShapeOpts, cat: 'face' },
    eyeColor: { label: 'Eye Iris Color', opts: eyeColorOpts, cat: 'face' },
    nose: { label: 'Nose Bridge & Tip Profile', opts: noseOpts, cat: 'face' },
    lips: { label: 'Lips & Cupid\'s Bow', opts: lipOpts, cat: 'face' },
    jawline: { label: 'Jawline & Chin Geometry', opts: jawlineOpts, cat: 'face' },
    cheeks: { label: 'Cheekbones & Midface', opts: cheekOpts, cat: 'face' },
    skinFinish: { label: 'Skin Complexion & Finish', opts: skinFinishOpts, cat: 'face' },

    hairCutAction: { label: 'Hair Edit Scope', opts: hairEditActionOpts, cat: 'hair' },
    haircut: { label: 'Target Haircut Style', opts: [O('Keep reference haircut', 'keep_ref'), ...hair], cat: 'hair' },
    hairColor: { label: 'Hair Color & Highlights', opts: hairColorOpts, cat: 'hair' },
    hairLength: { label: 'Target Hair Length', opts: hairLengthOpts, cat: 'hair' },
    hairTexture: { label: 'Hair Fiber Texture', opts: hairTextureOpts, cat: 'hair' },
    hairFinish: { label: 'Hair Styling Finish', opts: hairFinishOpts, cat: 'hair' },
    hairFaceCoverage: { label: 'Hair Face Coverage (Veil %)', opts: hairFaceCoverageOpts, cat: 'hair' },

    outfit: { label: 'Target Full Outfit', opts: [O('Keep reference clothing', 'keep_ref'), ...outfit], cat: 'wardrobe' },
    topPiece: { label: 'Target Top Piece', opts: [O('Keep reference top', 'keep_ref'), ...topPieces], cat: 'wardrobe' },
    bottomPiece: { label: 'Target Bottom Piece', opts: [O('Keep reference bottom', 'keep_ref'), ...bottomPieces], cat: 'wardrobe' },
    outfitFit: { label: 'Garment Tailoring Fit', opts: outfitFitOpts, cat: 'wardrobe' },
    midriffStyling: { label: 'Midriff & Hemline Coverage', opts: midriffStylings, cat: 'wardrobe' },
    makeup: { label: 'Makeup Styling Direction', opts: makeupOpts, cat: 'wardrobe' },
    accessories: { label: 'Jewelry & Accessories', opts: accessoriesOpts, cat: 'wardrobe' },

    editMode: { label: 'Prompt Engine Mode', opts: editModeOpts, cat: 'finish' },
    inpaintMaskTarget: { label: 'Target Inpaint Mask Zone', opts: inpaintMaskTargetOpts, cat: 'finish' }
  };

  const sections = [
    { id: 'doctorPreserveSec', name: 'Preserve & Lock', short: 'LOCKS', icon: '🔒', desc: 'Choose what must remain 100% identical to the source image.' },
    { id: 'doctorFaceSec', name: 'Facial Edits', short: 'FACE', icon: '👁️', desc: 'Surgically alter nose, brows, eyes, lips, jaw, or skin texture.' },
    { id: 'doctorHairSec', name: 'Hair Edits', short: 'HAIR', icon: '💇‍♀️', desc: 'Transform haircut, length, color, or texture from 276 styles.' },
    { id: 'doctorWardrobeSec', name: 'Wardrobe Edits', short: 'STYLE', icon: '👗', desc: 'Swap clothing (full looks or separates), makeup & accessories.' },
    { id: 'doctorFinishSec', name: 'Inpaint & Export', short: 'EXPORT', icon: '✦', desc: 'Fine-tune inpaint mode, custom guidance & copy production prompt.' }
  ];

  // Helper to test if a choice is "Keep reference"
  function isKeepRef(val) {
    if (!val) return true;
    if (typeof val === 'string') return val === 'keep_ref' || val === '' || /keep reference/i.test(val);
    return val.text === 'keep_ref' || /keep reference/i.test(val.label || '');
  }

  // Detect active edits
  function getActiveEdits() {
    const edits = [];
    if (!isKeepRef(values.faceShape)) edits.push({ zone: 'face', key: 'faceShape', label: 'Face Shape', val: values.faceShape });
    if (!isKeepRef(values.eyebrows)) edits.push({ zone: 'face', key: 'eyebrows', label: 'Eyebrows', val: values.eyebrows });
    if (!isKeepRef(values.eyeShape)) edits.push({ zone: 'face', key: 'eyeShape', label: 'Eye Shape', val: values.eyeShape });
    if (!isKeepRef(values.eyeColor)) edits.push({ zone: 'face', key: 'eyeColor', label: 'Eye Color', val: values.eyeColor });
    if (!isKeepRef(values.nose)) edits.push({ zone: 'face', key: 'nose', label: 'Nose', val: values.nose });
    if (!isKeepRef(values.lips)) edits.push({ zone: 'face', key: 'lips', label: 'Lips', val: values.lips });
    if (!isKeepRef(values.jawline)) edits.push({ zone: 'face', key: 'jawline', label: 'Jawline & Chin', val: values.jawline });
    if (!isKeepRef(values.cheeks)) edits.push({ zone: 'face', key: 'cheeks', label: 'Cheekbones', val: values.cheeks });
    if (!isKeepRef(values.skinFinish)) edits.push({ zone: 'face', key: 'skinFinish', label: 'Skin Complexion', val: values.skinFinish });
    if (values.customFaceNote && values.customFaceNote.trim()) {
      edits.push({ zone: 'face', key: 'customFaceNote', label: 'Specific Face Notes', val: { text: values.customFaceNote.trim() } });
    }

    // Hair
    const hasHaircut = !isKeepRef(values.haircut);
    const hasHairColor = !isKeepRef(values.hairColor);
    const hasHairLength = !isKeepRef(values.hairLength);
    const hasHairTexture = !isKeepRef(values.hairTexture);
    const hasHairFinish = !isKeepRef(values.hairFinish);
    if (hasHaircut) edits.push({ zone: 'hair', key: 'haircut', label: 'Haircut', val: values.haircut });
    if (hasHairColor) edits.push({ zone: 'hair', key: 'hairColor', label: 'Hair Color', val: values.hairColor });
    if (hasHairLength) edits.push({ zone: 'hair', key: 'hairLength', label: 'Hair Length', val: values.hairLength });
    if (hasHairTexture) edits.push({ zone: 'hair', key: 'hairTexture', label: 'Hair Texture', val: values.hairTexture });
    if (hasHairFinish) edits.push({ zone: 'hair', key: 'hairFinish', label: 'Hair Finish', val: values.hairFinish });

    // Wardrobe
    if (wardrobeMode === 'outfit') {
      if (!isKeepRef(values.outfit)) edits.push({ zone: 'wardrobe', key: 'outfit', label: 'Full Outfit', val: values.outfit });
    } else {
      if (!isKeepRef(values.topPiece)) edits.push({ zone: 'wardrobe', key: 'topPiece', label: 'Top Piece', val: values.topPiece });
      if (!isKeepRef(values.bottomPiece)) edits.push({ zone: 'wardrobe', key: 'bottomPiece', label: 'Bottom Piece', val: values.bottomPiece });
    }
    if (!isKeepRef(values.makeup)) edits.push({ zone: 'wardrobe', key: 'makeup', label: 'Makeup', val: values.makeup });
    if (!isKeepRef(values.accessories)) edits.push({ zone: 'wardrobe', key: 'accessories', label: 'Accessories', val: values.accessories });

    return edits;
  }

  // Smart Sync between active edits and preservation locks
  function autoSyncLocksWithEdits() {
    const edits = getActiveEdits();
    const hasHairEdit = edits.some(e => e.zone === 'hair');
    const hasWardrobeEdit = edits.some(e => e.zone === 'wardrobe');

    // If hair edit active, auto-uncheck hair lock
    if (hasHairEdit && lockState.hair) {
      lockState.hair = false;
    }
    // If wardrobe edit active, auto-uncheck wardrobe lock
    if (hasWardrobeEdit && lockState.wardrobe) {
      lockState.wardrobe = false;
    }
  }

  // =========================================================================
  // PROMPT SYNTHESIS ENGINE
  // =========================================================================
  function buildPrompt() {
    autoSyncLocksWithEdits();
    const edits = getActiveEdits();
    const hasFaceEdits = edits.some(e => e.zone === 'face');
    const hasHairEdits = edits.some(e => e.zone === 'hair');
    const hasWardrobeEdits = edits.some(e => e.zone === 'wardrobe');
    const mode = values.editMode?.text || editMode;

    const lines = [];

    // 1. MASTER DIRECTIVE HEADER
    lines.push('================================================================================');
    lines.push('IMAGE DOCTOR · SURGICAL REFERENCE EDIT & INPAINT SPECIFICATION');
    lines.push('================================================================================');
    lines.push('');

    // Operating Mode Note
    if (mode === 'inpaint') {
      lines.push('MODE: SURGICAL INPAINT & REGION-LOCKED EDIT');
      lines.push('• Primary Objective: Apply surgical modifications exclusively to designated regions.');
      lines.push('• Boundary Blending Rule: Seamlessly blend modified anatomy with untouched adjacent zones without visible seams, color disparity, or blur edges.');
    } else if (mode === 'img2img') {
      lines.push('MODE: IMAGE-TO-IMAGE PRECISION BLEND');
      lines.push('• Primary Objective: Re-render image with strict reference preservation while executing targeted transformations.');
    } else {
      lines.push('MODE: CREATIVE RESTYLING WITH IDENTITY ANCHOR');
      lines.push('• Primary Objective: Reinvent hair, wardrobe, and aesthetic feel while keeping model face & pose grounded in reference.');
    }
    lines.push('');

    // 2. PRESERVATION BLOCK (WHAT TO KEEP)
    lines.push('--------------------------------------------------------------------------------');
    lines.push('MANDATORY PRESERVATION LOCKS (DO NOT MODIFY UNTOUCHED ATTRIBUTES):');
    lines.push('--------------------------------------------------------------------------------');

    const activeLocks = PRESERVE_LOCKS.filter(l => lockState[l.id]);
    if (activeLocks.length === 0) {
      lines.push('• Master Reference Continuity: Retain baseline physical realism and image geometry from source image.');
    } else {
      activeLocks.forEach(l => {
        let text = l.preserveText;
        // If face edits are active but identity lock is on, refine instruction to surgical rather than total lock
        if (l.id === 'identity' && hasFaceEdits) {
          text = 'Preserve the same adult woman\'s baseline skull structure, recognizable ethnic heritage, natural eye socket placement, and underlying bone anatomy—modifying only the surgically designated facial features listed below while preventing total face replacement.';
        }
        lines.push(`• [LOCK: ${l.label.toUpperCase()}]: ${text}`);
      });
    }
    lines.push('');

    // 3. SURGICAL EDITS BLOCK (WHAT TO CHANGE)
    lines.push('--------------------------------------------------------------------------------');
    lines.push('SURGICALLY DESIGNATED TRANSFORMATIONS (MODIFY THESE SPECIFIC FEATURES):');
    lines.push('--------------------------------------------------------------------------------');

    if (edits.length === 0) {
      lines.push('• No active feature edits selected. The prompt operates in 100% preservation & fidelity restoration mode.');
    } else {
      // Group by zone
      const faceEdits = edits.filter(e => e.zone === 'face');
      const hairEdits = edits.filter(e => e.zone === 'hair');
      const wardrobeEdits = edits.filter(e => e.zone === 'wardrobe');

      if (faceEdits.length > 0) {
        lines.push('▶ [TARGET ZONE: FACIAL ANATOMY SURGERY]');
        faceEdits.forEach(e => {
          const optLabel = (e.val.label && e.val.label !== e.val.text) ? ` (${e.val.label})` : '';
          lines.push(`  - ${e.label}${optLabel}: ${e.val.text}`);
        });
        lines.push('');
      }

      if (hairEdits.length > 0) {
        lines.push('▶ [TARGET ZONE: HAIR TRANSFORMATION]');
        lines.push(`  - Action Scope: ${values.hairCutAction?.text || 'Complete haircut replacement'}`);
        hairEdits.forEach(e => {
          const optLabel = (e.val.label && e.val.label !== e.val.text) ? ` (${e.val.label})` : '';
          lines.push(`  - ${e.label}${optLabel}: ${e.val.text}`);
        });

        // Hair Moisture & Physics
        if (activeHairMoisture === 'wet') {
          lines.push('  - Mandatory Soaked Wet Hair Physics: hair is visibly saturated with water, sleek damp strand clumping, water droplets clinging to dark ends, authentic wet sheen without dry flyaways');
        } else if (activeHairMoisture === 'damp') {
          lines.push('  - Damp Hair Physics: hair is towel-dried and damp, soft moisture weight, restrained clumped texture with subtle natural sheen');
        } else {
          lines.push('  - Dry Blown-Out Hair Physics: hair is completely dry, airy root lift, soft silky strand separation, and natural micro-flyaways catching light');
        }

        // Veil coverage
        const veilTier = parseVeilTier(values.hairFaceCoverage?.label || '');
        if (veilTier && veilTier !== '0') {
          const rule = getVeilRule(veilTier);
          if (rule && rule.veilDirective) {
            lines.push(`  - Face-Behind-Hair Veil (${values.hairFaceCoverage.label}): ${rule.veilDirective}`);
          }
        }
        lines.push('');
      }

      if (wardrobeEdits.length > 0) {
        lines.push('▶ [TARGET ZONE: WARDROBE & STYLING]');
        if (wardrobeMode === 'separates') {
          lines.push('  - Styling Format: Two-Piece Separates Ensemble');
          if (!isKeepRef(values.topPiece)) lines.push(`  - Top Piece: ${values.topPiece.text}`);
          if (!isKeepRef(values.bottomPiece)) lines.push(`  - Bottom Piece: ${values.bottomPiece.text}`);
          lines.push(`  - Midriff / Hemline Coverage: ${values.midriffStyling?.text || 'natural waistline transition'}`);
        } else {
          lines.push('  - Styling Format: Full-Look Single Outfit');
          if (!isKeepRef(values.outfit)) lines.push(`  - Full Outfit: ${values.outfit.text}`);
        }
        lines.push(`  - Garment Fit: ${values.outfitFit?.text || 'natural tailored fit'}`);
        if (!isKeepRef(values.makeup)) lines.push(`  - Makeup Styling: ${values.makeup.text}`);
        if (!isKeepRef(values.accessories)) lines.push(`  - Accessories: ${values.accessories.text}`);
        lines.push('');
      }
    }

    // Custom Direction Notes
    if (values.customDirection && values.customDirection.trim()) {
      lines.push('▶ [ADDITIONAL USER EDIT DIRECTIVES]');
      lines.push(`  - ${values.customDirection.trim()}`);
      lines.push('');
    }

    // 4. INPAINTING MASK & TECHNICAL SPECIFICATIONS
    lines.push('--------------------------------------------------------------------------------');
    lines.push('INPAINT MASKING & COMPOSITING RULES:');
    lines.push('--------------------------------------------------------------------------------');
    let maskZone = values.inpaintMaskTarget?.text || inpaintMaskTarget;
    if (maskZone === 'auto') {
      if (hasFaceEdits && hasHairEdits && hasWardrobeEdits) maskZone = 'Full Model Anatomy Mask';
      else if (hasFaceEdits && hasHairEdits) maskZone = 'Face & Hair Combined Mask (Head Region)';
      else if (hasFaceEdits) maskZone = 'Facial Features Mask (Eyes, Nose, Mouth, Cheeks)';
      else if (hasHairEdits) maskZone = 'Hair & Scalp Area Mask';
      else if (hasWardrobeEdits) maskZone = 'Wardrobe & Apparel Mask';
      else maskZone = 'Global Edit Frame';
    }
    lines.push(`• Recommended Inpaint Mask Zone: ${maskZone}`);
    lines.push('• Pixel Bleed & Perimeter Feathering: Feather inpaint mask by 4–8px; do not introduce harsh cutouts or halo edges.');
    lines.push('• Optical Match Requirement: Match the source image\'s exact lens focal length, aperture depth-of-field, film grain density, and color grading.');
    lines.push('');

    // 5. NEGATIVE / EXCLUSION GUIDANCE
    lines.push('AVOID / NEGATIVE GUIDANCE:');
    const negs = [];

    // General quality
    negs.push('ai artifacts', 'plastic skin', 'waxy complexion', 'over-smoothed airbrushed face', 'cgi doll look', 'unnatural anatomy', 'extra fingers', 'deformed hands', 'floating limbs', 'harsh cutout edges', 'inpaint mask seam lines', 'halo artifacts around edited area');

    // Locked areas must be protected in negative
    if (lockState.identity && !hasFaceEdits) {
      negs.push('different person', 'face replacement', 'identity drift', 'altered bone structure', 'face morphing', 'changed facial features');
    }
    if (lockState.hair && !hasHairEdits) {
      negs.push('altered hairstyle', 'different hair color', 'shortened hair', 'lengthened hair', 'unwanted haircut change');
    }
    if (lockState.wardrobe && !hasWardrobeEdits) {
      negs.push('different clothes', 'wardrobe replacement', 'changed outfit', 'different fabric colors');
    }
    if (lockState.background) {
      negs.push('changed background', 'different setting', 'new venue', 'altered background objects', 'replaced environment');
    }
    if (lockState.pose) {
      negs.push('altered pose', 'different head angle', 'changed stance', 'shifted body position');
    }
    if (lockState.lighting) {
      negs.push('altered lighting', 'harsh studio flash when reference is natural', 'changed color temperature', 'inconsistent shadows');
    }

    // Hair moisture negative
    if (hasHairEdits) {
      if (activeHairMoisture === 'wet') {
        negs.push('dry hair', 'fluffy blown-out hair', 'frizzy dry strands', 'merely lightly misted dry-looking hair');
      } else if (activeHairMoisture === 'dry') {
        negs.push('wet hair', 'damp hair', 'soaked hair clumping', 'greasy oily hair sheen');
      }
    }

    // User extra negative
    if (values.extraNegative && values.extraNegative.trim()) {
      negs.push(values.extraNegative.trim());
    }

    const deduped = dedupeNegatives(negs);
    lines.push(deduped);

    const fullPrompt = lines.join('\n');
    const promptArea = el('prompt');
    if (promptArea) {
      promptArea.value = fullPrompt;
    }

    // Update word count & token estimate
    updateCounters(fullPrompt);

    // Update live summary
    updateSummary(edits, activeLocks);

    return fullPrompt;
  }

  function updateCounters(text) {
    const wordCountEl = el('wordCount');
    if (!wordCountEl) return;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const tokens = estimateTokens(text);
    wordCountEl.textContent = `${words} words · ~${tokens} tokens`;

    const mobCount = el('mobileWordCount');
    if (mobCount) mobCount.textContent = `${words} words`;
  }

  function updateSummary(edits, activeLocks) {
    const summaryEl = el('summary');
    if (!summaryEl) return;

    const pills = [];
    pills.push(`<span class="pill pill-primary">🔬 Image Doctor</span>`);
    pills.push(`<span class="pill">${activeLocks.length} Locked Features</span>`);

    if (edits.length === 0) {
      pills.push(`<span class="pill">100% Preservation Mode</span>`);
    } else {
      pills.push(`<span class="pill pill-highlight">⚡ ${edits.length} Surgical Edits</span>`);
      edits.slice(0, 3).forEach(e => {
        pills.push(`<span class="pill">${e.label}: ${e.val.label || e.val.text?.slice(0, 20)}</span>`);
      });
      if (edits.length > 3) {
        pills.push(`<span class="pill">+${edits.length - 3} more</span>`);
      }
    }

    summaryEl.innerHTML = pills.join(' ');

    const mobSummary = el('mobileSummaryMini');
    if (mobSummary) {
      mobSummary.textContent = `${activeLocks.length} Locks · ${edits.length} Edits`;
    }
  }

  // =========================================================================
  // DOM RENDERING & UI WIRE-UP
  // =========================================================================
  function renderTabs() {
    const tabsContainer = el('tabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    sections.forEach((sec, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab ${sec.id === currentSection ? 'active' : ''}`;
      btn.dataset.section = sec.id;
      btn.innerHTML = `<span class="tab-no">${String(idx + 1).padStart(2, '0')}</span>${sec.name}`;
      btn.addEventListener('click', () => goSection(sec.id));
      tabsContainer.appendChild(btn);
    });
  }

  function goSection(secId) {
    currentSection = secId;
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;

    // Update active tab
    const tabs = el('tabs');
    if (tabs) {
      tabs.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.section === secId);
      });
    }

    // Update step card headers
    const stepIdx = sections.findIndex(s => s.id === secId);
    if (el('stepEyebrow')) el('stepEyebrow').textContent = `Surgical direction · 0${stepIdx + 1}`;
    if (el('stepTitle')) el('stepTitle').textContent = sec.name;
    if (el('stepDescription')) el('stepDescription').textContent = sec.desc;
    if (el('stepIcon')) el('stepIcon').textContent = sec.icon;
    if (el('stepCount')) el('stepCount').textContent = `Step ${stepIdx + 1} of ${sections.length}`;

    // Render contents for this section
    renderSectionContents(secId);
    save();
  }

  function renderSectionContents(secId) {
    const fieldsContainer = el('fields');
    const specialContainer = el('specialContent');
    const fineTuneContainer = el('fineTuneArea');
    if (!fieldsContainer) return;

    fieldsContainer.innerHTML = '';
    if (specialContainer) specialContainer.innerHTML = '';
    if (fineTuneContainer) fineTuneContainer.innerHTML = '';

    if (secId === 'doctorPreserveSec') {
      renderPreserveLocksSection(fieldsContainer, specialContainer);
    } else if (secId === 'doctorFaceSec') {
      renderFaceEditsSection(fieldsContainer, specialContainer);
    } else if (secId === 'doctorHairSec') {
      renderHairEditsSection(fieldsContainer, specialContainer, fineTuneContainer);
    } else if (secId === 'doctorWardrobeSec') {
      renderWardrobeEditsSection(fieldsContainer, specialContainer);
    } else if (secId === 'doctorFinishSec') {
      renderFinishSection(fieldsContainer, specialContainer);
    }
  }

  // --- 1. RENDER PRESERVE LOCKS SECTION ---
  function renderPreserveLocksSection(container, special) {
    const lockGrid = document.createElement('div');
    lockGrid.className = 'doc-lock-grid doctor-lock-grid';

    PRESERVE_LOCKS.forEach(lock => {
      const isLocked = !!lockState[lock.id];
      const card = document.createElement('div');
      card.className = `doc-lock-card doctor-lock-card ${isLocked ? 'locked' : 'unlocked'}`;

      card.innerHTML = `
        <div class="doc-lock-header">
          <div class="doc-lock-identity">
            <span class="doc-lock-icon">${lock.icon}</span>
            <strong class="doc-lock-title">${lock.label}</strong>
          </div>
          <span class="doc-lock-pill lock-status-pill ${isLocked ? 'locked' : 'editing'}">${isLocked ? '🔒 Locked' : '⚡ Editing'}</span>
        </div>
        <p class="doc-lock-desc">
          ${lock.desc}
        </p>
      `;

      card.addEventListener('click', () => {
        lockState[lock.id] = !lockState[lock.id];
        renderSectionContents('doctorPreserveSec');
        buildPrompt();
      });

      lockGrid.appendChild(card);
    });

    container.appendChild(lockGrid);

    if (special) {
      special.innerHTML = `
        <div class="doc-info-box">
          <div>
            <strong class="doc-info-box-title">💡 Image Doctor Surgical Rule:</strong>
            <p class="doc-info-box-desc">
              When a feature is <strong>🔒 Locked</strong>, the prompt explicitly instructs the inpaint model to leave it 100% untouched. Choosing any surgical edit in later steps automatically toggles that attribute to <strong>⚡ Editing</strong>.
            </p>
          </div>
          <div class="doc-btn-row">
            <button type="button" class="btn btn-secondary btn-small" id="btnLockAll">🔒 Lock All (100% Preserve)</button>
            <button type="button" class="btn btn-quiet btn-small" id="btnUnlockAll">⚡ Unlock All</button>
          </div>
        </div>
      `;

      const bLock = el('btnLockAll');
      if (bLock) {
        bLock.addEventListener('click', () => {
          PRESERVE_LOCKS.forEach(l => { lockState[l.id] = true; });
          // Reset edit dropdowns to keep_ref
          Object.keys(values).forEach(k => {
            if (fields[k] && fields[k].opts && fields[k].opts[0] && isKeepRef(fields[k].opts[0])) {
              values[k] = fields[k].opts[0];
            }
          });
          renderSectionContents('doctorPreserveSec');
          buildPrompt();
        });
      }

      const bUnlock = el('btnUnlockAll');
      if (bUnlock) {
        bUnlock.addEventListener('click', () => {
          PRESERVE_LOCKS.forEach(l => { lockState[l.id] = false; });
          renderSectionContents('doctorPreserveSec');
          buildPrompt();
        });
      }
    }
  }

  // --- 2. RENDER FACE EDITS SECTION ---
  function renderFaceEditsSection(container, special) {
    const faceKeys = ['nose', 'eyebrows', 'eyeShape', 'eyeColor', 'lips', 'jawline', 'cheeks', 'skinFinish', 'faceShape'];
    faceKeys.forEach(k => {
      container.appendChild(createSelectField(k));
    });

    if (special) {
      special.innerHTML = `
        <div class="field full" style="margin-top: 14px;">
          <div class="label-row">
            <label for="customFaceNoteInput">🔬 Specific Facial Notes (Moles, Freckles, Scars, Custom Tweaks)</label>
            <span class="option-count">Optional</span>
          </div>
          <input type="text" id="customFaceNoteInput" placeholder="e.g. add faint freckles across nose bridge, remove small mole on left cheek, deep hazel eyes..." value="${values.customFaceNote || ''}">
        </div>
      `;

      const input = el('customFaceNoteInput');
      if (input) {
        input.addEventListener('input', e => {
          values.customFaceNote = e.target.value;
          buildPrompt();
        });
      }
    }
  }

  // --- 3. RENDER HAIR EDITS SECTION ---
  function renderHairEditsSection(container, special, fineTune) {
    // Hair category quick-filter bar
    if (fineTune) {
      renderHairCategoryBar(fineTune);
    }

    container.appendChild(createSelectField('hairCutAction'));
    container.appendChild(createSelectField('haircut'));
    container.appendChild(createSelectField('hairColor'));
    container.appendChild(createSelectField('hairLength'));
    container.appendChild(createSelectField('hairTexture'));
    container.appendChild(createSelectField('hairFinish'));
    container.appendChild(createSelectField('hairFaceCoverage'));

    // Moisture selector
    if (special) {
      renderMoistureCard(special);
    }
  }

  function renderHairCategoryBar(container) {
    const cats = [
      { id: 'all', label: 'All Cuts (276)' },
      { id: 'bob', label: 'Bobs' },
      { id: 'pixie', label: 'Pixies' },
      { id: 'fade', label: 'Fades' },
      { id: 'long', label: 'Long & Layered' },
      { id: 'updo', label: 'Updos' },
      { id: 'bangs', label: 'Bangs' }
    ];

    const bar = document.createElement('div');
    bar.className = 'doc-cat-bar hair-cat-bar';

    cats.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `doc-cat-chip cat-chip ${c.id === 'all' ? 'active' : ''}`;
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.doc-cat-chip, .cat-chip').forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        // Filter haircut select options
        filterHaircutSelect(c.id);
      });
      bar.appendChild(btn);
    });

    container.appendChild(bar);
  }

  function filterHaircutSelect(catId) {
    const sel = el('field_haircut');
    if (!sel) return;

    let filtered = hair;
    if (catId !== 'all') {
      filtered = hair.filter(h => h.cat === catId);
    }

    sel.innerHTML = '';
    const keepOpt = document.createElement('option');
    keepOpt.value = 'keep_ref';
    keepOpt.textContent = 'Keep reference haircut';
    sel.appendChild(keepOpt);

    filtered.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.label;
      opt.textContent = h.label;
      sel.appendChild(opt);
    });

    if (values.haircut && values.haircut.label) {
      sel.value = values.haircut.label;
    }
  }

  function renderMoistureCard(container) {
    const mCard = document.createElement('div');
    mCard.id = 'moistureToggleCard';
    mCard.className = 'moisture-toggle-card';

    mCard.innerHTML = `
      <div class="moisture-header">
        <span class="moisture-label">💧 Hair Moisture State</span>
        <span class="moisture-hint">Inpaint with precise water saturation physics (dry airy volume vs soaked clumped strands)</span>
      </div>
      <div class="moisture-pills" role="radiogroup" aria-label="Hair moisture state">
        <button type="button" class="btn btn-small moisture-pill ${activeHairMoisture === 'dry' ? 'active' : ''}" data-moisture="dry">💨 Dry &amp; Blown-Out</button>
        <button type="button" class="btn btn-small moisture-pill ${activeHairMoisture === 'damp' ? 'active' : ''}" data-moisture="damp">💦 Damp / Misted</button>
        <button type="button" class="btn btn-small moisture-pill ${activeHairMoisture === 'wet' ? 'active' : ''}" data-moisture="wet">💧 Soaked Wet</button>
      </div>
    `;

    mCard.querySelectorAll('.moisture-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        mCard.querySelectorAll('.moisture-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeHairMoisture = btn.dataset.moisture;
        buildPrompt();
      });
    });

    container.appendChild(mCard);
  }

  // --- 4. RENDER WARDROBE EDITS SECTION ---
  function renderWardrobeEditsSection(container, special) {
    // Mode toggle: Full Outfit vs Two-Piece Separates
    const modeBar = document.createElement('div');
    modeBar.className = 'doc-mode-bar';
    modeBar.innerHTML = `
      <button type="button" class="btn ${wardrobeMode === 'outfit' ? 'btn-primary' : 'btn-secondary'} btn-small" id="btnDoctorOutfit">👗 Full Outfit Ensembles</button>
      <button type="button" class="btn ${wardrobeMode === 'separates' ? 'btn-primary' : 'btn-secondary'} btn-small" id="btnDoctorSeparates">👚 Two-Piece Separates (Top + Bottom)</button>
    `;

    container.appendChild(modeBar);

    const bOut = modeBar.querySelector('#btnDoctorOutfit');
    const bSep = modeBar.querySelector('#btnDoctorSeparates');
    if (bOut) bOut.addEventListener('click', () => { wardrobeMode = 'outfit'; renderSectionContents('doctorWardrobeSec'); buildPrompt(); });
    if (bSep) bSep.addEventListener('click', () => { wardrobeMode = 'separates'; renderSectionContents('doctorWardrobeSec'); buildPrompt(); });

    if (wardrobeMode === 'outfit') {
      container.appendChild(createSelectField('outfit'));
    } else {
      container.appendChild(createSelectField('topPiece'));
      container.appendChild(createSelectField('bottomPiece'));
      container.appendChild(createSelectField('midriffStyling'));
    }

    container.appendChild(createSelectField('outfitFit'));
    container.appendChild(createSelectField('makeup'));
    container.appendChild(createSelectField('accessories'));
  }

  // --- 5. RENDER FINISH & INPAINT SECTION ---
  function renderFinishSection(container, special) {
    container.appendChild(createSelectField('editMode'));
    container.appendChild(createSelectField('inpaintMaskTarget'));

    if (special) {
      special.innerHTML = `
        <div class="field-grid" style="margin-top: 16px;">
          <div class="field">
            <div class="label-row">
              <label for="customDirInput">✦ Custom Inpaint Guidance / Specific Notes</label>
              <span class="option-count">Optional</span>
            </div>
            <textarea id="customDirInput" rows="3" placeholder="Add specific inpaint instructions (e.g. blend hair smoothly over left shoulder, keep earring visible)...">${values.customDirection || ''}</textarea>
          </div>
          <div class="field">
            <div class="label-row">
              <label for="extraNegInput">🚫 Additional Surgical Exclusions (Negative Guidance)</label>
              <span class="option-count">Optional</span>
            </div>
            <textarea id="extraNegInput" rows="3" placeholder="Exclude specific defects (e.g. flyaways on forehead, high neckline, heavy mascara)...">${values.extraNegative || ''}</textarea>
          </div>
        </div>
      `;

      const cd = el('customDirInput');
      if (cd) cd.addEventListener('input', e => { values.customDirection = e.target.value; buildPrompt(); });

      const en = el('extraNegInput');
      if (en) en.addEventListener('input', e => { values.extraNegative = e.target.value; buildPrompt(); });
    }
  }

  // Helper to create a standard select dropdown field
  function createSelectField(key) {
    const fld = fields[key];
    if (!fld) return document.createElement('div');

    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'field';

    const labRow = document.createElement('div');
    labRow.className = 'label-row';

    const label = document.createElement('label');
    label.htmlFor = `field_${key}`;
    label.textContent = fld.label;

    const optCount = document.createElement('span');
    optCount.className = 'option-count';
    optCount.textContent = `${fld.opts.length} choices`;

    labRow.appendChild(label);
    labRow.appendChild(optCount);

    const selWrap = document.createElement('div');
    selWrap.className = 'select-wrap';

    const select = document.createElement('select');
    select.id = `field_${key}`;

    fld.opts.forEach(opt => {
      const optEl = document.createElement('option');
      optEl.value = opt.label;
      optEl.textContent = opt.label;
      if (values[key] && values[key].label === opt.label) {
        optEl.selected = true;
      }
      select.appendChild(optEl);
    });

    select.addEventListener('change', () => {
      const selected = fld.opts.find(o => o.label === select.value) || fld.opts[0];
      values[key] = selected;

      // Smart uncheck corresponding preservation lock if user picked an actual edit
      if (!isKeepRef(selected)) {
        if (fld.cat === 'hair') lockState.hair = false;
        if (fld.cat === 'wardrobe') lockState.wardrobe = false;
      }

      buildPrompt();
    });

    selWrap.appendChild(select);
    fieldDiv.appendChild(labRow);
    fieldDiv.appendChild(selWrap);
    return fieldDiv;
  }

  // =========================================================================
  // PRESET MANAGEMENT
  // =========================================================================
  function renderPresets() {
    const container = el('presets');
    if (!container) return;
    container.innerHTML = '';

    const allPresets = [...customPresets, ...STARTER_PRESETS];

    allPresets.forEach(preset => {
      const card = document.createElement('div');
      card.className = `preset ${preset.isCustom ? 'custom-preset' : ''}`;
      card.innerHTML = `
        <div class="preset-icon">${preset.icon || '🔬'}</div>
        <div class="preset-content">
          <div class="preset-title">${preset.title}</div>
          <div class="preset-sub">${preset.sub || ''}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        applyPreset(preset);
      });

      if (preset.isCustom) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'preset-del-btn';
        delBtn.innerHTML = '×';
        delBtn.title = 'Delete saved look';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomPreset(preset.id);
        });
        card.appendChild(delBtn);
      }

      container.appendChild(card);
    });
  }

  function applyPreset(preset) {
    if (preset.wardrobeMode) {
      wardrobeMode = preset.wardrobeMode;
    }

    if (preset.locks) {
      Object.keys(preset.locks).forEach(k => {
        lockState[k] = preset.locks[k];
      });
    }

    if (preset.edits) {
      Object.keys(preset.edits).forEach(k => {
        const targetVal = preset.edits[k];
        if (fields[k] && fields[k].opts) {
          const match = fields[k].opts.find(o => o.label === targetVal || o.label.includes(targetVal));
          if (match) values[k] = match;
        }
      });
    }

    renderSectionContents(currentSection);
    buildPrompt();
  }

  function saveCustomDoctorPreset(title) {
    if (!title || !title.trim()) return null;
    const newPreset = {
      id: 'doctor_' + Date.now(),
      title: title.trim(),
      sub: `${getActiveEdits().length} edits · Custom look`,
      icon: '⭐',
      isCustom: true,
      wardrobeMode,
      locks: { ...lockState },
      edits: {}
    };

    Object.keys(values).forEach(k => {
      if (values[k] && values[k].label && !isKeepRef(values[k])) {
        newPreset.edits[k] = values[k].label;
      }
    });

    customPresets.unshift(newPreset);
    save();
    renderPresets();
    return newPreset;
  }

  function deleteCustomPreset(id) {
    customPresets = customPresets.filter(p => p.id !== id);
    save();
    renderPresets();
  }

  function importDoctorPresetsFromData(data) {
    if (!data || !Array.isArray(data.customPresets)) return 0;
    let count = 0;
    data.customPresets.forEach(p => {
      if (p && p.id && !customPresets.some(existing => existing.id === p.id)) {
        customPresets.push({ ...p, isCustom: true });
        count++;
      }
    });
    save();
    renderPresets();
    return count;
  }

  // =========================================================================
  // PERSISTENCE (LOCALSTORAGE)
  // =========================================================================
  const STORAGE_KEY = 'afterglow_image_doctor_v1';
  const HIST_KEY = 'afterglow_image_doctor_hist';

  function save() {
    try {
      const state = {
        currentSection,
        wardrobeMode,
        activeHairMoisture,
        lockState,
        values: {},
        customPresets
      };
      Object.keys(values).forEach(k => {
        if (values[k] && values[k].label) {
          state.values[k] = values[k].label;
        } else if (typeof values[k] === 'string') {
          state.values[k] = values[k];
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state.wardrobeMode) wardrobeMode = state.wardrobeMode;
      if (state.activeHairMoisture) activeHairMoisture = state.activeHairMoisture;
      if (state.lockState) Object.assign(lockState, state.lockState);
      if (Array.isArray(state.customPresets)) customPresets = state.customPresets;

      if (state.values) {
        Object.keys(state.values).forEach(k => {
          if (fields[k] && fields[k].opts) {
            const found = fields[k].opts.find(o => o.label === state.values[k]);
            if (found) values[k] = found;
          } else if (k === 'customFaceNote' || k === 'customDirection' || k === 'extraNegative') {
            values[k] = state.values[k];
          }
        });
      }
    } catch (e) {}
  }

  // =========================================================================
  // CLIPBOARD & EXPORT HELPERS
  // =========================================================================
  function copyToClipboard(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(msg || 'Copied to clipboard!'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(msg || 'Copied to clipboard!');
    }
    pushHistory(text);
  }

  function showToast(msg) {
    const t = el('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  function pushHistory(promptText) {
    if (!promptText || !promptText.trim()) return;
    promptHistory.unshift({
      time: new Date().toLocaleTimeString(),
      text: promptText,
      editsCount: getActiveEdits().length
    });
    if (promptHistory.length > 20) promptHistory.pop();
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(promptHistory));
    } catch (e) {}
    updateHistoryBadge();
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HIST_KEY);
      if (raw) promptHistory = JSON.parse(raw);
    } catch (e) {}
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    const b = el('historyBadge');
    if (b) b.textContent = promptHistory.length;
  }

  function renderHistoryModal() {
    const list = el('historyList');
    if (!list) return;
    list.innerHTML = '';

    if (promptHistory.length === 0) {
      list.innerHTML = '<p class="doc-history-empty">No prompt history yet this session.</p>';
      return;
    }

    promptHistory.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'history-item doc-history-item';
      card.innerHTML = `
        <div class="doc-history-meta">
          <span>${item.time} · ${item.editsCount} surgical edits</span>
          <button type="button" class="btn btn-quiet btn-small hist-copy-btn" data-idx="${idx}">Copy</button>
        </div>
        <p class="doc-history-text">
          ${item.text.slice(0, 150)}...
        </p>
      `;
      card.querySelector('.hist-copy-btn').addEventListener('click', () => {
        copyToClipboard(item.text, 'Copied from history!');
      });
      list.appendChild(card);
    });
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function init() {
    load();
    renderTabs();
    goSection(currentSection || 'doctorPreserveSec');
    renderPresets();
    buildPrompt();
    loadHistory();

    // Wire up header buttons
    if (el('copy')) {
      el('copy').addEventListener('click', () => {
        copyToClipboard(el('prompt')?.value || '', '✓ Prompt copied to clipboard');
      });
    }
    if (el('copyTop')) {
      el('copyTop').addEventListener('click', () => {
        copyToClipboard(el('prompt')?.value || '', '✓ Prompt copied to clipboard');
      });
    }
    if (el('mobileCopyBtn')) {
      el('mobileCopyBtn').addEventListener('click', () => {
        copyToClipboard(el('prompt')?.value || '', '✓ Prompt copied');
      });
    }
    if (el('fab')) {
      el('fab').addEventListener('click', () => {
        copyToClipboard(el('prompt')?.value || '', '✓ Prompt copied');
        const f = el('fab');
        f.textContent = '✓ Copied';
        setTimeout(() => f.textContent = '▱ Copy prompt', 1500);
      });
    }

    if (el('copyPositive')) {
      el('copyPositive').addEventListener('click', () => {
        const full = el('prompt')?.value || '';
        const pos = extractPositivePrompt(full);
        copyToClipboard(pos, '✓ Positive guidance copied');
      });
    }

    if (el('copyNegative')) {
      el('copyNegative').addEventListener('click', () => {
        const full = el('prompt')?.value || '';
        const neg = extractNegativePrompt(full);
        copyToClipboard(neg, '✓ Negative exclusions copied');
      });
    }

    if (el('download')) {
      el('download').addEventListener('click', () => {
        const text = el('prompt')?.value || '';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `image_doctor_prompt_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast('Downloaded .txt prompt');
      });
    }

    if (el('selectPrompt')) {
      el('selectPrompt').addEventListener('click', () => {
        const ta = el('prompt');
        if (ta) {
          ta.focus();
          ta.select();
        }
      });
    }

    if (el('resetTop')) {
      el('resetTop').addEventListener('click', () => {
        PRESERVE_LOCKS.forEach(l => { lockState[l.id] = true; });
        Object.keys(values).forEach(k => {
          if (fields[k] && fields[k].opts) {
            values[k] = fields[k].opts[0];
          }
        });
        values.customFaceNote = '';
        values.customDirection = '';
        values.extraNegative = '';
        renderSectionContents(currentSection);
        buildPrompt();
        showToast('Reset to default preservation state');
      });
    }

    if (el('randomTop') || el('shuffleLooks')) {
      const handler = () => {
        const p = STARTER_PRESETS[Math.floor(Math.random() * STARTER_PRESETS.length)];
        applyPreset(p);
        showToast(`Loaded preset: ${p.title}`);
      };
      if (el('randomTop')) el('randomTop').addEventListener('click', handler);
      if (el('shuffleLooks')) el('shuffleLooks').addEventListener('click', handler);
    }

    if (el('saveCustomLook')) {
      el('saveCustomLook').addEventListener('click', () => {
        const name = prompt('Name for this surgical edit preset:', 'My Surgical Look ' + (customPresets.length + 1));
        if (name) {
          saveCustomDoctorPreset(name);
          showToast(`Saved look: ${name}`);
        }
      });
    }

    if (el('exportPresetsBtn')) {
      el('exportPresetsBtn').addEventListener('click', () => {
        const data = {
          version: 1,
          studio: 'image_doctor',
          exportedAt: new Date().toISOString(),
          customPresets
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `afterglow_doctor_presets_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }

    if (el('importPresetsBtn')) {
      el('importPresetsBtn').addEventListener('click', () => {
        el('importPresetsInput')?.click();
      });
    }
    if (el('importPresetsInput')) {
      el('importPresetsInput').addEventListener('change', e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            const count = importDoctorPresetsFromData(data);
            showToast(`Imported ${count} presets`);
          } catch (err) {
            alert('Invalid JSON preset file');
          }
        };
        reader.readAsText(file);
      });
    }

    // Step navigation buttons
    if (el('prevStep')) {
      el('prevStep').addEventListener('click', () => {
        const idx = sections.findIndex(s => s.id === currentSection);
        if (idx > 0) goSection(sections[idx - 1].id);
      });
    }
    if (el('nextStep')) {
      el('nextStep').addEventListener('click', () => {
        const idx = sections.findIndex(s => s.id === currentSection);
        if (idx < sections.length - 1) goSection(sections[idx + 1].id);
      });
    }
    if (el('finishJump')) {
      el('finishJump').addEventListener('click', () => goSection('doctorFinishSec'));
    }

    // History modal
    if (el('openHistoryBtn')) {
      el('openHistoryBtn').addEventListener('click', () => {
        renderHistoryModal();
        el('historyModal')?.classList.add('open');
        el('historyBackdrop')?.classList.add('active');
      });
    }
    if (el('closeHistoryBtn')) {
      el('closeHistoryBtn').addEventListener('click', () => {
        el('historyModal')?.classList.remove('open');
        el('historyBackdrop')?.classList.remove('active');
      });
    }
    if (el('historyBackdrop')) {
      el('historyBackdrop').addEventListener('click', () => {
        el('historyModal')?.classList.remove('open');
        el('historyBackdrop')?.classList.remove('active');
      });
    }
    if (el('clearHistoryBtn')) {
      el('clearHistoryBtn').addEventListener('click', () => {
        promptHistory = [];
        try { localStorage.removeItem(HIST_KEY); } catch (e) {}
        renderHistoryModal();
        updateHistoryBadge();
        showToast('History cleared');
      });
    }

    // Mobile drawer
    if (el('openDrawerBtn')) {
      el('openDrawerBtn').addEventListener('click', () => {
        document.querySelector('.preview')?.classList.add('drawer-open');
        el('drawerBackdrop')?.classList.add('active');
      });
    }
    if (el('closeDrawer')) {
      el('closeDrawer').addEventListener('click', () => {
        document.querySelector('.preview')?.classList.remove('drawer-open');
        el('drawerBackdrop')?.classList.remove('active');
      });
    }
    if (el('drawerBackdrop')) {
      el('drawerBackdrop').addEventListener('click', () => {
        document.querySelector('.preview')?.classList.remove('drawer-open');
        el('drawerBackdrop')?.classList.remove('active');
      });
    }
    if (el('sheetHandle')) {
      el('sheetHandle').addEventListener('click', () => {
        document.querySelector('.preview')?.classList.toggle('drawer-open');
        el('drawerBackdrop')?.classList.toggle('active');
      });
    }

    // Ratio chips
    const ratioChips = el('ratioChips');
    if (ratioChips) {
      ratioChips.querySelectorAll('.ratio-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          ratioChips.querySelectorAll('.ratio-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          buildPrompt();
        });
      });
    }
  }

  // Export API for testing and automation
  window.AfterglowImageDoctor = {
    getFields: () => fields,
    getValues: () => values,
    getLockState: () => lockState,
    setLock: (k, v) => { lockState[k] = !!v; buildPrompt(); },
    getActiveEdits,
    buildPrompt,
    goSection,
    renderSectionContents,
    renderPresets,
    save,
    load,
    saveCustomDoctorPreset,
    deleteCustomPreset,
    importDoctorPresetsFromData,
    getCustomPresets: () => customPresets,
    getStarterPresets: () => STARTER_PRESETS,
    getHair: () => hair,
    getHairFaceCoverageOpts: () => hairFaceCoverageOpts,
    getMoisture: () => activeHairMoisture,
    setMoisture: (m) => { activeHairMoisture = m; buildPrompt(); },
    getWardrobeMode: () => wardrobeMode,
    setWardrobeMode: (m) => { wardrobeMode = m; renderSectionContents('doctorWardrobeSec'); buildPrompt(); },
    getExtractedPositive: () => extractPositivePrompt(el('prompt')?.value || ''),
    getExtractedNegative: () => extractNegativePrompt(el('prompt')?.value || '')
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
