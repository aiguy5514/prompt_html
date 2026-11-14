(function(){
'use strict';

const {
  O, makeOpts, addOptions,
  HAIR_FAMILIES, hair, hairFaceCoverageOpts,
  OUTFIT_FAMILIES, outfit,
  TOP_FAMILIES, topPieces,
  BOTTOM_FAMILIES, bottomPieces,
  midriffStylings,
  faceObfuscModeOpts,
  bikeScenes,
  dateVenues,
  coupleInteractions
} = window.AfterglowDatasets;

const {
  parseVeilTier, detectHairArchitecture, getVeilRule,
  sanitizeHairForVeil, sanitizeMakeupForVeil, sanitizeHiddenFaceText,
  cleanClause, capFirst, stripBuzzwords, dedupeNegatives, estimateTokens,
  extractPositivePrompt, extractNegativePrompt,
  buildObfuscClause, getObfuscNegatives
} = window.AfterglowVeil;

const hairColor=[O('Keep reference hair color','the original hair color from the reference image'),O('Deep natural black','deep natural black with subtle realistic highlights'),O('Espresso brunette','rich espresso brunette'),O('Chocolate brown','warm chocolate brown'),O('Soft chestnut','soft chestnut brown'),O('Caramel ribbons','subtle caramel ribbons blended naturally through the hair'),O('Cool ash brown','cool ash brown with restrained dimension'),O('Copper auburn','rich copper auburn'),O('Burgundy tint','deep burgundy-tinted hair'),O('Blue-black sheen','blue-black hair with a subtle cool sheen'),O('Dark roots + balayage','dark roots blended into soft balayage ends'),O('Honey blonde balayage','honey-blonde balayage with natural-looking dimension'),O('Platinum blonde','platinum blonde with believable root depth'),O('Rose-brown tint','subtle rose-brown tint'),O('Warm mahogany','warm mahogany brown')];
const hairFinish=[O('Fresh salon blow-dry finish (natural soft sheen)','freshly blown-out salon finish with natural soft silkiness, healthy organic sheen, and realistic flyaways without heavy wax or stiff spray'),O('Fresh salon finish','freshly salon-styled but still natural'),O('Lived-in candid texture','lived-in, touchable texture with a few imperfect strands'),O('Wind-touched movement','slightly wind-touched movement and fine flyaways'),O('Glossy editorial finish','glossy editorial finish without plastic shine'),O('Soft volume and bounce','soft root lift, airy volume and natural bounce'),O('Piecey textured definition','piecey texture with defined strand separation'),O('Minimal styling','lightly styled, natural hair with subtle imperfections'),O('Movement captured mid-turn','hair caught mid-movement as she turns')];
const outfitFit=[O('Keep believable garment fit','natural garment fit with realistic tailoring and fabric tension'),O('Relaxed editorial fit','relaxed editorial fit with believable folds and movement'),O('Structured polished fit','structured polished fit with clear seams and realistic fabric behavior'),O('Flowing movement','flowing fabric movement captured naturally'),O('Crisp tailored finish','crisp tailored finish with defined but believable lines')];
const accessories=[O('Minimal reference-consistent jewelry','minimal accessories consistent with the reference image'),O('Statement hoops','bold statement hoop earrings'),O('Sculptural earrings','sculptural designer-style earrings'),O('Layered necklaces','layered necklaces that complement the neckline'),O('Cuff bracelet + rings','a cuff bracelet and a few coordinated rings'),O('Statement ring only','one tasteful statement ring'),O('Sleek watch','a sleek watch with understated jewelry'),O('Bold sunglasses prop','bold sunglasses used as a fashion prop'),O('Pearl accents','modern pearl accents and small statement earrings'),O('Metallic accessories','coordinated metallic accessories'),O('Traditional jhumkas','traditional jhumka earrings styled with the outfit'),O('No visible accessories','no added accessories; keep the look clean'),O('Retain reference jewelry','retain any signature jewelry or nose ring visible in the reference'),O('Editorial ear cuff','an editorial ear cuff with minimal additional jewelry'),O('Small bag as prop','a small structured bag used naturally as a styling prop')];
const makeup=[O('Keep reference makeup','makeup consistent with the reference image'),O('Soft glam','soft glam makeup with realistic skin texture and defined eyes'),O('Bold winged liner','bold winged eyeliner with a clean, confident eye look'),O('Smoky eyes + nude lip','smoky eyes paired with a natural nude lip'),O('Classic red lip','a classic red lip and softly defined eyes'),O('Berry lip editorial','a berry-toned lip with refined editorial eye makeup'),O('Bronzed editorial makeup','bronzed editorial makeup with believable skin texture'),O('Fresh dewy makeup','fresh dewy makeup with restrained shine, not artificial gloss'),O('Matte sculpted glam','matte sculpted makeup with natural texture and subtle contour'),O('Soft rose makeup','soft rose-toned makeup with gently defined eyes'),O('Graphic liner','modern graphic eyeliner with otherwise understated makeup'),O('Warm brown smoky look','warm brown smoky eye makeup and a softly neutral lip'),O('Minimal clean makeup','minimal clean makeup with natural skin texture'),O('Statement lashes','defined lashes and subtle eye emphasis without changing eye shape'),O('Classic wing + soft lips','classic winged liner and soft neutral lips'),O('Metallic eye accent','a restrained metallic eye accent for fashion-editorial impact'),O('Muted mauve glam','muted mauve makeup with gently sculpted eyes'),O('Bold monochrome makeup','coordinated monochrome makeup in a rich, sophisticated shade'),O('Soft shimmer lids','soft shimmer lids with natural-looking skin'),O('Candid after-makeup touch-up','freshly finished makeup with a tiny imperfect touch-up detail')];
const pose=[
O('Over-the-shoulder power glance','turning over her shoulder to give the camera a confident, daring glance'),O('Hand on hip, strong stance','standing with one hand on her hip and a relaxed, powerful stance'),O('Walking toward camera','walking naturally toward the camera, captured mid-step'),O('Seated sideways on a stool','sitting sideways on a stool with relaxed shoulders and confident posture'),O('Hand running through hair','casually running one hand through her newly styled hair'),O('Leaning against a wall','leaning casually against a textured wall with an assured expression'),O('Candid laugh, looking away','laughing naturally while looking away from the camera'),O('Side profile, chin raised','posing in side profile with her chin slightly raised'),O('Arms folded, fierce stance','standing with folded arms and a bold, self-assured stance'),O('Adjusting an earring','adjusting an earring during a spontaneous behind-the-scenes moment'),O('Walking away, looking back','walking away before turning her head back toward the camera'),O('Seated forward, eye contact','sitting forward slightly and holding strong eye contact with the camera'),O('Mid-turn, hair in motion','caught mid-turn with loose hair moving naturally between poses'),O('Shoulder against wall','resting one shoulder against a wall with relaxed, confident body language'),O('Hands in trouser pockets','standing casually with hands in trouser pockets and a relaxed editorial stance'),O('One hand at collar','casually adjusting her collar while looking confidently toward camera'),O('Sitting on studio floor','sitting comfortably on the studio floor in a composed fashion pose'),O('Crossed-leg seated pose','sitting with legs comfortably crossed and shoulders relaxed'),O('Looking down, soft grin','looking down with a small spontaneous grin during a candid moment'),O('Looking back over her shoulder','looking back over her shoulder in a tasteful fashion pose'),O('Resting hand near chin','resting one hand lightly near her chin while holding the photographer’s gaze'),O('Both hands adjusting hair','using both hands to lightly arrange the new hairstyle'),O('Half-step into the light','taking a small step into a patch of natural light'),O('Turning toward photographer','turning toward the photographer as if someone just called her name'),O('Laughing with head slightly back','laughing freely with her head tilted slightly back'),O('Sitting on chair backwards','sitting sideways on a chair with one arm resting on its back'),O('Straight-on commanding stance','standing straight toward the camera with a poised, commanding stance'),O('Relaxed shoulder tilt','tilting one shoulder slightly with loose, natural posture'),O('Holding jacket over shoulder','casually holding a jacket over one shoulder'),O('Adjusting a bracelet','adjusting a bracelet while glancing toward the camera'),O('Mid-conversation candid','captured mid-conversation with an animated, confident expression'),O('Hands at waist, relaxed','resting her hands naturally at her waist with an open, confident stance'),O('Seated near window','sitting beside a window, turned slightly toward the light'),O('One foot forward editorial stance','standing with one foot slightly forward in a balanced editorial stance'),O('Caught between poses','a spontaneous in-between pose as she resets for the next shot'),O('Touching the ends of haircut','lightly touching the freshly cut ends of her hairstyle'),O('Casual jacket adjustment','adjusting the lapel of her jacket with effortless confidence'),O('Looking to the side mid-smile','looking off to the side with a natural smile'),O('Leaning on high table','leaning casually against a high table with relaxed posture'),O('Hands behind back, shoulder turn','standing with hands loosely behind her back and shoulders turned slightly'),O('Seated on studio stool with upper hair in butterfly clips','seated relaxed on a low backless studio stool with matte butterfly sectioning clips still pinned neatly across her upper crown while lower freshly cut ends frame her jawline'),O('Pausing mid-restyle brushing loose cut wisps off collarbone','leaning softly toward key light while brushing a few fine freshly snipped hair wisps playfully off her bare collarbone between cutting passes'),O('Holding aluminum water-mist bottle during solo hair reset','standing candidly in soft studio light holding a brushed aluminum salon spray bottle mid-air after spritzing natural moisture back into her layers'),O('Running spread fingers upward through damp tousled bangs','tilting her chin subtly down while sliding spread fingertips softly through freshly misted, damp piecey bangs to set effortless volume')];
const expression=[O('Playful smirk','a playful smirk and confident eyes'),O('Fierce direct gaze','a fierce, unwavering direct gaze'),O('Bold natural smile','a bold, natural smile'),O('Mischievous grin','a mischievous grin with a raised eyebrow'),O('Serious fashion expression','a composed, serious high-fashion expression'),O('Candid laughter','genuine laughter with relaxed facial muscles'),O('Poised editorial confidence','a poised, confident editorial expression'),O('Carefree look-away','a carefree expression while looking away from the lens'),O('Subtle closed-lip smile','a subtle closed-lip smile and relaxed eyes'),O('Confident half-smile','a confident half-smile with calm eye contact'),O('Surprised playful reaction','a playful, surprised reaction as if responding to the photographer'),O('Soft thoughtful gaze','a soft, thoughtful gaze directed slightly off camera'),O('Raised eyebrow','one raised eyebrow and a knowing smile'),O('Relaxed post-makeover happiness','a relaxed, happy expression just after the makeover'),O('Smiling with eyes','a warm smile that reaches her eyes'),O('Cool unbothered expression','a cool, unbothered expression with effortless confidence'),O('Candid mid-sentence','a natural mid-sentence expression in a behind-the-scenes moment'),O('Tiny laugh and lowered gaze','a tiny laugh with a briefly lowered gaze'),O('Determined strong gaze','a determined, strong gaze with a relaxed jaw'),O('Quiet confident expression','quiet confidence with natural facial asymmetry'),O('Playful side glance','a playful side glance toward the photographer'),O('Bright excited grin','a bright, excited grin at the reveal of her new look'),O('Calm direct expression','a calm direct expression with no exaggerated posing'),O('Elegant composed smile','an elegant, composed smile with a polished editorial feel'),
  O('Quiet sultry contemplation (parted lips)','a quiet sultry contemplative expression with gently parted lips, relaxed jawline, and deep focused gaze'),
  O('Enigmatic Mona Lisa smirk with knowing eyes','an enigmatic, subtle Mona Lisa smirk with a knowing, magnetic look and faint cheek dimple'),
  O('Soft daydreaming with gentle unfocused gaze','a soft, dreamy daydreaming expression with gentle relaxed brow, warm eye warmth, and subtle natural sweetness'),
  O('Intimate closed-eyes bliss tipping chin to light','a blissful candid moment with eyes gently closed, chin tipped toward the light, inhaling peacefully'),
  O('Disarming warm toothy laugh with eye crinkles','a genuine, disarming warm toothy laugh with authentic crinkles at the outer corners of her eyes'),
  O('Fierce high-fashion runway scowl & commanding stare','a fierce, high-fashion runway scowl with narrowed intense eyes and commanding regal authority'),
  O('Playful tongue-in-cheek half-smile','a playful, charming tongue-in-cheek half-smile with sparkling lively eyes'),
  O('Serene post-makeover confidence & calm poise','a calm, centered post-makeover confidence with serene facial symmetry and relaxed shoulder poise'),
  O('Subtle lip-bite with sensual candid intensity','a subtle, involuntary biting of the bottom lip with an intense, sensual candid gaze'),
  O('Chin lifted with regal, untouchable aloofness','chin lifted with an effortless regal, untouchable aloofness and direct downward gaze'),
  O('Breathless glance back over bare shoulder','a breathless, spontaneous glance back over her bare shoulder with parted lips and wide expressive eyes'),
  O('Vulnerable open gaze straight into lens','a vulnerable, open, unfiltered gaze straight into the camera lens with raw emotional clarity'),
  O('Wry amused micro-smile with one raised eyebrow','a wry, amused micro-smile with one subtly arched eyebrow and sharp discerning eyes'),
  O('Calm meditative stillness & soft tranquil breath','a tranquil meditative stillness with soft natural breathing, serene lips, and complete facial peace'),
  O('Intense editorial stare with razor-sharp focus','an intense, piercing editorial stare with razor-sharp eye catchlights and striking facial tension'),
  O('Joyful candid grin mid-conversation','a vibrant, spontaneous candid grin captured mid-conversation with radiant natural warmth')];
const gesture=[O('Natural loose hands','natural, relaxed hands with believable finger positions'),O('One hand touching hair','one hand lightly touching the hairstyle'),O('Hands holding outfit detail','hands naturally adjusting a cuff, lapel or fabric edge'),O('Subtle jewelry gesture','a small gesture with an earring or bracelet'),O('Hands in pockets','hands resting casually in pockets where the outfit allows'),O('Arms relaxed by sides','arms resting naturally by her sides'),O('One hand at waist','one hand resting casually at the waist'),O('Mid-gesture conversation','hands caught mid-gesture in conversation'),O('Hands gently folded','hands loosely folded without tension'),O('Hair tuck behind ear','tucking a loose strand behind one ear'),O('Holding steel pintail comb at parting','holding the slender handle of a carbon tail comb lightly near her hairline mid-parting change'),O('Popping open a butterfly section clip near crown','reaching up gracefully with two fingers to unclip a dark salon butterfly clamp from freshly styled upper layers')];
const framing=[O('Close-up beauty portrait','a close-up beauty portrait emphasizing her face, makeup and haircut'),O('Head-and-shoulders portrait','a head-and-shoulders portrait with the hairstyle fully visible'),O('Waist-up editorial portrait','a waist-up editorial portrait showing the outfit and expression'),O('Three-quarter fashion portrait','a three-quarter fashion portrait with natural body language'),O('Knee-up fashion photograph','a knee-up fashion photograph showing the outfit silhouette'),O('Full-body editorial photograph','a full-body editorial photograph with realistic proportions and natural posture'),O('Candid medium shot','a candid medium shot with the environment visible'),O('Tight side-profile portrait','a tight side-profile portrait emphasizing the haircut and facial profile'),O('Wide environmental portrait','a wider environmental portrait with the setting contributing to the story'),O('Detail crop: hair + face','a close fashion crop focused on hairstyle, face and upper outfit')];
const angle=[O('Eye-level candid angle','an eye-level candid camera angle'),O('Slightly low angle','a slightly low camera angle for a powerful editorial feel'),O('Three-quarter side angle','a three-quarter side camera angle'),O('Slightly elevated angle','a slightly elevated camera angle with a natural perspective'),O('Over-the-shoulder viewpoint','a camera viewpoint just behind and beside the subject\'s shoulder; subject remains the sole person in frame'),O('Side profile angle','a clean side-profile camera angle'),O('Diagonal candid composition','a gently diagonal candid composition'),O('Photographer just off-center','a slightly off-center photographer viewpoint, as if caught spontaneously'),O('Straight-on centered angle','a straight-on camera angle facing the subject directly'),O('Low oblique angle','a subtly low oblique camera angle looking up slightly toward the subject'),
  O('Dutch angle / dynamic 15-degree editorial tilt','a dynamic Dutch angle with a subtle 15-degree camera tilt adding kinetic editorial tension and energy'),
  O('Low-raking ground-level angle looking up (commanding stature)','a low-raking ground-level camera angle looking up, lending the subject commanding, statuesque presence'),
  O('High bird\'s-eye 45-degree angle looking down into eyes','a high 45-degree bird\'s-eye angle looking down into the model\'s upturned face, accentuating cheekbones and gaze'),
  O('Direct straight-on passport-precision symmetry angle','a direct straight-on camera angle with perfect graphic symmetry and clean anatomical alignment'),
  O('Glancing profile reflection angle through foreground glass','an artistic glancing profile angle looking through foreground glass with subtle layered reflections'),
  O('Intimate close-cropped chin-level perspective','an intimate chin-level camera perspective framing jawline, lips, and neck contour with tactile proximity'),
  O('Floor-grazing low-profile camera angle','a floor-grazing camera angle shooting just above ground level for an immersive, modern street editorial feel'),
  O('Worm\'s-eye perspective looking dramatically upward','a dramatic worm\'s-eye perspective looking sharply upward against the ceiling or sky'),
  O('Three-quarter rear angle capturing hair silhouette & rim','a three-quarter rear camera angle focusing on hair silhouette, neck curvature, and delicate rim lighting'),
  O('Slight downward 15-degree fashion catalogue angle','a classic high-fashion catalogue angle angled 15 degrees downward with clean, flattering geometry'),
  O('Sideways looking away - face hidden by hand', 'a side-profile camera angle where the model is turned sideways looking away from the scene, her face completely obscured and shielded from view by her raised hand touching her temple/forehead, keeping her facial features entirely hidden while highlighting her silhouette, hair volume, and wardrobe styling'),
  O('Sideways looking away - face concealed by hair & direction', 'a side-angle camera perspective capturing the model turned sideways facing away into the background/distance, her head turned away and thick hair falling forward naturally to completely obscure her face from the lens, with zero facial features visible'),
  O('Sideways looking away - model turned away into distance', 'a side-profile camera angle where the model is turned sideways looking away from the camera into the distance, her head angled away from the lens so her face is not visible, maintaining her natural hairstyle and drawing focus to her posture, shoulder line, and wardrobe silhouette'),
  O('Sideways 90-degree flush profile (lateral horizon)', 'a crisp 90-degree lateral side-profile camera angle capturing the model\'s complete side silhouette facing squarely toward the lateral horizon, with jawline and collarbone contoured against the background'),
  O('Sideways low-angle raking profile skimming upward', 'a low-angle raking side-profile camera perspective placed at waist level looking upward along the side contour of the body, accentuating posture, height, and side silhouette'),
  O('Over-the-shoulder sideways profile looking past camera left', 'an intimate over-the-shoulder sideways angle shooting past the model\'s shoulder blade as she turns her head in profile gazing outward, highlighting the curve of her neck and shoulder line'),
  O('Sideways wide environmental profile capturing full setting', 'a wide-angle environmental side-profile composition placing the model in lateral silhouette across the frame, balancing her side posture with rich architectural and environmental depth'),
  O('Sideways high-angle 45-degree downward profile crop', 'a high 45-degree angle looking down onto the model\'s side profile, tracing the cheekbone slope, temple, and shoulders in clean diagonal geometry'),
  O('Sideways cinematic walking-by tracking profile mid-turn', 'a cinematic lateral tracking camera angle capturing the model sideways in natural walking motion, side silhouette caught mid-turn with organic movement and realistic depth')];
const lens=[O('Natural 50mm DSLR look','a natural 50mm DSLR lens perspective'),O('85mm portrait look','an 85mm portrait lens look with soft background separation'),O('35mm environmental look','a 35mm environmental portrait look with a lived-in sense of space'),O('Smartphone candid look','a high-quality smartphone camera look with realistic computational detail'),O('Classic 70mm fashion look','a classic 70mm fashion portrait perspective'),O('Natural uncompressed perspective','a natural perspective without exaggerated wide-angle distortion'),O('Classic 105mm telephoto look','a classic 105mm telephoto portrait perspective with natural background compression'),O('Wide 24mm environmental look','a wide 24mm environmental perspective with realistic foreground context'),O('Crisp editorial detail','crisp editorial detail with natural optical falloff'),
  O('Hasselblad 100mm f/2.2 medium-format prime','a Hasselblad 100mm f/2.2 medium-format portrait prime look with ultra-creamy background melt and 3D subject pop'),
  O('105mm f/1.4 Art prime (tack-sharp eyes & creamy bokeh)','a 105mm f/1.4 prime lens perspective with razor-sharp focus on the iris and dreamlike buttery background falloff'),
  O('28mm f/1.4 wide-angle street editorial look','a 28mm f/1.4 wide-angle street editorial perspective providing dynamic spatial presence and tactile proximity'),
  O('135mm f/1.8 telephoto fashion compression','a 135mm f/1.8 telephoto lens look with cinematic background compression and flattering facial proportions'),
  O('Anamorphic 2.39:1 widescreen lens with oval bokeh','a cinematic anamorphic 2.39:1 widescreen lens look with characteristic horizontal oval bokeh and subtle lens flare streaks'),
  O('Vintage Leica Summilux 50mm f/1.4 (organic glow)','a vintage Leica Summilux 50mm f/1.4 look with rich organic micro-contrast and gentle luminous highlight roll-off'),
  O('24mm ultra-wide low-angle drama lens','a 24mm ultra-wide lens perspective exaggerating perspective, elongating limbs, and creating high-drama editorial impact'),
  O('Tilt-shift 45mm selective focus lens look','a tilt-shift 45mm lens look with a narrow slice of tack-sharp focus and artistic selective blur across the frame'),
  O('Macro 90mm f/2.8 beauty prime (extreme eye & skin detail)','a 90mm f/2.8 Macro lens perspective capturing extreme micro-detail in eye catchlights, skin pores, and fine hair strands')];
const composition=[O('Rule-of-thirds framing','rule-of-thirds framing with intentional breathing room'),O('Centered magazine composition','a centered magazine-style composition'),O('Loose candid crop','a loose candid crop with natural imperfect framing'),O('Clean negative space','clean negative space around the subject'),O('Subject off-center','the subject slightly off-center for a spontaneous editorial feel'),O('Foreground depth','subtle foreground depth without obstructing the face'),O('Hair silhouette visible','composition that clearly separates the haircut silhouette from the background'),O('Outfit silhouette emphasized','composition that makes the outfit silhouette easy to read'),O('Face-first composition','face-first composition with sharp focus on expression'),O('Environmental storytelling','environmental storytelling that shows enough context to feel authentic')];
const background=[O('Pure-white studio','a clean, seamless white studio'),O('Charcoal editorial studio','a dark charcoal editorial studio'),O('Warm taupe studio','a warm taupe studio with soft tonal variation'),O('Modern Indian salon','a stylish modern Indian salon immediately after her makeover'),O('Salon styling station','a realistic salon styling station with restrained, believable detail'),O('Luxury hotel suite','a sophisticated luxury hotel suite'),O('Minimal apartment interior','a modern, lived-in apartment interior'),O('Indian home living room','a tasteful Indian home living room with natural lived-in details'),O('Industrial loft windows','a minimal loft with tall industrial windows'),O('Concrete editorial wall','an urban concrete wall with subtle texture'),O('Night city bokeh','a nighttime city backdrop with soft bokeh lights'),O('Rooftop at dusk','a city rooftop at dusk with understated background detail'),O('Hotel corridor','an elegant hotel corridor with warm practical lighting'),O('Minimal beige backdrop','a minimal beige backdrop with gentle tonal depth'),O('Deep burgundy backdrop','a deep burgundy studio backdrop'),O('Soft grey studio','a soft grey studio with subtle natural shadows'),O('Apartment near window','a home interior beside a large window'),O('Fashion backstage','a fashion backstage area with subtle, realistic activity in soft focus'),O('Quiet cafe interior','a quiet modern cafe interior with warm natural light'),O('Modern stairwell','a modern architectural stairwell with clean lines'),O('Dressing room mirrorless setup','a stylish dressing room with wardrobe textures and no visible mirrors'),O('Garden terrace','a private garden terrace with soft greenery in the distance'),O('Outdoor stone wall','an outdoor stone wall under soft daylight'),O('Minimal photo studio cyclorama','a professional studio cyclorama with a softly graded neutral background')];
const lighting=[O('Direct camera flash','bold direct-flash photography with candid editorial energy'),O('Dramatic studio key light','dramatic studio key lighting with sculpted shadows'),O('Soft natural window light','soft natural window light and realistic shadows'),O('Warm cinematic side light','warm cinematic side lighting'),O('Moody low-key lighting','moody low-key lighting with controlled highlights'),O('Bright clean editorial light','bright, clean fashion-editorial lighting'),O('Golden-hour side light','late-afternoon golden-hour light with a warm natural glow'),O('Overcast daylight','soft overcast daylight with subtle shadow definition'),O('Beauty dish lighting','controlled beauty-dish lighting that preserves skin texture'),O('Window backlight','window backlight with subtle realistic hair rim light'),O('Mixed practical lighting','mixed practical interior lighting with believable color variation'),O('Hard sunlight and shadow','direct sunlight with crisp, believable shadows'),O('Soft diffused key light','soft diffused key light with gentle facial dimension'),O('Dim warm tungsten','dim warm tungsten lighting with a candid indoor feel'),O('Cool editorial lighting','cool editorial lighting with restrained contrast'),O('Flash plus ambient light','on-camera flash balanced with ambient room light'),O('Bright salon daylight','bright salon daylight reflecting naturally off the room'),O('Low-contrast film lighting','low-contrast film-style lighting with smooth tonal transitions')];
const style=[O('Candid luxury editorial','candid luxury fashion editorial photography'),O('Behind-the-scenes DSLR','raw behind-the-scenes DSLR photography'),O('Bold magazine editorial','bold high-fashion magazine editorial photography'),O('Smartphone candid','a spontaneous high-quality smartphone photograph'),O('Celebrity makeover reveal','a candid celebrity-style makeover reveal photoshoot'),O('Documentary portrait','natural documentary-style portrait photography'),O('Street-style fashion','street-style fashion photography with unforced attitude'),O('Beauty campaign','a premium beauty-campaign portrait with realistic details'),O('Modern fashion lookbook','a modern fashion lookbook photograph'),O('Flash snapshot energy','a spontaneous direct-flash snapshot with imperfect candid energy'),O('Analog 35mm film feel','a subtle analog 35mm film aesthetic with realistic grain'),O('Contemporary magazine spread','a contemporary magazine-spread editorial photograph'),O('Unposed studio test shot','an unposed studio test shot with authentic in-between moments'),O('Polished but candid portrait','a polished but candid portrait that still feels unstaged'),O('Runway backstage energy','fashion backstage energy captured as a natural moment'),O('Lifestyle campaign','a confident lifestyle-campaign portrait')];
const mood=[O('Fearless and self-assured','fearless, self-assured energy'),O('Playful and cheeky','playful, cheeky energy'),O('Cool and unbothered','cool, unbothered confidence'),O('Glamorous and composed','glamorous, composed energy'),O('Fresh makeover excitement','fresh post-makeover excitement'),O('Edgy rock-chic','edgy rock-chic attitude'),O('Quietly powerful','quietly powerful and grounded mood'),O('Relaxed and spontaneous','relaxed, spontaneous energy'),O('Celebratory reveal','a celebratory makeover-reveal mood'),O('Mysterious and cinematic','a mysterious, cinematic mood'),O('Warm and approachable','warm, approachable confidence'),O('High-fashion intensity','high-fashion intensity without exaggerated posing')];
const grade=[O('Natural true-to-life color','natural, true-to-life color with balanced skin tones'),O('Warm film warmth','subtle warm film-inspired color'),O('Cool editorial tones','cool editorial color tones with skin kept natural'),O('Rich jewel tones','rich jewel tones with controlled saturation'),O('Soft neutral palette','soft neutral palette with natural contrast'),O('Deep blacks, gentle highlights','deep blacks and gentle highlights without crushed detail'),O('Classic analog grain','subtle classic analog grain'),O('Clean crisp digital','clean crisp digital color with realistic contrast'),O('Muted cinematic palette','muted cinematic color grading'),O('Warm skin, cool shadows','warm natural skin tones with slightly cooler shadows')];
const aspect=[O('Vertical 9:16','vertical 9:16 portrait composition'),O('Portrait 4:5','portrait 4:5 composition for a social-media post'),O('Classic portrait 3:4','classic 3:4 portrait composition'),O('Square 1:1','square 1:1 composition'),O('Landscape 3:2','landscape 3:2 composition')];
const quality=[O('Photorealistic 35mm optical detail','natural 35mm optical sensor fidelity with unclipped dynamic range and gentle highlight roll-off'),O('Natural DSLR realism','natural DSLR realism with believable optical depth'),O('High-quality phone realism','high-quality smartphone realism with natural texture'),O('Magazine-quality finish','magazine-quality finish while preserving photographic authenticity'),O('Subtle film grain','subtle film grain and realistic tonal texture'),O('Crisp but not oversharpened','crisp details without artificial oversharpening')];

// EXTENDED OPTION LIBRARY — expanded curated combinations plus new micro-control fields.

// More poses, captured moments and body-language combinations.
const poseBases=[
['Resting against a high stool','resting one hand on a high stool while turning toward the photographer'],['Seated on the edge of a chair','sitting at the edge of a chair with an alert, confident posture'],['Turning after hearing her name','turning naturally after the photographer calls her name'],['Taking a breath before the next frame','taking a relaxed breath before the next frame, shoulders settling naturally'],['Fixing one lapel','straightening one lapel while holding an amused expression'],['Checking a sleeve cuff','checking a sleeve cuff as the photographer catches the moment'],['Lightly gathering the hair over one shoulder','gathering a section of hair over one shoulder to show the new cut'],['Tilting her head to show the fringe','tilting her head slightly to show the fringe and layered shape'],['Walking past the camera position','walking past the camera position and glancing back'],['Pausing at a doorway','pausing in a doorway with relaxed, self-assured body language'],['Leaning forward on a table','leaning forward lightly on a table with a confident look'],['Sitting by a window with one knee angled','sitting by a window with a comfortable, naturally angled posture'],['Standing with jacket draped over one arm','standing with a jacket draped naturally over one arm'],['Turning at the waist','turning at the waist so the outfit and hair move naturally'],['Settling into a relaxed stance','settling into a relaxed stance between formal takes'],['Stretching shoulders after the shoot cue','loosening her shoulders after the photographer gives a cue'],['Walking while fastening a bracelet','walking while fastening a bracelet in a candid in-between moment'],['Holding sunglasses loosely at her side','holding sunglasses loosely at her side as a styling prop'],['Adjusting a bag strap','adjusting a bag strap while keeping a confident expression'],['Sitting sideways with ankles crossed','sitting sideways with ankles crossed in a relaxed editorial pose'],['Resting against a counter','resting against a counter with a casual confident posture'],['Looking down at the outfit detail','glancing down briefly at an outfit detail before looking back up'],['Gently tucking hair behind one ear','gently tucking hair behind one ear to reveal the haircut'],['Turning to greet someone off-frame','turning to greet someone just outside the frame'],['Laughing while resetting her stance','laughing while resetting her stance between shots'],['Stepping backward into the composition','stepping backward into the composition while maintaining natural posture'],['Shifting weight onto one leg','shifting her weight onto one leg with a natural hip and shoulder line'],['Standing near a light source','standing near a light source with the side of her face turned toward it'],['Hands lightly resting on a chair back','resting her hands lightly on the back of a chair'],['Looking over the shoulder of a blazer','looking back over the shoulder of a blazer in a fashion-editorial moment'],['Smoothing the side of the outfit','smoothing the side of her outfit as a candid styling moment'],['Holding a relaxed three-quarter turn','holding a relaxed three-quarter turn toward the photographer'],['Mid-step with a jacket swinging lightly','caught mid-step as a jacket swings lightly with her movement'],['Sitting cross-legged on a studio chair','sitting comfortably cross-legged on a studio chair'],['Resting forearms on a railing','resting forearms naturally on a railing and looking toward camera'],['One hand lifted in a conversational gesture','lifting one hand in a natural conversational gesture'],['Turning her shoulder toward the light','turning one shoulder toward the light to show the outfit silhouette'],['Standing near a textured wall with one foot back','standing near a textured wall with one foot set casually behind'],['Glancing at the photographer between takes','glancing toward the photographer between takes with unforced confidence'],['Showing the back layers with a head turn','turning her head while showing the back layers of the new haircut'],['Sitting on a low platform','sitting on a low platform with an assured, relaxed pose'],['Leaning with one shoulder and crossed ankles','leaning with one shoulder against a wall and ankles crossed'],['Holding a folded jacket close to the side','holding a folded jacket naturally beside her'],['Walking through a patch of sunlight','walking through a patch of sunlight with natural hair movement'],['Pausing mid-conversation','pausing mid-conversation with expressive but relaxed hands'],['Standing with hands clasped loosely behind','standing with hands loosely clasped behind her back'],['Pivoting on one foot','pivoting lightly on one foot, captured at the start of a turn'],['Reaching to adjust a cuff bracelet','reaching to adjust a cuff bracelet in an unposed moment'],['Turning from profile to camera','turning from profile toward the lens with a fresh, bold expression'],['Leaning forward for a close frame','leaning forward slightly for a close editorial frame']
];
const poseModifiers=['captured in a genuine in-between moment','with a slight natural movement in her hair','while the photographer catches an unscripted expression','with relaxed shoulders and believable hand placement'];
const generatedPoses=[];poseBases.forEach((p,i)=>{generatedPoses.push(O(p[0],p[1]));if(i<40){const mod=poseModifiers[i%poseModifiers.length];generatedPoses.push(O(p[0]+' · candid take',p[1]+', '+mod));}});addOptions(pose,generatedPoses);

// Enrich existing menus with additional distinct options.
addOptions(expression,makeOpts([
['Warm confident grin','a warm, confident grin with naturally engaged eyes'],['Tiny amused smile','a tiny amused smile as if reacting to a comment off-camera'],['Calm intensity','a calm, intense gaze with relaxed facial muscles'],['Cheeky side-eye','a cheeky side-eye with a barely restrained smile'],['Dramatic chin-up gaze','a dramatic chin-up gaze with composed confidence'],['Quietly amused look','a quietly amused look captured between formal poses'],['Half-laugh with narrowed eyes','a half-laugh with naturally narrowed eyes'],['Fresh reveal delight','visible delight at the newly finished makeover'],['Unbothered editorial stare','an unbothered editorial stare with a relaxed jaw'],['Confident lips-closed smile','a lips-closed confident smile with natural eye expression'],['Looking off-frame with curiosity','a curious look directed off-frame'],['Soft smirk and lifted chin','a soft smirk and slightly lifted chin'],['Playful lip press','a playful lip press with alert, expressive eyes'],['Candid surprised smile','a candid, pleasantly surprised smile'],['A quiet moment of composure','a quiet moment of composed confidence'],['Big spontaneous laugh','a big spontaneous laugh with believable facial movement'],['Elegant warm smile','an elegant warm smile without exaggerated posing'],['Relaxed after-laugh expression','a relaxed expression just after laughing'],['Bold direct gaze with subtle smile','a bold direct gaze paired with a subtle smile'],['Thinking expression between takes','a thoughtful expression between takes'],['Eyes briefly closed in a laugh','eyes briefly closed during a genuine laugh'],['Confident playful wink-like squint','a playful squint without an exaggerated or cartoonish expression'],['Serene focused face','a serene, focused face with subtle natural asymmetry'],['A quick candid glance downward','a quick candid downward glance before returning to camera'],['Bright post-makeover excitement','bright excitement after seeing the finished makeover'],['Cool fashion attitude with raised brow','cool fashion attitude with one eyebrow subtly raised'],['Soft smile while listening','a soft smile while listening to the photographer'],['Determined but relaxed expression','a determined expression with relaxed facial tension'],['Side smile with cheek raised','a side smile with one cheek naturally raised'],['Spontaneous mid-sentence grin','a spontaneous grin captured in the middle of a sentence']
]));
addOptions(makeup,makeOpts([
['Brown liner and rose lip','soft brown liner with a rose lip and real skin texture'],['Smudged charcoal liner','smudged charcoal eyeliner with a clean, editorial lip'],['Soft berry stain','a soft berry lip stain with lightly defined eyes'],['Warm terracotta lip','a warm terracotta lip and softly sculpted cheeks'],['Graphic double-wing liner','a modern double-wing liner with restrained complexion makeup'],['Bronze shimmer and nude lip','bronze shimmer on the lids with a natural nude lip'],['Rosewood monochrome glam','rosewood-toned lips, cheeks and eyes blended subtly'],['Defined lower lash line','a defined lower lash line balanced with a soft neutral lip'],['Modern pin-up liner','modern pin-up eyeliner with a sophisticated red lip'],['Smoky plum eyes','smoky plum eye makeup with softly blended edges'],['Soft copper eye makeup','soft copper-toned eye makeup and natural lips'],['Clean editorial skin','clean editorial makeup with visible realistic skin texture'],['Muted wine lip','a muted wine lip paired with minimally defined eyes'],['Taupe sculpted eyes','taupe sculpted eye makeup with a soft satin lip'],['Subtle inner-corner shimmer','subtle inner-corner shimmer with an otherwise natural makeup look'],['Feathered brow emphasis','softly groomed, natural-looking brows without changing their shape'],['Classic brown smoky eye','a classic brown smoky eye with softly diffused edges'],['Peachy neutral glam','peachy neutral glam with believable skin texture'],['Soft matte berry lip','a soft matte berry lip with understated eye definition'],['Candid final powder touch-up','a realistic final makeup touch-up just before the first frame']
]));
addOptions(accessories,makeOpts([
['Oversized sculptural hoops','oversized sculptural hoops with restrained additional jewelry'],['Long drop earrings','long drop earrings that move naturally with her head'],['Chunky cuff and slim rings','a chunky cuff bracelet paired with slim rings'],['Layered fine chains','layered fine chains that sit naturally against the outfit'],['Bold pendant necklace','a bold pendant necklace coordinated with the neckline'],['Minimal ear stack','a curated stack of small earrings and an understated ear cuff'],['Structured clutch prop','a small structured clutch held naturally as a fashion prop'],['Statement belt','a statement belt coordinated with the outfit'],['Silk scarf accent','a silk scarf used as a restrained styling accent'],['Hair pin detail','a tasteful hair pin detail that does not obscure the haircut'],['Decorative barrette','a modern barrette placed naturally in the hairstyle'],['Metallic cuff earrings','metallic cuff earrings with a sculptural silhouette'],['Traditional oxidized earrings','traditional oxidized earrings styled with a contemporary outfit'],['Pearl drop earrings','pearl drop earrings with understated elegance'],['Layered bangles','a small stack of coordinated bangles'],['Slim chain belt','a slim chain belt used as a subtle styling detail'],['Keep glasses from reference','retain the same glasses visible in the reference image'],['Small hoop nose ring retained','retain a nose ring from the reference if present'],['Statement sunglasses in hand','statement sunglasses held in one hand rather than worn'],['No bag or props','no handbag or extra props; keep attention on the subject']
]));
addOptions(lighting,makeOpts([
['Large softbox with gentle falloff','a large softbox with gentle falloff and a natural skin rendering'],['Side window light with wall bounce','side window light with a soft wall bounce fill'],['Hard flash with softened ambient shadows','direct flash balanced with softened ambient shadows'],['Two-light editorial setup','a two-light editorial setup with controlled highlights and shadows'],['Soft rim light on hairstyle','a subtle rim light separating the hairstyle from the background'],['Window light plus negative fill','window light with gentle negative fill for dimensional contrast'],['Overhead salon practicals','realistic overhead salon practical lighting'],['Golden reflector fill','late-afternoon light with gentle warm reflector fill'],['Cloudy exterior softbox effect','soft outdoor daylight similar to a large natural softbox'],['Neon accent, natural skin','a restrained colored neon accent while keeping natural skin tones'],['Warm lamp mixed with daylight','warm practical lamp light mixed with cooler daylight'],['Crisp sun patch on background','crisp sunlight falling on the background while the face remains exposed naturally'],['Beauty-dish key and soft fill','a beauty-dish key light balanced by a soft fill'],['Low contrast open shade','low-contrast open shade with soft natural skin detail'],['Studio strip light edge','a narrow studio strip light creating a controlled edge highlight'],['Rainy-window ambient light','diffused rainy-window ambient light with gentle contrast'],['Late-day side light','late-day side light with natural tonal warmth'],['Flash freeze with motion in hair','flash-frozen facial detail with a slight natural movement in the hair']
]));
addOptions(background,makeOpts([
['Designer gallery lounge with low marble tables','a designer lounge with low marble coffee tables, curated art, and architectural cove lighting'],['Private styling suite','a private styling suite with garment rails and professional styling details'],['Backstage changing area','a fashion backstage changing area with clothing racks softly out of focus'],['White seamless with floor sweep','a white seamless studio with a clean floor sweep'],['Black velvet drape backdrop','a black velvet drape backdrop with subtle texture'],['Warm wood-panel interior','a modern interior with warm wood-panel details'],['Terracotta plaster wall','a terracotta plaster wall with tactile surface detail'],['Soft blush studio wall','a soft blush studio wall with restrained tonal variation'],['Hotel dressing nook','a hotel dressing nook with warm practical lamps and realistic detail'],['Apartment hallway with daylight','a home hallway filled with natural daylight'],['Modern salon reception','a modern salon reception area with realistic depth and restrained decor'],['Textured stone studio','a textured stone studio backdrop with natural tonal differences'],['Rooftop terrace in late light','a rooftop terrace in late light with distant city texture'],['Urban arcade walkway','an urban arcade walkway with repeating architectural lines'],['Modern gallery interior','a minimal contemporary gallery interior with clean walls'],['Muted olive-green studio','a muted olive-green studio background with soft shadows'],['Midnight-blue studio background','a midnight-blue studio backdrop with dimensional light'],['Brushed metal fashion set','a restrained brushed-metal editorial set with realistic reflections'],['Warm concrete loft','a warm concrete loft with natural architectural texture'],['Large-window apartment studio','a bright apartment studio with tall windows and authentic details'],['Curtain-lit bedroom corner','a refined bedroom corner with soft curtains and natural window light'],['Minimal staircase landing','a modern staircase landing with clean lines and soft depth'],['Stone courtyard','a quiet stone courtyard under diffused daylight'],['Covered veranda','a covered veranda with natural textures and soft exterior light'],['Garden wall in open shade','a garden wall in open shade with subtle greenery in the distance'],['Cafe window seating','a calm cafe window seat with background activity in soft focus'],['Architectural doorway','a sculptural architectural doorway with restrained background detail'],['Studio with warm paper backdrop','a studio with a warm paper backdrop and subtle floor shadows'],['Studio with slate backdrop','a studio with a slate-grey backdrop and natural gradients'],['Dressing room without mirrors','a dressing room with clothes and soft practical lights but no visible mirrors'],['Light industrial stairwell','a light industrial stairwell with textured walls and clean geometry'],['Balcony in soft morning light','a balcony in soft morning light with an unobtrusive exterior view'],['Old-world plaster interior','an old-world plaster interior with warm, subtle surface texture'],['Minimal black cyc studio','a minimal black cyclorama studio with controlled separation light'],['Neutral linen backdrop','a neutral linen backdrop with fine textile texture'],['Deep olive editorial backdrop','a deep olive editorial backdrop with understated tonal depth'],['Muted blue-grey studio','a muted blue-grey studio background with soft gradients'],['Quiet restaurant corner','a quiet restaurant corner with practical lights and soft background depth'],['Gallery corridor at dusk','a gallery corridor at dusk with a refined cinematic atmosphere'],['Open-shade courtyard wall','an open-shade courtyard wall with realistic stone texture']
]));


addOptions(pose, makeOpts([
  ['Daring runway back arch', 'arching her back with daring runway attitude while looking over her shoulder toward the camera'],
  ['Dynamic fashion stride with billowing fabric', 'captured mid-stride with bold fashion energy as the fabric and hair billow naturally in the air'],
  ['Reclining on minimal studio cube', 'sensually reclining on a minimal matte studio cube with her head tilted back and gaze holding the lens'],
  ['Wide-stance power pose with hands in pockets', 'standing in a confident wide power stance with hands sunk into trouser pockets and head held high'],
  ['Intimate collarbone touch with parted lips', 'touching her collarbone lightly with one hand, lips slightly parted and eyes fixed directly on the lens'],
  ['One knee raised, leaning against wall', 'resting one foot back against a textured wall with relaxed hip tilt and self-assured composure'],
  ['High-fashion hand-on-hip silhouette', 'standing with hands pressing firmly into her waist, elbows flared in a commanding high-fashion silhouette'],
  ['Pivoting mid-turn with hair whipping around', 'caught in the split-second of a quick pivot as her newly styled hair whips dynamically through the frame']
]));

addOptions(background, makeOpts([
  ['Luxury cliffside infinity pool at golden hour', 'a luxury cliffside infinity pool terrace overlooking the ocean under warm golden-hour light'],
  ['Minimal brutalist concrete pavilion', 'a minimal brutalist architectural pavilion with raw concrete surfaces and dramatic sunbeam shadow stripes'],
  ['High-end marble dressing suite', 'an opulent marble dressing suite with garment rails, warm brass sconces, and soft ambient reflections'],
  ['Sunset rooftop terrace with skyline bokeh', 'a private city rooftop terrace at dusk with shimmering urban skyline bokeh lights'],
  ['Private luxury yacht deck', 'a sun-drenched teakwood deck of a private luxury yacht with glistening sea water caustics in the background'],
  ['Mirrored salon suite with zero reflections', 'a glamorous architectural salon suite with warm designer lighting and uncluttered surfaces']
]));

addOptions(lighting, makeOpts([
  ['Venetian blind shadow stripes', 'warm sunlight streaming through Venetian blinds, casting dramatic graphic shadow stripes across her face and body'],
  ['Pool water caustics light reflection', 'shimmering pool water light caustics dancing across her skin and hair with warm atmospheric glow'],
  ['High-contrast chiaroscuro spotlight', 'a focused high-contrast chiaroscuro spotlight sculpting her facial contours with deep cinematic shadows'],
  ['Neon noir cyan and amber split light', 'atmospheric neon-noir lighting with a cool cyan key light balanced by a warm amber rim light'],
  ['Sunset rim light with subtle lens flare', 'rich sunset rim lighting catching the outer silhouette of her hair and outfit with a subtle optical flare']
]));

addOptions(accessories, makeOpts([
  ['Draping metallic body chain', 'a delicate gold body chain draping gracefully over the collarbones and midriff'],
  ['Sculptural gold ear cuffs wrapping outer ear', 'sculptural gold ear cuffs wrapping the entire outer edge of one ear'],
  ['Avant-garde chrome choker', 'an avant-garde polished chrome choker necklace with minimalist elegance'],
  ['Sheer black opera gloves', 'sheer black mesh opera gloves reaching above the elbows'],
  ['Oversized architectural sunglasses', 'statement oversized architectural sunglasses held casually or worn as a styling accent'],
  ['Delicate waist chain jewelry', 'a fine metallic waist chain accentuating the outfit silhouette']
]));



// New micro-controls with large, searchable option banks.
const fringeDetail=makeOpts([['Arched bottleneck curtain bangs grazing brows & cheekbones','soft arched bottleneck curtain bangs parted slightly at the center hairline with wispy brow-grazing center strands that curve naturally outward to cheekbone level with delicate strand separation'],['Arched center-parted curtain bangs framing cheekbones','arched center-parted curtain bangs softly framing the forehead, eyebrow arches and cheekbones with curved outward ends'],['No fringe / open forehead','no fringe, with the forehead naturally open'],['Wispy curtain fringe','soft, wispy curtain bangs'],['Long curtain fringe','long curtain fringe that blends into face-framing layers'],['Brow-skimming fringe','light fringe skimming the eyebrows'],['Airy see-through fringe','an airy, see-through fringe with separated strands'],['Side-swept fringe','a deep side-swept fringe'],['Long cheekbone fringe','long cheekbone-length fringe pieces'],['Piecey textured fringe','piecey textured fringe with realistic separation'],['Soft rounded fringe','a soft rounded fringe with feathered edges'],['Asymmetric fringe','an asymmetric fringe swept gently to one side'],['Micro fringe','a short micro fringe styled with a modern editorial attitude'],['Bottleneck fringe','a bottleneck fringe that opens at the center and curves at the temples'],['Feathered curtain bangs','feathered curtain bangs with soft outward movement'],['Full brow fringe','a full brow-length fringe with natural texture'],['Loose strands across forehead','a few soft loose strands falling naturally across the forehead'],['Wispy side pieces only','wispy side pieces without a full fringe'],['Parted long fringe','a long fringe parted loosely at the center'],['Soft diagonal fringe','a softly diagonal fringe swept across the forehead'],['Layered fringe','a layered fringe with varied lengths'],['No bangs, face-framing only','no bangs, only long face-framing layers']]);
const parting=makeOpts([['Clean center part with bottleneck curtain opening','a clean short center part at the hairline opening into arched bottleneck curtain bangs'],['Clean center part with curtain fringe opening','a clean short center part at the hairline opening into curtain bangs'],['Deep left side part','a deep left-side part'],['Deep right side part','a deep right-side part'],['Soft center part','a soft center part'],['Loose off-center part','a relaxed off-center part'],['Natural part matching reference','a natural part consistent with the reference image'],['Slight zigzag part','a subtle, realistic zigzag part'],['Slicked-back no visible part','a slicked-back style with no prominent part'],['Side part with lifted roots','a side part with softly lifted roots'],['Center part with curtain opening','a center part opening naturally into curtain bangs'],['Part softened by flyaways','a subtle part softened by natural flyaways']]);
const hairVolume=makeOpts([['Natural low volume','natural low volume with a close-to-head silhouette'],['Airy crown lift','airy crown lift without exaggerated height'],['Soft rounded volume','soft rounded volume with a balanced outline'],['Full salon blowout volume','full salon blowout volume with realistic bounce'],['Piecey separated layers','piecey, separated layers with natural space between strands'],['Controlled sleek finish','a controlled sleek finish without helmet-like hair'],['Loose airy texture','loose airy texture with subtle strand variation'],['Defined curls with natural expansion','defined curls with natural expansion and believable volume'],['Undone volume','slightly undone volume as the hair settles after styling'],['Wind-touched lightness','light wind-touched movement and fine flyaways'],['Root lift, smooth lengths','soft root lift with smoother lengths'],['Softly compressed crown','a softly compressed crown with volume through the ends']]);

addOptions(fringeDetail, makeOpts([
  ['Micro baby bangs', 'razor-sharp micro baby bangs sitting high on the forehead'],
  ['Feathered bottleneck fringe', 'feathered bottleneck bangs curving gracefully around the cheekbones'],
  ['Shattered textured fringe', 'a shattered textured fringe with deliberate separation and airy finish'],
  ['Asymmetric peekaboo fringe', 'an asymmetric peekaboo fringe revealing one eye'],
  ['Wispy French curtain bangs', 'wispy French curtain bangs that part softly at the bridge of the nose']
]));

addOptions(hairVolume, makeOpts([
  ['90s bombshell mega-volume', 'full 1990s bombshell mega-volume with dramatic root lift and airy body'],
  ['Sleek liquid-glass compressed volume', 'sleek liquid-glass compressed volume sculpted close to the head'],
  ['Tousled beach salt-spray texture', 'lived-in beach salt-spray texture with piecey strand definition'],
  ['Windblown runway motion volume', 'dynamic windblown runway volume with natural flyaway movement']
]));

addOptions(hairFinish, makeOpts([
  ['Glass-hair laminated shine', 'ultra-reflective glass-hair laminated shine with zero synthetic glossiness'],
  ['Sculpted gel baby hairs at temples', 'delicate gel-sculpted baby hairs artfully swirled along the temples and forehead'],
  ['Matte lived-in editorial texture', 'a matte lived-in editorial texture with touchable strand separation'],
  ['High-humidity subtle texture', 'subtle high-humidity texture with fine natural wisps around the hairline']
]));
const hairAccessories=makeOpts([['No added hair accessories','no added hair accessories'],['Minimal metallic clip','one minimal metallic hair clip'],['Pearl barrette','a small pearl barrette placed naturally'],['Black ribbon accent','a restrained black ribbon accent'],['Slim velvet headband','a slim velvet headband that does not hide the cut'],['Subtle gold hair pin','a subtle gold hair pin'],['Decorative claw clip','a modern claw clip for a deliberately relaxed updo'],['Small crystal pin','a small crystal pin with understated sparkle'],['Satin bow accent','a small satin bow accent'],['Fine braid detail','a fine braid detail integrated into the hairstyle'],['Statement barrette on one side','a statement barrette on one side'],['Keep reference hair accessories','retain hair accessories that are clearly visible in the reference']]);
const neckline=makeOpts([['Deep plunging V-neckline','a dramatic plunging deep V-neckline with sharp clean architectural lines'],['Sculpted architectural V-wire notch','a structured V-wire notch neckline providing dramatic shape and support'],['Keyhole front cutout neckline','a sleek keyhole cutout neckline revealing the upper sternum'],['Geometric slash cutout neckline','an asymmetric slash cutout neckline across the collarbone and decolletage'],['Halter deep-V with open back','a halter neckline plunging into a deep V with an open back'],['Asymmetric neckline','an asymmetric neckline'],['One-shoulder neckline','a one-shoulder neckline'],['Off-shoulder neckline','an off-shoulder neckline'],['Square neckline','a square neckline'],['Structured sweetheart neckline','a structured sweetheart neckline'],['High sculptural neckline','a high sculptural neckline'],['Clean crew neckline','a clean crew neckline'],['Soft cowl neckline','a soft cowl neckline'],['Boat neckline','a boat neckline'],['Halter neckline','a halter neckline'],['V neckline, tasteful depth','a tasteful V neckline'],['Folded draped neckline','a folded draped neckline'],['Collared button-up neckline','a crisp collared button-up neckline'],['Wide bateau neckline','a wide bateau neckline'],['Wrap neckline','a wrap neckline'],['Mock-neck silhouette','a modern mock-neck silhouette'],['Strapless structured neckline','a structured strapless neckline'],['Notched blazer lapel','a sharp notched blazer lapel'],['Sharp peak lapel','a sharp peak lapel'],['Soft tie-neck detail','a softly tied neckline detail']]);
const sleeves=makeOpts([['Sleeveless clean armhole','a sleeveless silhouette with a clean armhole'],['Cap sleeves','short cap sleeves'],['Fitted long sleeves','fitted long sleeves'],['Three-quarter sleeves','three-quarter-length sleeves'],['One long sleeve, one bare shoulder','one long sleeve paired with one bare shoulder'],['Off-shoulder sleeves','off-shoulder sleeves'],['Sculptural puff sleeves','sculptural puff sleeves'],['Cape sleeves','flowing cape sleeves'],['Structured shoulder line','a structured shoulder line'],['Rolled blazer sleeves','rolled blazer sleeves with natural folds'],['Sheer overlay sleeves','subtle sheer overlay sleeves'],['Bell sleeves','bell sleeves with controlled volume'],['Asymmetric sleeve design','an asymmetric sleeve design'],['Wide cuffs','wide cuffs with visible tailoring'],['Strap detail','clean shoulder straps with restrained detail'],['Sleeveless with broad shoulders','a sleeveless cut with broad, structured shoulders']]);
const fabric=makeOpts([['Matte crepe','matte crepe with fine, realistic texture'],['Liquid satin','liquid satin with controlled natural highlights'],['Structured suiting','structured suiting fabric with visible tailoring'],['Velvet pile','velvet with realistic pile and soft light absorption'],['Silk twill','silk twill with a refined soft sheen'],['Textured jacquard','textured jacquard with subtle woven detail'],['Soft ribbed knit','soft ribbed knit with natural stretch and folds'],['Heavy ponte knit','heavy ponte knit with a clean, structured drape'],['Fine georgette layers','fine georgette layers with believable movement'],['Linen blend','a linen blend with natural creasing'],['Soft chiffon overlay','a soft chiffon overlay with realistic transparency'],['Matte leather-look texture','a matte leather-look texture without plastic shine'],['Denim twill','denim twill with believable seams and weight'],['Sequin embellishment','tasteful sequin embellishment with realistic reflections'],['Metallic woven fabric','metallic woven fabric with restrained highlights'],['Crepe-backed satin','crepe-backed satin with polished draping'],['Brushed cotton poplin','brushed cotton poplin with natural folds'],['Fine wool tailoring','fine wool tailoring with rich but understated texture'],['Satin piping accents','subtle satin piping accents'],['Soft tulle accent layer','a restrained tulle accent layer'],['Embroidered silk','embroidered silk with carefully rendered stitch detail'],['Velour texture','velour texture with soft directional highlights'],['Structured organza accents','structured organza accents with believable stiffness'],['Textured knit ribbing','textured knit ribbing with natural stretch marks']]);
const palette=makeOpts([['Black and silver','a black-and-silver palette'],['Red and black','a red-and-black palette'],['Oxblood and champagne','an oxblood-and-champagne palette'],['Ivory and gold','an ivory-and-gold palette'],['Emerald and black','an emerald-and-black palette'],['Cobalt and charcoal','a cobalt-and-charcoal palette'],['Plum and rose gold','a plum-and-rose-gold palette'],['Chocolate and cream','a chocolate-and-cream palette'],['Monochrome white','a monochrome-white palette'],['All-black tonal layers','all-black tonal layers'],['Burgundy monochrome','a burgundy monochrome palette'],['Ruby and warm gold','a ruby-red and warm-gold palette'],['Navy and ivory','a navy-and-ivory palette'],['Forest green and brass','a forest-green and brass palette'],['Teal and black','a teal-and-black palette'],['Charcoal and pewter','a charcoal-and-pewter palette'],['Rose and cocoa','a rose-and-cocoa palette'],['Burnt orange and espresso','a burnt-orange and espresso palette'],['Silver and midnight blue','a silver-and-midnight-blue palette'],['Lavender and charcoal','a lavender-and-charcoal palette'],['Pearl and deep plum','a pearl-and-deep-plum palette'],['Copper and black','a copper-and-black palette'],['Fuchsia and burgundy','a fuchsia-and-burgundy palette'],['Warm neutrals','warm neutral tones with a bold silhouette'],['Jewel-tone mix','a coordinated jewel-tone palette'],['Red statement accent','a restrained red statement accent against neutrals']]);
const footwear=makeOpts([['Pointed-toe pumps','pointed-toe pumps'],['Strappy evening heels','strappy evening heels'],['Sculptural block heels','sculptural block heels'],['Ankle boots','sleek ankle boots'],['Knee-high boots','knee-high fashion boots'],['Loafers with tailoring','polished loafers with tailored clothing'],['Minimal heeled sandals','minimal heeled sandals'],['Metallic heels','metallic statement heels'],['Classic black pumps','classic black pumps'],['Modern ballet flats','modern ballet flats'],['Clean white sneakers','clean white sneakers for a street-style look'],['Chunky fashion boots','chunky fashion boots'],['Satin evening sandals','satin evening sandals'],['Traditional juttis','traditional juttis styled to match the outfit'],['Minimal pointed flats','minimal pointed flats'],['Platform sandals','platform sandals with balanced proportions'],['Ankle-strap heels','ankle-strap heels'],['No footwear emphasis','keep footwear outside the frame or visually understated']]);
const layering=makeOpts([['No extra layer','no extra layer; let the main outfit read clearly'],['Oversized blazer layer','an oversized blazer layer with realistic sleeve folds'],['Cropped structured jacket','a cropped structured jacket as a sharp outer layer'],['Longline waistcoat','a longline waistcoat layered over the main outfit'],['Light trench worn open','a light trench worn open with natural movement'],['Tailored coat draped over shoulders','a tailored coat draped naturally over the shoulders'],['Soft shawl accent','a soft shawl accent with believable draping'],['Satin evening jacket','a satin evening jacket with controlled highlights'],['Leather-look jacket layer','a leather-look jacket layered without excessive shine'],['Sheer outer layer','a restrained sheer outer layer with realistic transparency'],['Statement scarf layer','a statement scarf as a fashion accent'],['Structured cape layer','a structured cape layer with a clean silhouette'],['Unbuttoned shirt layer','an unbuttoned shirt layer over a simple base'],['Short evening bolero','a short evening bolero with tailored edges'],['No competing layers','avoid competing layers; keep the outfit silhouette uncluttered']]);
const nailStyle=makeOpts([['Short natural manicure','short natural nails with a clean finish'],['Deep red manicure','a deep red manicure'],['Glossy black manicure','a glossy black manicure'],['Classic French manicure','a classic French manicure'],['Neutral taupe manicure','a neutral taupe manicure'],['Burgundy manicure','a burgundy manicure'],['Metallic chrome accent','a restrained metallic chrome nail accent'],['Deep plum manicure','a deep plum manicure'],['Soft rose manicure','a soft rose manicure'],['Short dark espresso nails','short dark espresso nails'],['Minimal nail art','minimal nail art with fine detail'],['Muted olive nails','muted olive nails'],['Pearl shimmer manicure','a subtle pearl-shimmer manicure'],['Natural nails, no emphasis','natural nails with no special emphasis'],['Coordinated jewel-tone manicure','a coordinated jewel-tone manicure'],['Classic nude glossy manicure','a classic nude glossy manicure']]);
const lipLook=makeOpts([['Natural rose lip','a natural rose lip'],['Classic red lip','a classic red lip'],['Berry satin lip','a berry satin lip'],['Deep wine lip','a deep wine lip'],['Warm nude lip','a warm nude lip'],['Rosewood lip','a rosewood lip'],['Soft terracotta lip','a soft terracotta lip'],['Muted mauve lip','a muted mauve lip'],['Glossy neutral lip','a glossy neutral lip with restrained shine'],['Soft brick-red lip','a soft brick-red lip'],['Brown-rose lip','a brown-rose lip'],['Velvet matte berry lip','a velvet-matte berry lip'],['Bare lip with balm','a bare lip with a natural balm finish'],['Classic pink-red lip','a classic pink-red lip'],['Cocoa nude lip','a cocoa-nude lip'],['Plum stain','a plum lip stain'],['Soft coral lip','a soft coral lip'],['Neutral lip with crisp liner','a neutral lip with carefully blended liner']]);
const eyeLook=makeOpts([['Soft brown wing','a soft brown winged eyeliner'],['Black cat-eye liner','a precise black cat-eye liner'],['Smudged charcoal lash line','a smudged charcoal lash line'],['Bronze lid wash','a bronze wash across the eyelids'],['Taupe smoky eyes','taupe smoky eyes with soft edges'],['Defined lashes, minimal shadow','defined lashes with minimal eyeshadow'],['Soft shimmer inner corners','soft shimmer at the inner corners'],['Muted plum shadow','muted plum eyeshadow'],['Warm copper shadow','warm copper eyeshadow'],['Classic liner and neutral lid','classic liner with a neutral lid'],['Graphic but refined liner','graphic yet refined eyeliner'],['Soft black smoky eye','a softly blended black smoky eye'],['Olive-brown shadow','olive-brown eyeshadow'],['Subtle metallic bronze','a subtle metallic bronze eye accent'],['Clean bare-eye editorial','a clean, nearly bare-eye editorial look'],['Diffused wing and soft lower lash','a diffused wing with a softly defined lower lash line'],['Deep espresso liner','deep espresso eyeliner'],['Muted rose eye makeup','muted rose eye makeup']]);
const stance=makeOpts([['Relaxed offset stance','a relaxed offset stance with one shoulder slightly forward'],['Balanced planted stance','a balanced, planted stance with natural alignment'],['Asymmetric shoulder line','an asymmetric shoulder line that feels effortless'],['One knee softly bent','one knee softly bent without exaggerating posture'],['Weight shifted naturally','weight shifted naturally onto one leg'],['Long relaxed posture','a long, relaxed posture with shoulders down'],['Compact seated posture','a compact seated posture with relaxed hands'],['Open confident posture','an open, confident posture without forced arching'],['Casual lean','a casual lean with natural weight support'],['In-motion stance','a natural in-motion stance caught between steps'],['Shoulders angled to camera','shoulders angled slightly toward the camera'],['Torso turned, face to lens','torso turned slightly while the face returns to the lens'],['Soft diagonal posture','a soft diagonal posture for editorial energy'],['Arms close to body','arms held naturally close to the body'],['Relaxed arms with space','relaxed arms with a little natural space from the body']]);
const gaze=makeOpts([['Direct lens contact','direct eye contact with the lens'],['Just beside the lens','looking just beside the lens'],['Over photographer shoulder','looking over the photographer’s shoulder'],['Off-frame to camera left','looking off-frame to camera left'],['Off-frame to camera right','looking off-frame to camera right'],['Down toward hands','looking down briefly toward her hands'],['Up toward soft light','looking slightly upward toward the soft light'],['Side glance mid-turn','a side glance captured mid-turn'],['Looking toward a person off-frame','looking toward someone just outside the frame'],['Eyes following movement','eyes following movement outside the frame'],['Looking at hairstyle in hand','glancing at the new hairstyle as she lightly touches it'],['Looking past camera with confidence','looking past the camera with quiet confidence'],['Closed-eye laugh moment','eyes softly closed in a genuine laugh'],['Downward reflective glance','a reflective downward glance'],['Direct gaze with head turned','direct lens contact while her head remains turned three-quarter'],
['Turned away into background (face hidden)','head turned away into the background with face completely hidden from camera view']]);
const motion=makeOpts([['Almost-still candid','an almost-still candid moment with subtle natural movement'],['Hair moving from a turn','hair moving naturally from a recent turn'],['Caught mid-step','a clear but natural mid-step moment'],['Jacket moving slightly','a jacket moving slightly with her body movement'],['Hand gesture frozen in motion','a hand gesture frozen at a natural point in motion'],['Fabric moving at the hem','the fabric moving gently at the hem'],['Loose strands in motion','a few loose strands moving independently'],['Turning into the light','turning naturally into a patch of light'],['Settling after a laugh','settling after a laugh with shoulders dropping naturally'],['Reaching for a styling prop','reaching for a styling prop between takes'],['Tiny hair adjustment','a tiny hair adjustment captured in motion'],['Movement-free polished frame','a nearly still frame that emphasizes the finished look'],['Walking with natural stride','walking with a natural stride and believable limb positions'],['Mid-turn fabric sweep','a small fabric sweep captured during a turn'],['Candid hand movement','a candid hand movement rather than a posed gesture'],['Soft wind movement','subtle environmental movement in hair and fabric']]);
const interaction=makeOpts([['Photographer gives a cue','responding to a photographer’s cue between shots'],['Quick hair adjustment between takes', 'a quick natural hair adjustment between takes before settling into pose'],['Friend says something amusing','reacting to something amusing said just outside the frame'],['Checking the finished look','taking a quick moment to appreciate the finished makeover'],['Between takes conversation','a brief conversation between takes'],['Adjusting a clothing detail herself','adjusting a small clothing detail herself before the next frame'],['Hearing her name','turning as someone calls her name'],['Receiving a final styling check','receiving a final styling check just before the shoot'],['Taking a relaxed pause','taking a comfortable pause between more directed poses'],['Showing the haircut to the photographer','briefly showing the haircut to the photographer'],['Moving toward the setup mark','moving toward her position on the set'],['Laughing at an outtake','laughing at a moment from the previous take']]);
const setProps=makeOpts([['No extra props','no extra props; keep focus on her makeover and styling'],['Architectural floor lamp softly blurred in background','an architectural floor lamp softly blurred in the background'],['Styling tools on a counter','a few styling tools placed naturally on a counter, not distracting'],['Clothing rail in background','a clothing rail in soft focus'],['Minimal stool','a simple stool used naturally in the composition'],['Tall director chair','a tall director chair used as a subtle studio prop'],['Structured handbag','a structured handbag used as a styling prop'],['Sunglasses in hand','sunglasses held naturally in one hand'],['Small makeup pouch','a small makeup pouch placed on a nearby counter'],['Unbranded coffee cup','an unbranded coffee cup as a casual backstage prop'],['Soft curtain movement','a soft curtain in the background with slight movement'],['Low side table','a low side table with restrained surface details'],['Minimalist pedestal with sculptural ceramic piece','a clean gallery pedestal with a minimalist ceramic sculpture in soft focus'],['Coat draped over chair','a coat draped casually over a chair'],['Neutral flower arrangement','a small neutral flower arrangement in the distant background'],['Simple modern lamp','a simple modern lamp with realistic warm light'],['Editorial plinth','a minimal editorial plinth used as a studio prop'],['Camera bag out of focus','a photographer’s camera bag out of focus near the edge of frame'],['Magazine stack with unreadable covers','a small stack of magazines with no readable text'],['A hairbrush on counter','a hairbrush resting naturally on a counter'],['No mirrors in set','no visible mirrors or reflection-heavy set pieces'],['Subtle architectural column','a subtle architectural column in the background'],['Neutral bench','a neutral bench used as a natural resting point'],['No text or branded props','no readable text or branded props']]);
const timeOfDay=makeOpts([['Mid-morning daylight','mid-morning daylight with neutral color temperature'],['Bright noon studio light','bright noon daylight balanced naturally'],['Late afternoon glow','late-afternoon glow with restrained warmth'],['Golden hour','golden-hour light with natural skin-tone fidelity'],['Blue hour city mood','blue-hour city ambience with realistic cool background tones'],['Early evening interior','early-evening interior light with practical lamps'],['Nighttime studio session','a nighttime studio session with controlled lighting'],['Overcast afternoon','overcast afternoon daylight with soft shadows'],['Morning studio buzz with soft dawn daylight','morning studio atmosphere with fresh dawn daylight'],['Quiet late-night editorial set','a quiet late-night editorial set with moody but realistic illumination']]);
const weather=makeOpts([['No weather emphasis','no visible weather effects; keep the scene neutral'],['Soft overcast outdoors','soft overcast outdoor conditions'],['Light breeze','a light breeze creating subtle hair and fabric movement'],['After-rain city ambience','subtle after-rain city ambience with no dramatic wetness'],['Clear dry evening','a clear, dry evening environment'],['Warm summer air','warm summer air with natural outdoor light'],['Cool crisp air','cool crisp air with restrained environmental cues'],['Light mist in distance','a very light distant mist that does not obscure the subject'],['Cloud-filtered sunlight','cloud-filtered sunlight with natural contrast'],['Sheltered indoor setting','a sheltered indoor setting unaffected by weather']]);
const depth=makeOpts([['Softly separated background','a softly separated background while keeping the scene readable'],['Room details remain visible','room details remain visible without competing with the subject'],['Strong background bokeh','strong background bokeh with natural optical falloff'],['Deep focus editorial','deeper focus so clothing and environment details remain clear'],['Moderate shallow depth','moderately shallow depth of field with face and hair sharply focused'],['Subtle foreground layer','a subtle foreground layer that adds depth without blocking the subject'],['Clean uncluttered background','a clean uncluttered background with gentle tonal depth'],['Layered architectural depth','layered architectural depth with realistic distance cues'],['Soft background movement','very subtle background movement while the subject remains clear'],['Crisp edge separation','clear subject separation without artificial cutout halos']]);
const focusDetail=makeOpts([['Eyes tack sharp','critical focus on the eyes with realistic skin detail'],['Face and haircut equally sharp','face and haircut equally sharp, including the outer hair silhouette'],['Haircut silhouette prioritized','the haircut silhouette prioritized while keeping facial detail clear'],['Outfit construction in focus','outfit construction and fabric detail clearly in focus'],['Face sharp, hands natural','the face sharply focused while hands remain naturally detailed'],['Full subject in balanced focus','balanced focus across the visible subject'],['Eye focus with soft falloff','precise eye focus with a gentle optical falloff'],['No artificial sharpening halos','fine detail without artificial sharpening halos'],['Natural motion in ends only','a hint of motion in hair ends while face remains sharp'],['Photographic, not hyper-sharpened','photographic detail without hyper-sharpening'],['Shallow depth of field','shallow depth of field with the face and hairstyle sharp against a softly blurred background'],['Moderate depth of field','moderate depth of field with the outfit and scene details readable alongside the face']]);
const filmFeel=makeOpts([['Clean contemporary digital','clean contemporary digital photography'],['Subtle 35mm grain','subtle 35mm film grain'],['Fine analog texture','fine analog texture with natural tonal roll-off'],['Soft halation restrained','very restrained highlight halation'],['Classic magazine print','classic magazine-print tonal response'],['Natural smartphone computational look','natural smartphone computational photography without plastic smoothing'],['DSLR optical falloff','DSLR-style optical falloff and realistic depth'],['Crisp documentary texture','crisp documentary texture with natural imperfections'],['Warm negative film look','a subtle warm negative-film look'],['Neutral color science','neutral color science with accurate skin tone'],['Fine-grain monochrome option','a fine-grain monochrome photographic character'],['Soft highlight roll-off','soft highlight roll-off with protected detail']]);
const shotEnergy=makeOpts([['Effortlessly bold','effortlessly bold rather than theatrically posed'],['Playful rock-chic','playful rock-chic energy with natural attitude'],['Quietly commanding','quietly commanding editorial energy'],['Spontaneous and cheeky','spontaneous, cheeky and self-assured'],['High-fashion composed','high-fashion composure with an unforced stance'],['Confident celebratory','confident, celebratory energy after the makeover'],['Cool and relaxed','cool and relaxed with understated edge'],['Elegant and daring','elegant and daring without exaggerated gestures'],['Cinematic and moody','cinematic, moody energy with a natural expression'],['Raw backstage energy','raw backstage energy as the camera catches an unscripted moment'],['Magazine-cover confidence','magazine-cover confidence while preserving candid authenticity'],['Warm and charismatic','warm, charismatic energy with genuine personality']]);
const extraFields={
fringe:{label:'Fringe / bangs detail',section:'look',opts:fringeDetail,def:0},parting:{label:'Hair parting',section:'look',opts:parting,def:4},hairVolume:{label:'Hair volume / silhouette',section:'look',opts:hairVolume,def:2},hairAccessories:{label:'Hair accessories',section:'look',opts:hairAccessories,def:0},
neckline:{label:'Neckline / collar',section:'wardrobe',opts:neckline,def:0},sleeves:{label:'Sleeves / shoulder line',section:'wardrobe',opts:sleeves,def:0},fabric:{label:'Fabric texture',section:'wardrobe',opts:fabric,def:0},palette:{label:'Wardrobe color palette',section:'wardrobe',opts:palette,def:0},footwear:{label:'Footwear styling',section:'wardrobe',opts:footwear,def:17},layering:{label:'Outer layers',section:'wardrobe',opts:layering,def:0},nailStyle:{label:'Manicure / nails',section:'wardrobe',opts:nailStyle,def:13},lipLook:{label:'Lip color / finish',section:'wardrobe',opts:lipLook,def:0},eyeLook:{label:'Eye makeup detail',section:'wardrobe',opts:eyeLook,def:0},
stance:{label:'Posture / stance',section:'pose',opts:stance,def:0},gaze:{label:'Eye-line / gaze target',section:'pose',opts:gaze,def:0},motion:{label:'Movement / timing',section:'pose',opts:motion,def:0},interaction:{label:'Candid interaction',section:'pose',opts:interaction,def:0},shotEnergy:{label:'Editorial energy',section:'pose',opts:shotEnergy,def:0},
focusDetail:{label:'Focus priority',section:'camera',opts:focusDetail,def:1},filmFeel:{label:'Camera / film character',section:'camera',opts:filmFeel,def:0},
setProps:{label:'Props / set dressing',section:'scene',opts:setProps,def:0},timeOfDay:{label:'Time of day',section:'scene',opts:timeOfDay,def:0},weather:{label:'Outdoor atmosphere',section:'scene',opts:weather,def:0},depth:{label:'Background depth',section:'scene',opts:depth,def:0}
};

const ponyTailFallOpts = [
  O('Auto · natural fall', ''),
  O('Falling straight down the back', 'falling straight down the back along the spine'),
  O('Draped forward over left shoulder (front)', 'draped forward over the left shoulder, falling in front across the chest'),
  O('Draped forward over right shoulder (front)', 'draped forward over the right shoulder, falling in front across the chest'),
  O('Split over both shoulders to the front', 'split into two sections draped forward over both shoulders onto the chest'),
  O('Swept over one shoulder to the front', 'swept forward over one shoulder to rest on the front'),
  O('Falling behind one shoulder', 'resting behind one shoulder, leaving the neck and collarbone exposed'),
  O('Floating in motion behind her', 'caught in dynamic mid-air motion floating behind her from a quick turn'),
  O('Resting flush against neck hollow', 'resting flush and flat against the hollow of the neck'),
  O('High arching cascade down the back', 'arching outward from the crown before cascading down the center of the back')
];

const ponyTailEndOpts = [
  O('Auto · natural length for cut', ''),
  O('Ending around nape to upper shoulders', 'ending around the nape to upper shoulders with soft movement'),
  O('Ending at nape of neck just above shoulders', 'ending at the nape of the neck just above the shoulders'),
  O('Ending around the neck (short & sleek)', 'ending around the middle of the neck with a clean cropped tail'),
  O('Ending at base of neck / nape', 'ending right at the base of the neck / nape'),
  O('Ending at upper nape (ultra-cropped)', 'ultra-cropped micro-tail ending at the upper nape above the collar'),
  O('Ending at collarbone', 'ending neatly at the collarbone level'),
  O('Ending at shoulder blades / mid-back', 'falling to the shoulder blades / mid-back'),
  O('Ending at waist / lower back (dramatic)', 'cascading long down to the waist and lower back'),
  O('Cropped micro-tail (jawline focus)', 'a cropped micro-tail barely grazing jawline level')
];

const ponyBaseHeightOpts = [
  O('Auto · standard height', ''),
  O('Snatched ultra-high crown apex', 'snatched ultra-high crown placement with smooth upward tension'),
  O('High crown with slight tilt', 'high crown anchor with a subtle playful tilt'),
  O('Mid-occipital height', 'mid-height placement at the back curve of the skull'),
  O('Low sleek nape anchor', 'low sleek anchor snug at the nape of the neck'),
  O('Asymmetric high side pony', 'anchored high and to the side for an editorial look')
];

const ponyBaseWrapOpts = [
  O('Auto · clean finish', ''),
  O('Hair strand wrapped around elastic', 'with a smooth strand of hair wrapped around the base to conceal the elastic'),
  O('Sleek metallic cuff (gold/silver)', 'with a polished metallic cuff encircling the base of the ponytail'),
  O('Minimal black silk ribbon wrap', 'with a narrow black silk ribbon tied cleanly around the base'),
  O('Architectural cord wrap (2-3 inches)', 'with black or metallic cord wrapped two inches down the tail'),
  O('Invisible clear band (no wrap)', 'with an invisible seamless band and zero added hardware')
];

const sideSweepSideOpts = [
  O('Auto · natural side sweep', ''),
  O('Swept completely over left shoulder', 'with all hair swept completely over the left shoulder, leaving the right neck and collarbone elegantly exposed'),
  O('Swept completely over right shoulder', 'with all hair swept completely over the right shoulder, leaving the left neck and collarbone elegantly exposed'),
  O('Tossed forward over left shoulder in motion', 'casually tossed forward over the left shoulder with natural movement as she turns'),
  O('Tossed forward over right shoulder in motion', 'casually tossed forward over the right shoulder with natural movement as she turns'),
  O('Draped over one shoulder with back pieces', 'with the main body of hair draped forward over one shoulder while a few soft pieces trail behind')
];

const sideSweepFlipOpts = [
  O('Auto · natural crown line', ''),
  O('Dramatic voluminous hair flip at roots', 'with a dramatic, voluminous hair flip at the roots providing high-fashion lift and body'),
  O('Soft natural hair flip with airy volume', 'with a soft natural hair flip and airy lift along the deep part'),
  O('Smooth sleek transition (no flip, flat-ironed)', 'with a smooth sleek transition across the crown with zero flip, lying sleek and close to the scalp'),
  O('Tousled textured flip with loose flyaways', 'with a piecey, tousled flip featuring effortless texture and natural flyaways')
];

const sideSweepEndOpts = [
  O('Auto · natural length for cut', ''),
  O('Ending at collarbone / upper chest', 'with the cascading lengths ending cleanly at the collarbone and upper chest'),
  O('Ending at mid-chest / breast level', 'with the side-swept lengths cascading down across mid-chest level'),
  O('Ending at ribs / waist level (dramatic long)', 'with the hair flowing dramatically long down to ribcage and waist level'),
  O('Grazing shoulder tops (medium lob length)', 'with the ends softly grazing the shoulder tops in a relaxed lob silhouette')
];

const sideSweepFinishOpts = [
  O('Auto · match global hair finish', ''),
  O('Dry, soft & touchable with airy volume', 'dry, soft and touchable with airy blowout bounce and natural strand separation'),
  O('High-gloss wet-look saturated clumps', 'high-gloss wet-lacquered texture with saturated clumped strands and liquid reflections'),
  O('Damp post-swim salty beach texture', 'damp post-swim texture with soft piecey clumping and subtle beach wave separation'),
  O('Glossy glass-shine editorial finish', 'sleek mirror glass shine with razor-clean strand definition')
];

const ponyTailStyleOpts = [
  O('Auto · smooth straight', ''),
  O('Short wavy tail with softly tousled ends', 'a short wavy tail with softly tousled ends'),
  O('Pin-straight razor-sharp glass tail', 'pin-straight razor-cut tail with mirror glass shine'),
  O('Playful 90s outward flick', 'with a soft 90s outward flick at the ends'),
  O('Inward curved neck sweep', 'with an inward-curving blowout bend that hugs the neck curve'),
  O('Wet-look saturated strand clumps', 'wet-lacquered clumps with aquatic shine and droplet cling'),
  O('Defined glossy Hollywood waves', 'defined glossy Hollywood waves running through the tail'),
  O('Tight polished 3-strand braid', 'woven into a tight, glossy three-strand plait'),
  O('Compact structured bubble segments', 'styled into compact structured bubble sections'),
  O('Textured piecey lived-in tail', 'piecey, separated texture through the tail with soft movement')
];


const POSE_FAMILIES = [
  O('✦ All Poses (108 options)', 'all'),
  O('🧍‍♀️ Standing & Power Stances (31 variations)', 'standing'),
  O('💆‍♀️ Hair-Touch & Beauty Gestures (22 variations)', 'beauty'),
  O('🚶‍♀️ Motion, Walking & Turns (18 variations)', 'motion'),
  O('🧱 Leaning & Architectural (12 variations)', 'leaning'),
  O('💫 Candid & In-Between Takes (9 variations)', 'candid'),
  O('🪑 Seated & Floor Lounging (9 variations)', 'seated'),
  O('💧 Wet-Look & Aquatic Action (7 variations)', 'wet')
];

const SHOT_FAMILIES = [
  O('✦ All Framings (10 options)', 'all'),
  O('💄 Close-Up & Beauty Portraits (4 variations)', 'close'),
  O('👗 Medium & Half-Length (3 variations)', 'medium'),
  O('💃 Full-Length & Environmental (3 variations)', 'full')
];

const SCENE_FAMILIES = [
  O('✦ All Locations (159 options)', 'all'),
  O('📸 Studio Backdrops & Cycs (29 variations)', 'studio'),
  O('🌆 Urban Streets & Rooftops (24 variations)', 'urban'),
  O('🛋️ Luxury Interiors & Suites (18 variations)', 'luxury'),
  O('🏢 Modernist Architecture & Museums (13 variations)', 'architecture'),
  O('🌿 Exotic Nature, Botanical & Dunes (8 variations)', 'nature'),
  O('✨ Runways, Catwalks & Backstages (7 variations)', 'runway'),
  O('🍸 Luxury Nightlife & Speakeasies (7 variations)', 'nightlife'),
  O('✂️ Salons & Makeover Backstages (7 variations)', 'salon'),
  O('🏛️ Palaces, Heritage Havelis & Estates (6 variations)', 'heritage'),
  O('🌊 Aquatic Pools & Coastal (5 variations)', 'aquatic')
];

const LIGHTING_FAMILIES = [
  O('✦ All Lighting (62 options)', 'all'),
  O('💡 Studio Key & Beauty Dish (25 variations)', 'studio'),
  O('☀️ Natural Window & Daylight (11 variations)', 'daylight'),
  O('🌅 Golden Hour & Warm Tungsten (9 variations)', 'warm'),
  O('⚡ Direct Flash & Hard Sunlight (7 variations)', 'flash'),
  O('🎬 Cinematic, Low-Key & Cool (6 variations)', 'moody'),
  O('💧 Aquatic Caustics & Water Rim (4 variations)', 'aquatic')
];

function getItemCategory(id, item) {
  if (!item) return 'all';
  const text = ((item.label || '') + ' ' + (item.text || '')).toLowerCase();
  if (id === 'salonVenue') {
    if (/barber\s*shop|gent\S*\s*saloon|shaving/i.test(text)) return 'barbershop';
    if (/parlour|parlor/i.test(text)) return 'parlour';
    if (/studio|atelier|loft/i.test(text)) return 'studio';
    if (/salon|suite/i.test(text)) return 'salon';
    return 'barbershop';
  } else if (id === 'hair' || id === 'salonHaircut') {
    if (/pony|ponytail/i.test(text)) return 'pony';
    if (/bob|lob|tassel|clip/i.test(text)) return 'bob';
    if (/shag|wolf|mullet|mixie|octopus/i.test(text)) return 'shag';
    if (/pixie|crop|bixie|buzz/i.test(text)) return 'pixie';
    if (/curl|curls|curly|coily|afro|ringlet/i.test(text)) return 'curl';
    if (/braid|braided|crown braid|twist|chignon|updo|bun/i.test(text)) return 'braid';
    if (/wet|hydro|drenched|slicked|ocean-soaked|post-swim|finger wave/i.test(text)) return 'wet';
    if (/butterfly|hush|feather|rachel|layer|blowout|flip/i.test(text)) return 'layer';
    if (/wave|waves|mermaid|straight|glass hair/i.test(text)) return 'wave';
    return 'layer';
  } else if (id === 'outfit') {
    if (/monokini|swimsuit|bikini|swimwear|neoprene|bathing|sarong/i.test(text)) return 'swim';
    if (/saree|sari|nauvari|dhoti|fusion|kurti/i.test(text)) return 'saree';
    if (/jumpsuit|bodysuit|catsuit|romper|one-piece/i.test(text)) return 'jumpsuit';
    if (/leather|vinyl|latex|trench|moto|leatherette/i.test(text)) return 'leather';
    if (/\bshirt\b|corset|blouse|breastplate|jeans|skirt|denim|\btop\b|knit top/i.test(text)) return 'separates';
    if (/\bsuit|blazer|waistcoat|tuxedo|power suit|trousers/i.test(text)) return 'suit';
    if (/cocktail|mini dress|wrap dress|knit dress|bandage|midi dress/i.test(text)) return 'cocktail';
    if (/gown|slip gown|evening dress|column dress|illusion gown|origami|cowl gown|slip dress/i.test(text)) return 'gown';
    return 'gown';
  } else if (id === 'pose') {
    if (/pool|water|emerging|aquatic|drenched|shower|swim|ocean|wave|splash|sun-drench/i.test(text)) return 'wet';
    if (/hair|earring|cuff|collar|chin|touching|jewelry|tuck|bracelet|lapel|sleeve/i.test(text)) return 'beauty';
    if (/lean|leaning|wall|counter|railing|doorway|table|platform/i.test(text)) return 'leaning';
    if (/seated|sitting|chair|stool|floor|couch|cross-legged|ankles crossed/i.test(text)) return 'seated';
    if (/walk|walking|turn|turning|mid-step|pivot|stride|swinging|stepping|glance|profile|head turn/i.test(text)) return 'motion';
    if (/candid|laugh|laughing|breath|reset|conversation|between|looking away|unscripted|reaction|cue/i.test(text)) return 'candid';
    return 'standing';
  } else if (id === 'framing') {
    if (/close-up|head-and-shoulders|detail crop|tight side-profile/i.test(text)) return 'close';
    if (/waist-up|candid medium|three-quarter/i.test(text)) return 'medium';
    return 'full';
  } else if (id === 'background') {
    if (/nightclub|lounge|speakeasy|cocktail|sky lounge|neon|jazz|members club/i.test(text)) return 'nightlife';
    if (/haveli|palace|chateau|villa|estate|heritage|monastery|jharokha|chettinad/i.test(text)) return 'heritage';
    if (/runway|catwalk|backstage|fashion week|photo pit|fitting atelier|model lineup/i.test(text)) return 'runway';
    if (/dune|desert|greenhouse|conservatory|botanical|glade|forest|cove|volcanic|grove|sand|garden|terrace|park|meadow|courtyard|floral|orchard/i.test(text)) return 'nature';
    if (/museum|atrium|spiral|staircase|brutalist|concrete|gallery|sculpture|loft|pavilion|plaza|travertine/i.test(text)) return 'architecture';
    if (/pool|water|ocean|cliffside|beach|aqua|terrace pool|shower|lagoon/i.test(text)) return 'aquatic';
    if (/salon|styling station|dressing room|waiting area|hairdresser|barber/i.test(text)) return 'salon';
    if (/studio|backdrop|cyclorama|paper|seamless|grey studio|white studio|taupe studio|burgundy backdrop/i.test(text)) return 'studio';
    if (/hotel|suite|apartment|living room|bedroom|interior|corridor|penthouse/i.test(text)) return 'luxury';
    return 'urban';
  } else if (id === 'maleInteraction') {
    return item.cat || 'all';
  } else if (id === 'lighting') {
    if (/pool|water|caustic|specular|aquatic|dusk backlighting|ocean/i.test(text)) return 'aquatic';
    if (/\b(?:on-camera flash|studio flash|strobe|speedlight|hard flash|direct flash|flash photography)\b/i.test(text)) return 'flash';
    if (/\b(?:window|daylight|salon daylight|ambient daylight|sunlight|sunlit|sun patch|overcast|morning light|afternoon light)\b/i.test(text)) return 'daylight';
    if (/\b(?:golden|warm|tungsten|sunset|dusk|candlelight|amber)\b/i.test(text)) return 'warm';
    if (/\b(?:moody|low-key|low-contrast|cool editorial|cinematic side|practical)\b/i.test(text)) return 'moody';
    if (/\b(?:flash|strobe|hard shadow)\b/i.test(text)) return 'flash';
    if (/ambient|day/i.test(text)) return 'daylight';
    return 'studio';
  }
  return 'all';
}


// ==========================================
// SALON & BARBERSHOP STUDIO DATASETS
// ==========================================
const SALON_VENUE_CATEGORIES = [
  O('✦ All Establishments (52 choices)', 'all'),
  O('💈 Barber Shop (Traditional, street & modern barbershops)', 'barbershop'),
  O('✂️ Salon (Commercial, unisex, mall & luxury salons)', 'salon'),
  O('🪞 Parlour (Neighborhood, air-conditioned & market parlours)', 'parlour'),
  O('🏢 Hair Studio (Boutique, industrial, minimalist & creative studios)', 'studio')
];

const salonVenue = makeOpts([
  // BARBER SHOPS
  ['Traditional Neighborhood Barber Shop', 'an authentic neighborhood Indian male barber shop with turquoise oil-painted walls, large wooden-framed mirrors, a vintage black ceiling fan whirling overhead, and a classic chrome hydraulic barber chair'],
  ['Local Street-Side Barber Shop with Open Shutter', 'a compact street-side Indian barber shop with a large open roll-up shutter showing the bustling outdoor bazaar, classic vinyl barber chair with chrome footrest, buzzing clippers, white towel on the chair back, and powder-scented air'],
  ['Vintage Retro Barber Shop with Belmont Chair', 'a classic vintage barber shop with checkerboard tile flooring, antique Belmont hydraulic chair, leather strop hanging beside the mirror, blue Barbicide jar on the marble ledge, and retro wall decor'],
  ['Modern Urban Barber Shop with Dark Wood', 'a contemporary male barber shop with matte-charcoal walls, rich dark walnut cabinetry, black leather reclining barber chairs, warm directional track spotlights, and clean masculine aesthetic'],
  ['Local Corner Barber Shop with Shaded Canopy', 'a bustling corner street barber shop with a striped awning canopy outside, open doorway, whirring wall fan, stainless steel scissor tray, and energetic shop tempo'],
  ['Multi-Chair Bustling Commercial Barber Shop', 'a lively high-energy barber shop with a row of five active chrome hydraulic chairs, male patrons receiving haircuts and hot towel shaves, large mirrored wall, and buzzing background chatter'],
  ['Traditional Shaving & Haircut Barber Shop', 'a dedicated traditional men\'s grooming barbershop with hot lather machine, straight razor hone, magnetic tool bar holding precision shears, and deep tufted leather chairs'],
  ['Express Quick-Cut Barber Shop Kiosk', 'a brightly lit, compact express barber shop with functional stainless steel cabinetry, blue disinfectant comb jar, and efficient urban layout'],
  ['Retro 1970s Barber Shop with Faux-Wood Laminates', 'a nostalgic 1970s retro barber shop featuring warm woodgrain laminate walls, rounded vanity mirrors, vintage transistor radio playing soft melodies, and padded vinyl styling chairs'],

  // SALONS
  ['Modern Unisex Salon Floor', 'a contemporary unisex salon interior with clean minimalist design, plush black leather styling chairs, frameless backlit LED vanity mirrors, branded hair product display shelves, and pale oak wood flooring'],
  ['Full-Service Commercial Salon Floor', 'a busy commercial salon floor with multiple styling stations, polished tile flooring, wall-mounted mirror islands, and active background energy'],
  ['High-End Luxury Salon Suite', 'an exclusive private VIP salon suite with white marble countertops, gold-trimmed architectural mirrors, deep plush reclining leather styling chair, warm designer cove lighting, and private serene atmosphere'],
  ['Shopping Mall Glass-Fronted Salon Studio', 'an upscale glass-fronted salon inside a modern shopping mall, polished granite flooring, recessed warm spotlighting, sleek chrome stations, and sophisticated contemporary aesthetics'],
  ['Suburban Family Salon with Product Displays', 'a warm neighborhood family salon with polished ceramic tile floor, product display glass cases, comfortable armchairs, and familiar community buzz'],
  ['VIP Private Haircut Suite in Salon', 'an intimate, soundproof single-station VIP room within a premier salon, featuring an oversized reclining leather chair, private vanity mirror, and tranquil personal attention'],
  ['Open-Plan Commercial Hair Salon', 'an airy open-plan salon with high ceilings, polished concrete floors, parallel rows of hydraulic chairs, and diffuse daylight filtering through large windows'],
  ['Exclusive Penthouse Salon with Skyline View', 'a luxurious top-floor penthouse salon with panoramic floor-to-ceiling city skyline views, white quartz styling islands, and sleek floating mirrors'],
  ['Modern Glass & Steel Salon Studio', 'an ultra-clean contemporary salon with frosted glass partition walls, brushed stainless steel cabinetry, and cool balanced daylight illumination'],

  // PARLOURS
  ['Classic Neighborhood Hair Parlour', 'a cheerful neighborhood hair parlour with pastel cream walls, vanity mirror with warm bulb strip, clean tiled floor, and a comfortable cushioned swivel styling chair'],
  ['Air-Conditioned Market Hair Parlour', 'a cool air-conditioned hair parlour located in a bustling market complex, tinted glass entry door, neat rows of tonic bottles, and quiet hum of the AC unit'],
  ['Traditional Gent\'s Hair Parlour', 'an authentic classic gent\'s parlour with dark wood mirror moldings, glass display cabinets holding hair grooming tonics, vintage wall clock, and comfortable vinyl swivel chairs'],
  ['Local High-Street Hair Parlour', 'a ground-floor high-street hair parlour with constant foot traffic outside, colorful wall trim, stainless steel instrument cart, and bright overhead lights'],
  ['Compact Two-Chair Hair Parlour', 'an intimate two-station neighborhood parlour with two chrome hydraulic chairs, shared center mirror ledge, fresh white towels, and relaxed neighborly atmosphere'],
  ['Busy Municipal Bazaar Hair Parlour', 'an energetic municipal bazaar hair parlour with open doorway, whirring wall-mounted fans, male customers seated on the waiting bench, and vibrant market murmurs'],
  ['Second-Floor Balcony Hair Parlour', 'a quiet second-story hair parlour overlooking the market square below, breeze through open windows, clean mirrors, and relaxed afternoon tempo'],
  ['Cozy Suburban AC Hair Parlour', 'a modern suburban air-conditioned parlour with beige porcelain tile flooring, chrome armchairs, and amber-lit styling station'],
  ['Classic Street Corner Hair Parlour', 'a long-standing corner parlour with vintage tile wainscoting, large street-facing window, and classic hydraulic pump styling chair'],

  // HAIR STUDIOS
  ['Boutique Hair Studio with Warm Brick & Plants', 'a charming boutique hair studio with warm exposed red brick accents, potted indoor plants, brass vanity fixtures, and a plush emerald-green velvet styling chair'],
  ['Industrial Loft Hair Studio with Exposed Pipes', 'a trendy industrial loft hair studio with exposed brick walls, high ceilings, dark ductwork, reclaimed wood counters, steel-framed swivel mirrors, and Edison bulb pendants'],
  ['Clean Minimalist Monochrome Hair Studio', 'an airy open-concept hair studio with polished concrete floors, matte-black steel styling stations, floor-to-ceiling seamless mirrors, and diffuse daylight'],
  ['Creative Atelier Hair Studio', 'an artistic open hair studio with light birch woodwork, brass pendant lighting, clean uncluttered countertops, and serene creative focus'],
  ['Sunlit Rooftop Terrace Hair Studio', 'a modern rooftop hair studio bathed in 360-degree daylight, sheer white curtains, potted plants, and outdoor terrace breeze'],
  ['Private One-Chair Styling Studio', 'an intimate private studio with a single bespoke leather styling chair, acoustic wall panels, custom halo-lit mirror, and zero distractions'],
  ['Artisan Raw Concrete Hair Studio', 'a modern architectural hair studio featuring textured micro-cement walls, minimalist black iron stations, and sculptural lighting'],
  ['Garden Veranda Hair Studio', 'a peaceful semi-outdoor veranda studio with terracotta pavers, leafy palm fronds reflecting in mirrors, and gentle warm breeze'],
  ['Underground Speakeasy Hair Studio', 'an intimate speakeasy-inspired studio with dim amber Edison bulbs, dark tufted leather seating, exposed masonry walls, and low-key jazz ambiance'],

  // BARBER SHOPS EXPANSION
  ['Old Delhi Chawri Bazaar Heritage Barber Shop', 'an authentic historic Old Delhi narrow lane barber shop with aged Burma teak framing, brass talcum shaker, ornate antique mirror reflecting passing cycle-rickshaws, and vintage revolving chrome chair'],
  ['Mumbai Colaba Art Deco Barber Saloon', 'a 1930s Mumbai Art Deco barber saloon with seafoam-green mosaic tile floors, curved geometric mirrors, polished brass coat tree, and overhead slow revolving ceiling fan'],
  ['Goan Portuguese-Villa Heritage Barber Shop', 'a breezy heritage Goan barber shop with whitewashed laterite stone walls, azure-blue wooden louvered shutters, terracotta floor tiles, and a vintage hydraulic leather chair'],
  ['Railway Colony Express Barber Shop', 'a nostalgic Indian railway colony barber shop with mint-green enamel wainscoting, overhead slow-spinning ceiling fan, stainless steel scissor magnetic bar, and quiet midday hum'],

  // SALONS EXPANSION
  ['Bandra West Sunlit Bohemian Chic Salon', 'a trendy Mumbai Bandra West salon with fluted lime-wash plaster walls, arched brass vanity niches, natural rattan chairs, and warm filtered coastal daylight'],
  ['Bangalore Indiranagar Biophilic Glasshouse Salon', 'an airy glass-roofed Bangalore salon filled with hanging fiddle-leaf figs and monstera vines, terrazzo floors, and minimalist natural ash-wood styling stations'],
  ['New Delhi Mehrauli Heritage Courtyard Salon', 'a high-fashion salon situated in a historic Mehrauli sandstone courtyard, scalloped Mughal archways in soft focus, and modern minimalist halo mirrors'],
  ['South Mumbai Victorian Stone Heritage Salon Suite', 'an exclusive salon suite inside a Victorian Gothic stone heritage building with 16-foot vaulted ceilings, arched leaded-glass windows, and plush emerald leather styling chairs'],

  // PARLOURS EXPANSION
  ['Kolkata North Heritage Marble-Top Parlour', 'a historic North Kolkata neighbourhood parlour with Belgian glass mirrors, marble-top vanity shelf, antique brass wall sconces, and gentle street chatter outside'],
  ['Chennai Mylapore Traditional Brahmin Market Parlour', 'an authentic Mylapore temple-district parlour with brass oil lamp on the counter, fresh jasmine garland, polished red-oxide floors, and humming wall fan'],
  ['Jaipur Pink City Johari Bazaar Parlour', 'a vibrant Pink City market parlour with terracotta-pink arched doorway, brass mirror frames, traditional block-print curtains, and energetic bazaar sounds'],
  ['Pune Deccan Gymkhana Shaded Corner Parlour', 'a serene suburban Pune parlour shaded by ancient banyan trees, white tiled walls, vintage radio playing classic melodies, and comfortable reclining vinyl chairs'],

  // HAIR STUDIOS EXPANSION
  ['Goa Fontainhas Heritage Quarter Atelier', 'an artistic private hair studio in Fontainhas with ochre-yellow stucco facade, dark timber rafters, hand-painted Portuguese azulejo tiles, and a private garden patio'],
  ['Kochi Fort Kochi Colonial Waterfront Studio', 'an airy waterfront studio in Fort Kochi with exposed Dutch brickwork, antique maritime brass lamps, and sea breeze through tall louvered casement windows'],
  ['Himalayan Dehradun Pine Valley Retreat Studio', 'a serene mountain hair studio with knotty pine timber walls, panoramic valley views of mist-clad Himalayan hills, and a warm stone hearth'],
  ['Rishikesh Riverside Zen Bamboo Studio', 'a tranquil riverside hair studio with split-bamboo screens, natural slate flooring, soft sound of flowing Ganga river water, and diffused mountain daylight']
]);

const salonDesign = makeOpts([
  ['Preset Default (Harmonized with venue)', 'harmonized with the selected establishment architectural style and interior ambiance'],
  ['Classic Traditional (Teal oil paint & chrome fans)', 'classic traditional aesthetic with light turquoise oil-painted plaster walls, vintage black ceiling fan, stainless steel trays, and retro Bollywood film wall art'],
  ['Modern Minimalist (Matte black & frameless LED mirrors)', 'sleek modern minimalist interior with clean white and charcoal walls, frameless backlit LED halo mirrors, and matte-black steel accents'],
  ['Industrial Raw (Exposed brick, steel pipes & concrete)', 'gritty industrial aesthetic with exposed red brick walls, overhead steel ductwork, polished concrete floor, and warm amber Edison bulb pendants'],
  ['Vintage Retro (Faux-wood laminates & checkerboard floor)', 'warm vintage retro aesthetic with 1970s woodgrain laminate wall panels, black-and-white checkerboard floor tiles, and chrome trim'],
  ['Upscale Luxury (White marble, gold trim & cove lighting)', 'luxurious high-end interior with polished white Calacatta marble counters, brushed brass architectural mirror trim, and warm recessed cove lighting'],
  ['Cozy Boutique (Warm painted brick & indoor plants)', 'intimate boutique atmosphere with warm painted brick, lush potted indoor ficus and palm plants, brass vanity sconces, and pale oak flooring'],
  ['Clean Commercial (White subway tiles & bright studio lights)', 'crisp commercial aesthetic with glossy white subway tile walls, dark grout lines, bright 5000K balanced daylight tubes, and organized product shelves'],
  ['Distressed Rustic (Aged plaster walls & weathered wood)', 'authentic lived-in rustic atmosphere with weathered plaster walls showing aged patina, reclaimed wood countertops, and antique mirrors'],
  ['High-Tech Contemporary (Polished granite & cool daylight LEDs)', 'high-tech contemporary interior with polished dark granite surfaces, frosted glass partition screens, and cool daylight vanity light bars']
]);

const salonBarberStaff = makeOpts([
  ['Solo male barber only (Private 1-on-1 focus)', 'strictly one solo male barber in the shop giving complete, undivided professional attention to the female client in the chair with zero other staff'],
  ['Lead male barber with junior male apprentice standing by', 'two male barbers present: an experienced lead male barber actively cutting the female client\'s hair, while a junior male apprentice stands nearby observing attentively and holding clean styling tools'],
  ['Two active male barbers working at adjacent chairs', 'two male barbers actively working in the shop: one male barber cutting our female client, and a second male barber cutting another male patron\'s hair at the neighboring station'],
  ['Three active male barbers in a bustling shop', 'three male barbers working simultaneously along the mirrored counter: the lead male barber detailing our female client\'s haircut, while two other male barbers attend to male clients in adjacent chairs'],
  ['Full multi-station floor with 4–5 male barbers working', 'a full commercial shop floor with four to five male barbers actively working across multiple stations, executing haircuts, beard trims, and blowouts for male clients in the background'],
  ['Lead master barber with waiting male patrons watching', 'one skilled master male barber actively styling the female client in the central chair, while several male patrons wait patiently on the wooden bench watching the haircut progression']
]);

const salonTime = makeOpts([
  ['Bright morning opening with soft street light', 'early morning opening hours with soft, clean daylight filtering through the shop front, quiet street outside, fresh clean towels, and a peaceful calm atmosphere'],
  ['Sunny mid-day with bright street glare', 'bright mid-day sun casting crisp light through the front salon window, busy daytime street glare outside, and bright ambient salon illumination'],
  ['Golden late afternoon with warm sun rays', 'golden hour late afternoon with warm angled sunbeams slanting across the barber chair, casting deep amber highlights and long soft shadows in the shop'],
  ['Dusk twilight with glowing neon practicals', 'evening twilight and blue hour dusk outside the salon window, contrasting dramatically with warm interior fluorescent tubes and soft vanity mirror glow'],
  ['Late-night busy shift under buzzing fluorescent lights', 'late-night salon hours with dark nighttime street outside, bright cool overhead fluorescent tubes buzzing overhead, lively night crowd, and vibrant shop energy'],
  ['Overcast rainy monsoon afternoon with cozy shop warmth', 'rainy monsoon afternoon with diffuse moody gray daylight through rain-streaked shop windows, cool damp reflections, and cozy sheltered shop warmth'],
  ['Afternoon tea lull with mellow ambient daylight', 'lazy mid-afternoon hours with gentle diffuse daylight, slow unhurried pace, and warm relaxed shop atmosphere'],
  ['Nighttime street view with warm interior spotlights', 'deep night atmosphere with dark outdoor market illuminated by warm exterior shop front signage and focused interior spotlights'],
  ['Pre-sunset radiant golden hour glow', 'radiant pre-sunset golden hour light pouring through the salon windows, creating vivid warm rim lighting and glowing highlights across dark hair strands'],
  ['Early dawn first-client appointment', 'quiet early dawn light with crisp cool blue daylight creeping over the horizon, peaceful undisturbed shop, and freshly prepped styling counter'],
  ['Dramatic thunderstorm with moody dim ambient light', 'heavy monsoon storm raging outside, dark dramatic sky, rain lashing the glass, and cozy warm mirror bulb lighting inside'],
  ['Crisp foggy winter morning with diffused sunlight', 'misty cold winter morning with soft diffused sunlight filtering through outdoor fog, steaming towel warmer on the counter, and calm quiet vibe']
]);

const salonStage = makeOpts([
  ['Active scissor work — mid-haircut', 'in-progress haircut action: the male barber holds a taut section of hair between his index and middle fingers while sharp stainless steel shears execute a clean precision snip, with freshly cut hair strands falling onto the draped cape'],
  ['Precision fringe & curtain bangs trimming', 'active precision detailing: the male barber carefully point-cuts soft arched bottleneck curtain bangs at eyebrow level, using a carbon cutting comb to hold light tension as tiny hair clippings scatter onto the cape'],
  ['Sectioning with butterfly clips & prep', 'haircut preparation stage: the client is draped in a cape with upper hair divided into neat sections secured by colorful salon butterfly clips, while lower layers are combed flat ready to be cut'],
  ['Wetting with spray bottle & combing flat', 'pre-cut wetting stage: fine water mist from an aluminum spray bottle glistens across the hair strands, as the male barber uses a fine-tooth cutting comb to create a crisp center parting'],
  ['Thinning shears & texture feathering', 'texturizing stage: the male barber works with notched thinning shears across the ends of the hair, softening weight and creating piecey feathering with light hair dust on the cape shoulders'],
  ['Final snip & perimeter check', 'final precision stage: the haircut is nearly complete as the male barber steps back slightly, evaluating balance in the mirror before making one final deliberate micro-snip at the bangs'],
  ['Round-brush blowout & crown lifting', 'styling in-chair: a round ceramic barrel brush lifts roots at the crown while a hairdryer nozzle directs warm airflow to smooth the hair and curve the curtain bangs outward'],
  ['Handheld mirror rear ponytail reveal', 'post-cut reveal in chair: the haircut is 100% finished with cape still on, as the male barber stands behind holding up an oval handheld mirror so the client can inspect the rear ponytail and nape silhouette'],
  ['Unclipping cape & neck duster cleanup', 'cleanup stage: the haircut is finished and the male barber gently dusts the client\'s neck and collarbone with a soft talcum-powdered horsehair duster brush as the cape snap is unfastened'],
  ['Haircut consultation & initial comb-through', 'consultation stage: client seated comfortably in the barber chair, cape fastened around neck, male barber lightly combing through dry hair while discussing desired length in the mirror'],
  ['Guarded feathering razor tapering along collarbone ends', 'razor texturizing stage: the male barber works with a guarded feathering razor along the outer ends, carving soft, tapered, wispy layers with natural fluid movement'],
  ['Razor edge perimeter cleanup along the nape', 'precision razor detailing: the male barber uses a straight razor with light shaving lather to clean the neckline perimeter cleanly below the finished hair'],
  ['Vertical point-cutting texture into bang tips', 'styling texture work: the male barber vertically point-cuts scissor tips into the curtain bang ends to soften weight and create organic piecey separation'],
  ['Towel blotting damp hair post-wash', 'prep stage: client seated in the styling chair with a soft white towel wrapped around shoulders, male barber gently blotting damp hair before initial comb-out'],
  ['Final mirror tilt & profile check', 'evaluation stage: the male barber tilts the vanity lamp and asks the client to turn her head gently to inspect the cheekbone-framing angle in the mirror'],
  ['Scissor-over-comb blending motion', 'active layering: the male barber rapidly works cutting shears over a flat barber comb to sculpt clean graduated layers along the hair perimeter'],
  ['Slide cutting along face-framing angles', 'precision shaping: the male barber slides open scissor blades smoothly down the front curtain strands to create a seamless tapered face frame'],
  ['Cross-checking vertical sections across the crown', 'balance check: the male barber lifts vertical sections of hair perpendicular to the scalp between his fingers, checking uniform layer lengths across the crown'],
  ['Spray bottle misting during haircut', 'active cut maintenance: the male barber spritzes water mist directly onto crown strands as water droplets glisten and hair settles into clean cutting tension'],
  ['Combing curtain bangs into crisp center part', 'parting precision: the male barber uses a black tail comb to carve a clean center parting and drape wispy arched curtain bangs symmetrically over brows'],
  ['Twisting and point-cutting ponytail tail ends', 'tail detailing: the male barber gathers the ponytail tail, twisting the ends lightly and point-cutting into the tips to give soft natural movement'],
  ['Hairdryer cool-shot loose hair blast', 'clearing clippings: the male barber uses the cool-shot nozzle of a hairdryer to gently blow loose cut hair fragments off the shoulders and cape collar'],
  ['Hands cupping and checking hair bounce', 'final tactile check: the male barber gently cups the finished ends with his hands, letting the silky hair fall and bounce into place naturally in the mirror'],
  ['Barber shaving client\'s armpit hair with straight razor', 'barber underarm shaving: the female client relaxes comfortably in the hydraulic chair with one arm raised behind her head, draped in cape, while the male barber applies rich warm shaving lather to her underarm and expertly glides a traditional straight razor to shave her armpit hair cleanly and smoothly'],
  ['Barber shaving fine chest hair with warm lather & straight razor', 'chest and décolletage shave: the male barber carefully works warm rich lather across the female client\'s upper chest and collarbones, delicately shaving fine chest hair and body hair with smooth, confident straight-razor strokes while she reclines comfortably in the chair'],
  ['Full body hair shave: arms & shoulders with lather & razor', 'body hair grooming service: the male barber applies hot towel prep and rich lather across the female client\'s shoulders, arms, and neckline, smoothly shaving all fine body hair with an authentic chrome safety razor, revealing clean, smooth skin'],
  ['Post-shave hot towel & soothing balm on underarms & chest', 'post-shave soothing treatment: the male barber gently presses a steaming aromatic hot towel to the client\'s freshly shaved underarms and chest, followed by a gentle soothing after-shave balm application'],
  ['Client head tilted down for nape trimming', 'precision neckline detailing: client with head tilted gently down toward her chest, exposing the cervical spine and nape while the barber combs and shears the baseline'],
  ['Client leaning forward evaluating bangs in mirror', 'in-chair posture: client leaning slightly forward with torso angled toward the vanity mirror, head tilted down softly to check fringe length'],
  ['Client turned sideways looking away while barber checks perimeter', 'haircut moment: client turned sideways in chair looking away into the shop with her hand raised near her temple shielding her face, as the barber steps to the side to inspect the haircut baseline and hair texture'],
  ['Straight-razor bob nape & hairline detailing with leaned-in barber', 'tight close barbershop detailing: the male barber leans closely in beside her shoulder pressing a folding black-handle straight razor cleanly against her bare nape below a sharp jawline bob while loose cut hair snippets scatter across her black cape'],
  ['Point-cutting damp cheek-grazing front tendrils & face frame', 'detailed perimeter work: the male barber holds damp front cheek-locks at a precise 45-degree tension angle across her cheekbones, vertically point-cutting soft feathered graduation around the face'],
  ['Clipper-over-comb stacked bob nape undercut trim', 'crisp stacked tailoring: the male barber presses a flat white cutting comb gently against the lower occipital nape and skims detail trimmers cleanly along the hairline for an ultra-sharp stacked bob edge'],
  ['Dry visual carving & asymmetry balance check on bob ends', 'dry freehand detailing: on finished dry hair, the barber delicately slides open shear tips along her jawline perimeter to sculpt airy movement and balanced cheekbone framing'],
  ['Ear-tuck & temple sideburn razor sculpting', 'refined ear detailing: the barber gently combs damp locks behind her ear to reveal the delicate ear curve and feathers fine wispy sideburns using a guarded styling razor'],
  ['Water-mist soak & center comb-down full face veil prep', 'dramatic veil preparation: thoroughly misting front bangs and side sections until glossy and heavy, combing the front curtain straight down over forehead and eyes ready for geometric slicing'],
  ['Club-cutting thick occipital bulk across horizontal guide line', 'decisive blunt cut: holding thick damp lower crown sections clamped tightly between index and middle fingers, executing one crisp horizontal club-cut snip establishing a sharp blunt baseline'],
  ['Over-directed forward tension slicing for steep A-line graduation', 'precision A-line cutting: combing side sections steeply forward toward the jawline and slicing cleanly downward so front bob corners cascade noticeably longer than the stacked nape'],
  ['Butterfly-clip quadrant drop — releasing next wet cutting layer', 'layered progression: unclipping the middle alligator section clip on one side so heavy glossy wet hair drops smoothly down over the freshly blunted underlayer'],
  ['Micro-bang & brow-bone razor texturizing over comb spine', 'micro-fringe artistry: resting a narrow fine-tooth comb across brow height while precision shear tips delicately notch airy texture into damp bang ends'],
  ['Razor-comb thinning along thick lower nape curve', 'debulking pass: gliding a toothed styling razor comb downward along mid-lengths to remove internal weight while preserving a crisp heavy outer hemline'],
  ['Channel carving deep internal layers while cape catches ribbons', 'internal texturizing: elevating diagonal crown sections smoothly upward and carving clean internal channels as thick ribbons of dark hair rain gently onto the vinyl cape'],
  ['Warm lather & exposed straight-razor neck cleanup post-bob', 'nape razor finish: smoothing warm aromatic lather across the freshly uncovered skin at the nape and pulling an exposed chrome straight razor down to clean perfection'],
  ['Wet curl assessment & upward palm bounce scrunch mid-cut', 'shrinkage check: cupping newly cut damp waves or curls upward in a towel-wrapped palm toward her cheekbone to measure true spring tension before making the final pass'],
  ['Double-brush blow-dry polishing & glassy inward C-bevel', 'luxury salon finish: wrapping bottom jawline ends tightly under with a boar-bristle round brush beneath focused dryer airflow for a sleek mirror-smooth inward C-curve'],
  ['Flat-iron C-curve beveling pass on ultra-sleek glass bob', 'high-gloss finishing: gliding a heated titanium straightener cleanly down narrow hair ribbons and curving wrists smoothly inward at chin level for reflective glass shine'],
  ['Warm argan gloss mist & root finger-rake lift', 'final touch finish: spritzing weightless shine mist into freshly blown-out crown layers and tipping fingers gently through the scalp to shake out effortless salon volume'],
  ['Mid-makeover pause surrounded by thick cut wet locks on cape & floor', 'dramatic transformation milestone: thick cut dark hair strands piled cleanly across her black cape collar and sweeping the floor tiles beneath the chrome chair pedestal'],
  ['Wiping clipped damp hair off scissor blades onto folded wrist towel', 'artisan rhythm pause: the barber holds a tense section securely in his comb hand while wiping damp cut hairs cleanly from stainless blades onto a folded white shoulder towel'],
  ['Parting flip switch — testing deep side sweep vs center veil', 'dynamic style check: sweeping the metal pintail comb cleanly from temple to crown to flip lush hair into a dramatic side-swept cascade partially veiling one eye'],
  ['Neckline talc dusting & chamois cleanup admiring raw jaw edge', 'post-cut crisp cleanup: sweeping soft talc-dusted neck-brush bristles softly across her exposed collarbone and neck hairline as the crisp new jawline perimeter settles'],
  ['Precision damp ear-corner micro-trim after shake-out', 'final symmetry check: asking her to tilt her head sharply sideways so the barber cleanly snips lingering micro-hairs just below the earlobe for museum-grade symmetry'],
  // Expanded In-Progress Chair Hair Work Stages
  ['Shampoo bowl neck-cradle foaming lather wash & rhythmic scalp scrub', 'wash basin hair prep: the client leans comfortably back into the porcelain shampoo bowl neck cradle while the male barber works rich aromatic foaming shampoo deeply through saturated dark hair roots with soothing circular finger strokes'],
  ['Deep conditioning mask wide-tooth comb-through at wash basin', 'conditioning treatment: coating gleaming wet lengths with velvety salon conditioning cream and slowly drawing a wide-tooth carbon detangler comb through silky strands from crown to ends at the wash bowl'],
  ['180° twisted butterfly front bang slice above nose bridge', 'advanced bang carving: gathering thick damp front curtain bangs, twisting them cleanly one full half-turn between fingers above the nose bridge, and executing one deliberate horizontal shear slice so edges fan outward automatically into cheek graduation'],
  ['Zig-zag crown parting carved with gleaming steel pintail tip', 'precise geometric sectioning: drawing the fine metal pin tail of a carbon sectioning comb across the damp crown in an interlocking zig-zag rhythm so parted hair strands cascade cleanly without harsh straight scalp lines'],
  ['Cordless detail trimmers carving ultra-sharp stacked bob nape undercut', 'close nape tailoring: the male barber presses a tapered comb flat against the lower occipital hairline and skims matte-black zero-gap cordless trimmers along bare neck skin for a surgical stacked bob neckline'],
  ['Dual titanium foil-shaver gliding zero-stubble clean across bare lower nape', 'mirror-smooth nape shave: pulling gentle tension along the bare back of the neck below freshly blunted bob ends while gliding foil shaver cylinders across baby hairs for a crisp spotless barber finish'],
  ['Exposed chrome shavette detailing tiny temple wisps around ear', 'delicate ear-arch razor work: holding damp hair softly pinned upward above one ear while resting an exposed shavette blade lightly along temple baby hairs to refine the cheekbone contour'],
  ['Double-prong duckbill clips setting sculptural S-wave along cheekbone', 'pin-wave setting action: combing glossy misted side sections into a flowing curved C-shape beside the cheekbone and locking gentle aluminum duckbill wave clips snugly into place'],
  ['Curl-by-curl dry sculpting cut in natural organic spring bounce', 'dry curl carving: holding individual natural wave ribbons softly without stretching them taut, snipping clean diagonal points directly beneath the curl bend to calibrate effortless spring-back volume'],
  ['Diffuser bowl cupping wet natural waves upwards under low airflow', 'curl diffusion in progress: leaning the chair slightly tilted while the male barber cradles damp cascading waves softly inside a wide round diffuser bowl attachment against the side of her head'],
  ['Wide barber paddle brush sweeping cut hair piles off chest cape to floor', 'mid-session clearing pass: taking a pause between layer passes as the male barber sweeps thick fallen dark hair ribbons down the glossy front slope of the black vinyl cape onto the salon floor'],
  ['Finger-combing saturated front locks over forehead to mark cut guide', 'guide-line calibration: saturating upper bangs down completely straight across the bridge of the nose and forehead so the barber measures exact lip-or-eyebrow length against bare skin before club-cutting'],
  ['Steaming damp herbal towel wrap draped around nape between passes', 'luxury mid-cut reset: pressing a warm steaming white cotton barber towel snugly against the exposed back of the neck after nape clippering while the barber sanitizes precision shears'],
  ['Testing wet-vs-dry tension elasticity by pulling crown ribbon smoothly', 'tension & spring test: clamping a glossy wet crown strand lightly between thumb and forefinger and drawing it gracefully toward the shoulder to check healthy elastic weight before texturizing'],
  // Female Model (Barber) Grooming Male Client
  ['Female model (barber) straight-razor shaving male client\'s beard with warm lather', 'barber action: the adult female model acts as the skilled barber standing beside the hydraulic chair, holding a traditional chrome straight razor at a precise angle to shave rich lather off the male client\'s jawline as he reclines comfortably with a draped cape'],
  ['Female model (barber) performing traditional hot oil champi (head massage) on male client', 'barber action: the adult female model stands behind the seated male client, skillfully massaging warm herbal oil into his scalp and temples with rhythmic finger kneading as he leans back into the headrest with eyes closed'],
  ['Female model (barber) shaving male client\'s underarm hair clean with razor', 'grooming service: the adult female model carefully glides a precision razor down the male client\'s raised underarm with warm foamy lather, expertly shaving his armpit hair clean as he relaxes in the chair'],
  ['Female model (barber) detailing male client\'s mustache and beard perimeter with shears', 'precision styling: the adult female model leans in close with fine barber shears and a pocket comb to detail and sculpt the male client\'s mustache and sideburn perimeter in the vanity mirror'],
  ['Female model (barber) applying hot towel wrap & shoulder massage on male client', 'spa treatment: the adult female model drapes a steaming hot towel around the male client\'s neck and shoulders, using firm caring palm pressure to massage his neck muscles after his shave'],
  ['Female model (barber) executing precision clipper skin-fade blend on male client', 'barber fade artistry: the adult female model stands closely beside the hydraulic chair holding cordless chrome fade clippers tilted neatly along the male client\'s temple and nape while steadying his brow calmly with her free hand'],
  ['Female model (barber) straight-razor hairline & beard cheek edge-up on male client', 'crisp lineup craft: the adult female model leans intently beside the male client’s profile, pulling taut cheek/temple skin with two fingertips and tracing razor-sharp geometric hairlines with a black-handle straight razor'],
  ['Female model (barber) scissor-over-comb precision top crop on male client', 'classic barbering craft: the adult female model holds a crisp white flat-top comb perpendicular through the male client’s damp crown locks, smoothly scissoring even graduated passes across the comb spine'],
  ['Female model (barber) whisking rich badger-brush lather onto male client’s jaw', 'luxury prep ritual: the adult female model whisks warm, fragrant foamy shaving lather across the male client\'s cheeks, throat, and jawline using a classic badger-bristle brush while he reclines serenely under a striped cape'],
  ['Female model (barber) combing & balm-sculpting male client’s beard', 'beard craftsmanship: the adult female model works a tortoise-shell beard comb and small precision trimming shears cleanly through the male client’s beard and mustache perimeter with warm finishing balm'],
  ['Female model (barber) wrapping hot-steam facial towel & temple acupressure on male client', 'spa grooming ritual: the adult female model tucks a steaming white barbershop towel snugly around the male client’s jawline and cheeks while applying soothing rhythmic temple pressure'],
  ['Female model (barber) dusting clipped beard & hair off male client’s collar with neck brush', 'finishing hospitality: the adult female model unclips the sanitary neck strip and sweeps a soft talc-dusted horsehair neck duster brush smoothly along the male client’s collar and freshly groomed neckline'],
  ['Female model (barber) scissor point-cutting textured French crop fringe on male client', 'active barbering precision: the adult female model stands tightly beside her male client holding damped front fringe taut between fingers while vertically point-cutting textured cropped texture right above his eyebrows'],
  ['Female model (barber) straight-razor cleaning male client\'s nape taper & behind-ear edge', 'nape razor craft: the adult female model leans closely over the tilted headrest, bracing his lower skull gently with one hand while gliding a traditional folding straight razor cleanly down the male client\'s foamed nape hairline'],
  ['Female model (barber) clipper-over-comb mid-drop taper transition on male client\'s side profile', 'graduation mastery: the adult female model tilts a white flattop comb smoothly away from the male client\'s temple and skims cordless clippers seamlessly up the comb spine, showering fine cut hairs onto the striped cape'],
  ['Female model (barber) misting aluminum spray bottle & carving crisp side part on male client\'s crown', 'pre-cut barber prep: the adult female model spritzes glistening fine water mist across the male client\'s hair before drawing a crisp razor-straight side parting using a sleek carbon tail comb'],
  ['Female model (barber) thinning thick crown bulk with Japanese notched thinning shears on male client', 'texture refinement: the adult female model lifts damp crown sections through her braced fingers and works notched texturizing shears rhythmically across mid-lengths of her male client\'s hair'],
  ['Female model (barber) round-brush quiff & pompadour blowout with warm hairdryer on male client', 'gentleman\'s blowout styling: the adult female model holds a chrome concentrator-nozzle dryer in one hand and rotates a narrow round brush through the male client\'s front hair upward into effortless volume'],
  ['Female model (barber) feather-razor slicing wispy mullet/shag collar layers on male client', 'modern barber blade work: the adult female model lightly draws a guarded styling razor down the nape and side layers of her male client\'s textured cut for effortless wispy collar movement'],
  ['Female model (barber) finger-raking matte styling clay through male client\'s freshly cut crop', 'tactile clay finish: the adult female model warms matte grooming clay between both palms before raking splayed fingers smoothly forward and upward through her male client\'s textured short crop'],
  ['Female model (barber) gliding uniform buzz-cut clipper guard straight over male client\'s crown', 'decisive clipper pass: the adult female model holds powerful chrome clippers flat against the male client\'s crown, guiding smooth overlapping strips forward as thick dark hair tumbles across the striped cape'],
  ['Female model (barber) detailing low burst-fade crescent around male client\'s ear with trimmers', 'artisan fade detailing: the adult female model bends smoothly near ear height, holding the male client\'s ear tip gently forward with two fingertips while tracing a tight semicircular burst fade with T-blade detail trimmers'],
  ['Female model (barber) zeroing skin-fade lower nape with dual titanium foil shaver on male client', 'ultra-clean barber finish: the adult female model pulls downward neck skin tension cleanly with one hand and glides gleaming chrome foil shavers smoothly across the lower hairline of her male client'],
  ['Female model (barber) briskly towel-scrubbing male client\'s damp hair after wash basin rinse', 'refreshing prep moment: the adult female model stands closely beside the reclined male client, briskly rubbing and blotting his soaked hair between folded warm white salon towels before shearing'],
  ['Female model (barber) holding oval dual-view mirror behind chair showing male client his rear taper fade', 'barber reveal moment: the adult female model steps slightly back holding a black-rimmed oval mirror behind her male client\'s freshly faded nape while he turns smoothly in the chair to inspect the line'],
  ['Female model (barber) cool-shot blowing clipped hair dust off male client\'s forehead and cape collar', 'crisp cleanup motion: the adult female model aims the cool-shot dryer nozzle gently across her male client\'s brow and unsnapped cape neck strip as clipped hair snippets blow cleanly away']
]);

const salonStylist = makeOpts([
  ['Indian male barber actively cutting', 'an attentive Indian male hairstylist with neat grooming, wearing a casual short-sleeve shirt and black waist apron, focused intently on cutting the hair with professional hand posture'],
  ['Stylist hands only (Macro POV / First-person focus)', 'first-person portrait focus: the camera frames the client\'s face and hair closely, showing only the skilled hands of the male barber holding stainless steel shears and a black carbon comb'],
  ['Solo client in barber chair (Stylist just stepped aside)', 'the client sits alone in the center of the frame in the barber chair, cape draped, with the male barber just out of frame having stepped away to grab a styling tool'],
  ['Barber standing behind holding secondary mirror', 'the male barber in a casual salon apron stands slightly behind and to the side, holding up a small handheld mirror reflecting the back view of the client\'s new ponytail'],
  ['Candid conversation with stylist', 'a natural candid moment with the client smiling and speaking with the friendly Indian male barber in a collared shirt as they discuss the front curtain bang drape in the mirror'],
  ['Two stylists collaborating on finish', 'lead Indian male barber in black apron detailing the front bangs while a junior male assistant stands nearby holding round brush and hairdryer'],
  ['Young trendy barber with faded undercut & rolled sleeves', 'an energetic young Indian male barber with a sharp taper fade haircut, tattooed arms, and canvas utility apron, smiling candidly while holding comb and texturizing shears'],
  ['Veteran elderly barber with traditional eyeglasses & white coat', 'a gentle, dignified older Indian male barber with wire-rimmed glasses, wearing a traditional buttoned white barber coat, working with time-tested calm precision'],
  ['Stylist stepping back evaluating balance in the mirror', 'the Indian male barber in casual black attire has stepped three feet back, arms folded loosely while holding shears, squinting thoughtfully at the client\'s reflection to verify symmetry'],
  ['Stylist dusting neck with powder duster brush', 'the Indian male barber standing beside the chair holding a soft wooden-handled talcum powder neck duster brush, gently sweeping away loose cut hair from the client\'s jawline and neck'],
  ['Solo client checking finished hair in the mirror', 'the client sits completely alone in the chair with cape unfastened, reaching up with both hands to touch and feel the ends of her new curtain bangs with a genuine satisfied smile'],
  ['Master barber with neat mustache and striped apron', 'a skilled senior Indian male barber with a neat mustache, wearing a classic pinstriped barber apron, executing deliberate precision snips with calm authority'],
  ['Apprentice male barber observing senior master barber', 'a young apprentice Indian male barber in training standing attentively beside the styling chair, watching the master male barber execute the precision cut'],
  ['Male barber resting hand on chair back during consultation', 'the Indian male barber resting one hand comfortably on the black hydraulic chair headrest, leaning in slightly to consult with the client in the mirror'],
  ['Male barber spraying water with focused concentration', 'the Indian male barber holding an aluminum spray bottle with focused concentration, fine water droplets misting between his hands and the hair strands'],
  ['Male barber applying sanitary neck strip before draping', 'the Indian male barber carefully wrapping a white crêpe paper sanitary neck collar around the client\'s neck before snapping the cape into place'],
  ['Male barber gently unclipping crown butterfly clips', 'the Indian male barber using deft gentle hand movements to unclip colorful butterfly hair clamps from the client\'s crown as layers fall into place'],
  ['Over-the-shoulder angle of male barber\'s focused eyes in mirror', 'an intimate mirror perspective capturing the Indian male barber\'s focused, professional gaze reflected in the glass as his hands detail the fringe'],
  ['Stylist crouched at jawline height checking crisp bob symmetry', 'the Indian male barber crouched cleanly beside the chair armrest at eye level with her cheekbones and jaw, sighting across the freshly blunted bob perimeter with comb and shears ready'],
  ['Barber actively rotating round ceramic brush beneath warm hairdryer airflow', 'the Indian male barber standing behind the chair working both hands in seamless synchronization—spinning a round thermal brush through damp lengths while sweeping a narrow-nozzle hairdryer overhead'],
  ['Precision-focused stylist wiping cut hair dust off shear blades on white towel', 'the Indian male barber holding damp front hair taut between comb-hand fingers while wiping snipped dark hair ribbons cleanly off his stainless Japanese shear blades onto a folded white cotton towel'],
  ['Senior barber holding gleaming aluminum spray bottle & steel pintail comb', 'the Indian male barber misting gleaming water droplets evenly over the crown while his other hand prepares a crisp parting line with the gleaming steel pin of a carbon comb']
]);

const salonStoolType = makeOpts([
  ['Low round backless swivel stool', 'a compact low round backless swivel cutting stool with a firm black faux-leather cushion and brushed chrome hydraulic cylinder, placing the client open and unobstructed in the space'],
  ['Minimalist low wooden barber stool', 'a handcrafted low solid-wood barber stool with visible natural teak grain and clean rounded edges, completely backless and low to the ground'],
  ['Vintage leather-cushioned small stool', 'a vintage industrial low salon stool with deep button-tufted espresso leather cushioning and a circular cast-iron foot ring base'],
  ['Matte-black low studio stool', 'a compact matte-black steel round stool with a firm low-profile cushion, keeping her seated low without any tall backrest'],
  ['Low ergonomic saddle stool', 'a compact dark-brown leather saddle-style stool without a backrest, encouraging an open, upright, and relaxed spinal posture'],
  ['Traditional Indian low wooden baithak stool', 'a traditional low wooden baithak / peeda stool with rustic dark wood legs and tightly woven natural fiber detailing'],
  ['Compact chrome rolling stool', 'a low-profile chrome rolling swivel stool with smooth casters and a minimalist black vinyl seat'],
  ['Low upholstered square ottoman stool', 'a minimalist low square salon ottoman in textured charcoal linen, placing the client completely open in the room with zero chair back']
]);

const salonBarberProximity = makeOpts([
  ['Directly pressed against her back — chest touching shoulders', 'standing directly behind her back with his chest practically touching her upper shoulders, leaning forward attentively as his arms bracket her frame'],
  ['Torso grazing her shoulder blades closely', 'leaning in close over her shoulders with his dark canvas apron and shirt lightly grazing her back as his hands work forward'],
  ['Standing millimeters behind with arms wrapping forward', 'positioned millimeters behind her back, body intimately close to hers, reaching both forearms forward around her head'],
  ['Bending down close beside her ear', 'leaning his head down close beside her cheek and ear, face inches away as his skilled hands detail her front hair'],
  ['One hand resting firmly on her bare shoulder', 'standing pressed intimately close behind her with one warm hand resting reassuringly on her shoulder and collarbone while his other hand cuts'],
  ['Intimately hovering over crown from behind', 'hovering closely over her crown from behind, chest gently resting against her upper back, completely absorbed in shaping her hair'],
  ['Legs lightly bracketing the small stool', 'standing closely behind with his stance lightly bracketing the backless stool, towering gently over her from behind'],
  ['Gentle hands guiding her head tilt', 'standing right against her back, using both hands to softly guide and tilt her head as his body moves in harmony with hers']
]);

const salonIntimateHairAction = makeOpts([
  ['Precision scissor work right in front of her face', 'holding a taut section of hair between his index and middle fingers right beside her cheek while sharp stainless steel shears execute precision point-snips, with fine hair fragments fluttering down'],
  ['Fine-tooth combing & razor-sharp center part', 'standing directly behind her crown, gently gliding a fine-tooth carbon tail comb across her scalp to sculpt a razor-sharp center parting with calm focused breath'],
  ['Point-cutting curtain bangs reaching over forehead', 'leaning forward over her shoulders from behind, his hands reaching across her forehead to point-cut soft arched bottleneck bangs at eyebrow level'],
  ['Spray bottle misting & hand-smoothing damp hair', 'spritzing fine water mist onto hair strands while his warm fingers glide through the damp lengths to smooth them over her collarbones in the salon light'],
  ['Straight-razor detailing along exposed nape & neckline', 'delicately applying warm lather and sweeping a traditional straight razor along her bare neck and nape hairline while bent close behind her ear'],
  ['Warm blowout & round-brush crown root lifting', 'directing warm hairdryer airflow and a round ceramic barrel brush through her crown from directly behind, body pressed close to the stool'],
  ['Fingers buried deep in hair assessing volume & bounce', 'burying both hands into her freshly cut hair from behind, lifting strands gently to feel the organic weight, texture, and tactile bounce'],
  ['Sectioning with matte duckbill clips from above', 'methodically dividing upper hair into clean quadrant sections with black salon clips, leaning directly over her head from behind'],
  ['Thinning shears texturizing weight from ends', 'working notched texturizing shears through hair ends while cut hair clippings flutter down onto her draped lap and stool base'],
  ['Underarm straight-razor shave on stool', 'gently guiding her arm raised behind her head while leaning close from behind, applying rich lather and shaving underarm hair clean with a straight razor'],
  ['Straight-razor nape cleanup leaning close beside stool shoulder', 'standing inches beside the backless stool leaning in over her draped shoulder, pressing a sleek straight razor gently against warm lather at her bare nape hairline'],
  ['Combing heavy damp front veil down over forehead & eyes on stool', 'reaching calmly over her crown from behind to comb gleaming saturated wet front hair completely forward across her forehead and eyes prior to geometric slicing'],
  ['Clipping upper wet quadrant high while bob underlayer dries naturally', 'gathering thick upper crown locks smoothly into matte dark alligator clips from directly behind on the open stool so the blunt lower bob perimeter hangs crisp and unobstructed'],
  ['Scissor-over-finger jawline perimeter sculpting inches from cheek', 'sandwiching damp jawline ends cleanly between two braced fingers right beside her ear and cheek while mirror-bright shears snip an ultra-sharp architectural edge'],
  ['Channel carving airy internal texture while clipped ribbons dust cape', 'elevating narrow crown locks gently overhead from behind on the stool and sliding open carving blades cleanly downward to lighten heavy natural density'],
  ['Swiping loose hair snippets off cape collar & collarbone with warm palms', 'brushing clinging freshly cut hair strands lightly off the upper cape folds and bare lower neck skin while evaluating clean symmetry from behind the stool'],
  ['Flat-iron C-curve smoothing pass framing both cheekbones on stool', 'gliding sleek heated styling plates down fresh collarbone layers right around her cheekbones to bevel silky ends gently inward toward her chin'],
  ['Parting comb flip sculpting dramatic half-face hair veil from behind', 'drawing a steel pintail comb swiftly down one side from behind the stool, sweeping damp front sections diagonally across one eye in a sleek peek-a-boo curtain'],
  // Expanded In-Progress Hair Work & Barber Action on Stool (+32 options -> 50 total)
  ['Horizontal club-cutting thick nape baseline clamped between fingers', 'clamping damp dark nape ends tightly between braced index and middle fingers at collar level and executing one crisp, decisive horizontal club-cut snip with stainless Japanese shears'],
  ['Deep 45° forward slide-cutting cheekbone cascades on stool', 'combing damp side locks sharply forward beside her face at a 45-degree angle and gliding semi-open shear blades smoothly downward to carve fluid cheekbone-framing layers'],
  ['Scissor-over-comb stacked nape graduation along lower occipital bone', 'pressing a narrow white flat-top barber comb snugly into the lower nape curve and clicking cutting shears rapidly up the comb spine for tight architectural bob stacking'],
  ['Dry freehand visual carving along jawline perimeter ends', 'working on completely dry blown-out hair from beside the low stool, opening shear tips softly to freehand-carve delicate airy movement along the crisp jaw edge'],
  ['Cross-checking vertical crown sections lifted 90° overhead', 'lifting crisp vertical slices of damp crown hair straight overhead perpendicular to the scalp between taut fingers, inspecting and snipping stray uneven tips cleanly in air'],
  ['180° twisted butterfly bang slice directly above nose bridge', 'gathering saturated wet curtain fringe cleanly forward between both hands above the bridge of her nose, twisting once softly before slicing straight across for soft arched cheek wings'],
  ['Ear-tuck reveal & delicate temple sideburn razor feathering', 'sweeping gleaming damp side locks neatly back behind one ear contour while delicately feathering fine baby sideburn wisps beside the tragus with a guarded styling razor'],
  ['Micro-bangs notched texturizing over slim carbon comb spine', 'anchoring short front fringe flat against the teeth of a fine black carbon comb resting gently at brow height while vertical shear points notch airy piecey separation'],
  ['Twisting damp perimeter ribbons & V-notching textured tips', 'twisting damp shoulder-skimming hair bundles loosely along the collarbone between thumb and finger, snipping tiny angled V-notches directly into the twisted ends'],
  ['Measuring symmetrical left-right jaw lengths between thumb & forefinger', 'stepping slightly in front of the low stool to pull down corresponding cheek strands on both sides between thumb and forefinger, verifying razor-accurate millimeter symmetry'],
  ['Cordless detail trimmer carving surgical stacked nape undercut', 'tilting her chin gently forward on the stool while pressing cordless zero-gap T-blade trimmers along bare neck skin beneath lifted damp nape locks for a crisp hidden undercut line'],
  ['Dual titanium foil-shaver gliding zero-stubble clean across exposed neck', 'tautening the bare nape skin smoothly downward with one warm palm while gliding a gleaming foil shaver side-to-side across fine baby hairs below the blunted bob edge'],
  ['Toothed styling razor-comb debulking heavy crown density downward', 'drawing a guarded single-edge styling razor comb softly downward through wet mid-lengths from directly behind the stool to remove internal bulk without sacrificing baseline length'],
  ['Guarded feathering razor carving collarbone ends while clipped dust falls', 'leaning over her right shoulder holding tense collarbone hair outward with his comb hand while slicing fluid wispy tips with a guarded folding feathering razor'],
  ['Continuous spray-bottle soak until dark strands drip along nape', 'pumping continuous fine cooling water mist from an aluminum salon spritzer around her crown and front fringe until dark glossy strands cling smoothly against cheeks and collar'],
  ['Towel-squeezing saturated wet lengths along spine from behind', 'wrapping a thick folded warm cotton salon towel calmly around wet dripping mid-lengths behind her back, gently pressing moisture out with rhythmic downward squeezes'],
  ['Steel pintail comb carving clean zig-zag crown parting', 'tracing the slender steel pin tail of a carbon sectioning comb across the damp crown in a crisp zig-zag stitch so cascading strands interlock without harsh bare scalp lines'],
  ['Unclipping butterfly section clamps layer-by-layer letting wet tiers drop', 'removing colorful plastic butterfly clips systematically from upper quadrants so heavy glossy wet hair tiers cascade over freshly carved underlayers one sheet at a time'],
  ['Setting double-prong aluminum duckbill clips into S-wave cheek ridges', 'shaping gleaming misted hair around her cheekbones into a smooth sculptural S-bend with comb spine pressure and sliding flat aluminum wave clips along each crease'],
  ['Wide-tooth carbon detangler gliding calmly down from root to ends', 'anchoring her crown softly with one steady hand while slowly drawing wide spaced detangling teeth down damp tangled lengths from behind the backless stool'],
  ['Steaming damp herbal towel wrap draped around nape prior to razor pass', 'wrapping a steaming folded hot barber towel snugly beneath her freshly lifted occipital hair against bare nape skin to soften hair follicles prior to straight-razor detailing'],
  ['Dual boar-bristle round brushes rotating jawline ends inward under nozzle heat', 'coordinating heated dryer airflow overhead while slowly curling damp jawline perimeter inward around a dense boar-bristle round barrel brush for a glassy French-bob tuck'],
  ['Wide diffuser bowl cupping wet curls upward from behind for root bounce', 'tilting beside the low stool cradling soft damp waves snugly inside a wide spiked diffuser bowl, pulsing gentle warm heat upward toward the crown for natural spring'],
  ['Hairdryer cool-shot air blast sweeping clipped hair needles off bare neck', 'pressing the cool-shot trigger of the chrome salon dryer inches from her shoulders to sweep loose dark clipped hair needles cleanly off bare skin and cape folds'],
  ['Curling wand carving subtle editorial S-bends around temple tendrils', 'twirling narrow dry temple framing ribbons quickly around a slim ceramic barrel beside her cheek for effortless, touchable editorial wave movement'],
  ['Misting weightless argan shine mist & finger-raking lifted crown volume', 'fanning a cloud of golden shine mist softly above her freshly cut silhouette and sliding spread fingers warmly upward from behind to shake out airy bounce'],
  ['Soft talc-dusted horsehair neck brush sweeping exposed nape & collarbone', 'loading soft bristles delicately with fresh barbershop talcum powder and gliding feathery brush strokes around the back of her neck, ear line, and collarbone'],
  ['Wiping dark clipped hair ribbons off gleaming shear blades on wrist towel', 'pausing briefly behind the stool with hair clamped neatly in his comb fingers to wipe clinging dark clippings cleanly across a white cotton towel draped on his forearm'],
  ['Brushing stray wet cheek wisps gently behind ear with warm fingertips', 'reaching forward beside her face with gentle thumb and index fingertips to tuck clinging damp front wisps cleanly behind her ear before final outline inspection'],
  ['Testing wet spring bounce by lifting freshly blunted ends in open palm', 'cupping the entire damp freshly blunted bottom baseline upward in one flat palm toward her jawline to watch crisp cut ends rebound into shape'],
  ['Slicing subtle internal ghost-layers beneath untouched glossy top canopy', 'holding the intact outer hair canopy lifted smoothly upwards in one hand while cleanly sliding notched shears underneath to carve weightless internal buoyancy'],
  ['Guiding chin slightly upward with two fingers to double-check front curtain line', 'standing attentively beside the low stool, resting two gentle fingertips under her chin to raise her gaze toward room light and inspect symmetrical curtain bang length']
]);

const salonStoolModelPosture = makeOpts([
  ['Upright on backless stool with relaxed composure', 'sitting comfortably upright on the low stool with natural spinal curve, shoulders relaxed, looking forward with quiet poise and calm confidence'],
  ['Head softly tilted as his hands guide her hair', 'head gently tilted to the side under his reassuring touch, hands resting peacefully in her draped lap'],
  ['Looking up into mirror / camera with candid trust', 'glancing slightly upward toward the lens with a calm, trusting, candid expression as he works inches away'],
  ['Eyes softly closed enjoying the tactile sensation', 'eyes gently closed in relaxed bliss, savoring the tactile feeling of his hands and comb moving through her hair'],
  ['Side profile angle with exposed neck', 'turned in side profile on the small stool, long graceful neckline exposed as his shears detail her perimeter'],
  ['Candid conversation mid-snip', 'smiling softly and conversing candidly with the barber as he leans close over her shoulder'],
  ['Hands resting lightly on knees', 'hands resting naturally on her knees under the cutting cape, fully immersed in the intimate barbershop moment'],
  ['Serene chin raised, receptive posture', 'chin slightly raised with relaxed jawline, leaning back subtly into the barber\'s attentive presence'],
  ['Head tilted down exposing crown and nape for barber shears', 'head tilted forward with chin resting toward chest, curving the neck to expose the crown, hairline, and nape while the barber combs and snips the baseline from behind'],
  ['Bent forward with elbows on knees as barber details crown', 'torso bent forward at the waist with elbows resting on knees under the cape, rounding the back and bowing the head forward naturally for precision cutting'],
  ['Head tilted softly downward admiring haircut in cape reflection', 'head tilted softly downward with eyes glancing at the fallen hair clippings on the draped cape, in a quiet, contemplative candid moment'],
  ['Bent slightly down to examine cut hair on floor', 'bending slightly forward and tilting head down to observe the scattered hair clippings accumulated on the salon floor around the stool'],
  ['Turned sideways looking away with hand touching temple', 'turned sideways on the stool looking away from the camera and mirror, raising one hand to her hairline to shield her face from view while the barber details her silhouette'],
  ['Turned away in profile with hair falling forward hiding face', 'turned sideways facing away into the salon background with hair falling forward and shielding her face completely from the lens'],
  ['Turned sideways on stool looking away from camera', 'turned sideways on the low stool looking away from the camera and mirror into the shop, head angled away so her face is not visible to the lens, retaining her natural hair while the barber works'],
  ['Turned sideways in barber chair with arm draped over backrest', 'seated sideways across the hydraulic barber chair with draped cape, one arm resting casually along the chair backrest while her head turns away toward the salon window'],
  ['Flush sideways profile gazing away while barber snips side layer', 'sitting upright in clean lateral profile looking away into the shop, keeping her head turned steadily away as the male barber detail-snips the perimeter line along her ear tuck'],
  ['Turned sideways on stool with hands clasped quietly on lap', 'turned sideways on the low wooden stool with hands resting calmly under the voluminous cutting cape, head angled away into the background enjoying the ambient salon sound'],
  ['Turned sideways leaning against chair armrest gazing past mirror', 'relaxing sideways into the contoured leather chair, shoulder leaning against the padded armrest, head turned away from the mirror gazing toward the bustling shop floor'],
  ['Sideways profile looking into distance as barber combs neckline', 'seated sideways in profile looking out toward the salon entrance, holding natural still posture while the barber stands behind with black comb detailing her neckline'],
  ['Turned sideways on stool with chin angled away toward lap', 'seated sideways on the small stool with torso turned away, chin tilted slightly down and away from the lens, hands resting comfortably under the cape in a candid salon pause'],
  ['Turned sideways observing neighboring styling station', 'seated sideways in the barber chair draped in cape, head angled away to casually watch the barber at the neighboring styling station, revealing her clean side jawline and ear contour'],
  ['Turned sideways on stool resting side of chin on knuckles', 'turned sideways on the low stool with draped cape, resting the side of her chin lightly on bent knuckles while gazing away into the salon interior, face turned away from the camera'],
  ['Leaning slightly back toward barber chest while smiling softly in mirror', 'resting subtly back on the backless stool against the barber’s attentive chest height as he cradles a side section, sharing a warm candid glance into the vanity mirror'],
  ['Chin dipped gently down exposing entire nape for straight-razor shave', 'tipping her head warmly forward on the low stool until her chin brushes the cape edge, revealing a clean curved nape under warm barbershop light'],
  ['Glancing smoothly upward from beneath lowered thick front hair veil', 'angled seated posture on the stool gazing softly upward toward the camera lens from underneath heavy forehead-skimming bangs and cheek tendrils'],
  ['Crossing ankles delicately around chrome stool foot-ring under cape', 'seated calmly upright on the backless stool with ankles hooked gracefully around the polished circular chrome foot-ring as the cape drapes neatly to mid-calf'],
  ['Tilting head cleanly 35° sideways draping hair across one cheek', 'tilting her crown playfully to the side on the open stool, allowing one long front curtain section to spill smoothly across her upper cheek and outer eye edge'],
  ['Holding both hands neatly clasped together inside draped cape lap', 'sitting centered on the low stool with relaxed rounded shoulders and hands laced gently together beneath the smooth dark cape cloth'],
  ['Turning torso 45° sideways on swivel stool checking asymmetrical jaw corner', 'pivoting her hips softly sideways on the smooth backless seat while angling her chin cleanly toward the mirror to examine newly carved diagonal tips'],
  ['Eyes drifting calmly shut as razor blade hums softly along neckline hairline', 'seated still in serene concentration on the stool with eyelids resting closed as a traditional straight razor clears fine fuzz softly along the back of her neck']
]);


const salonChairPose = makeOpts([
  ['Natural relaxed seated posture in hydraulic chair', 'seated calmly upright in the black leather hydraulic barber chair, shoulders relaxed beneath the draped cutting cape and hands resting comfortably in her lap'],
  ['Chin dipped gently down toward chest exposing nape for razor work', 'seated squarely with her chin dipped softly forward toward her chest, elongating the back of her neck to expose the clean hairline and nape while the barber details the perimeter'],
  ['Head tilted 30° sideways toward shoulder for bob line precision', 'tilting her head smoothly 30 degrees toward one shoulder while holding perfectly still beneath the cape so the barber can carve an ultra-crisp jawline perimeter'],
  ['Leaning slightly back into plush headrest with chin softly raised', 'leaning back comfortably against the tufted Belmont leather headrest with her chin angled gently upward, extending her throat and jawline calmly as work proceeds near the neck'],
  ['Seated slightly sideways (45° swivel) glancing coyly at camera', 'seated casually at a 45-degree swivel angle in the styling chair with draped cape falling across one shoulder, turning her eyes lightly toward the lens with effortless charm'],
  ['One hand peeking under cape collar lightly brushing cut cheek strands', 'resting casually back in the chair as two fingers peek just beneath the snapped cape collar to brush tiny tickling clipped hairs off her cheek'],
  ['Hands clasping draped cape edges beneath chin with shy downward gaze', 'lightly holding the folded edges of the cutting cape together from underneath near her sternum while dipping her gaze softly in a candid mid-cut moment'],
  ['Leaning forward toward vanity mirror inspecting fresh front fringe', 'leaning torso forward slightly toward the mirror edge with elbows resting on padded thighs under the cape, lifting her brows subtly to inspect eyebrow-level bang length'],
  ['Forearms resting along polished chrome armrests under flowing cape', 'settling heavily into the wide vintage chair with both forearms draped calmly along the chrome leather armrests beneath the tented satin cape'],
  ['Reclined 45° back in pumped-down hydraulic chair for face-frame work', 'reclined smoothly at a 45-degree hydraulic chair tilt with ankles crossed on the metal footrest, completely trusting and serene during close frontal styling'],
  ['Head turned 60° toward window light highlighting tapered cheekbone cut', 'angled three-quarters toward the glowing front window light, chin poised to trace the crisp geometric corner of her freshly cut front perimeter'],
  ['Resting cupped chin lightly above cape collar during cutting pause', 'pausing comfortably between sections with her chin lifted neatly clear of the white crêpe neck strip and hands tucked peacefully inside the cape folds'],
  ['Subtle playful shoulder shrug while clipped locks slide down vinyl cape', 'giving a candid, breezy mini-shrug beneath the cape as newly snipped locks slip silently down the shiny nylon drape onto the salon floor'],
  ['One ear tucked cleanly back holding other profile steady for trim', 'tucking one side firmly behind the ear while holding her jawline level so the barber compares symmetrical front length from side to side']
]);

const salonBarberPose = makeOpts([
  ['Standing beside chair leaning closely over shoulder with razor precision', 'the adult female model acts as the skilled barber standing tightly beside the hydraulic chair with torso hinged slightly forward, elbows braced smoothly near the headrest as she works with razor precision'],
  ['Poised directly behind hydraulic headrest bracing comb & shears', 'the adult female model stands upright right behind the pumped chair headrest, forearms framing the male client’s crown as she guides sections with calm authority'],
  ['Knee slightly bent crouched toward client eye-level checking fade line', 'the adult female model bends gently at the knees beside the chair armrest to bring her eyes flush with the male client’s temple fade and sideburn geometry'],
  ['Side-profile artisan stance anchoring client’s forehead gently with thumb', 'the adult female model stands in sleek three-quarter profile beside the chair, resting her free hand lightly along the male client’s forehead or temple to steady his tilt'],
  ['Resting one forearm lightly across chair back leaning in for beard detail', 'the adult female model braces one forearm across the chrome backrest rim while leaning closely in toward her reclined male client to detail beard and cheek lines'],
  ['Walking gracefully around chair perimeter inspecting symmetry', 'the adult female model steps smoothly around the front corner of the hydraulic chair, tilting her head slightly to appraise left-to-right balance with tools held cleanly in hand'],
  ['Intimate close stance bracing jaw gently for straight-razor cheek pass', 'the adult female model stands inches from the reclined male client’s chest level, tautening cheek skin gently with two clean fingers while pulling a smooth straight-razor stroke'],
  ['Relaxed post-service stance draping fresh towel & neck brush around chair', 'the adult female model stands calmly behind the chair unfastening the cape clip and brushing stray neck clippings away with poised, welcoming body language']
]);

const salonClientExpressions = makeOpts([
  ['Quiet satisfaction in mirror', 'watching her hair transformation in the mirror with quiet satisfaction, relaxed eyes, and a subtle self-assured smile'],
  ['Warm soft closed-lip smirk & bright natural eyes (candid barbershop charm)', 'a warm, genuine soft-closed-lip smirk with subtle dimples and bright, candid dark eyes looking comfortably forward during close razor/shear detailing'],
  ['Relaxed contemplative poise', 'a calm, contemplative expression with soft eyes and relaxed facial muscles as shears work around her face'],
  ['Anticipatory joyful smile', 'an anticipatory, joyful half-smile as she watches the shape of the new haircut emerge in the mirror'],
  ['Closed-eyes basin wash bliss', 'eyes gently closed in serene bliss, completely relaxed and savoring the tactile wash and scalp massage'],
  ['Direct confident eye contact with reflection', 'holding direct, confident eye contact with her reflection in the mirror, chin slightly raised with poised allure'],
  ['Surprised joyful reveal delight', 'a spontaneous, delighted gasp and joyful expression as the cape is shaken out to reveal the finished haircut'],
  ['Amused candid mid-conversation laughter', 'natural candid laughter with crinkled eyes while chatting effortlessly with the barber mid-snip'],
  ['Serene trusting calm', 'a completely serene and trusting expression, head resting obediently as the stylist details her perimeter'],
  ['Subtle playful smirk', 'a playful, mischievous smirk reflected in the vanity mirror as she runs her fingers through the freshly cut fringe'],
  ['Focused appraisal of bangs and layers', 'attentive, appreciative gaze focused on the fresh curtain bangs and face-framing layers in the mirror'],
  ['Warm approachable glow', 'a warm, approachable expression with bright eyes, soft relaxed smile, and glowing post-makeover excitement'],
  ['Cool unbothered editorial aloofness', 'a cool, unbothered high-fashion editorial expression with relaxed lips and calm, piercing gaze'],
  ['Soft awe touching freshly cut ends', 'an expression of soft awe and wonder as she lightly touches the blunt edges and silky texture of her new cut'],
  ['Subtle relief and renewed confidence', 'a subtle exhale of relief and renewed feminine confidence seeing the gorgeous silhouette in the glass'],
  ['Intrigued curious glance at scissors', 'an intrigued, curious sidelong glance watching the barber\'s precise scissors cut through damp strands'],
  ['Radiant post-blowout euphoria', 'radiant euphoria and beaming happiness as the blow-dryer lifts voluminous bouncy layers around her cheekbones'],
  ['Gentle head-tilt appreciation', 'tilting her head with an appreciative smile, admiring how the layers cascade along her jawline'],
  ['Thoughtful mirror consultation', 'a thoughtful, engaged expression discussing length and styling options while looking into the vanity glass'],
  ['Coy downward-eyelid blush while strands fall', 'softly lowered eyelids and a coy quiet blush as cut strands tumble down the cape around her cheeks'],
  ['Playful lip-bite concentration watching perimeter check', 'an understated playful lip-bite concentration while eyeing the razor-sharp perimeter line in close view'],
  ['Sleepy sun-warmed barbershop serenity', 'languid heavy-lidded relaxation catching the rhythmic snip of stainless shears in warm afternoon light'],
  ['Poised micro-chin-raise testing sharp jawline reveal', 'tilting her chin subtly upward with poised assurance as the shortened bob opens up her slender neckline'],
  ['Delighted eye crinkle catching loose mist spray', 'a delicate reflexive eye crinkle and bright candid laugh as cool water mist hits her temple locks'],
  ['Relaxed dreamy gaze peeking softly through parted bangs', 'a relaxed, slightly dreamy gaze peeking earnestly through softly parted damp bangs draped halfway across her cheek']
]);

const salonCape = makeOpts([
  ['Classic black nylon cutting cape with cut hair clippings', 'a silky black nylon salon cutting cape snapped snugly around the neck over a white sanitary paper collar strip, with scattered cut hair fragments resting visibly across the draped shoulders'],
  ['Vintage blue and white pinstriped barber cape', 'a classic vintage barber cape with blue and white vertical pinstripes, draped broadly over the client\'s chest and lap with fresh cut hair dusting'],
  ['White waterproof salon cape with hair fragments', 'a clean white waterproof salon cape draped over the client, contrasting sharply with fallen hair clippings on the shoulders'],
  ['Dusty rose cotton kurti visible beneath draped cape', 'a relaxed dusty rose-pink split-neck cotton kurti peeking out beneath a partially draped black salon cape with cut hair fragments'],
  ['Silver metallic styling cape with hair clippings', 'a modern reflective silver salon cape draped over shoulders with scattered cut hair strands'],
  ['Fresh clean towel & cape (consultation start)', 'a clean freshly draped black salon cape with a white cotton salon towel tucked snugly around the neck, completely clean with zero hair clippings yet'],
  ['Translucent viewing-window black salon cape', 'an innovative black nylon cape featuring a clear transparent vinyl viewing window across the lap, allowing client hands to rest comfortably under the cape while cut hair scatters on the shoulders'],
  ['Crimson burgundy barber cape with gold snaps', 'a rich deep burgundy-red barber cape with polished brass snap buttons along the neck collar, draped over the shoulders with fine cut hair fragments'],
  ['Matte charcoal-gray salon cape with snap collar', 'a sleek charcoal-gray polyester cape with an adjustable silicone waterproof neck seal and light cut hair clippings'],
  ['Traditional red and white striped barber cape', 'a vibrant red and white vertical candy-striped barber cape draped over chest and lap, giving an iconic retro barbershop look with scattered hair clippings'],
  ['Forest green salon cape with white collar strip', 'a deep emerald-forest green waterproof cutting cape fastened over a fresh white neck tissue strip with fine fallen hair ends'],
  ['Sheer lightweight navy salon drape over casual t-shirt', 'a lightweight breathable dark navy cutting drape loosely fastened at the neck, with client\'s casual crew-neck t-shirt collar visible beneath'],
  ['Heavyweight black vinyl chemical & cutting cape', 'a thick glossy black vinyl waterproof salon cape draped heavily over the styling chair arms, with water droplets and cut hair clippings clinging to the surface'],
  ['Double-towel neck wrap with classic black cape', 'thick dual white salon towels layered around the neck for maximum comfort under a snug black nylon cutting cape with scattered hair dust'],
  ['Gold-trimmed luxury black satin cutting cape', 'an upscale luxury black satin salon cape with gold piping along the edges, draped gracefully with fine micro-hair clippings resting on the shoulders'],
  ['Royal blue waterproof cape with snap fasteners', 'a rich royal blue waterproof barber cape snapped securely at the neck with fallen cut hair fragments visible against the vibrant fabric'],
  ['Retro barber tool motif printed black cape', 'a retro black cape printed with subtle white vintage shears, combs, and barber pole graphics, dusted with realistic hair clippings'],
  ['Sunny yellow retro vinyl barber cape', 'a cheerful vintage yellow salon cape with black edge binding, draped over the styling chair with cut hair dust scattered on the lap'],
  ['Earthy terracotta cotton-blend drape over embroidered kurti', 'a warm terracotta rust-colored cotton salon drape loosely fastened, revealing an embroidered traditional Indian kurti collar at the neckline'],
  ['Soft lavender waterproof cape with sanitary neck strip', 'a calming pastel lavender cutting cape with a clean white crêpe collar, accented by a scattering of cut hair ends across the chest'],
  ['Black cape with sporty red contrast racing stripes', 'a contemporary sporty black salon cape featuring twin red accent stripes down the arms, dusted with fresh cut hair fragments'],
  ['Loosened cape neckline revealing collarbone post-cut', 'the black nylon cape partially unsnapped at the throat, loosely falling open to reveal the client\'s collarbone, silver necklace, and satisfied post-makeover expression'],
  ['Loosened cutting cape revealing ribbed cropped tank & distressed denim shorts', 'the black nylon cutting cape partially unsnapped at the neck, draped loosely over a casual white ribbed cropped tank top and distressed denim cutoff shorts dusted with fallen hair ends'],
  ['Cape partially unfastened showing white baby tee & high-waisted denim cutoffs', 'the cape partially unfastened after the blowout, revealing the client\'s vintage white baby tee and high-waisted raw-hem denim cutoff shorts'],
  ['Black salon cape draped loosely over casual cropped halter top & denim waistband', 'a silky black cutting cape resting loosely over the client\'s shoulders, revealing an olive-green knit halter crop top and the waistband of relaxed denim shorts'],
  ['Sheer lightweight navy salon drape over graphic crop tee & denim shorts', 'a lightweight dark navy salon drape loosely fastened around the neck, with a vintage graphic crop tee and frayed denim cutoff shorts visible beneath'],
  ['Dusty rose cutting cape peeking open over square-neck crop top & vintage denim', 'a dusty rose-tinted cutting cape slightly parted down the front, revealing a fitted square-neck cotton crop top and classic medium-wash denim shorts'],
  ['Unsnapped cape collar revealing collarbone, crop top, and frayed denim shorts post-makeover', 'the barber cape completely unsnapped at the collar and pushed back over the shoulders, showing the model\'s bare collarbone, ribbed crop top, and frayed denim shorts as she admires the finished cut'],
  ['Classic striped barber cape over black bandeau crop top & low-rise denim', 'a retro pinstriped barber cape draped across the lap, leaving a black stretch bandeau crop top and low-rise denim shorts visible at the chest and waist'],
  ['Silky black salon cape parted over asymmetric crop top and cutoff denim shorts', 'a silky black cape parted slightly over the torso, showing an asymmetric one-shoulder ribbed crop top and cutoff denim shorts with subtle frayed hem detail'],
  ['Clean white salon cape loosely draped over cropped baby tee & distressed denim', 'a crisp white salon cape loosely draped around the neck over a soft grey cropped baby tee and distressed denim shorts dusted with hair clippings'],
  ['Vintage leather barber chair seating with cape falling back over crop top & denim shorts', 'the client seated in the vintage leather hydraulic chair with the cutting cape falling naturally back over her shoulders, revealing a fitted ribbed crop top, silver navel accent, and denim cutoffs']
]);

const salonStationProps = makeOpts([
  ['Authentic barber counter with talc, Dettol & comb jar', 'a glass barber counter lined with a blue Barbicide jar holding combs, a vintage talcum powder shaker, bottle of Dettol, aluminum water spray bottle, and folded towels'],
  ['Styling trolley with shears, clips & hairdryer', 'a rolling black salon trolley beside the chair equipped with sectioning alligator clips, texturizing shears, round brushes, and a professional hairdryer'],
  ['Scattered hair clippings on vinyl floor around chair', 'the base of the hydraulic barber chair surrounded by scattered fallen hair clippings on the salon vinyl floor'],
  ['Water spray bottle with fine mist droplets', 'a brushed-metal water spray bottle resting on the shelf, with fine water droplets misting the air'],
  ['Minimalist counter with premium hair serum & mirror lights', 'a clean modern salon station with luxury amber glass serum dropper bottles, carbon tail combs, and bright mirror vanity bulbs'],
  ['Vintage razor strop, alum block & stainless tray', 'a stainless steel instrument tray holding straight razor, white block of alum, round shaving bowl with lather brush, and antiseptic lotion'],
  ['Multiple scissor shears on magnetic strip with oil bottle', 'a wall-mounted magnetic tool strip holding 4 different precision shears (blunt cutting, thinning, swivel shear) and a small clipper oil dropper bottle'],
  ['Hot towel warmer cabi with steaming rolled towels', 'a compact stainless steel towel warmer on the counter with a stack of warm, steaming white rolled towels ready for client comfort'],
  ['Salon hair color bowls, tint brushes & foil sheets', 'a salon side table holding mixing bowls with cream tint, wide application brushes, and neatly torn silver foil sheets'],
  ['Barber clipper caddy with color-coded guard combs', 'a countertop charging station with cordless magnetic clippers and a neat rack of colorful guard combs (1/8 inch to 1 inch)'],
  ['Ceramic round blowout brushes and styling mousse', 'a wooden shelf holding ceramic thermal round brushes in varied diameters, professional nozzle hairdryer, and styling mousse foam'],
  ['Traditional Indian brass attar perfume bottle & rosewater spritzer', 'a traditional Indian salon touch: vintage brass rosewater spray dispenser, herbal hair oil bottle, and fresh marigold garland on the mirror frame'],
  ['Vintage chrome hydraulic pump lever & footrest', 'the heavy chrome-plated hydraulic foot pedal, base ring, and textured metal footrest of an authentic vintage styling chair'],
  ['Disinfectant spray bottle, neck tissue roll & hair grips', 'a clear disinfectant spray bottle, wall-mounted dispenser roll of white crêpe neck paper, and a jar of black bobby pins and hair grips'],
  ['Rubber station work mat with cordless clippers and fade brush', 'a heat-resistant black rubber barber station mat holding cordless gold-accented clippers, a boar bristle fade brush, and precision clipper oil'],
  ['Vintage glass hair tonic bottles with labeled apothecary tops', 'a wooden shelf lined with vintage glass hair tonic and cologne bottles featuring retro Indian labels and chrome spouts'],
  ['Professional ionic hairdryer resting in spiral holster', 'a matte-black professional salon hairdryer with narrow styling concentrator nozzle resting securely in a coiled metal side holster on the trolley'],
  ['Clear acrylic station organizer with tail combs and alligator clips', 'a neat clear acrylic organizer holding assorted carbon cutting combs, sectioning alligator clips, and wide-tooth detangling combs']
]);

const salonCamera = makeOpts([
  ['Direct mirror reflection POV (shot through the glass)', 'photographed directly into the large salon wall mirror, capturing the client\'s front reflection, the male barber\'s hands, and the full styling station reflected with optical depth'],
  ['Candid 3/4 styling chair portrait', 'an eye-level 3/4 candid portrait from the side, framing the client in the black leather chair with the draped cape and ponytail profile'],
  ['Over-the-shoulder rear angle past the barber', 'an intimate over-the-shoulder perspective looking past the male barber toward the client\'s facial reaction in the mirror'],
  ['Close-up macro on curtain bangs and shears', 'a tight beauty close-up focused on the client\'s eyes and arched bottleneck curtain bangs, with shears mid-trim in crisp focus'],
  ['Wide atmospheric salon interior composition', 'a wide horizontal frame capturing the full salon atmosphere, adjacent barber chairs, background mirrors, and the client centered in the foreground chair'],
  ['Low-angle chair portrait looking up at the mirror', 'a dramatic low-angle perspective looking slightly upward from chair armrest height, emphasizing confident posture and facial reflection in the glass'],
  ['Side profile framing nape and ponytail anchor', 'a razor-sharp side profile angle showcasing the neck curve, clean ear tuck, and ponytail base against the salon backdrop'],
  ['Close-up mirror reflection with blurred barber shoulder', 'portrait focused sharply on client\'s face and bangs in the mirror, with blurred male barber shoulder in the foreground framing the composition'],
  ['Cinematic overhead bird\'s eye chair POV', 'an artistic high-angle camera looking down at the client in the chair, draped cape fanning out, and scattered cut hair on the vinyl floor'],
  ['Medium shot with front shop window street bokeh', 'a frontal portrait of client in chair with background window revealing warm blurred outdoor street lights and market activity'],
  ['Straight-on symmetrical vanity mirror portrait', 'a centered symmetrical portrait looking square into the illuminated vanity mirror, framing the client evenly between warm bulb fixtures'],
  ['Dutch angle candid from styling trolley perspective', 'a dynamic low-angled Dutch tilt perspective framing the corner of the tool trolley in the foreground with the client and mirror behind'],
  ['Infinite reflection through opposing dual mirrors', 'a captivating double-mirror perspective with front and rear mirrors creating infinite recursive reflections and deep optical salon geometry'],
  ['Extreme close-up on shears and finger cutting tension', 'a macro close-up focused exclusively on the male barber\'s fingers holding a taut wet hair strand as the scissor blades slice cleanly through'],
  ['Behind-the-chair portrait showing handheld mirror angle', 'a candid perspective from behind the chair showing the male barber holding up an oval handheld mirror framing the back of the client\'s new haircut'],
  ['Street-level documentary view through the shop doorway', 'a candid documentary street perspective looking through the open salon doorway from the sidewalk, framing the brightly lit haircut scene within'],
  ['Low stool-height raking angle on draped silhouette', 'a low camera angle placed near footrest height looking upward, emphasizing the cascading drape of the cutting cape and the model\'s poised jawline'],
  ['Macro straight razor on nape with warm lather', 'an ultra-sharp macro detail shot focused on a classic chrome straight razor cleaning the nape hairline against rich warm lather'],
  ['Over-barber\'s-forearm perspective framing shears', 'an intimate photographic perspective shot right over the barber\'s rolled-up sleeve forearm, framing the scissor tips slicing damp strands'],
  ['Floor-level shot of fallen hair clippings', 'an artistic low floor-level angle capturing crisp scattered hair clippings on the salon tile, with the chair base and client\'s shoes in shallow focus behind'],
  ['High-angle shampoo basin wash perspective', 'a gentle 45-degree high-angle view looking down at the ceramic shampoo basin, water mist droplets, and the client\'s relaxed profile during the wash'],
  ['Split-diopter dual focus: shears foreground & mirror reflection', 'a split-diopter optical shot keeping both the barber\'s shears in extreme foreground and the client\'s expressive eyes in the background mirror tack-sharp'],
  ['Handheld brass mirror secondary angle reveal', 'a candid medium shot capturing the barber holding an ornate handheld mirror showing the client her rear neckline from a flattering 45-degree angle'],
  ['Trolley flat-lay with styling tools and mirror bokeh', 'an editorial perspective angled over the styling trolley showing combs, clips, and tonic bottles in sharp relief with the haircut scene in soft bokeh'],
  ['Tight 85mm portrait focusing on parted wet fringe', 'an 85mm f/1.4 prime portrait isolating the client\'s eyes and glistening wet fringe with creamy optical background bokeh'],
  ['Wide cinematic 2.39:1 letterbox salon panorama', 'a wide cinematic 2.39:1 widescreen frame capturing the entire salon length, neon wall signage, multiple mirrors, and the bustling haircut action'],
  ['35mm documentary snapshot with natural room blur', 'a candid 35mm photojournalistic perspective capturing authentic motion blur, barber\'s comb movement, and unposed salon realism'],
  ['Profile shot through hanging salon plants and vintage glass', 'an atmospheric peek-through composition shot through hanging salon greenery and vintage ribbed glass partitions framing the chair'],
  ['Ultra-close macro on blow-dry round brush tension', 'a tight macro shot on the bristles of a ceramic round brush lifting hair at the roots under the concentrated airflow of the dryer nozzle'],
  ['Sideways angle: client looking away with hand shielding face', 'a side-angle camera perspective where the client in the salon is turned sideways looking away from the camera, with one hand raised to her temple/forehead lightly shielding her face so her facial features remain completely concealed, highlighting her haircut silhouette, hair texture, and draped cape'],
  ['Side-profile turned away with hair concealing face', 'a side-profile camera angle capturing the client turned sideways facing away into the salon background, with her hair naturally falling forward to fully obscure her face from the lens, focusing on her haircut perimeter and cape drape with zero facial exposure'],
  ['Sideways angle: client turned looking away into shop', 'a side-angle camera perspective capturing the client turned sideways looking away from the camera into the salon background, her head angled away so her face is not visible to the lens, retaining her natural hairstyle and focusing on her haircut perimeter, hair texture, and draped cape with zero facial exposure'],
  ['Sideways lateral 90-degree chair profile framing haircut baseline', 'a flush 90-degree lateral camera angle from the side of the styling station, framing the client\'s side profile, the clean haircut perimeter line, and the male barber standing beside inspecting balance'],
  ['Sideways low footrest-level profile looking up at chair', 'a low floor-level raking side perspective shot just above the chair footrest looking upward, emphasizing the dramatic vertical silhouette of the draped cape, jawline, and ear-tuck contour'],
  ['Sideways wide-aperture 85mm profile isolating ear & perimeter layers', 'an 85mm f/1.4 telephoto side-profile portrait with shallow depth of field, rendering the client\'s cheekbone and face-framing hair perimeter tack-sharp against creamy blurred salon mirrors'],
  ['Sideways over-the-trolley perspective past styling tools', 'a cinematic side-angle composition framed over the metallic tray of the salon trolley in the foreground, looking past scissors and clips directly at the client\'s poised side profile'],
  ['Sideways diagonal 3/4 rear-side angle capturing nape & cape drape', 'a diagonal rear-side profile angle framing the back of the neck, natural hairline curvature, and the expansive geometric folds of the cutting cape across the back of the chair'],
  ['Sideways profile glance through antique fluted glass divider', 'an atmospheric side-profile shot taken through semi-opaque vintage ribbed glass partitioning, capturing the client\'s side silhouette with soft painterly salon light refractions'],
  ['Very close to action: tight chest-up direct shot of barber razor/shears at neck', 'an ultra-close direct chest-up 3/4 portrait taken just two feet from the styling chair; the client\'s expressive face, parted front bob tendrils, and black cape shoulders dusted with cut hair clippings fill 70% of the foreground while the male barber leans tightly in beside her left shoulder holding a folding straight razor or shears pressed delicately against her right neckline/nape in razor-sharp closeup, with real all-male barbershop stations and glass wall mirrors softly receding in authentic background depth'],
  ['Very close to action: intimate 28mm handheld chest-up front haircut POV', 'a very close 28mm handheld documentary chest-up framing inches from the active cutting zone; capturing the client\'s eyes and parted bangs filling the immediate frame while the barber\'s fingers tension damp locks and steel shears snip along the jawline, leaving fine hair snippets resting on the snapped black cape collar'],
  ['Very close to action: tight jaw & collarbone perimeter snip crop', 'an ultra-tight chin, jaw, and cape-collar close-up shot right beside the cutting blade; natural neck skin pores, snapped vinyl collar strip, fine fallen hair snippets on cape shoulders, and the barber\'s braced hands snipping crisp perimeter geometry below the earlobe dominate the frame'],
  ['Very close to action: over-cape-shoulder macro framing razor/clipper nape detail', 'a very close low-3/4 action framing angled right past the client\'s draped cape shoulder into the active neck and nape detailing zone; the leaning male barber\'s concentrated profile and razor-holding hand beside the client\'s slightly tilted chin fill the immediate foreground'],
  ['Very close to action: tight front bang & eyebrow shear-snip close-up', 'an ultra-close eye-to-mouth level close-up positioned directly in front of the styling chair, capturing fine black carbon comb teeth parting damp front fringe inches from her nose bridge as sharp shear tips slice across brow level'],
  ['Very close to action: intimate side-cheek & earlobe scissor-point close-up', 'a very close cheek-level 3/4 action crop capturing the barber\'s braced fingers clamping a damp section of jawline hair right beside her cheekbone and earlobe as gleaming silver scissor blades close millimeters from the skin'],
  ['Very close to action: selfie-distance wide frontal barbering shot (clippings on cape)', 'a very close 32mm selfie-distance direct frontal barbershop shot with the client looking warmly past parted face-framing layers and small cut hair clippings clinging to her black cutting cape, while the barber leans closely in from one side trimming her perimeter right at neck height'],
  ['Very close to action: mirror-edge close-up framing hands at neck and eye contact', 'an ultra-tight mirror-side close-up capturing the client\'s direct eye contact and subtle smirk in the immediate foreground alongside the barber\'s focused face and razor-detailing hand right at her neckline'],
  ['Very close to action: over-the-shears macro through falling damp cut strands', 'an ultra-tight macro close-up aligned right behind gleaming Japanese cutting shears as dark cut hair strands slice cleanly away in mid-air before landing on her cape shoulders'],
  ['Very close to action: flat-iron steam & glassy C-curve bevel macro at jaw', 'a super-close jawline beauty crop framing glistening sleek hair strands sliding smoothly through heated titanium plates into a luminous inward C-curve bevel inches from her collarbone'],
  ['Very close to action: butterfly clip-release cascade framing falling wet tier', 'a tight close-up focused on the barber\'s fingertips popping open a dark matte salon clip so a thick sheet of glossy misted hair tumbles smoothly down past her temple and jawline'],
  ['Very close to action: shampoo basin macro framing foamy scalp massage & water sheen', 'an intimate close-up angled directly over the porcelain backwash rim framing rich aromatic lather bubbles, barber fingertips kneading wet roots, and gleaming aquatic light highlights']
]);

const salonLighting = makeOpts([
  ['Overhead salon fluorescent tubes & mirror practicals', 'authentic salon lighting with cool fluorescent ceiling tubes balanced by warm vanity mirror practical lights, rendering realistic highlights on hair'],
  ['Warm vanity mirror bulb glow', 'flattering soft warm light emitted by round LED vanity bulbs framing the mirror, casting gentle fill onto the face'],
  ['Daylight pouring through front shop glass window', 'bright natural street daylight flooding through the front salon window, mixed with ambient indoor practicals'],
  ['Dramatic ring-light illumination with circular catchlights', 'a professional salon ring light positioned in front of the mirror, casting circular catchlights into the client\'s eyes and crisp edge definition onto the hair'],
  ['Soft warm tungsten ceiling bulbs with golden glow', 'warm ambient incandescent salon lighting giving skin tones a flattering, rich golden warmth and cozy atmosphere'],
  ['High-key white LED studio panel lighting', 'ultra-clean, even, shadowless white LED salon lighting highlighting strand definition, micro-droplets, and authentic hair gloss'],
  ['Moody cinematic chiaroscuro with single mirror spotlight', 'dramatic directional light from a single vanity fixture creating striking contrast, deep shadows, and rich tactile texture'],
  ['Neon shop sign glow mixed with ambient practicals', 'retro red and blue neon light spill from front shop sign blending with warm salon mirrors and atmospheric reflections'],
  ['Golden late-afternoon sunbeam shaft through room haze', 'a visible diagonal sunbeam of warm late-afternoon sunlight cutting through ambient salon dust and hair spray haze, illuminating the chair'],
  ['Soft diffuse north-facing window light', 'gentle, flattering natural north-facing window light creating smooth tonal roll-off, soft shadows, and painterly hair sheen'],
  ['Low-key moody ambient lighting with illuminated mirror only', 'atmospheric low-key salon lighting with dimmed shop surroundings and only the central styling mirror vanity glowing brightly'],
  ['Bright commercial halogen track lighting with hair glints', 'high-intensity overhead halogen track lights casting sharp, sparkling specular glints across glistening damp hair strands']
]);

const salonBustle = makeOpts([
  ['Empty shop — completely quiet, serene & private', 'an empty shop with zero other customers; serene, peaceful atmosphere where the female model is the sole client in the room'],
  ['Sparse — 1 other male customer waiting quietly on bench', 'a calm, quiet shop atmosphere with only one other male customer seated on the wooden waiting bench reading a newspaper'],
  ['Moderate — 2–3 male customers in background', 'a typical calm afternoon with two to three male customers in the shop—one paying at the counter and two seated on the waiting bench'],
  ['Bustling — all neighboring chairs occupied by male clients', 'a lively, bustling salon atmosphere with all neighboring hydraulic chairs occupied by male clients receiving cuts and shaves from male barbers'],
  ['Heavily crowded / Packed — waiting bench full of male patrons', 'a packed rush-hour shop with a full bench of waiting male patrons engaged in lively banter, clippers buzzing, and energetic neighborhood buzz'],
  ['Quiet closing time — last appointment with street darkening', 'a quiet late-evening atmosphere near closing time with the outdoor street darkening, shop shutters half-drawn, and warm interior lights focused on the final client']
]);

const salonQuality = makeOpts([
  ['Photorealistic 35mm documentary salon photography', 'raw documentary salon photo, 35mm lens, natural film grain, authentic skin texture with visible pores, realistic stray hair physics, zero plastic smoothing, zero artificial AI sheen'],
  ['Cinematic 50mm candid portrait with shallow depth of field', 'candid 50mm portrait with shallow depth of field softly blurring the background salon stations while keeping the client\'s eyes and bangs razor sharp'],
  ['High-end fashion editorial documentary', 'polished editorial documentary aesthetic with rich contrast, authentic lighting balance, and believable texture'],
  ['Vintage 1990s color film snapshot', 'nostalgic 1990s 35mm film aesthetic with slightly warm color cast, gentle grain, and authentic candid imperfections'],
  ['Gritty street documentary style with deep contrast', 'gritty street documentary photo style with deep shadows, rich contrast, and unvarnished realism'],
  ['Medium-format portrait clarity (Hasselblad feel)', 'exquisite medium-format portrait clarity with lifelike dimensional depth, pin-sharp iris detail, and natural optical falloff'],
  ['Kodak Portra 400 aesthetic with glowing skin tones', 'warm, natural skin tones inspired by Kodak Portra 400 film, soft highlight roll-off, rich hair shadow detail, and fine organic grain'],
  ['Fujifilm Superia street documentary color palette', 'vivid authentic street photography tones inspired by Fujifilm Superia, punchy greens and cool blues under fluorescent tubes, and lifelike contrast'],
  ['Monochrome high-contrast fine art salon photo', 'striking black-and-white documentary photography with deep velvety blacks, luminous silvery midtones, and graphic hair silhouettes'],
  ['Intimate 85mm editorial portrait with creamy background bokeh', 'an intimate 85mm portrait with creamy background compression, rendering salon reflections into soft bokeh circles while keeping the haircut crisply defined']
]);

const salonHairTexture = makeOpts([
  ['🔒 Preserve original reference hair texture', 'strictly preserve the client\'s authentic natural organic hair strand texture, strand thickness, density, and natural behavior from reference'],
  ['Natural silky-fine Indian hair texture with healthy gloss', 'authentic thick, silky-fine natural Indian hair texture with delicate strand separation and healthy salon blowout gloss'],
  ['Soft straight-to-subtle-wave blowout texture', 'smooth straight-to-gently-tapered blowout curve with natural movement and realistic flyaways'],
  ['Lived-in organic texture with fine cut hair dust', 'natural lived-in strand texture with realistic hair density and fine fallen hair clippings on the surface'],
  ['Damp weighted hair texture with water sheen', 'damp weighted hair texture clinging naturally under light water spray tension'],
  ['Thick coarse natural Indian hair fiber with density', 'rich voluminous natural coarse Indian hair fiber with authentic dense strands and organic movement'],
  ['Fine silky sleek hair texture with glass-like sheen', 'ultra-fine silky smooth hair fiber with mirror-like shine and lightweight fluid drape'],
  ['Freshly washed towel-damp wavy texture', 'naturally damp hair beginning to air-dry with subtle organic wave definition and clean strand separation'],
  ['Soft natural frizz and delicate baby hair flyaways', 'hyper-realistic authentic hair behavior with soft micro-flyaways at the hairline and temples, completely free of artificial smoothing'],
  ['Rich oiled traditional Indian hair luster', 'deep rich natural luster reminiscent of traditional herbal hair care, with deep strand nourishment and healthy weight']
]);

const salonClipperGuards = makeOpts([
  ['Auto (Adapts to chosen haircut)', ''],
  ['#0 Bald Skin Fade (Zero foil shaver down to skin)', 'faded with a zero-gap shaver down to clean skin along the nape and lower perimeter'],
  ['#0.5 Shadow Fade (1/16" / 1.5mm micro-stubble)', 'tapered with a #0.5 guard creating a soft shadow fade into skin'],
  ['#1 Clean Fade (1/8" / 3mm clipper guard)', 'sculpted cleanly with a #1 magnetic clipper guard providing crisp edge definition'],
  ['#2 Taper Length (1/4" / 6mm clipper guard)', 'shaped with a #2 clipper guard leaving smooth uniform clipper density'],
  ['Scissor-over-comb artisan taper (No electric clippers)', 'blended with fine scissor-over-comb hand technique and carbon comb teeth with zero electric clippers']
]);


const escapeHtml = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const salonCollageScenes = makeOpts([
  // Preparation & Consultation
  ['In-Chair Consultation & Hair Evaluation', 'consultation_chair', 'consultation in styling chair discussing desired length and silhouette', 'Preparation & Consultation'],
  ['Relaxed Chai/Coffee Consultation at Counter', 'consultation_chai', 'candid beverage consultation at station counter before cutting', 'Preparation & Consultation'],
  ['Fastening Nylon Cape & Crêpe Neck Strip', 'cape_neck_strip', 'barber fastening black nylon cape with crêpe paper neck strip', 'Preparation & Consultation'],
  ['Pre-Cut Dry Combing & Texture Assessment', 'comb_through_dry', 'barber combing through dry hair assessing natural fall and cowlicks', 'Preparation & Consultation'],
  ['Hydraulic Belmont Chair Height Adjustment', 'chair_hydraulic', 'barber pumping hydraulic foot lever adjusting chair height', 'Preparation & Consultation'],
  // Washing & Basin Care
  ['Scalp Wash & Foaming Lather at Shampoo Basin', 'shampoo_basin', 'leaning back at porcelain shampoo basin with foaming shampoo and warm water', 'Washing & Basin Care'],
  ['Invigorating Scalp Massage & Warm Water Rinse', 'scalp_massage_rinse', 'warm cascading rinse and scalp massage at backwash basin', 'Washing & Basin Care'],
  ['Towel Turban Headwrap & Gentle Squeeze Drying', 'towel_turban_dry', 'seated in chair with plush white towel turban drying damp strands', 'Washing & Basin Care'],
  // Wetting & Sectioning
  ['Spray Bottle Water Misting with Glistening Droplets', 'spray_misting', 'aluminum spray bottle spritzing fine mist droplets on hair strands', 'Wetting & Sectioning'],
  ['Carbon Tail Comb Crisp Parting Lines', 'carbon_comb_parting', 'carbon tail comb carving razor-sharp clean parting lines', 'Wetting & Sectioning'],
  ['Duckbill Clip Sectioning into Clean Quadrants', 'sectioning_clips', 'hair partitioned into four clean quadrants with duckbill clips', 'Wetting & Sectioning'],
  // Precision Scissor Work
  ['Horizontal Baseline Perimeter Scissor Cut', 'scissor_blunt_perimeter', 'clamping hair flat between fingers snipping crisp baseline perimeter', 'Precision Scissor Work'],
  ['Vertical Scissor Point-Cutting into Ends', 'scissor_point_cutting', 'scissor tips point-cutting vertically into damp ends for soft texture', 'Precision Scissor Work'],
  ['Precision Fringe & Bottleneck Curtain Bangs', 'scissor_curtain_bangs', 'point-cutting soft arched bottleneck curtain bangs around cheekbones', 'Precision Scissor Work'],
  ['Slide-Cutting Angled Face-Framing Layers', 'scissor_face_framing', 'shears angled downward slide-cutting soft jawline-hugging layers', 'Precision Scissor Work'],
  ['Barber Scissor-Over-Comb Graduation Blending', 'scissor_over_comb', 'cutting shears working rhythmically over flat comb blending graduation', 'Precision Scissor Work'],
  ['Crown Section 90-Degree Layer Elevation', 'scissor_crown_layers', 'lifting crown section 90 degrees straight up trimming fluid layers', 'Precision Scissor Work'],
  // Texturizing & Razor Craft
  ['Japanese Notched Thinning Shears Bulk Removal', 'thinning_shears_bulk', 'notched thinning shears cutting mid-lengths removing internal bulk', 'Texturizing & Razor Craft'],
  ['Traditional Straight Razor Detailing Nape Hairline', 'razor_perimeter_nape', 'sharp straight razor with warm lather carving clean nape perimeter', 'Texturizing & Razor Craft'],
  ['Guarded Feathering Razor Tapering Collarbone Ends', 'feathering_razor_ends', 'feathering razor lightly slicing outer ends creating wispy tips', 'Texturizing & Razor Craft'],
  // Blowout & Thermal Styling
  ['Ceramic Round Brush Blowout & Crown Root Lift', 'blowout_round_brush', 'ceramic round barrel brush lifting crown roots with warm hairdryer airflow', 'Blowout & Thermal Styling'],
  ['Narrow-Nozzle Blowout Setting Curved Bouncy Ends', 'blowout_curved_ends', 'round brush rolling through bottom perimeter setting bouncy curves', 'Blowout & Thermal Styling'],
  ['Wide Diffuser Cup Cradling Organic Wave Volume', 'diffuser_volume', 'wide diffuser nozzle cupping waves amplifying organic volume', 'Blowout & Thermal Styling'],
  // Cleanup & Barber Craft
  ['Talcum Powder Horsehair Neck Duster Cleanup', 'talcum_neck_duster', 'soft horsehair powder duster with talc sweeping loose clippings off neck', 'Cleanup & Barber Craft'],
  ['Wide Barber Brush Sweeping Clippings off Cape', 'cape_hair_dusting', 'wide barber brush sweeping cut hair clippings off black nylon cape', 'Cleanup & Barber Craft'],
  // Mirror Reveal & Inspection
  ['Dual-Mirror Reveal: Barber Holding Oval Handheld Mirror', 'handheld_mirror_reveal', 'barber holding oval handheld mirror behind reflecting rear silhouette', 'Mirror Reveal & Inspection'],
  ['Client Smiling at Front Wall Mirror Admiring Cut', 'front_mirror_admire', 'client smiling directly into station mirror running fingers through hair', 'Mirror Reveal & Inspection'],
  ['Client Turning 45-Degree Side Profile Inspection', 'side_profile_check', 'client turning head 45 degrees checking face-framing graduation', 'Mirror Reveal & Inspection'],
  ['Male Barber Stepping Back Smiling Proudly', 'barber_satisfied_finish', 'male barber stepping back wiping shears on towel with proud posture', 'Mirror Reveal & Inspection'],
  // Cinematic Perspectives & Macro
  ['Macro Focus on Barber Hands, Fingers & Shears Pivot', 'macro_hands_tools', 'tight macro focus on barber fingers, gleaming shears and taut hair strand', 'Cinematic Perspectives & Macro'],
  ['Over-the-Shoulder POV Mirror Reflection of Client', 'over_shoulder_mirror', 'over-the-shoulder POV looking past barber into mirror at client eyes', 'Cinematic Perspectives & Macro'],
  ['Wide Establishing Shot of Bustling All-Male Shop', 'wide_shop_bustle', 'wide establishing angle showing styling station, neighboring chairs and shop', 'Cinematic Perspectives & Macro'],
  // Body Shaving & Barber Grooming
  ['Straight Razor Armpit Hair Shave with Warm Lather', 'armpit_shave', 'barber lathering and shaving client armpit hair clean with straight razor', 'Body Shaving & Barber Grooming'],
  ['Chest & Décolletage Hair Shave with Warm Foam', 'chest_hair_shave', 'barber shaving fine chest hair and body hair with warm lather', 'Body Shaving & Barber Grooming'],
  ['Upper Body & Shoulder Hair Shave with Razor', 'body_hair_shave', 'barber shaving shoulders, collarbones and body hair smooth with lather', 'Body Shaving & Barber Grooming'],
  ['Steaming Hot Towel & Soothing After-Shave Balm', 'post_shave_balm', 'barber applying steaming hot towel and soothing balm to shaved areas', 'Body Shaving & Barber Grooming'],
  // Intimate Stool & Close Barber Work
  ['Model on Small Stool · Barber Leaning Close from Behind', 'stool_barber_leaning', 'barber standing directly behind model on small stool, practically touching her back while sectioning hair', 'Intimate Stool & Close Barber Work'],
  ['Model on Low Stool · Intimate Scissor Trimming from Behind', 'stool_scissor_close', 'male barber directly behind model on low stool with hands framing her hair and shears snip in focus', 'Intimate Stool & Close Barber Work'],
  ['Model on Low Stool · Barber Combing & Guiding Head from Behind', 'stool_combing_intimate', 'male barber leaning over model on small stool from behind, fingers gently through her hair with comb', 'Intimate Stool & Close Barber Work'],
  ['Model on Small Stool · Barber Spray Misting & Smoothing Strands', 'stool_mist_close', 'male barber standing millimeters behind model on stool, spritzing fine mist and smoothing hair over shoulders', 'Intimate Stool & Close Barber Work'],
  ['Model on Low Stool · Barber Detailing Nape & Collarbone Strands', 'stool_nape_intimate', 'barber bent close over model\'s shoulders from behind on low stool, detailing nape taper with razor/shears', 'Intimate Stool & Close Barber Work'],
  // Expanded In-Progress Hair Work & Tool Transitions
  ['Butterfly Clip Release: Wet Layer Tier Dropping', 'clip_release_drop', 'popping open section clips so gleaming wet crown layer cascades over blunted underlayer', 'Wetting & Sectioning'],
  ['180° Twisted Butterfly Fringe Slice Over Nose', 'twisted_butterfly_bangs', 'twisting damp front bangs cleanly above bridge of nose and executing horizontal shear cut', 'Precision Scissor Work'],
  ['Cordless Detail Trimmer & Titanium Foil Shaver Nape Cleanup', 'foil_nape_shave', 'gliding detail trimmers and foil shaver cleanly along exposed bare nape below bob', 'Texturizing & Razor Craft'],
  ['Flat-Iron Titanium C-Curve Jawline Beveling Pass', 'flat_iron_c_bevel', 'gliding heated straightener cleanly down hair ribbons curling ends inward at jaw', 'Blowout & Thermal Styling'],
  ['Dry Curl-by-Curl Visual Carving in Natural Spring', 'dry_curl_carving', 'carving individual dry wave or curl ribbons freehand without stretching spring tension', 'Precision Scissor Work'],
  ['Aluminum Duckbill Clips Setting Cheekbone S-Wave', 'duckbill_wave_set', 'combing glossy damp cheek strands into graceful S-curve locked with metal duckbill clips', 'Wetting & Sectioning'],
  ['Steaming Herbal Towel Wrap Over Nape Between Passes', 'steam_towel_nape', 'pressing warm steaming white towel gently over nape hairline between cutting stages', 'Washing & Basin Care'],
  ['Wide Barber Paddle Brush Sweeping Cut Piles off Vinyl Cape', 'paddle_cape_sweep', 'brushing thick cut dark hair ribbons down glossy cape onto floor tiles', 'Cleanup & Barber Craft'],
  ['Channel Carving Deep Internal Layers Above Crown', 'channel_carving_crown', 'elevating diagonal crown sections and sliding open shear blades carving internal lightness', 'Precision Scissor Work'],
  ['Saturated Comb-Down Full Veil Across Forehead & Eyes', 'comb_down_veil_soak', 'spritzing water-mist soak and combing damp front hair cleanly down across forehead before cut', 'Wetting & Sectioning']
]);

const salonCollageFlow = makeOpts([
  ['Chronological Haircut Journey (Prep → Cut → Profile → Reveal)', 'journey'],
  ['Multi-Angle Moment Showcase (Wide → Macro Hands → Profile → POV)', 'multi_angle'],
  ['Full Makeover Arc (Arrival → Misting → Crown Layers → Blowout)', 'makeover_arc'],
  ['Barber Craft & Tool Detailing (Parting → Scissor-over-Comb → Razor → Duster)', 'tool_craft'],
  ['Wash, Cut & Blowout (Basin → Spray → Blunt Cut → Curved Ends)', 'wash_and_cut'],
  ['Dual-Mirror Reveal & Aftercare (Face Framing → Duster → Rear Mirror → Admire)', 'dual_mirror'],
  ['Close-Up Precision Craft (Parting → Macro Fingers → Thinning → POV)', 'precision_craft'],
  ['Barber Grooming & Body Shave (Consultation → Armpit Shave → Chest Shave → Reveal)', 'grooming_shave'],
  ['✦ Custom 4-Panel Selection (Individually Chosen Below)', 'custom']
]);

const COLLAGE_PRESETS = {
  journey: ['consultation_chair', 'scissor_blunt_perimeter', 'side_profile_check', 'front_mirror_admire'],
  multi_angle: ['wide_shop_bustle', 'macro_hands_tools', 'side_profile_check', 'over_shoulder_mirror'],
  makeover_arc: ['consultation_chair', 'spray_misting', 'scissor_crown_layers', 'blowout_round_brush'],
  tool_craft: ['carbon_comb_parting', 'scissor_over_comb', 'razor_perimeter_nape', 'talcum_neck_duster'],
  wash_and_cut: ['shampoo_basin', 'spray_misting', 'scissor_blunt_perimeter', 'blowout_curved_ends'],
  dual_mirror: ['scissor_face_framing', 'talcum_neck_duster', 'handheld_mirror_reveal', 'front_mirror_admire'],
  precision_craft: ['carbon_comb_parting', 'macro_hands_tools', 'thinning_shears_bulk', 'over_shoulder_mirror'],
  grooming_shave: ['consultation_chair', 'armpit_shave', 'chest_hair_shave', 'front_mirror_admire']
};

const STAGE_SCENE_MAP = {
  'Active scissor work — mid-haircut': 'scissor_blunt_perimeter',
  'Precision fringe & curtain bangs trimming': 'scissor_curtain_bangs',
  'Sectioning with butterfly clips & prep': 'sectioning_clips',
  'Wetting with spray bottle & combing flat': 'spray_misting',
  'Thinning shears & texture feathering': 'thinning_shears_bulk',
  'Final snip & perimeter check': 'scissor_blunt_perimeter',
  'Round-brush blowout & crown lifting': 'blowout_round_brush',
  'Handheld mirror rear ponytail reveal': 'handheld_mirror_reveal',
  'Unclipping cape & neck duster cleanup': 'talcum_neck_duster',
  'Haircut consultation & initial comb-through': 'consultation_chair',
  'Guarded feathering razor tapering along collarbone ends': 'feathering_razor_ends',
  'Razor edge perimeter cleanup along the nape': 'razor_perimeter_nape',
  'Vertical point-cutting texture into bang tips': 'scissor_point_cutting',
  'Towel blotting damp hair post-wash': 'towel_turban_dry',
  'Final mirror tilt & profile check': 'side_profile_check',
  'Scissor-over-comb blending motion': 'scissor_over_comb',
  'Slide cutting along face-framing angles': 'scissor_face_framing',
  'Cross-checking vertical sections across the crown': 'scissor_crown_layers',
  'Spray bottle misting during haircut': 'spray_misting',
  'Combing curtain bangs into crisp center part': 'carbon_comb_parting',
  'Twisting and point-cutting ponytail tail ends': 'scissor_point_cutting',
  'Hairdryer cool-shot loose hair blast': 'cape_hair_dusting',
  'Hands cupping and checking hair bounce': 'front_mirror_admire',
  'Barber shaving client\'s armpit hair with straight razor': 'armpit_shave',
  'Barber shaving fine chest hair with warm lather & straight razor': 'chest_hair_shave',
  'Full body hair shave: arms & shoulders with lather & razor': 'body_hair_shave',
  'Post-shave hot towel & soothing balm on underarms & chest': 'post_shave_balm',
  'Shampoo bowl neck-cradle foaming lather wash & rhythmic scalp scrub': 'shampoo_basin',
  'Deep conditioning mask wide-tooth comb-through at wash basin': 'scalp_massage_rinse',
  '180° twisted butterfly front bang slice above nose bridge': 'twisted_butterfly_bangs',
  'Zig-zag crown parting carved with gleaming steel pintail tip': 'carbon_comb_parting',
  'Cordless detail trimmers carving ultra-sharp stacked bob nape undercut': 'foil_nape_shave',
  'Dual titanium foil-shaver gliding zero-stubble clean across bare lower nape': 'foil_nape_shave',
  'Exposed chrome shavette detailing tiny temple wisps around ear': 'razor_perimeter_nape',
  'Double-prong duckbill clips setting sculptural S-wave along cheekbone': 'duckbill_wave_set',
  'Curl-by-curl dry sculpting cut in natural organic spring bounce': 'dry_curl_carving',
  'Diffuser bowl cupping wet natural waves upwards under low airflow': 'diffuser_volume',
  'Wide barber paddle brush sweeping cut hair piles off chest cape to floor': 'paddle_cape_sweep',
  'Finger-combing saturated front locks over forehead to mark cut guide': 'comb_down_veil_soak',
  'Steaming damp herbal towel wrap draped around nape between passes': 'steam_towel_nape',
  'Testing wet-vs-dry tension elasticity by pulling crown ribbon smoothly': 'macro_hands_tools'
};

function getStageMatchingSceneId(stageLabel, stageText){
  if(stageLabel && STAGE_SCENE_MAP[stageLabel]){
    return STAGE_SCENE_MAP[stageLabel];
  }
  const lbl = (stageLabel || '').toLowerCase();
  const txt = (stageText || '').toLowerCase();
  if (lbl.includes('feathering razor') || txt.includes('feathering razor')) return 'feathering_razor_ends';
  const text = (stageLabel + ' ' + (stageText || '')).toLowerCase();
  if (text.includes('flat-iron') || text.includes('c-curve bevel')) return 'flat_iron_c_bevel';
  if (text.includes('foil shaver') || text.includes('foil-shaver') || text.includes('undercut trim')) return 'foil_nape_shave';
  if (text.includes('butterfly') && text.includes('drop')) return 'clip_release_drop';
  if (text.includes('butterfly') && text.includes('slice')) return 'twisted_butterfly_bangs';
  if (text.includes('channel carving')) return 'channel_carving_crown';
  if (text.includes('paddle brush')) return 'paddle_cape_sweep';
  if (text.includes('duckbill')) return 'duckbill_wave_set';
  if (text.includes('curl-by-curl')) return 'dry_curl_carving';
  if (text.includes('diffuser')) return 'diffuser_volume';
  if (text.includes('comb-down') || text.includes('veil prep')) return 'comb_down_veil_soak';
  if (text.includes('steam') && text.includes('towel')) return 'steam_towel_nape';
  if (text.includes('blowout') || text.includes('hairdryer') || text.includes('round-brush')){
    return 'blowout_round_brush';
  } else if (text.includes('razor')){
    return 'razor_perimeter_nape';
  } else if (text.includes('thinning') || text.includes('texturizing')){
    return 'thinning_shears_bulk';
  } else if (text.includes('spray bottle') || text.includes('wetting') || text.includes('misting')){
    return 'spray_misting';
  } else if (text.includes('handheld mirror') || text.includes('rear reveal')){
    return 'handheld_mirror_reveal';
  } else if (text.includes('neck duster') || text.includes('cleanup') || text.includes('duster brush')){
    return 'talcum_neck_duster';
  } else if (text.includes('fringe') || text.includes('bangs')){
    return 'scissor_curtain_bangs';
  } else if (text.includes('face-framing') || text.includes('slide cut')){
    return 'scissor_face_framing';
  } else if (text.includes('point-cut')){
    return 'scissor_point_cutting';
  } else if (text.includes('scissor-over-comb')){
    return 'scissor_over_comb';
  } else if (text.includes('towel')){
    return 'towel_turban_dry';
  } else if (text.includes('shampoo') || text.includes('basin')){
    return 'shampoo_basin';
  } else {
    return 'scissor_blunt_perimeter';
  }
}

const SALON_CAMERA_MIRROR_FREE = {
  "photographed directly into the large salon wall mirror, capturing the client's front reflection, the male barber's hands, and the full styling station reflected with optical depth":
    "photographed directly from the front styling station angle, capturing the client's expressive eyes and posture in the hydraulic chair, the male barber's skilled hands, and the styling station with crisp optical depth",

  "an intimate over-the-shoulder perspective looking past the male barber toward the client's facial reaction in the mirror":
    "an intimate over-the-shoulder perspective looking past the male barber framing the client's facial profile and expression in the chair",

  "a wide horizontal frame capturing the full salon atmosphere, adjacent barber chairs, background mirrors, and the client centered in the foreground chair":
    "a wide horizontal frame capturing the full salon atmosphere, adjacent barber chairs, background styling stations, and the client centered in the foreground chair",

  "a dramatic low-angle perspective looking slightly upward from chair armrest height, emphasizing confident posture and facial reflection in the glass":
    "a dramatic low-angle portrait looking slightly upward from chair armrest height, emphasizing confident posture and facial expression in the styling chair",

  "portrait focused sharply on client's face and bangs in the mirror, with blurred male barber shoulder in the foreground framing the composition":
    "portrait focused sharply on the client's face and bangs from the front chair perspective, with blurred male barber shoulder in the foreground framing the composition",

  "a centered symmetrical portrait looking square into the illuminated vanity mirror, framing the client evenly between warm bulb fixtures":
    "a centered symmetrical direct portrait looking squarely toward the client in the styling chair, framed evenly between warm station bulb fixtures",

  "a dynamic low-angled Dutch tilt perspective framing the corner of the tool trolley in the foreground with the client and mirror behind":
    "a dynamic low-angled Dutch tilt perspective framing the corner of the tool trolley in the foreground with the client in the styling chair behind",

  "a captivating double-mirror perspective with front and rear mirrors creating infinite recursive reflections and deep optical salon geometry":
    "a captivating layered-depth perspective framing the client in the chair with atmospheric depth across the salon interior",

  "a candid perspective from behind the chair showing the male barber holding up an oval handheld mirror framing the back of the client's new haircut":
    "a candid perspective from behind the chair showing the male barber proudly presenting the rear silhouette and perimeter lines of the client's new haircut",

  "a split-diopter optical shot keeping both the barber's shears in extreme foreground and the client's expressive eyes in the background mirror tack-sharp":
    "a split-diopter optical shot keeping both the barber's shears in extreme foreground and the client's expressive eyes tack-sharp in the styling chair",

  "a candid medium shot capturing the barber holding an ornate handheld mirror showing the client her rear neckline from a flattering 45-degree angle":
    "a candid medium shot capturing the barber presenting the client's rear neckline and perimeter from a flattering 45-degree angle",

  "an editorial perspective angled over the styling trolley showing combs, clips, and tonic bottles in sharp relief with the haircut scene in soft bokeh":
    "an editorial perspective angled over the styling trolley showing combs, clips, and tonic bottles in sharp relief with the client in soft bokeh",

  "a wide cinematic 2.39:1 widescreen frame capturing the entire salon length, neon wall signage, multiple mirrors, and the bustling haircut action":
    "a wide cinematic 2.39:1 widescreen frame capturing the entire salon length, neon wall signage, multiple styling stations, and the bustling haircut action",

  "an ultra-close direct chest-up 3/4 portrait taken just two feet from the styling chair; the client's expressive face, parted front bob tendrils, and black cape shoulders dusted with cut hair clippings fill 70% of the foreground while the male barber leans tightly in beside her left shoulder holding a folding straight razor or shears pressed delicately against her right neckline/nape in razor-sharp closeup, with real all-male barbershop stations and glass wall mirrors softly receding in authentic background depth":
    "an ultra-close direct chest-up 3/4 portrait taken just two feet from the styling chair; the client's expressive face, parted front bob tendrils, and black cape shoulders dusted with cut hair clippings fill 70% of the foreground while the male barber leans tightly in beside her left shoulder holding a folding straight razor or shears pressed delicately against her right neckline/nape in razor-sharp closeup, with authentic all-male barbershop styling stations and dark shop wood receding cleanly behind them",

  "an ultra-tight mirror-side close-up capturing the client's direct eye contact and subtle smirk in the immediate foreground alongside the barber's focused face and razor-detailing hand right at her neckline":
    "an ultra-tight direct frontal close-up capturing the client's direct eye contact and subtle smirk in the immediate foreground alongside the barber's focused face and razor-detailing hand right at her neckline",
};

function sanitizeMirrorProse(text){
  if(!text) return text;
  let t = text;
  t = t
    // Beauty, metallic blade, and lighting idioms that contain "mirror" but do NOT depict actual mirrors:
    .replace(/vanity mirror bulb strips|mirror vanity bulbs/gi, 'vanity bulb strips')
    .replace(/mirror specular shine|mirror gloss|mirror luster/gi, 'glass-like specular shine')
    .replace(/mirror-bright/gi, 'razor-bright')
    .replace(/mirror-flat/gi, 'glass-flat')
    .replace(/mirror-edge/gi, 'close frontal')
    .replace(/in the (?:vanity )?glass/gi, 'in direct view')

    // Specific full-phrase / contextual rewrites for handheld mirror:
    .replace(/holding (?:up )?(?:an oval|a small|a secondary)?\s*(?:black-rimmed )?(?:handheld )?mirror reflecting the back view of the client(?:[\x27\u2019]s)?(?:\s+(?:new )?(?:ponytail|haircut))?/gi, "presenting the rear silhouette and perimeter of the client's haircut")
    .replace(/holding (?:up )?(?:an oval|a small|a secondary)?\s*(?:black-rimmed )?(?:handheld )?mirror reflecting [^,.]+/gi, 'presenting the finished rear silhouette and perimeter lines')
    .replace(/holding (?:up )?(?:an oval|a small|a secondary)?\s*(?:black-rimmed )?(?:handheld )?mirror framing the back of the client(?:[\x27\u2019]s)?(?:\s+(?:new )?(?:ponytail|haircut))?/gi, "presenting the back silhouette and perimeter lines of the client's new haircut")
    .replace(/holding (?:up )?(?:an oval|a small|a secondary)?\s*(?:black-rimmed )?(?:handheld )?mirror so the client can inspect [^,.]+/gi, 'presenting the rear silhouette and perimeter lines for client inspection')
    .replace(/holding (?:up )?(?:an oval|a small|a secondary)?\s*(?:black-rimmed )?(?:handheld )?mirror to show her [^,.]+/gi, 'presenting the rear silhouette to show her the neckline and perimeter')
    .replace(/holding (?:up )?(?:an oval|a small|a secondary)?\s*(?:black-rimmed )?(?:handheld )?mirror/gi, 'presenting the finished haircut silhouette')
    .replace(/Barber standing behind holding secondary mirror/gi, 'Barber standing behind presenting rear silhouette')
    .replace(/holding a secondary mirror/gi, 'inspecting the rear silhouette')
    .replace(/handheld mirror rear ponytail reveal/gi, 'rear ponytail reveal of silhouette and perimeter')
    .replace(/tilts the vanity lamp and holds a secondary mirror to showcase/gi, 'tilts the vanity lamp to showcase rear silhouette,')
    .replace(/lifting them toward the mirror to demonstrate/gi, 'lifting them gently to demonstrate')

    // Client and stylist mirror interactions:
    .replace(/Solo client checking finished hair in the mirror/gi, 'Solo client checking finished hair in the styling chair')
    .replace(/checking finished hair in the mirror/gi, 'checking finished hair from the styling chair')
    .replace(/evaluating balance in the mirror/gi, 'evaluating balance from styling chair perspective')
    .replace(/consult with the client in the mirror/gi, 'consult with the client in the styling chair')
    .replace(/discussing desired length in the mirror/gi, 'discussing desired length at the styling station')
    .replace(/discuss the front curtain bang drape in the mirror/gi, 'discuss the front curtain bang drape')
    .replace(/inspect the cheekbone-framing angle in the mirror/gi, 'inspect the cheekbone-framing angle from the styling chair')
    .replace(/fall and bounce into place naturally in the mirror/gi, 'fall and bounce into place naturally')
    .replace(/admiring cut in the mirror/gi, 'admiring cut from the chair')
    .replace(/facial reaction in the mirror/gi, 'facial expression in the styling chair')
    .replace(/drape in the mirror/gi, 'drape from the front chair angle')
    .replace(/eyes meeting in the mirror/gi, 'eyes meeting through direct gaze')
    .replace(/eyes (?:reflected )?in (?:the )?mirror/gi, 'eyes in direct gaze')
    .replace(/in the station mirror/gi, 'at the styling station')
    .replace(/in the mirror/gi, 'from the styling chair')

    // Collage flow and frame titles:
    .replace(/Dual-Mirror Reveal & Aftercare/gi, 'Rear Silhouette Reveal & Aftercare')
    .replace(/dual-mirror reveal: barber holding oval handheld mirror/gi, 'Rear Silhouette Reveal: Client Evaluating Cut')
    .replace(/dual-mirror reveal:?/gi, 'Rear Reveal:')
    .replace(/client smiling at front wall mirror admiring cut/gi, 'Client Smiling in Styling Chair Admiring Cut')
    .replace(/over-the-shoulder pov mirror reflection of client/gi, 'Over-the-Shoulder Angle Framing Client')
    .replace(/intimate mirror perspective/gi, 'intimate direct perspective')
    .replace(/Rear Mirror/gi, 'Rear Angle')

    // Venue architecture & interior wall panels:
    .replace(/dark wood mirror moldings/gi, 'dark wood wall moldings')
    .replace(/mirror moldings/gi, 'wall moldings')
    .replace(/large wooden-framed mirrors/gi, 'wooden wall panels')
    .replace(/large mirrored wall/gi, 'expansive architectural feature wall')
    .replace(/mirrored counter/gi, 'styling counter')
    .replace(/mirrored wall/gi, 'architectural feature wall')
    .replace(/rounded vanity mirrors/gi, 'rounded vanity wall panels')
    .replace(/frameless backlit LED vanity mirrors/gi, 'frameless backlit LED wall panels')
    .replace(/frameless backlit LED halo mirrors/gi, 'frameless backlit LED halo wall panels')
    .replace(/gold-trimmed architectural mirrors/gi, 'gold-trimmed architectural wall accents')
    .replace(/brushed brass architectural mirror trim/gi, 'brushed brass architectural station trim')
    .replace(/private vanity mirror/gi, 'private styling suite')
    .replace(/private mirror/gi, 'private styling suite')
    .replace(/floating mirrors/gi, 'floating wall panels')
    .replace(/sleek floating mirrors/gi, 'sleek floating wall panels')
    .replace(/vanity mirror with warm bulb strip/gi, 'vanity station with warm bulb strip')
    .replace(/shared center mirror ledge/gi, 'shared center station ledge')
    .replace(/clean mirrors/gi, 'clean architectural finishes')
    .replace(/steel-framed swivel mirrors/gi, 'steel-framed partition panels')
    .replace(/floor-to-ceiling seamless mirrors/gi, 'floor-to-ceiling architectural wall panels')
    .replace(/custom halo-lit mirror/gi, 'custom halo-lit wall panel')
    .replace(/leafy palm fronds reflecting in mirrors/gi, 'leafy palm fronds decorating the station wall')
    .replace(/antique mirrors/gi, 'antique wall decor')
    .replace(/vintage mirrors reflecting/gi, 'vintage wall fixtures highlighting')
    .replace(/vintage mirrors/gi, 'vintage wall decor')
    .replace(/wall-mounted mirror islands/gi, 'wall-mounted styling stations')
    .replace(/background mirrors/gi, 'background styling areas')
    .replace(/client and mirror behind/gi, 'client seated in the styling chair')
    .replace(/leather strop hanging beside the mirror/gi, 'leather strop hanging beside the station wall')
    .replace(/fresh marigold garland on the mirror frame/gi, 'fresh marigold garland on the station frame')
    .replace(/on the mirror frame/gi, 'on the station frame')
    .replace(/round LED vanity bulbs framing the mirror/gi, 'round LED vanity bulbs framing the station')
    .replace(/framing the mirror/gi, 'framing the vanity')
    .replace(/positioned in front of the mirror/gi, 'positioned in front of the client')
    .replace(/in front of the mirror/gi, 'in front of the client')

    // Time of day, lighting, and reflections:
    .replace(/soft vanity mirror glow/gi, 'soft vanity bulb glow')
    .replace(/cool damp reflections/gi, 'cool damp sheen')
    .replace(/warm mirror bulb lighting/gi, 'warm vanity bulb lighting')
    .replace(/bright mirror vanity bulbs/gi, 'bright vanity bulbs')
    .replace(/warm vanity mirror practical lights/gi, 'warm vanity practical lights')
    .replace(/mirror practical lights/gi, 'vanity practical lights')
    .replace(/mirror practicals/gi, 'vanity practicals')
    .replace(/single mirror spotlight/gi, 'single station spotlight')
    .replace(/single vanity fixture/gi, 'single station fixture')
    .replace(/warm salon mirrors and atmospheric reflections/gi, 'warm salon fixtures and atmospheric lighting')
    .replace(/only the central styling mirror vanity glowing brightly/gi, 'only the central styling vanity glowing brightly')

    // Photography, texture, cape:
    .replace(/rendering salon reflections into soft bokeh circles/gi, 'rendering salon ambient lighting into soft bokeh circles')
    .replace(/sleek mirror glass shine/gi, 'sleek high-gloss glass shine')
    .replace(/mirror glass shine/gi, 'high-gloss glass shine')
    .replace(/mirror-like shine/gi, 'glass-like shine')
    .replace(/mirror-like reflection/gi, 'high-gloss sheen')
    .replace(/mirror shine/gi, 'radiant gloss')
    .replace(/mirror-lacquer finish/gi, 'high-gloss lacquer finish')
    .replace(/mirror-smooth/gi, 'ultra-smooth')
    .replace(/ultra-reflective/gi, 'ultra-glossy')
    .replace(/modern reflective silver/gi, 'modern lustrous silver')
    .replace(/reflective downward glance/gi, 'downward glance')
    .replace(/authentic mirror reflections/gi, 'authentic directional highlights')
    .replace(/liquid reflections/gi, 'liquid highlights')
    .replace(/still water reflections/gi, 'still water highlights')
    .replace(/water reflections/gi, 'water highlights')
    .replace(/controlled reflections/gi, 'controlled highlights')
    .replace(/reflective wet marble/gi, 'wet lustrous marble')
    .replace(/reflective damp surfaces/gi, 'lustrous damp surfaces')
    .replace(/reflective mirror highlights/gi, 'lustrous highlights')
    .replace(/reflective sheen/gi, 'lustrous sheen')
    .replace(/dressing room without mirrors/gi, 'dressing room with soft practical lights')
    .replace(/dressing room mirrorless setup/gi, 'dressing room with wardrobe textures')
    .replace(/no visible mirrors or reflection-heavy set pieces/gi, 'clean non-reflective set pieces and textured background')
    .replace(/no visible mirrors/gi, 'clean non-reflective surfaces')
    .replace(/reflecting naturally off the room/gi, 'illuminating the room naturally')
    .replace(/light caustics light reflection/gi, 'light caustics illumination')
    .replace(/realistic reflections/gi, 'realistic surface highlights')
    .replace(/soft ambient reflections/gi, 'soft ambient illumination')
    .replace(/reflector fill/gi, 'diffuse ambient fill')
    .replace(/Mirrored salon suite with zero reflections/gi, 'Architectural salon suite with clean matte styling')

    // Generic fallbacks for any remaining standalone words:
    .replace(/\bhandheld mirrors?\b/gi, 'rear haircut silhouette')
    .replace(/\bvanity mirrors?\b/gi, 'vanity panel')
    .replace(/\bwall mirrors?\b/gi, 'station wall')
    .replace(/\bmirrored\b/gi, 'styling')
    .replace(/\bmirrors\b/gi, 'wall panels')
    .replace(/\bmirror\b/gi, 'styling station')
    .replace(/\brecursive reflections\b/gi, 'atmospheric depth')
    .replace(/\boptical reflections\b/gi, 'lighting highlights')
    .replace(/\blight reflections\b/gi, 'lighting highlights')
    .replace(/\breflections\b/gi, 'highlights')
    .replace(/\breflection\b/gi, 'direct perspective')
    .replace(/\breflective\b/gi, 'lustrous')
    .replace(/\breflected\b/gi, 'framed')
    .replace(/\breflecting\b/gi, 'illuminating')
    .replace(/\breflects\b/gi, 'highlights');

  return t.replace(/ {2,}/g, ' ').trim();
}


function getCollageSceneDirective(sceneId, ctx){
  const v = ctx.venueText || 'authentic salon interior';
  const d = ctx.designText || 'classic salon design';
  const st = ctx.stylistText || 'male barber';
  const sl = ctx.stylistLabel || 'Male barber';
  const h = ctx.haircutText || 'haircut';
  const m = ctx.moistureText || 'damp hair';
  const c = ctx.capeText || 'protective salon cutting cape';
  const l = ctx.lightingText || 'salon ambient lighting';
  const cam = ctx.cameraText || 'eye-level perspective';
  const pStr = ctx.stationProps ? ` Station counter features ${ctx.stationProps}.` : '';
  const b = ctx.bustleText || 'salon atmosphere';
  const staff = ctx.staffText || 'barber staff working';
  const isSoloClient = ctx.isSoloClient !== undefined ? !!ctx.isSoloClient : (ctx.stylistLabel || '').toLowerCase().includes('solo client');
  const isDryMode = (ctx.hairMoisture === 'dry');
  const isWetMode = (ctx.hairMoisture === 'wet');
  const noMirror = !!ctx.noMirror;
  const veilTier = ctx.veilTier || 'auto';
  const hasHeavyCollageVeil = ['40_45', '50', '65_70', '80_85', '95_100'].includes(veilTier);
  const hideEyesInCollage = ['65_70', '80_85', '95_100'].includes(veilTier);
  const collageVeilClause = hasHeavyCollageVeil
    ? ` Cohesive sleek combed hair framing (${hideEyesInCollage ? 'ZERO visible eyeballs/open forehead, ' : ''}${ctx.veilLabel || 'styled hair veil'}) strictly matches her haircut length without separated scraggly mouth strings.`
    : '';

  const isBustleEmpty = (ctx.bustleLabel || '').toLowerCase().startsWith('empty');
  const shopCrowdDesc = isBustleEmpty ? 'peaceful quiet atmosphere with zero other customers in neighboring chairs' : `${b}. Barber staffing: ${staff}`;

  const templates = {
    consultation_chair: isSoloClient
      ? `Wide-medium in-chair consultation at the styling station in ${v} (${d}). The female client sits comfortably in the styling chair draped in ${c}, reviewing haircut reference photos on her phone and contemplating the desired silhouette ${noMirror ? `under ${l}` : `in the station mirror under ${l}`}.${pStr}`
      : `Wide-medium in-chair consultation at the styling station in ${v} (${d}). The female client sits comfortably in the hydraulic chair draped in ${c}. The male barber (${st}) stands beside her, gently lifting a section of ${h} with his fingers while discussing the desired silhouette ${noMirror ? `under ${l}` : `in the station mirror under ${l}`}.${pStr}`,
    consultation_chai: isSoloClient
      ? `Relaxed candid consultation moment: the female client holds a steaming brass cup of chai/coffee at the station counter in ${v}, relaxing and contemplating her haircut direction before cutting. Shop atmosphere: ${shopCrowdDesc}.${pStr}`
      : `Relaxed candid consultation moment at the station in ${v}. The female client holds a steaming brass cup of chai/coffee while conversing with ${st} about her haircut direction. Shop atmosphere: ${shopCrowdDesc}. Vintage Belmont chair and counter props in ${l}.${pStr}`,
    cape_neck_strip: `Prep moment in chair: the male barber (${sl}) stands behind the client, gently wrapping a clean white elastic crêpe paper neck strip around her collar before fastening the high neckline of ${c} with snap buttons. The client smiles calmly; station background ${noMirror ? 'softly illuminated by' : 'reflects'} ambient ${l} of ${v}.`,
    comb_through_dry: isSoloClient
      ? `Pre-cut hair assessment: the female client uses a wide-tooth tortoiseshell styling comb to glide smoothly through her hair, evaluating natural strand fall and density under ${c}. Background displays ${d} with ${b}.`
      : `Pre-cut hair assessment: the male barber uses a wide-tooth tortoiseshell styling comb to glide smoothly through the client's hair, evaluating natural strand fall, crown cowlicks, and density before cutting. The female client relaxes under ${c}. Background displays ${d} with ${b}.`,
    chair_hydraulic: isSoloClient
      ? `Atmospheric salon mechanics: the female client sits comfortably in the vintage hydraulic Belmont chair in ${v}, draped in ${c}, gazing ${noMirror ? 'forward' : 'into the station mirror'} with anticipation under ${l}.${pStr}`
      : `Atmospheric salon mechanics: the male barber uses his foot on the heavy chrome hydraulic pump lever of the vintage barber chair, adjusting the client's seating height with precision. The female client rests her hands under ${c} looking ${noMirror ? 'ahead' : 'into the station mirror'} with anticipation under ${l}.${pStr}`,
    shampoo_basin: isDryMode 
      ? `Soothing wash station capture (pre-blowout prep): the client leans back comfortably over the white porcelain shampoo basin in the wash area of ${v}. The male barber gently massages botanical shampoo and warm water into hair strands before subsequent towel-drying and thermal blowout styling. Relaxed facial expression, delicate suds, all attendants male.`
      : `Soothing wash station capture: the client leans back comfortably over the white porcelain shampoo basin in the wash area of ${v}. The male barber gently massages rich foaming botanical shampoo into saturated hair strands under a warm chrome spray nozzle. Delicate water droplets and lather bubbles, relaxed facial expression.`,
    scalp_massage_rinse: isDryMode
      ? `Sensory salon wash ritual (pre-blowout prep): warm water cascades through hair strands as the male barber rinses clean suds at the ceramic backwash basin for the female client before towel blotting and blowout styling. Steam rises softly in ambient ${l}; all attendants male.`
      : `Sensory salon ritual: warm water cascades through saturated hair strands as the male barber rinses clean suds at the ceramic backwash basin for the female client. Steam rises softly in ambient ${l}. Believable wet hair drape and glistening aquatic sheen; all attendants male.`,
    towel_turban_dry: isDryMode
      ? `Post-wash return to chair: the female client is seated at the main station in ${v} with a plush white towel neatly wrapped into a turban atop her head, blotting hair dry before thermal blowout styling.${pStr}`
      : `Post-wash return to chair: the female client is seated at the main station in ${v} with a plush white towel neatly wrapped into a turban atop her head, beginning to air-dry.${pStr}`,
    spray_misting: isDryMode
      ? `Pre-cut prep stage: the male barber holds a brushed aluminum spray bottle, applying light targeted water mist across sectioned strands on the seated client while preserving overall dry cutting texture. Tiny glistening droplets catch the salon lighting as his other hand glides a carbon cutting comb through ${h}. Zero scissors in this prep frame.`
      : `Pre-cut wetting stage: the male barber holds a brushed aluminum spray bottle, spritzing a fine, even water mist across hair strands on the seated client. Moisture state: ${m}. Tiny glistening droplets catch the salon lighting as his other hand glides a carbon cutting comb through the dampened sections of ${h}. Zero scissors in this prep frame.`,
    carbon_comb_parting: `Precision sectioning craft: close-medium shot of the male barber's focused hands using the fine metal tail of a carbon comb to carve crisp, razor-sharp parting lines across the ${isDryMode ? 'crown' : 'damp crown'} of the female client. Clean geometric sectioning, butterfly clips securing perimeter of ${h}, focused artisan gaze.`,
    sectioning_clips: `Artisan preparation: the female client's ${isDryMode ? 'hair' : 'damp hair'} is methodically partitioned into four clean quadrants, held securely by matte black salon duckbill clips. The male barber (${sl}) stands poised with shears ready in hand, studying the symmetry of ${h} ${noMirror ? 'under' : 'in the wall mirror under'} ${l}.`,
    scissor_blunt_perimeter: `Hero precision cutting: crisp eye-level close-up of the male barber's hands clamping a horizontal section of ${h} taut and flat between index and middle fingers on the female client, cleanly snipping a blunt baseline perimeter with Japanese stainless steel shears. Authentic barber grip (thumb and ring finger in rings, pinky on tang). Distinct strand tension, crisp cutting line, fine clippings falling onto ${c}.`,
    scissor_point_cutting: `Texturizing scissor work: the male barber holds shears vertically, delicately point-cutting with the scissor tips into the ends of ${isDryMode ? '' : (isWetMode ? 'soaked wet ' : 'damp ')}${h} on the female client to soften the perimeter and create controlled movement. Full anatomical arm connection, taut two-finger tension${isDryMode ? ', clean dry strand separation.' : (isWetMode ? ', heavy glistening water droplets beading down drenched strands.' : ', realistic micro-droplets on hair fibers.')}`,
    scissor_curtain_bangs: `Face-framing fringe craft: the male barber stands facing ${noMirror ? 'the client' : 'the station mirror'}, meticulously point-cutting heavy elongated bottleneck curtain bangs draping forward across the client's forehead and brows. ${hideEyesInCollage ? 'Her face remains heavily veiled beneath thick descending front hair; ' : ''}delicate fallen hair dust on upper collar of ${c}.${collageVeilClause}`,
    scissor_face_framing: `Angled slide cutting: dynamic angle showing the male barber gently angling his shears downward along the side of the client's face, carving soft jawline-hugging graduated layers in ${h}. Beautiful cheekbone framing, natural hair movement, shop background ${d}.`,
    scissor_over_comb: `Master barber technique: male barber rhythmically works his stainless steel cutting shears over a flat white barber comb, precisely blending graduation and weight along the perimeter of ${h} for the female client. Steady wrists, rhythmic motion blur, lived-in atmosphere of ${v}.`,
    scissor_crown_layers: `Dimensional layering: the male barber elevates a clean rectangular section from the crown straight up at a 90-degree angle, tensioning the hair taut between fingers before trimming to establish fluid cascading layers in ${h} on the client. Cut strands fan out naturally under ${l}.`,
    thinning_shears_bulk: `Specialized texturizing: macro focus on the male barber's notched Japanese thinning shears cutting midway through a thick ${isDryMode ? '' : (isWetMode ? 'soaked wet ' : 'damp ')}hair section of ${h} on the female client. Visible notched teeth on moving blade removing weight while preserving strand length; ${isWetMode ? 'heavy water-clumped strand separation.' : 'airy piecey separation.'}`,
    razor_perimeter_nape: `Artisan razor detailing: the male barber carefully wields a traditional folding straight razor with warm lather along the lower nape and hairline perimeter below ${h} on the client. Zero shears; deliberate, steady hand control, razor edge gleaming under ${l}.`,
    feathering_razor_ends: `Feathering razor styling: male barber uses a guarded feathering razor to lightly slice through the outer ends of ${h} on the female client, creating soft wispy tips and lightweight airy flick along the collarbone. Natural hair drape over ${c}.`,
    blowout_round_brush: `Thermal blowout styling: professional ceramic round barrel brush lifting roots at the crown of the female client while the male barber directs a narrow-nozzle salon hairdryer with warm smoothing airflow. Zero scissors in this frame; dynamic brush curvature, smooth strand tension, and airy blowout volume on ${h}.`,
    blowout_curved_ends: `Polished finish: male barber uses a large boar-bristle round brush with hot hairdryer airflow, rolling the brush through the bottom perimeter of ${h} on the client to lock in bouncy, inward-tucked salon curves with glossy sheen.`,
    diffuser_volume: `Organic texture drying: male barber cups ${isDryMode ? 'naturally wavy strands' : 'damp wavy strands'} of ${h} on the female client with a large round diffuser nozzle on the hairdryer, lifting roots gently to amplify organic volume and soft bouncy wave definition without frizz.`,
    talcum_neck_duster: `Post-cut barber cleanup: close-up of the male barber using a soft wooden-handled horsehair powder duster with light talcum powder, gently sweeping away stray loose hair clippings from the client's neck, collarbone, and neckline of ${c}.`,
    cape_hair_dusting: `Station cleanup ritual: the male barber uses a wide soft-bristle barber brush to sweep freshly fallen hair clippings off the shoulders and chest of the black nylon cape draped on the female client, letting them flutter to the floor tiles.`,
    handheld_mirror_reveal: noMirror
      ? `Post-cut reveal: direct rear three-quarter view showcasing the back silhouette, graduation, and neckline of her finished ${h} in crisp lighting. The male barber (${sl}) stands nearby admiring the balanced perimeter.`
      : `Dual-mirror reveal: post-cut moment in the chair. The male barber stands behind holding up an oval black-rimmed handheld mirror at a precise angle, allowing the female client to inspect the back silhouette, graduation, and neckline of her finished ${h} in the main wall mirror.`,
    front_mirror_admire: isSoloClient
      ? `Joyful reveal: the client faces ${noMirror ? 'forward toward the camera' : 'toward the station mirror'} running her fingers through the silky bounce and heavy weight of her completed ${h} under ${l}, seated alone in the chair with the male stylist having stepped out of frame.${collageVeilClause}`
      : `${noMirror ? 'Joyful reveal:' : 'Joyful mirror reveal:'} the client faces ${noMirror ? 'forward' : 'toward the station mirror'}, running her fingers through the silky bounce and weight of her completed ${h} under ${l}, while the male barber watches approvingly.${collageVeilClause}`,
    side_profile_check: isSoloClient
      ? `Three-quarter inspection from camera angle ${cam}: the female client turns her head 45 degrees, showcasing the side silhouette, jawline frame, and clean movement of ${h}${noMirror ? '' : ' near the mirror'} while seated comfortably alone in the styling chair.${collageVeilClause}`
      : `Three-quarter inspection from camera angle ${cam}: the female client turns her head 45 degrees, showcasing the side silhouette, jawline frame, and clean movement of ${h}${noMirror ? '' : ' near the mirror'}. Barber (${sl}) stands by with hands relaxed, pleased with the result.${collageVeilClause}`,
    barber_satisfied_finish: isSoloClient
      ? `Craftsman satisfaction: the female client sits alone in the styling chair showcasing her completed haircut${noMirror ? '' : ' beside the mirror'}, while the male barber in the background tidies tools on the counter. Atmospheric depth of ${v} and ${shopCrowdDesc}.${collageVeilClause}`
      : `Craftsman satisfaction: the male barber steps back slightly with a warm proud posture, wiping his shears on a clean station towel while the client presents her completed haircut${noMirror ? '' : ' beside the mirror'}. Atmospheric depth of ${v} and ${shopCrowdDesc}.${collageVeilClause}`,
    macro_hands_tools: `Cinematic macro insert: tight macro focus on the male barber's fingers clamping a section of hair taut alongside gleaming Japanese shears pivot screw and carbon comb teeth on the seated female client. Micro-droplets glistening on strand fibers, hyper-detailed texture, shallow depth of field.`,
    over_shoulder_mirror: noMirror
      ? `Cinematic perspective (${cam}): over-the-shoulder angle from behind the male barber looking toward the seated female client, framing ${hideEyesInCollage ? 'her thick hair-veiled head silhouette' : 'her calm composed posture'} and the silhouette of ${h} under warm ${l}.${collageVeilClause}`
      : `Cinematic perspective (${cam}): over-the-shoulder angle from behind the male barber looking past his shoulder into the station mirror, framing ${hideEyesInCollage ? "the client's thick hair-veiled profile" : "the client's calm composed posture"} and the silhouette of ${h} under warm ${l}.${collageVeilClause}`,
    wide_shop_bustle: noMirror
      ? `Wide environmental storytelling (${cam}): wide establishing shot showing the entire styling station in ${v}. Female client seated in chair with ${c}, male barber working diligently, atmospheric shop interior showing ${d} and ${shopCrowdDesc}.`
      : `Wide environmental storytelling (${cam}): wide establishing shot showing the entire styling station in ${v}. Female client seated in chair with ${c}, male barber working diligently, vintage mirrors reflecting ${d} and ${shopCrowdDesc}.`,
    armpit_shave: `Underarm armpit shaving service: the female client relaxes comfortably in the hydraulic chair in ${v} with one arm gracefully raised behind her head, draped in ${c}. The male barber (${sl}) carefully applies rich warm shaving lather to her underarm, smoothly gliding a traditional straight razor to shave her armpit hair clean with artisan precision. Smooth skin, crisp lighting under ${l}.${pStr}`,
    chest_hair_shave: `Chest and décolletage razor grooming: close-medium shot in ${v}. The male barber (${sl}) delicately applies warm shaving foam across the female client's upper chest and collarbones, deftly gliding a warm straight razor to shave fine chest hair and body hair smooth. Clean towel draped, serene client posture under ${l}.${pStr}`,
    body_hair_shave: `Upper body & shoulder hair razor shave: the male barber (${sl}) methodically lathers the client's shoulders, arms, and neckline with rich shaving cream in ${v}, executing smooth straight-razor passes to shave all fine body hair clean. Professional barber craft, authentic chrome razor, atmospheric depth of ${d}.${pStr}`,
    post_shave_balm: `Post-shave hot towel & soothing treatment: the male barber (${sl}) gently presses a steaming aromatic hot towel across the female client's freshly shaved underarms and upper chest in ${v}, followed by a delicate application of soothing after-shave balm to nourish smooth skin under ${l}.${pStr}`,
    stool_barber_leaning: `Intimate stool seating capture: the female client sits with relaxed, upright posture on a low backless salon stool in ${v}, completely open without a tall chair back. The attentive male barber (${st}) stands directly behind her, chest practically touching her upper back, leaning forward with focused care as his arms bracket her frame and his hands work through ${h} under ${l}.${pStr}`,
    stool_scissor_close: `Intimate scissor craftsmanship on stool: close-medium shot in ${v}. The female client is seated on a low compact stool while the male barber stands millimeters behind her back, torso grazing her shoulders, holding a taut section of ${h} right in front of her cheek as sharp Japanese shears execute a precision snip with fallen clippings on ${c}.${pStr}`,
    stool_combing_intimate: `Intimate combing & parting from behind: the female client sits calmly on a low backless stool with natural spinal poise. Standing pressed close behind her, the male barber leans over her crown, one warm hand softly steadying her temple while his other hand draws a razor-sharp parting line through ${h} with a carbon tail comb under ${l}.${pStr}`,
    stool_mist_close: `Sensory misting & strand smoothing on stool: the male barber stands intimately close behind the female client seated on a small low stool, his apron and shirt lightly brushing against her shoulders. He spritzes a fine water mist over ${h} and gently glides his warm fingers through the damp lengths to smooth them over her collarbones in ${l}.${pStr}`,
    stool_nape_intimate: `Close-contact nape & neckline detailing: the female client is seated on a low stool with her head gently tilted forward, exposing her graceful nape and neck. The male barber leans down intimately close beside her ear from behind, deftly detailing the tapered perimeter of ${h} with straight razor and comb with artisan precision under ${l}.${pStr}`,
    clip_release_drop: `Layered cut transition in ${v}: the male barber (${sl}) pops open a matte salon alligator clip at her temple so heavy glossy wet crown locks of ${h} cascade smoothly down over freshly blunted nape layers onto ${c}. Distinct layer drop, glistening moisture, soft reflections under ${l}.${pStr}`,
    twisted_butterfly_bangs: `Geometric fringe carving: the male barber gathers thick damp curtain bangs of ${h}, twists them smoothly 180° between thumb and forefinger above the client's nose bridge, and executes one deliberate horizontal snip with gleaming Japanese shears. Client gazes calmly from under ${c} under ${l}.${pStr}`,
    foil_nape_shave: `Surgical stacked nape finish in ${v}: client bows her chin cleanly forward beneath ${c} exposing bare lower neck skin beneath freshly blunted ${h}, while the male barber glides cordless detail trimmers and a chrome dual foil-shaver cleanly along the hairline for zero-stubble crispness under ${l}.${pStr}`,
    flat_iron_c_bevel: `Glass-gloss thermal finish: the male barber glides sleek heated titanium plates smoothly down narrow ribbons of ${h}, rotating wrists gently inward at jawline height to bevel gleaming ends into a tight luminous C-curve under ${l}.${pStr}`,
    dry_curl_carving: `Freehand curl & wave sculpting on dry hair: zero water bottle; the male barber lifts intact organic wave ribbons of ${h} loosely between relaxed fingers and point-cuts custom diagonal spaces directly underneath curl bends for airy shape in ${v}.${pStr}`,
    duckbill_wave_set: `Sculptural pin-wave setting: combed sleek misted cheek locks curved gently alongside the cheekbone and anchored carefully with flat matte silver aluminum duckbill clips as the male barber evaluates symmetrical front drape under ${l}.${pStr}`,
    steam_towel_nape: `Spa barber transition: the male barber (${sl}) presses a steaming aromatic white cotton towel gently around the female client's exposed nape and shoulders between nape razor passes in ${v}, with delicate warmth misting in soft ${l}.${pStr}`,
    paddle_cape_sweep: `Mid-makeover transformation milestone: thick cut dark hair ribbons resting prominently across the glossy shoulders of ${c} while the male barber sweeps a wide soft-bristle paddle brush across the front cape slope onto the tiled floor in ${v}.${pStr}`,
    channel_carving_crown: `Internal channel weight carving: elevating crisp diagonal crown panels of ${h} gracefully upward from behind as open cutting shear blades slide cleanly down mid-lengths to remove heavy bulk while thick hair dust drops onto ${c}.${pStr}`,
    comb_down_veil_soak: `Pre-cut veil saturation: the male barber spritzes generous cooling mist from an aluminum bottle across front bangs of ${h} and combs saturated gleaming dark strands flat forward across her forehead and brows before precision fringe slicing under ${l}.${pStr}`
  };

    let res = templates[sceneId];
    if(!res){
      const sceneObj = salonCollageScenes.find(s => s.text === sceneId);
      const rawSceneName = sceneObj?.label || 'haircut progression action';
      const sceneName = noMirror ? sanitizeMirrorProse(rawSceneName) : rawSceneName;
      res = `Authentic salon scene focusing on ${sceneName.toLowerCase()} on ${h} with ${st} inside ${v} (${d}). Client seated draped in ${c} under ${l}.${pStr}`;
    }
    if(ctx.isStool){
      res = res
        .replace(/vintage hydraulic Belmont chair/gi, 'low backless salon cutting stool')
        .replace(/classic chrome hydraulic barber chair/gi, 'low backless salon cutting stool')
        .replace(/hydraulic Belmont chair/gi, 'low backless salon cutting stool')
        .replace(/hydraulic barber chair/gi, 'low backless salon cutting stool')
        .replace(/black leather hydraulic styling chair/gi, 'low backless cutting stool')
        .replace(/black leather salon styling chair/gi, 'low backless cutting stool')
        .replace(/hydraulic chair/gi, 'low backless stool')
        .replace(/Belmont chair/gi, 'low backless stool')
        .replace(/barber chair/gi, 'low backless cutting stool')
        .replace(/styling chair arms/gi, 'draped down around the stool')
        .replace(/styling chair/gi, 'low backless stool')
        .replace(/in the styling chair/gi, 'on the low backless stool')
        .replace(/in the barber chair/gi, 'on the low backless stool')
        .replace(/to the female client in the chair/gi, 'to the female client on the low backless stool')
        .replace(/in the chair/gi, 'on the stool')
        .replace(/the heavy chrome hydraulic pump lever of the vintage barber chair, adjusting the client's seating height with precision/gi, "the client's seated posture and position on the low backless cutting stool with artisan precision")
        .replace(/foot on the heavy chrome hydraulic pump lever[^,.]+/gi, "careful hand positioning to adjust the client's seating on the low stool");
    }
    return res;
}

const placeDetail = makeOpts([
  ['Default setting details (natural scene composition)', 'natural ambient setting composition with authentic spatial depth'],
  ['Carved sandstone jharokha archway overlooking courtyards', 'framing an intricately carved sandstone jharokha archway overlooking sunlit courtyards and stone lattices'],
  ['Private dressing mirror station with rolling brass wardrobe racks', 'a backstage dressing mirror station with warm vanity bulbs, rolling brass wardrobe racks, and designer garment bags'],
  ['Polished dark terrazzo floors with floor-to-ceiling glass reflections', 'mirror-polished dark terrazzo flooring reflecting floor-to-ceiling glass panels and ambient exterior light'],
  ['Vintage velvet chaise lounge beside tall fluted stone pillars', 'a deep velvet antique chaise lounge positioned beside monumental fluted stone pillars with classical proportions'],
  ['Raw board-formed concrete walls with minimalist linear shadow play', 'raw board-formed concrete surfaces with rhythmic tie-rod holes and sharp architectural linear shadows'],
  ['Warm amber uplighting against exposed vintage brickwork', 'warm amber LED uplighting grazing textured vintage brickwork and distressed industrial mortar'],
  ['Lush tropical palm fronds casting graphic leaf shadows', 'lush tropical palm and monstera foliage casting crisp botanical leaf shadows across warm limestone tiles'],
  ['Dramatic floating spiral staircase with brushed bronze railings', 'a monumental curved spiral staircase with smooth white plaster soffit and brushed bronze handrails in background'],
  ['Sunlit floor-to-ceiling French arched windows with flowing linen drapes', 'tall French arched windows bathing the interior in soft morning light with billowing sheer linen drapes'],
  ['Industrial iron-framed factory windows with afternoon sunbeams', 'multipanel black iron factory windows with warm afternoon sunbeams cutting through subtle atmospheric haze'],
  ['Minimalist stone bench set against monolithic limestone block wall', 'a low-profile monolithic stone bench anchored against a seamless honed limestone feature wall'],
  ['Mirror-polished black runway floor reflecting strobe lighting', 'a high-gloss black lacquer runway floor capturing crisp mirror reflections of overhead spotlights'],
  ['Gilded rococo wall moldings and antique distressed mirrors', 'ornate gilded rococo wall moldings with warm patinated plaster and antique mercury-glass accents'],
  ['Minimalist water channel and shallow basalt reflecting pool', 'a tranquil shallow basalt stone water rill with calm water ripples catching horizontal lighting'],
  ['Curated contemporary art canvases and raw plaster plinths', 'large-scale minimalist contemporary canvas art on white walls with raw plaster sculpture plinths'],
  ['Deep velvet curtain drapery pooling onto hardwood floors', 'heavy theatre-grade midnight-blue velvet drapes pooling elegantly onto dark chevron oak parquet'],
  ['Brushed stainless steel work tables and vintage vanity cases', 'industrial stainless steel backstage makeup tables with organized cosmetic brushes, palettes, and mirrors'],
  ['Sculptural travertine coffee table with art monographs', 'a sculptural low-slung travertine stone coffee table topped with oversized fashion and architecture monographs'],
  ['Backlit frosted glass partition wall with soft diffused glow', 'an architectural floor-to-ceiling frosted glass screen glowing with diffused daylight from behind'],
  ['Open-air stone balustrade with expansive horizon panorama', 'a classical carved stone balustrade overlooking an expansive panoramic horizon view'],
  ['Sun-drenched teakwood balcony railing with climbing bougainvillea', 'leaning over a polished teak balcony railing entwined with vivid magenta bougainvillea blossoms, overlooking sun-washed courtyards'],
  ['Raw board-formed concrete pillar with morning sunbeam slice', 'standing beside a massive board-formed architectural concrete pillar cut through by a sharp, warm morning sunbeam'],
  ['Low minimalist travertine coffee table with art book and candle', 'a low rectangular travertine stone coffee table displaying an open hardbound art monograph and a minimalist stone candle'],
  ['Scalloped marble jali screen casting geometric lace shadows', 'an intricately carved Mughal-style marble jali screen casting crisp, delicate geometric lace shadows across the floor and walls'],
  ['Industrial black crittall grid window with city rain streaks', 'tall industrial steel crittall grid window panes with delicate rain droplet trails reflecting soft diffused city lights'],
  ['Aged brass bar cart with crystal decanters in amber shadow', 'an elegant vintage polished brass bar cart with crystal fluted decanters catching warm amber light in the corner']
]);

const malePresenceOpts = makeOpts([
  ['Solo female model (Zero men / completely alone in frame)', 'solo'],
  ['Romantic chemistry & intimacy with male colleague', 'romantic'],
  ['Couple bike ride & road journey (Motorcycle / cafe-racer)', 'romantic_bike'],
  ['Romantic date scene (Candlelight, café, street stroll)', 'romantic_date'],
  ['Candid backstage & colleague interaction', 'candid_colleague'],
  ['Male creative crew & backstage prep (Makeup, hair & wardrobe)', 'crew_prep'],
  ['BTS grooming & body shaving prep', 'bts_shaving'],
  ['Female model grooming & pampering male partner (Shaving, beard & champi)', 'female_grooming_men']
]);

const maleInteractionOpts = makeOpts([
  ['None (Strictly solo female model in frame)', 'none', 'Solo Subject', 'solo'],
  // Romantic & Intimate Colleague Interactions
  ['Passionate editorial lips kiss with handsome male co-model', 'passionate editorial lips kiss: a handsome, sharply groomed male co-model in an unbuttoned designer collared shirt gently cups her jaw with his hand, leaning in to kiss her lips with intense, high-fashion passion and tangible chemistry while she responds with relaxed confidence', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Intimate neck kiss from behind with male model', 'intimate neck kiss from behind: the male co-model stands close behind her with both hands resting gently at her waist, leaning down to tenderly kiss the side of her neck just beneath her haircut as she tilts her head with a serene, confident smile', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Affectionate forehead & temple kiss', 'affectionate forehead kiss: tall male colleague leaning down tenderly to place a warm kiss against her temple, his arm draped lightly across her shoulder while she rests one hand over his chest with genuine warmth', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Cheek kiss & playful mutual laughter', 'cheek kiss and candid laughter: male co-model kissing her cheek playfully mid-laugh, capturing a spontaneous burst of radiant shared happiness and effortless chemistry between takes', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['High-tension near-kiss editorial intimacy', 'high-tension near-kiss editorial pose: the male model and female model positioned face-to-face with lips mere millimeters apart, noses almost touching, locked in intense, smoldering eye contact just before a kiss', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Warm protective embrace from behind around waist', 'protective embrace from behind: handsome male co-model wrapping his arms gently around her waist from behind, his chest pressed to her back and chin resting lightly near her shoulder in an intimate editorial hug', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Chest-to-chest intimate hug with arms around his neck', 'chest-to-chest close embrace: the female model with both arms wrapped around the male colleague\'s neck while his hands hold her firmly at the lower back, cheek-to-cheek contact with relaxed eyes', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Playful side hug with linked arms stroll', 'playful side hug and stroll: casual arm-in-arm stroll with her handsome male colleague, his arm wrapped around her shoulder in a relaxed, friendly embrace while they smile candidly', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Editorial power-couple pose (back-to-back seated)', 'editorial power couple: seated back-to-back on a minimalist bench, male model in sharp tailored tuxedo and female model in her designer outfit, shoulders touching with hands grazing at their sides in a poised high-fashion stance', 'Romantic & Intimate Colleague Interactions', 'romantic'],
  ['Male co-model whispering softly in her ear', 'intimate whisper: male colleague leaning in close to whisper something amusing in her ear, capturing an intrigued, radiant smile on her lips as she reacts spontaneously', 'Romantic & Intimate Colleague Interactions', 'romantic'],

  // Couple Bike Ride & Road Journey
  ['Pillion rider — arms wrapped tight around his waist at speed', 'pillion rider on open highway: she rides behind him on a classic cafe-racer motorcycle, arms wrapped snugly around his waist, chest pressed against his leather jacket, dark hair whipped by the 70 km/h wind under an open-face retro helmet, coastal sunset horizon blurring past in golden light', 'Couple Bike Ride & Road Journey', 'romantic_bike'],
  ['Scenic mountain highway rest stop — leaning against the bike', 'scenic mountain road pull-off: both leaning casually against a matte-black Triumph Bonneville parked on gravel, helmets resting on the handlebar mirrors, her head tilted tenderly against his leather-jacketed shoulder while late afternoon sun glints off chrome exhaust pipes', 'Couple Bike Ride & Road Journey', 'romantic_bike'],
  ['He fastens her retro helmet strap — tender eye-level gaze', 'tender pre-ride moment beside the motorcycle: he stands close in front of her with both hands gently fastening and adjusting the leather chin strap of her cream open-face helmet, as she looks up into his eyes with genuine warmth and playful anticipation on a sunlit city street', 'Couple Bike Ride & Road Journey', 'romantic_bike'],
  ['Windblown hair exhilaration — 60 km/h open-road portrait', 'dynamic moving road portrait at speed: seated pillion with one hand holding his hip and the other catching her hair, wind catching glossy dark tresses in an ecstatic kinetic sweep, joyful parted lips and radiant energy as asphalt lines streak into motion blur behind them', 'Couple Bike Ride & Road Journey', 'romantic_bike'],
  ['Dusk silhouette ridge — couple astride motorcycle', 'panoramic dusk silhouette: the couple astride a vintage scrambler motorcycle at the crest of an overlook hill, framed against a rich gradient sunset sky of burnt orange and indigo, crisp graphic silhouette of rider profiles, bike tank, and spoked wheels with soft rim light', 'Couple Bike Ride & Road Journey', 'romantic_bike'],
  ['Night city tunnel cruise — amber sodium neon reflections', 'night urban motorcycle cruise through an illuminated tunnel: warm amber sodium lights and neon streaks reflecting across bike chrome and his dark leather jacket, she rests her chin over his shoulder taking in the hypnotic cinematic city glow', 'Couple Bike Ride & Road Journey', 'romantic_bike'],
  ['Roadside vintage diner stop — curb seated beside the bike', 'roadside vintage neon diner stop: motorcycle parked at an angle near the curb, both sitting on the curb step sipping cold glass-bottle sodas, laughter and relaxed travel fatigue, dust on motorcycle boots, retro americana road-trip romance', 'Couple Bike Ride & Road Journey', 'romantic_bike'],

  // Romantic Date & Venue Scenes
  ['Candlelight rustic bistro dinner — warm wine & Edison glow', 'intimate candlelight bistro dinner: cozy rustic brick alcove with soft amber Edison bulb glow, low flickering candles on dark wood table, wine glasses half-raised in a private toast, deep eye contact and warm romantic resonance', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Rainy cobblestone street stroll — sharing a compact umbrella', 'rainy evening city walk: huddled close together beneath a single black umbrella on glistening wet cobblestone streets, his arm around her shoulder pulling her in from the drizzle, raindrops catching golden reflections of warm shopfronts', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Heritage rooftop terrace café at dusk — overlooking city lights', 'heritage rooftop cafe at dusk: terracotta planters filled with flowering bougainvillea, wrought-iron railing overlooking a sprawling city as dusk turns deep sapphire and streetlights flicker on, steam rising from ceramic coffee cups between them', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Vibrant night street-food market stroll — candid laughter', 'lively night street-food stroll: weaving hand-in-hand through colorful market stalls lit with warm hanging paper lanterns and festive string lights, she feeds him a bite with a spontaneous laugh, ambient steam and bokeh creating energetic intimacy', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Cozy vintage vinyl record shop — browsing crates together', 'warm-wood vintage record shop: browsing side-by-side through wooden vinyl crates, she holds up a retro album sleeve with an amused smile while he leans over her shoulder reading the liner notes in dusty afternoon sunbeams', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Golden hour coastal promenade — sunset seaside walk', 'golden-hour beach promenade: strolling along a seaside boardwalk at sunset, shoes dangling from one hand, coastal breeze gently lifting her hair, warm amber sidelight sculpting their laughing profiles against rolling ocean waves', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Rain-streaked yellow taxi backseat — cozy city transit', 'backseat of a vintage yellow taxi cab in evening rain: water droplets streaking across the window blurring neon city lights, heads leaning together in comfortable closeness, shared private warmth inside the moving vehicle', 'Romantic Date & Venue Scenes', 'romantic_date'],
  ['Fairy-lit rooftop terrace stargazing — cozy knit blanket', 'rooftop terrace stargazing under night sky: wrapped together in a heavy textured knit blanket on low floor cushions, warm fairy lights woven along the pergola, holding steaming mugs with fingers lightly intertwined under the stars', 'Romantic Date & Venue Scenes', 'romantic_date'],
  // Candid Colleague Interactions
  ['Candid laughing conversation between takes with male colleague', 'candid conversation between takes: genuine mid-sentence laughter and expressive hand gestures with her handsome male co-model between camera setups, sharing an inside joke', 'Candid Colleague Interactions', 'candid_colleague'],
  ['Casual coffee break chatting on set with male co-model', 'casual coffee break: female model and male colleague holding ceramic espresso cups, chatting comfortably beside production gear with relaxed posture and easy banter', 'Candid Colleague Interactions', 'candid_colleague'],
  ['Reviewing preview monitor photos together with male colleague', 'reviewing monitor shots: female model and male co-model leaning in together over the photographer\'s tethered digital monitor, pointing at preview shots with genuine smiles of approval', 'Candid Colleague Interactions', 'candid_colleague'],
  ['Walking side-by-side through the venue in candid banter', 'side-by-side walking banter: strolling together through the shoot location with natural synchronized strides, talking and laughing spontaneously between takes', 'Candid Colleague Interactions', 'candid_colleague'],
  // Male Creative Crew & Stylists
  ['Male makeup artist applying lipstick / lip gloss with fine brush', 'male makeup artist at work: attentive male makeup artist in black studio apron holding a fine detail brush, gently supporting her chin with a soft tissue while applying lip lacquer to her lips as she tilts her head up gracefully', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male makeup artist dusting cheekbones with translucent powder', 'makeup powder touch-up: skilled male beauty artist holding a large fluffy kabuki brush, delicately dusting translucent setting powder across her cheekbones and temple with focused professional precision', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male beauty artist detailing eye makeup & contouring', 'eye makeup detailing: male beauty artist using a slender blending brush around her eyelids, his focused gaze and skilled hand posture highlighting high-fashion backstage artistry', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist adjusting curtain bangs with tail comb', 'hairstylist touch-up: stylish male hairstylist standing beside her with a black carbon tail comb, gently teasing and positioning her curtain bangs to frame her face with millimeter accuracy', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist misting texturizing hairspray into hairstyle', 'hair misting finish: male hairstylist shielding her forehead with a professional styling guard while misting fine texturizing spray into her ponytail and crown layers', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist point-cutting curtain bangs on set between camera flashes', 'active on-set scissor trim: attentive male hairstylist in black utility apron leaning closely beside the studio stool, clamping damp front fringe taut between fingers and vertically point-cutting soft cheekbone-framing wisps with gleaming Japanese shears between flash pops', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist soaking damp front strands with aluminum spray bottle & comb', 'backstage hair wetting prep: male hairstylist pumping cool fine water mist from an aluminum salon spritzer across her front hair and combing glistening damp strands smoothly down over brow height with a carbon cutting comb', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist round-brush blow-drying crown lift before key-light exposure', 'live set blowout craft: male hairstylist holding a concentrated-nozzle chrome hairdryer in one hand while spinning a ceramic boar-bristle round brush sharply upward through her crown layers for voluminous lift', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist gliding titanium flat-iron for glassy jawline C-curve beveling', 'on-set thermal beveling: male hairstylist clamping sleek flat-iron plates down damp-to-dry hair ribbons right beside her cheek and curving his wrist neatly inward at the jawline to seal mirror-bright sheen', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist slide-cutting cheek tendrils under studio sidelight', 'editorial dry carving on set: male hairstylist guiding open Japanese shear blades smoothly downward along dry front layers beside her cheekbones under dramatic studio lights as delicate cut whispers flutter onto her collarbones', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist unclipping colorful butterfly section clamps mid-preparation', 'backstage clip release: male hairstylist deftly unclipping stacked salon butterfly sectioning clamps layer-by-layer so glossy freshly styled tiers drop smoothly into place around her shoulders', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist thinning-shears texturizing weight from ends between takes', 'mid-shoot weight feathering: male hairstylist lifting heavy outer hair locks over flat fingers and rhythmically snapping notched thinning shears cleanly through mid-lengths for airy editorial movement', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist diffuser-cupping natural waves upwards with warm airflow', 'live curl diffusion on set: male hairstylist cradling wavy locks inside a wide black diffuser attachment against the side of her head, pressing soft waves gently upward toward her temple with open fingers', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist detailing nape & temple hairline with cordless trimmer', 'studio stool perimeter lineup: male hairstylist crouching smoothly beside the studio stool holding a sleek matte cordless detail trimmer to carve an ultra-clean hairline along her nape and beside her ear', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist carving clean zig-zag crown parting with steel pintail tip', 'backstage geometric parting: male hairstylist drawing the slender steel pin of a sectioning comb lightly across her crown in an interlocking zig-zag stitch while her hair drapes naturally over one shoulder', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist sculpting sleek S-waves with aluminum duckbill clips', 'backstage pin-wave styling: male hairstylist combing gleaming glossed hair around her cheekbone into smooth S-waves and pinning flat matte metal duckbill clips delicately along the curve', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male hairstylist sweeping cut hair wisps off bare collarbone with neck duster', 'on-set grooming cleanup: male hairstylist lightly dusting clinging dark cut hair snippets off her exposed collarbone and neck skin using a soft wooden-handled talc horsehair neck duster', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Collaborative male crew: one styling hair, one touching up lip gloss', 'collaborative male styling team: two male creative crew members working simultaneously—one male stylist adjusting hair layers from behind while a male makeup artist delicately touches up her lips', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male wardrobe stylist adjusting gown plunge neckline & straps', 'wardrobe styling adjustment: professional male fashion stylist carefully adjusting the shoulder straps and deep plunge neckline of her outfit, ensuring flawless fabric draping across her collarbones', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male stylist kneeling to smooth gown hem & high leg slit', 'wardrobe hem adjustment: meticulous male stylist kneeling on the studio floor, smoothing the fluid fabric folds and high slit of her gown so the hem falls gracefully', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male fashion stylist pinning garment waistline from behind', 'backstage garment tailoring: male fashion stylist standing behind her, using dressmaker pins to snatch and adjust the garment waistline for an impeccable custom fit', 'Male Creative Crew & Stylists', 'crew_prep'],
  ['Male photographer demonstrating pose and speaking encouragingly', 'photographer interaction: charismatic male photographer holding a medium-format camera lowered to his chest, demonstrating an editorial pose while speaking encouragingly to her as she reacts naturally', 'Male Creative Crew & Stylists', 'crew_prep'],
  // BTS Body Shaving & Grooming
  ['Male groomer shaving armpit hair clean with precision razor', 'backstage underarm shaving prep: the female model relaxes comfortably in a backstage makeup chair with one arm elegantly raised behind her head, draped in a soft robe, while an attentive male groomer applies warm foamy lather to her underarm and smoothly glides a precision razor to shave her armpit hair completely clean and smooth for the shoot', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Male stylist shaving fine chest hair & décolletage with warm lather', 'pre-shoot chest and décolletage razor grooming: male grooming specialist gently working rich shaving lather across the female model\'s upper chest and collarbones, deftly shaving fine chest hair and body hair with smooth, delicate razor strokes before she dresses in a plunging neckline gown', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Male groomer shaving body hair on shoulders and arms', 'body hair grooming service: male groomer applying warm lather and a sleek safety razor along her shoulders, arms, and collarbones to shave away fine body hair, with steaming white towels and grooming essentials neatly arranged on the tray', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Complete smooth body shaving touch-up with lather & razor', 'comprehensive body hair shave: attentive male groomer performing a meticulous pre-shoot shave on her underarms and upper body with warm lather and fresh razor, ensuring completely smooth, radiant skin under shoot lighting', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Post-shave soothing balm application by male groomer', 'post-shave soothing skincare: male groomer delicately pressing a warm damp towel to her freshly shaved underarms and chest, followed by a gentle massage of soothing after-shave balm to nourish smooth skin', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Male groomer straight-razor cleaning lower nape hairline & wispy neck hairs', 'backstage nape razor shave: attentive male groomer leaning closely behind her lowered chin, spreading light warm foam across the bare nape below her pinned bob and pulling a traditional chrome straight razor smoothly to leave crisp spotless neck skin', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Male beauty specialist dermaplaning peach fuzz smoothly along jawline & cheek', 'precision facial blade prep: male skincare specialist tautening her cheekbone softly with gloved fingertips while gliding a fine angled dermaplaning blade lightly downward to reveal luminous camera-ready skin', 'BTS Body Shaving & Grooming', 'bts_shaving'],
  ['Male groomer clearing post-trim baby hairs with steaming aromatic damp towel', 'refreshing backstage prep: male groomer pressing a folded steaming white cotton towel smoothly along her nape, hairline, and collarbones before wiping dry with radiant skin luster', 'BTS Body Shaving & Grooming', 'bts_shaving'],

  // Female Model Grooming & Pampering Men (Shaving, Beard, Mustache & Champi)
  // 1. Beard & Mustache Shaving (6 Actions)
  ['Model whipping warm shaving lather and brushing man\'s beard', 'Female model whipping rich shaving cream into dense warm froth in a ceramic barber mug, gently painting thick foam across the man\'s beard, jawline, and cheeks with a badger-hair brush as he tilts his head back in a leather chair', 'Beard & Mustache Shaving', 'female_grooming_men'],
  ['Model shaving man\'s cheek & jawline with classic straight razor', 'Female model holding a traditional chrome straight razor at a precise 30-degree angle, stretching his cheek skin taut with one hand while shaving the beard stubble off his jawline with delicate, confident strokes', 'Beard & Mustache Shaving', 'female_grooming_men'],
  ['Model shaving man\'s throat and neckline with straight razor', 'Female model standing over the seated man, holding his chin up gently with one finger while deftly gliding a straight razor along his exposed neck and Adams apple with focused concentration', 'Beard & Mustache Shaving', 'female_grooming_men'],
  ['Model trimming & detailing man\'s mustache with shears and comb', 'Female model leaning in close to the seated man, using precision small barber scissors and a black mustache comb to detail his mustache line, her expressive eyes locked in artisan focus', 'Beard & Mustache Shaving', 'female_grooming_men'],
  ['Model applying soothing alum block and sandalwood aftershave splash', 'Female model gently gliding a smooth wet alum block over his freshly shaved jawline, followed by patting soothing sandalwood aftershave splash across his cheeks with both open palms', 'Beard & Mustache Shaving', 'female_grooming_men'],
  ['Model wiping residual lather with warm damp cloth from his face', 'Female model delicately holding a warm damp white cotton towel, gently wiping clean the residual shaving foam from his lips, chin, and jawline with an affectionate smile', 'Beard & Mustache Shaving', 'female_grooming_men'],

  // 2. Men\'s Underarm Hair Shaving (5 Actions)
  ['Model applying warm foamy lather to man\'s underarm', 'Female model applying rich, warm shaving lather into the male model\'s armpit with her fingertips, while he reclines comfortably shirtless on a studio bench with one arm raised behind his head', 'Men\'s Underarm Shaving', 'female_grooming_men'],
  ['Model shaving man\'s underarm hair clean with precision razor', 'Female model gently holding the skin of his raised arm taut, smoothly gliding a precision chrome razor down the hollow of his underarm to shave away all underarm hair, revealing clean smooth skin', 'Men\'s Underarm Shaving', 'female_grooming_men'],
  ['Model wiping freshly shaved underarm with steaming hot damp towel', 'Female model pressing a warm, steaming damp towel to his freshly shaved armpit to soothe the skin and clean away stray hair clippings, her other hand resting on his bicep', 'Men\'s Underarm Shaving', 'female_grooming_men'],
  ['Model massaging soothing post-shave balm into man\'s underarm', 'Female model gently massaging cooling aloe vera and tea-tree aftershave balm into his smooth, freshly shaved underarm with light circular thumb strokes as he relaxes completely', 'Men\'s Underarm Shaving', 'female_grooming_men'],
  ['Model inspecting smooth clean underarm shave with admiring touch', 'Female model lightly brushing her fingertips across his smooth, freshly shaved underarm to inspect the clean razor finish, sharing a candid, affectionate half-smile', 'Men\'s Underarm Shaving', 'female_grooming_men'],

  // 3. Traditional Indian Champi (Scalp Massage) (6 Actions)
  ['Traditional Indian champi: pouring warm Ayurvedic oil into man\'s hair', 'Female model standing behind the seated man, parting his hair with one hand and pouring a thin stream of warm golden Brahmi/Bhringraj herbal oil directly onto his crown from a small brass cruet', 'Traditional Indian Champi', 'female_grooming_men'],
  ['Traditional Indian champi: rhythmic circular scalp massage on crown', 'Female model using both hands with spread fingers to deeply knead and circulate warm herbal oil into his scalp, working in rhythmic circular pulses that stimulate the roots as he closes his eyes in blissful relaxation', 'Traditional Indian Champi', 'female_grooming_men'],
  ['Champi temple & forehead pressure point relief on man', 'Female model resting her fingers over his crown while using both thumbs to apply firm, soothing pressure to his temples and brow bone, releasing tension as he leans his head back against her torso', 'Traditional Indian Champi', 'female_grooming_men'],
  ['Champi rhythmic scalp clapping and knuckle tapping (Thappi)', 'Female model executing authentic rhythmic Indian champi percussive tapping and cupping motions across his scalp with cupped palms and loose knuckles, sending ripples of tingling relaxation through him', 'Traditional Indian Champi', 'female_grooming_men'],
  ['Deep thumb kneading at the base of man\'s skull (Occipital ridge)', 'Female model cradling the sides of his head while her thumbs press deeply into the hollows at the base of his skull and upper cervical spine, as his head tilts gently back in serene release', 'Traditional Indian Champi', 'female_grooming_men'],
  ['Model running oiled fingers through man\'s hair smoothing strands', 'Female model running both hands slowly through his oil-enriched hair from forehead to nape, gathering and smoothing the dark glossy strands in an intimate, tranquil post-champi moment', 'Traditional Indian Champi', 'female_grooming_men'],

  // 4. Neck, Trapezius & Shoulder Massage (5 Actions)
  ['Model massaging warm oil into man\'s neck and trapezius muscles', 'Female model standing behind the seated shirtless man, working warm herbal massage oil into the nape of his neck and trapezius muscle ridges with strong, fluid palm strokes', 'Neck, Trapezius & Shoulder Massage', 'female_grooming_men'],
  ['Model applying deep thumb pressure to man\'s tight shoulder knots', 'Female model leaning over the seated man, focusing both thumbs into his tight shoulder knots beside the shoulder blades, working out tension as he exhales deeply', 'Neck, Trapezius & Shoulder Massage', 'female_grooming_men'],
  ['Chest & collarbone soothing oil massage on reclining man', 'Female model gently smoothing warm scented oil across his upper chest, clavicles, and shoulders with broad open-palm gliding motions while he reclines comfortably', 'Neck, Trapezius & Shoulder Massage', 'female_grooming_men'],
  ['Forearm and hand reflexology massage on male partner', 'Female model seated beside him, holding his forearm in her lap and using both thumbs to massage his palm and forearm muscles with nourishing almond oil', 'Neck, Trapezius & Shoulder Massage', 'female_grooming_men'],
  ['Resting hands warmly on man\'s shoulders after soothing massage', 'Female model standing behind the man, resting both hands flat and warm over his relaxed bare shoulders, chin tilted slightly with a soft, caring, confident expression', 'Neck, Trapezius & Shoulder Massage', 'female_grooming_men'],

  // 5. Hot Towel & Post-Grooming Soothing (4 Actions)
  ['Wrapping man\'s face in steaming aromatic hot barber towel', 'Female model carefully draping a steaming hot white barber towel over his face and beard, leaving only his nose exposed to breathe, gently pressing the warmth into his pores with open hands', 'Hot Towel & Post-Grooming Soothing', 'female_grooming_men'],
  ['Unwrapping hot towel from man\'s face revealing glowing skin', 'Female model gently peeling the warm towel away from his face and neck, with delicate wisps of steam rising, revealing his smooth, refreshed skin', 'Hot Towel & Post-Grooming Soothing', 'female_grooming_men'],
  ['Applying chilled rosewater toner mist across man\'s freshly shaved face', 'Female model holding a vintage amber glass spray bottle, spritzing a fine refreshing mist of chilled rosewater over his clean shaven face while shielding his eyes with her hand', 'Hot Towel & Post-Grooming Soothing', 'female_grooming_men'],
  ['Applying soothing sandalwood moisturizer to man\'s face and neck', 'Female model lightly dabbing soothing sandalwood moisturizing cream across his cheeks, chin, and neck, blending it in with gentle upward palm strokes', 'Hot Towel & Post-Grooming Soothing', 'female_grooming_men'],

  // 6. Men's Haircutting, Fade & Styling Work (6 Actions)
  ['Model scissor-over-comb top crop trimming on male partner', 'Female model standing tightly beside the seated male partner holding a flat white barber comb vertically through his damp crown locks and executing smooth, even scissor-over-comb trimming passes with calm artisan precision', 'Men\'s Haircutting & Styling Work', 'female_grooming_men'],
  ['Model executing clean temple skin-fade blend on man with cordless clippers', 'Female model leaning intently beside the male partner\'s profile, holding chrome cordless fade clippers tilted neatly along his temple and nape hairline while steadying his brow calmly with her free hand', 'Men\'s Haircutting & Styling Work', 'female_grooming_men'],
  ['Model point-cutting textured French crop fringe on man with shears & comb', 'Female model bracing damp front hair neatly between her fingers above the man\'s eyebrows, point-cutting airy textured French crop graduation with Japanese shears as cut hair wisps fall onto his draped shoulders', 'Men\'s Haircutting & Styling Work', 'female_grooming_men'],
  ['Model straight-razor cleaning man\'s nape & behind-ear neckline', 'Female model gently guiding the male partner\'s head tilted slightly forward, pulling neck skin taut beside his ear and smoothly gliding a traditional folding straight razor along his bare nape hairline', 'Men\'s Haircutting & Styling Work', 'female_grooming_men'],
  ['Model misting & round-brush blow-drying man\'s pompadour crown', 'Female model spritzing fine mist over the male partner\'s top hair and rotating a sleek round brush smoothly under warm hairdryer airflow to sculpt natural lifted crown volume', 'Men\'s Haircutting & Styling Work', 'female_grooming_men'],
  ['Model finger-raking matte styling clay through man\'s damp hair', 'Female model warming artisan matte styling clay between her palms before raking splayed fingers smoothly forward and upward through his freshly textured crop with playful intimacy', 'Men\'s Haircutting & Styling Work', 'female_grooming_men']
]);

addOptions(background, makeOpts([
  // Heritage Havelis & Palaces
  ['Rajasthani haveli with carved sandstone jharokhas', 'an authentic Rajasthani heritage haveli courtyard with intricately carved golden sandstone jharokhas, cusped arches, and marble water basin'],
  ['Udaipur lake palace marble terrace', 'a grand white marble terrace of a royal Udaipur lake palace overlooking shimmering waters and distant Aravali hills at sunset'],
  ['French Renaissance chateau salon with gilded boiserie', 'a palatial French Renaissance chateau salon with ornate gilded boiserie wall paneling, herringbone parquet, and grand crystal chandelier'],
  ['Italian neoclassical villa colonnade', 'a sunlit neoclassical Italian lakeside villa colonnade with soaring fluted Corinthian columns and terracotta urns'],
  ['Mughal heritage pavilion with lotus fountain pool', 'a symmetrical red sandstone and white marble Mughal pavilion with geometric stone screens, cypress trees, and calm lotus pool'],
  ['Chettinad heritage mansion with carved teak pillars', 'an expansive Chettinad heritage mansion with polished Athangudi floor tiles, carved Burma teak pillars, and brass oil lamps'],
  // Runway & Backstage
  ['Paris fashion week runway catwalk with flashing camera pit', 'a high-energy Paris fashion week elevated runway catwalk with mirror-lacquer black floor, dramatic spotlight wash, and crowded front-row photographer pit'],
  ['Haute couture backstage dressing area with garment racks', 'a bustling backstage haute couture dressing suite with rolling stainless steel clothing racks filled with organza gowns, hair and makeup vanity stations, and production call sheets'],
  ['Illuminated glass runway catwalk with strobe tunnel', 'a futuristic fashion runway with an underlit frosted glass catwalk, minimalist industrial truss lighting, and atmospheric smoke haze'],
  ['Milan fashion week photo call backdrop wall', 'a sleek matte-grey Milan fashion week press call backdrop with subtle designer relief monogram and direct flash photography lighting'],
  ['Designer VIP fitting atelier with floor-to-ceiling tri-fold mirrors', 'an exclusive private couture fitting salon in an atelier with deep ivory velvet draping, plush silk rugs, and architectural tri-fold mirrors'],
  // Luxury Nightlife & Speakeasies
  ['Dimly lit velvet jazz speakeasy with brass accents', 'an intimate subterranean velvet-clad jazz lounge with ribbed walnut bar counters, warm amber banker lamps, and moody low-key shadows'],
  ['Glass rooftop infinity lounge overlooking illuminated skyline', 'a sleek open-air rooftop sky lounge with perimeter glass walls, minimalist linear fire pit, and panoramic illuminated city skyscrapers'],
  ['Art Deco cocktail salon with black marble & onyx counters', 'a lavish Art Deco cocktail salon featuring backlit green onyx bar front, polished brass geometric lattices, and deep emerald banquette seating'],
  ['Moody neon-lit subterranean Tokyo lounge', 'a sultry retro-futuristic cocktail lounge with neon cyan and magenta accents reflecting off wet black lacquer tables and acoustic felt walls'],
  ['Private members club library with leather armchairs', 'an exclusive private members club library with floor-to-ceiling mahogany bookstacks, rolling brass ladders, and tufted cognac leather chesterfields'],
  // Exotic Nature, Botanical & Dunes
  ['Golden hour desert sand dunes with wind-rippled crests', 'vast undulating golden desert sand dunes at late afternoon, with crisp wind-sculpted sand ridges and warm glowing horizon'],
  ['Lush tropical Victorian greenhouse conservatory', 'a soaring 19th-century glass and wrought-iron botanical conservatory dense with towering palms, giant monstera fronds, and humid mist'],
  ['Misty Himalayan pine forest glade with morning sunbeams', 'a serene high-altitude Himalayan pine forest clearing with soft blue fog, mossy stone slabs, and dramatic golden shafts of morning light'],
  ['Mediterranean seaside cliffside olive grove', 'a rugged limestone cliff terrace above turquoise Mediterranean water, surrounded by ancient gnarled olive trees and dry stone walls'],
  ['Black volcanic sand beach with surging ocean spray', 'a dramatic Icelandic black basalt sand beach with surging foamy white ocean surf and towering sea-stack monoliths'],
  // Modernist Architecture & Museums
  ['Monumental exposed concrete art museum atrium', 'a dramatic brutalist art museum atrium with soaring board-formed grey concrete walls, sharp angular skylight shafts, and smooth poured-concrete floors'],
  ['Curved sculptural spiral gallery staircase', 'an expansive minimalist contemporary art gallery with a monumental curved white plaster spiral staircase and museum-grade track lighting'],
  ['Minimalist cantilevered glass pavilion over reflecting pool', 'an architectural modernist glass pavilion cantilevered over a serene black granite reflecting pool mirroring the sky'],
  ['Monolithic limestone museum plaza with minimalist water channel', 'a tranquil modernist courtyard framed by monumental raw travertine stone walls, a shallow linear water rill, and a solitary bonsai maple tree'],
  ['Industrial gallery loft with exposed steel beams & sawtooth skylights', 'a cavernous converted industrial loft gallery with exposed rust-patina steel trusses, whitewashed brick, and northern sawtooth skylights']
]));


// ==========================================
// MODULAR SEPARATES ENGINE (TOPS & BOTTOMS)
// ==========================================

let wardrobeMode = 'ensemble';

const fields={
salonVenueCategory:{label:'Establishment category',section:'salonVenueSec',opts:SALON_VENUE_CATEGORIES,def:0},
salonVenue:{label:'Establishment type',section:'salonVenueSec',opts:salonVenue,def:0},
salonDesign:{label:'Shop design & interior style',section:'salonVenueSec',opts:salonDesign,def:0},
salonBarberStaff:{label:'Barber staff count',section:'salonVenueSec',opts:salonBarberStaff,def:0},
salonBustle:{label:'Crowd density & bustle',section:'salonVenueSec',opts:salonBustle,def:0},
salonTime:{label:'Time of day & light',section:'salonVenueSec',opts:salonTime,def:0},
salonStationProps:{label:'Counter & station props',section:'salonVenueSec',opts:salonStationProps,def:0},
salonStage:{label:'Haircut progress & moment',section:'salonStageSec',opts:salonStage,def:0},
salonStylist:{label:'Barber / Stylist presence',section:'salonStageSec',opts:salonStylist,def:0},
salonChairPose:{label:'Client chair pose & posture',section:'salonStageSec',opts:salonChairPose,def:0},
salonBarberPose:{label:'Female model (barber) working pose & stance',section:'salonStageSec',opts:salonBarberPose,def:0},
salonExpression:{label:'Client expression & reaction',section:'salonStageSec',opts:salonClientExpressions,def:0},
salonStoolType:{label:'Stool & seating style',section:'salonStageSec',opts:salonStoolType,def:0},
salonBarberProximity:{label:'Barber intimate proximity & body contact',section:'salonStageSec',opts:salonBarberProximity,def:0},
salonIntimateHairAction:{label:'Hair work & in-progress action',section:'salonStageSec',opts:salonIntimateHairAction,def:0},
salonStoolModelPosture:{label:'Model posture & expression on stool',section:'salonStageSec',opts:salonStoolModelPosture,def:0},
salonHairCategory:{label:'Haircut style family',section:'salonHairSec',opts:HAIR_FAMILIES,def:0},
salonHaircut:{label:'Haircut being cut',section:'salonHairSec',opts:hair,def:0},
salonFaceHairCoverage:{label:'% of face behind hair (veil coverage)',section:'salonHairSec',opts:hairFaceCoverageOpts,def:0},
salonFaceObfuscMode:{label:'Face concealment method',section:'salonHairSec',opts:faceObfuscModeOpts,def:0},
salonHairTexture:{label:'Hair texture & density',section:'salonHairSec',opts:salonHairTexture,def:0},
salonClipperGuard:{label:'Fade & clipper guard depth',section:'salonHairSec',opts:salonClipperGuards,def:0},
salonCape:{label:'Cutting cape & drape',section:'salonCameraSec',opts:salonCape,def:0},
salonCamera:{label:'Camera angle & mirror POV',section:'salonCameraSec',opts:salonCamera,def:0},
salonLighting:{label:'Salon lighting & practicals',section:'salonCameraSec',opts:salonLighting,def:0},
salonQuality:{label:'Photography style & texture',section:'salonCameraSec',opts:salonQuality,def:0},
salonCollageFlow:{label:'2×2 Collage Storyboard Flow',section:'salonCollageSec',opts:salonCollageFlow,def:0},
salonCollageFrame1:{label:'Panel 1 Scene (Top-Left)',section:'salonCollageSec',opts:salonCollageScenes,def:0},
salonCollageFrame2:{label:'Panel 2 Scene (Top-Right)',section:'salonCollageSec',opts:salonCollageScenes,def:11},
salonCollageFrame3:{label:'Panel 3 Scene (Bottom-Left)',section:'salonCollageSec',opts:salonCollageScenes,def:27},
salonCollageFrame4:{label:'Panel 4 Scene (Bottom-Right)',section:'salonCollageSec',opts:salonCollageScenes,def:26},

hairCategory:{label:'Haircut category',section:'look',opts:HAIR_FAMILIES,def:0},
outfitCategory:{label:'Wardrobe category',section:'wardrobe',opts:OUTFIT_FAMILIES,def:0},
topCategory:{label:'Top piece category',section:'wardrobe',opts:TOP_FAMILIES,def:0},
topPiece:{label:'Top garment & silhouette',section:'wardrobe',opts:topPieces,def:0},
bottomCategory:{label:'Bottom piece category',section:'wardrobe',opts:BOTTOM_FAMILIES,def:0},
bottomPiece:{label:'Bottom garment & denim style',section:'wardrobe',opts:bottomPieces,def:0},
midriffStyling:{label:'Midriff & waistband styling',section:'wardrobe',opts:midriffStylings,def:0},

poseCategory:{label:'Pose category',section:'pose',opts:POSE_FAMILIES,def:0},
shotCategory:{label:'Shot category',section:'camera',opts:SHOT_FAMILIES,def:0},
sceneCategory:{label:'Location category',section:'scene',opts:SCENE_FAMILIES,def:0},
lightingCategory:{label:'Lighting category',section:'scene',opts:LIGHTING_FAMILIES,def:0},
sideSweepSide:{label:'Which shoulder hair is swept to',section:'look',opts:sideSweepSideOpts,def:0},
sideSweepFlip:{label:'Root hair flip & crown lift',section:'look',opts:sideSweepFlipOpts,def:0},
sideSweepEnd:{label:'Where side-swept hair ends',section:'look',opts:sideSweepEndOpts,def:0},
sideSweepFinish:{label:'Side-swept finish (wet or dry)',section:'look',opts:sideSweepFinishOpts,def:0},
ponyTailFall:{label:'Where ponytail falls (front / back)',section:'look',opts:ponyTailFallOpts,def:0},
ponyTailEnd:{label:'Where ponytail ends',section:'look',opts:ponyTailEndOpts,def:0},
ponyBaseHeight:{label:'Ponytail base height',section:'look',opts:ponyBaseHeightOpts,def:0},
ponyBaseWrap:{label:'Ponytail base wrap & hardware',section:'look',opts:ponyBaseWrapOpts,def:0},
ponyTailStyle:{label:'Ponytail tail texture & finish',section:'look',opts:ponyTailStyleOpts,def:0},
makeover:{label:'Makeover moment',section:'look',opts:[O('Solo reveal after salon styling','the sleek post-makeover haircut has just been completed, showcasing her finished salon styling with a confident, candid reaction as a solo subject'),O('Reveal right after salon','the makeover has just been completed, and she is excited to reveal her new look'),O('Just stepped out of salon','she has just stepped out of the salon, showing off her new hairstyle'),O('Fresh salon finish','the finished styling has settled beautifully with natural bounce and clean movement just after the makeover'),O('Candid reveal reaction','she is enjoying a spontaneous makeover reveal moment'),O('First look in studio','she has just entered the studio for the first shots after her makeover'),O('Between-shot reset','the photographer catches a natural moment between formal poses'),O('Showcasing finished haircut','she is casually showcasing the finished haircut to the photographer'),O('Fresh styling, still settling','her freshly styled hair is settling naturally as she moves'),O('Mid-makeover pause with butterfly section clips still pinned in crown','mid-makeover hair-work moment: colorful salon butterfly sectioning clips remain neatly pinned across her upper crown while freshly cut lower layers frame her cheekbones'),O('Mid-cut damp hair restyle pause with fresh wispy ends','in-progress styling moment: freshly trimmed hair hangs gleaming and lightly damp with sharp piecey separation along her jawline between cutting stages'),O('Self-adjusting damp curtain bangs & tucking strays between takes','live hair-work reset: captured mid-motion as she lightly rakes and adjusts glistening damp curtain bangs and tucks stray locks between studio takes'),O('Holding brushed aluminum mist bottle during live hair reset','between-frame misting moment: holding a brushed aluminum salon water spritzer casually in one hand after misting moisture into restless hair strands'),O('Freshly razor-feathered ends with clipped wisps resting on shoulders','raw mid-makeover moment: newly razor-feathered ends settle organically around her neck with a few delicate freshly cut hair wisps resting visibly along her bare shoulders'),O('Half-clipped aluminum duckbill wave-set framing cheekbones','sculptural in-progress pin-wave moment: flat matte metal aluminum duckbill clips hold glossy combed wave ridges along one temple while the opposite side drapes naturally'),O('Pausing mid-parting change with steel pintail comb at hairline','live restyle pause: holding a slender carbon pintail comb gently at her parting line mid-way through switching from a center part into a sweeping deep side part'),O('Running spread fingers upward through damp crown blowout pause','active between-pass pause: fingers slid softly upward through warm damp-to-dry blowout layers to let fresh crown volume settle before key lighting'),O('Freshly blunted jawline perimeter straight out of cutting chair','immediate post-cut pause: crisp freshly blunted ends hold raw geometric salon precision just moments after standing up from the cut'),O('Between-shot bang micro-trim pause on low studio stool','in-progress detail pause: seated upright on a studio stool immediately between micro-trim passes as fine front wisps settle across her brow'),O('Mid-blowout thermal round-brush bend cooling along cheekbones','in-progress blowout transition: freshly heated, curved C-bend lengths cool down into bouncy glass-smooth shape right around her chin and collarbones'),O('Stepping onto mark straight out of active mist-and-comb restyle','live editorial changeover: stepping effortlessly onto the studio floor moments after fresh spray-bottle misting and fine comb shaping'),O('Mid-shoot flat-iron C-curve bevel touch-up under key lights','live thermal touch-up pause: glassy freshly beveled front ends catch crisp studio specular light immediately after a titanium straightener pass')],def:0},
mode:{label:'Reference workflow',section:'look',opts:[O('Edit the supplied reference','Edit the supplied reference image, preserving the same adult woman and making only the requested styling and photoshoot changes'),O('New image using reference identity','Create a new photograph using the supplied reference image as identity guidance for the same adult woman')],def:0},hair:{label:'Specific haircut',section:'look',opts:hair,def:0},
hairFaceCoverage:{label:'% of face behind hair (veil coverage)',section:'look',opts:hairFaceCoverageOpts,def:0},
faceObfuscMode:{label:'Face concealment method',section:'look',opts:faceObfuscModeOpts,def:0},
hairColor:{label:'Hair color',section:'look',opts:hairColor,def:0},hairFinish:{label:'Hair finish',section:'look',opts:hairFinish,def:0},
outfit:{label:'Specific outfit',section:'wardrobe',opts:outfit,def:0},outfitFit:{label:'Fabric and fit',section:'wardrobe',opts:outfitFit,def:0},accessories:{label:'Accessories',section:'wardrobe',opts:accessories,def:12},makeup:{label:'Makeup direction',section:'wardrobe',opts:makeup,def:0},
pose:{label:'Specific pose',section:'pose',opts:pose,def:0},malePresence:{label:'Male presence / Co-stars & crew',section:'pose',opts:malePresenceOpts,def:0},maleInteraction:{label:'Male colleague & crew interaction',section:'pose',opts:maleInteractionOpts,def:0},expression:{label:'Expression',section:'pose',opts:expression,def:0},gesture:{label:'Hand / gesture detail',section:'pose',opts:gesture,def:0},mood:{label:'Overall attitude',section:'pose',opts:mood,def:0},
framing:{label:'Specific framing',section:'camera',opts:framing,def:3},angle:{label:'Camera angle',section:'camera',opts:angle,def:0},lens:{label:'Lens / perspective',section:'camera',opts:lens,def:1},composition:{label:'Composition',section:'camera',opts:composition,def:2},aspect:{label:'Image ratio',section:'camera',opts:aspect,def:0},
background:{label:'Specific location',section:'scene',opts:background,def:0},placeDetail:{label:'Granular architectural setting',section:'scene',opts:placeDetail,def:0},lighting:{label:'Specific lighting',section:'scene',opts:lighting,def:0},style:{label:'Photography style',section:'scene',opts:style,def:0},grade:{label:'Color grade',section:'scene',opts:grade,def:0},quality:{label:'Output quality',section:'scene',opts:quality,def:0}
};

// SECOND EXPANSION: another substantial layer of distinct variants and detailed controls.
const extraPoseBases=[
['Turning while stepping onto a mark','turning while stepping onto the studio mark'],['Leaning lightly on a tall stool','leaning lightly on a tall stool with a confident side glance'],['Holding a jacket by the collar','holding a jacket loosely by its collar while smiling toward camera'],['Resting a hand on a pocket edge','resting one hand at the pocket edge in a relaxed stance'],['Tilting toward the photographer','tilting slightly toward the photographer while listening'],['Catching a loose hair strand','catching a loose strand of hair and tucking it back'],['Standing with crossed wrists','standing with wrists loosely crossed in front, shoulders relaxed'],['Turning while holding a clutch','turning while holding a small clutch at her side'],['Pausing beside a clothing rack','pausing beside a clothing rack with a candid expression'],['Taking a seat mid-conversation','taking a seat mid-conversation with relaxed hands'],['Looking back while fixing a cuff','looking back while casually fixing a sleeve cuff'],['Stepping away from the styling station','stepping away from the styling station after the final touch-up'],['Gently sweeping hair off one shoulder','gently sweeping hair off one shoulder to reveal the haircut'],['Standing with a relaxed hip shift','standing with a natural hip shift and shoulders at ease'],['Leaning forward with one palm on table','leaning forward with one palm resting lightly on a table'],['Turning from the window','turning away from a window toward the photographer'],['Sitting upright with one elbow supported','sitting upright with one elbow naturally supported'],['Smiling at an off-frame comment','smiling at a comment from someone outside the frame'],['Walking while looking over shoulder','walking while looking over one shoulder'],['Smoothing a lapel during a reset','smoothing a lapel during a natural reset between frames'],['Keeping one hand near the waist','keeping one hand near the waist in an easy confident stance'],['Standing under a doorway light','standing under doorway light with the head turned slightly'],['Leaning shoulder-first into frame','leaning shoulder-first into the composition with a playful expression'],['Holding a relaxed side pose','holding a relaxed side pose while the photographer adjusts focus'],['Turning to show the haircut profile','turning to show the haircut profile with realistic hair movement'],['Looking down and then smiling','looking down briefly before smiling naturally'],['Adjusting a bracelet during a laugh','adjusting a bracelet while laughing between takes'],['Moving one hand through the air mid-sentence','moving one hand naturally through the air mid-sentence'],['Sitting near the edge of a bench','sitting near the edge of a bench with a composed posture'],['Stepping into a pool of studio light','stepping naturally into a pool of studio light'],['Resting fingertips on a chair back','resting fingertips on a chair back with relaxed shoulders'],['Turning with fabric moving softly','turning as the outfit fabric moves softly'],['Standing at a three-quarter angle with hands relaxed','standing at a three-quarter angle with both hands relaxed'],['Laughing candidly toward someone off-camera', 'laughing warmly toward someone just outside the frame, caught in a genuine spontaneous reaction'],['Walking past a textured wall','walking past a textured wall as the camera catches the moment'],['Pausing to arrange an earring','pausing to arrange an earring before the next photograph'],['Showing the neckline with a shoulder turn','turning one shoulder to show the neckline and outfit construction'],['Resting one elbow on a ledge','resting one elbow lightly on a ledge in a composed pose'],['Caught fixing a loose strand','caught fixing a loose strand without looking directly at camera'],['Standing with a slight backward glance','standing with a slight backward glance and a confident half-smile'],['Settling into a side-sit','settling into a comfortable side-sit on a stool'],['Moving from shadow into light','moving from shadow into light in a spontaneous take'],['Holding sunglasses by one temple','holding sunglasses by one temple as a casual prop'],['Half-turn with chin lowered slightly','making a half-turn with chin lowered slightly and eyes toward camera'],['Pausing after a small spin','pausing after a small, natural turn with hair settling'],['Adjusting the edge of a jacket','adjusting the edge of a jacket while keeping an easy expression'],['Looking toward the room entrance','looking toward the room entrance as someone arrives'],['Relaxed pose with hands loosely linked','posing with hands loosely linked and arms relaxed'],['Leaning on the back of a sofa','leaning lightly on the back of a sofa in an editorial setting'],['Walking into frame while smiling','walking into frame while smiling naturally']
];
const extraPoseMods=['with believable balance and natural hand placement','captured a fraction of a second before she settles','with subtle clothing and hair movement','as a candid moment instead of a directed pose'];
const morePoses=[];extraPoseBases.forEach((p,i)=>{morePoses.push(O(p[0],p[1]));if(i<45)morePoses.push(O(p[0]+' · spontaneous variation',p[1]+', '+extraPoseMods[i%extraPoseMods.length]));});addOptions(pose,morePoses);
addOptions(expression,makeOpts([
['Amused half-smile with direct eyes','an amused half-smile with direct, confident eyes'],['Unscripted laugh after a cue','an unscripted laugh just after a photographer’s cue'],['Confident neutral face','a confident neutral face with relaxed lips and naturally expressive eyes'],['Smiling toward someone nearby','smiling toward someone nearby rather than directly at the lens'],['Cool side glance','a cool side glance with understated attitude'],['Soft squint in bright light','a soft, natural squint in bright light'],['Confident grin with head tilt','a confident grin paired with a slight head tilt'],['Quick surprised reaction','a quick surprised reaction that feels genuine, not theatrical'],['Quiet delight at new hairstyle','quiet delight at the finished hairstyle'],['Sophisticated smile with relaxed eyes','a sophisticated smile with relaxed eyes'],['Focused listening expression','a focused listening expression between instructions'],['Playfully unimpressed expression','a playfully unimpressed expression with a tiny smirk'],['Candid smile mid-turn','a candid smile captured mid-turn'],['A subtle laugh behind closed lips','a subtle laugh behind closed lips'],['Bold brow and steady gaze','a subtle brow lift and steady gaze'],['Soft thoughtful smile','a soft, thoughtful smile'],['Bright eyes and relaxed grin','bright eyes with a relaxed grin'],['Calm self-possessed look','a calm, self-possessed look without exaggerated intensity'],['Looking away with a private smile','looking away with a small private smile'],['A brief confident smirk','a brief, confident smirk'],['Open relaxed smile with natural teeth','an open, relaxed smile with naturally rendered teeth'],['A tiny asymmetrical smile','a tiny asymmetrical smile that preserves natural facial character'],['Playful glance under the brow','a playful glance from slightly under the brow'],['Relaxed face while fixing hair','a relaxed expression while fixing a strand of hair'],['Fresh confident expression after final touch-up','a fresh confident expression just after the final touch-up'],['Serious gaze softened by a smile','a serious gaze softened by the beginning of a smile'],['Laughing while looking down','laughing naturally while looking down'],['A calm candid look between shots','a calm candid look between shots'],['Sly smile toward camera left','a sly smile directed toward camera left'],['Warm, confident expression with chin level','a warm confident expression with chin level']
]));
addOptions(hairColor,makeOpts([
['Natural black with warm sheen','natural black with a subtle warm sheen'],['Cool espresso with subtle dimension','cool espresso brown with subtle natural dimension'],['Dark brown with soft caramel ribbons','dark brown with soft caramel ribbons'],['Chestnut with warm undertones','chestnut brown with warm undertones'],['Deep chocolate with fine highlights','deep chocolate brown with fine, believable highlights'],['Mahogany brown','rich mahogany brown'],['Soft copper brunette','soft copper brunette with natural root depth'],['Dark auburn','dark auburn with restrained red dimension'],['Mushroom brown balayage','mushroom-brown balayage with natural transitions'],['Smoky brunette','smoky brunette with a cool neutral finish'],['Caramel face-framing pieces','subtle caramel face-framing pieces blended into the base'],['Bronde balayage','bronde balayage with believable dark roots'],['Warm honey highlights','warm honey highlights with soft blend lines'],['Ash beige brown','ash-beige brown with restrained dimension'],['Cool dark mocha','cool dark mocha with realistic sheen'],['Muted burgundy gloss','a muted burgundy gloss over a deep brunette base'],['Blue-black natural shine','blue-black with natural, non-metallic shine'],['Soft rose-brown gloss','a restrained rose-brown gloss'],['Golden chestnut ribbons','golden chestnut ribbons in a brunette base'],['Keep color exactly as reference','the exact same hair color as the reference image']
]));
addOptions(hairFinish,makeOpts([
['Airy ends and light flyaways','airy ends with a few light flyaways'],['Soft polished blowout','a soft polished blowout with believable bend'],['Loose tousled finish','a loose tousled finish with natural irregularity'],['Satin sheen, no wet look','a natural satin sheen without a wet-look effect'],['Root lift with smooth lengths','soft root lift with smoother lengths'],['Natural curl definition','natural curl definition with separated strands'],['Softly frizzed real texture','subtle, realistic frizz and flyaways for natural texture'],['Brushed-out waves','brushed-out waves with soft transitions'],['Deliberately imperfect finish','a deliberately imperfect, freshly styled finish'],['Touchable salon texture','touchable salon texture without excessive product shine'],['Defined ends with natural separation','defined ends with natural strand separation'],['Minimal product, soft movement','minimal styling product with soft natural movement'],['Volume concentrated at crown','volume concentrated gently at the crown'],['Smooth crown, feathered ends','a smooth crown with feathered ends'],['Curls loosened slightly at ends','curls loosened slightly at the ends'],['Hair settling after motion','hair settling naturally after a small movement'],['Subtle natural static flyaways','a few subtle static flyaways'],['Lightly wind-moved fringe','a fringe lightly moved by the air']
]));
addOptions(accessories,makeOpts([
['Sculptural cuff bracelet','a sculptural cuff bracelet'],['Short pendant with open neckline','a short pendant necklace that complements the open neckline'],['Delicate layered chains and hoops','delicate layered chains and hoops'],['Large angular earrings','large angular earrings with a clean geometric form'],['Mixed-metal jewelry accents','restrained mixed-metal jewelry accents'],['A single bold cuff','one bold cuff with no competing accessories'],['Fine stacked rings','fine stacked rings with natural hand placement'],['Minimal chain anklet','a minimal chain anklet if visible in the chosen crop'],['Contemporary mangalsutra retained if present','retain a contemporary mangalsutra only if visible in the reference'],['Small nose stud retained if present','retain a small nose stud only if visible in the reference'],['Thin waist belt accent','a thin waist belt accent'],['Elegant watch and one ring','an elegant watch paired with a single ring'],['Dramatic drop earrings and no necklace','dramatic drop earrings with no necklace'],['Statement collar necklace','a statement collar necklace that suits the neckline'],['No jewelry beyond reference','add no jewelry beyond what is present in the reference']
]));
addOptions(makeup,makeOpts([
['Soft contour, no harsh stripes','soft contour with no harsh lines and natural skin texture'],['Natural blush placement','natural blush placed to complement her existing features'],['Warm champagne shimmer','warm champagne shimmer with restrained highlights'],['Cool taupe contour and liner','cool taupe contour and eyeliner with a refined finish'],['Red lip with softly defined eyes','a red lip paired with softly defined eyes'],['Berry stain with minimal eye makeup','a berry stain with minimal eye makeup'],['Fresh skin and graphic liner','fresh-looking skin with graphic liner as the focus'],['Subtle bronzer and nude gloss','subtle bronzer and a nude gloss'],['Refined smoky liner and rose lip','refined smoky liner paired with a rose lip'],['Natural brows and satin skin','natural brows and satin skin finish'],['Warm monochrome bronze look','a warm monochrome bronze makeup look'],['Soft plum lip and brown eyes','a soft plum lip paired with brown-toned eyes'],['Peach blush with muted lip','peach blush with a muted lip'],['Understated editorial makeup','understated editorial makeup with fine natural texture'],['Bold liner, neutral cheeks','bold liner balanced with neutral cheeks'],['Very light touch-up only','only a very light final touch-up, preserving the reference makeup']
]));
addOptions(background,makeOpts([
['Muted plum paper backdrop','a muted plum paper backdrop with tonal depth'],['Warm black studio','a warm black studio background with gentle edge separation'],['Cream plaster backdrop','a cream plaster backdrop with subtle imperfections'],['Olive velvet curtain','an olive velvet curtain with soft folds'],['Soft terracotta cyclorama','a soft terracotta cyclorama with natural floor shadow'],['Modern apartment kitchen edge','a modern apartment kitchen edge softly blurred in the background'],['Sunlit Milanese courtyard with stone arches','an elegant sunlit Milanese courtyard with historic limestone arches and lush terracotta planters'],['Minimalist wardrobe suite','a minimalist wardrobe suite with garment textures in soft focus'],['Neutral plaster corridor','a neutral plaster corridor with understated architectural depth'],['Dark wood lounge','a dark-wood lounge with warm practical lighting'],['Stone archway interior','a stone archway interior with natural texture'],['Linen curtain backdrop','a linen curtain backdrop with subtle fabric weave'],['Muted sage studio','a muted sage studio with gentle shadows'],['Deep navy seamless','a deep navy seamless backdrop with controlled gradients'],['Warm grey plaster wall','a warm grey plaster wall with tactile texture'],['Minimalist concrete gallery corridor with skylight','a minimalist raw concrete gallery corridor with natural zenith skylight and dramatic shadows'],['Sunlit studio corner','a sunlit studio corner with imperfect natural shadows'],['Softly blurred city sidewalk','a softly blurred city sidewalk with authentic street texture'],['Balcony doorway with curtains','a balcony doorway with lightly moving curtains'],['Neutral stone bench setting','a neutral stone bench setting with simple architectural lines']
]));
addOptions(lighting,makeOpts([
['Soft frontal fill and side key','soft frontal fill balanced with a directional side key'],['Window light with natural shadow edge','window light with a natural shadow edge across the background'],['Large diffused source above eye level','a large diffused light source just above eye level'],['Cinematic backlight with soft fill','cinematic backlight balanced by soft face fill'],['Soft flash bounce','soft bounced flash with realistic ambient color'],['Warm practicals and neutral key','warm practical lights balanced with a neutral key light'],['High-key light with gentle shadow','high-key lighting with a gentle natural shadow'],['Low-key light with eye catchlights','low-key lighting that preserves natural eye catchlights'],['Soft side light revealing hair layers','soft side light that reveals individual hair layers'],['Ambient salon light, realistic color','realistic salon ambient light with neutral skin tones'],['Cloudy-window wraparound light','wraparound cloudy-window light with soft tonal transitions'],['Sunlit hair edge and shaded face','sunlit hair edge with the face remaining naturally shaded'],['Two-source studio with negative fill','a two-source studio setup with restrained negative fill'],['Natural dusk exterior light','natural dusk exterior light with believable cool ambience'],['Bright indirect window illumination','bright indirect window illumination with natural shadows'],['Subtle warm rim and soft front fill','a subtle warm rim light and soft frontal fill']
]));

const browStyle=makeOpts([['Keep reference brow shape','keep the eyebrow shape consistent with the reference'],['Naturally groomed brows','naturally groomed brows without changing their structure'],['Softly defined brows','softly defined brows with natural hair detail'],['Feathered brow texture','feathered brow texture with visible individual hairs'],['Subtle brow lift through expression only','a subtle lifted brow expression without reshaping the brows'],['Soft straight brow styling','soft straight brow styling that respects the original features'],['Defined arch, natural texture','a defined arch with natural brow texture'],['Minimal brow product','minimal brow product and a natural finish'],['No brow reshaping','no brow reshaping or artificial symmetry']]);
const complexion=makeOpts([['Natural satin complexion','a natural satin complexion with realistic pores'],['Soft matte T-zone','a softly matte T-zone with natural skin detail retained'],['Natural cheek texture preserved','natural cheek texture preserved without smoothing'],['Subtle real skin highlights','subtle skin highlights that follow the lighting'],['No artificial glass skin','no artificial glass-skin effect'],['Realistic under-eye texture','realistic under-eye texture and natural facial detail'],['Light makeup texture','light makeup texture that does not obscure pores'],['Natural shine variation','natural variation in skin sheen across forehead, cheeks and nose'],['Fine facial details retained','fine facial details and natural asymmetry retained'],['No skin tone shift','no shift in the reference skin tone']]);
const garmentDetail=makeOpts([['Symmetrical side-waist cutouts','tastefully tailored symmetrical side-waist cutouts accentuating the silhouette'],['Asymmetric ribcage slash cutout','an architectural asymmetric slash cutout along the ribcage and midriff'],['Deep V-cut pelvic accents','high-cut V-shaped hip accents with clean geometric lines'],['Backless deep-V taper','a dramatic open back with clean V-tapered tailoring down to the lower back'],['Underbust keyhole cutouts','subtle structural underbust cutouts with crisp seam finishing'],['Visible seam construction','visible seam construction where appropriate'],['Tasteful statement buttons','tasteful statement buttons with realistic spacing'],['Defined waist seam','a defined waist seam with natural garment tension'],['Asymmetric panel detail','an asymmetric panel detail that reads clearly'],['Clean hemline','a clean hemline with believable weight'],['Subtle piping','subtle piping following the garment construction'],['Draped fabric folds','draped fabric folds that follow gravity naturally'],['Pleats with clear structure','pleats with clear structure and realistic spacing'],['Minimal hardware detail','minimal hardware detail with controlled reflections'],['Belt and buckle detail','a realistic belt and buckle detail'],['Tailored lapel texture','tailored lapel texture with clear edge definition'],['Button placket visible','a visible button placket with believable button placement'],['Satin highlights controlled','controlled satin highlights without blown-out patches'],['No random embellishment','no random or invented garment embellishments'],['Realistic fabric thickness','realistic fabric thickness at cuffs, hems and seams']]);
const accentColors=makeOpts([['Single red accent','one single red accent against a restrained palette'],['Metallic silver details','metallic silver details used sparingly'],['Warm gold buttons or jewelry','warm gold buttons or jewelry used as a subtle accent'],['Burgundy accent','a burgundy accent integrated with the outfit'],['Cobalt accessory accent','a cobalt accessory accent'],['Emerald accent detail','an emerald accent detail'],['Pearl white accent','a pearl-white accent against deeper tones'],['Black contrast piping','black contrast piping'],['Tone-on-tone detail','tone-on-tone detailing for a sophisticated finish'],['No extra accent color','no additional accent color; preserve a cohesive palette'],['Subtle copper accent','a subtle copper accent'],['Silver-blue accent','a silver-blue accent'],['Deep plum accent','a deep plum accent'],['Warm neutral contrast','warm neutral contrast with restrained visual separation']]);
const sceneActivity=makeOpts([['No background people','no background people; keep the frame focused on the subject'],['Crew member blurred in far background', 'a crew member blurred far in the background without distracting from her'],['Photographer presence implied','the photographer’s presence implied by her candid glance'],['Quiet pause between editorial takes','a quiet spontaneous pause between camera takes'],['A real in-between take','a believable in-between take during the photoshoot'],['Subtle production activity in soft focus','subtle production crew and lighting gear in soft background focus'],['Empty studio between setups','an empty studio between setups'],['Someone just outside frame','someone just outside the frame prompting a genuine reaction'],['Final outfit adjustment before shot','a final outfit adjustment before the photographer starts shooting'],['Relaxed break after makeover','a relaxed break immediately after the makeover'],['Natural conversation off-camera','a brief natural conversation happening off-camera'],['Photographer tests a frame','the photographer testing a frame while she relaxes'],['She is readying for next pose','she is getting ready for the next pose'],['A candid reaction to a preview','a candid reaction to seeing a preview photo'],['Fresh post-makeover moment', 'a fresh post-makeover moment before stepping into the main shoot']]);
const cameraDistance=makeOpts([['Close portrait distance','a close portrait distance with natural facial perspective'],['Comfortable conversational distance','a comfortable conversational camera distance'],['Medium fashion distance','a medium camera distance suited to fashion portraiture'],['Full-body distance with normal perspective','a full-body camera distance without wide-angle distortion'],['Slightly farther environmental view','a slightly farther environmental view with context'],['Tight but not cropped awkwardly','a tight frame that avoids awkwardly cutting the chin or hairstyle'],['Natural smartphone distance','a natural smartphone shooting distance'],['Portrait-lens distance','a portrait-lens distance with believable compression'],['Camera at comfortable eye line','camera positioned at a comfortable eye line'],['Step-back framing for outfit','a step-back composition that shows the outfit clearly']]);
const blurControl=makeOpts([['No artificial motion blur','no artificial motion blur'],['Tiny motion in hair only','a tiny hint of motion in hair ends while face remains crisp'],['Very light ambient movement','very light ambient movement in the setting'],['Subject crisp, background soft','a crisp subject against a softly blurred background'],['Subtle film motion character','subtle film motion character without smearing facial detail'],['Freeze action clearly','freeze the action clearly with sharp facial detail'],['No ghosting or duplicate edges','no ghosting, double edges or duplicate limbs'],['Natural depth blur only','natural optical depth blur only, without cutout artifacts']]);
const cropRules=makeOpts([['Keep full hairstyle inside frame','keep the complete hairstyle inside the frame'],['Do not cut off chin or forehead','avoid cutting off the chin or forehead awkwardly'],['Show neckline and hairstyle','show both the neckline and the full hairstyle where the selected crop allows'],['Hands remain inside crop if active','keep active hands inside the frame when the pose depends on them'],['Keep outfit silhouette readable','keep the selected outfit silhouette readable'],['Give breathing room above hair','leave breathing room above the top of the hairstyle'],['Avoid accidental limb cropping','avoid accidental limb cropping in medium and full-body shots'],['Frame naturally, not perfectly centered','frame naturally rather than forcing perfect center alignment'],['Respect vertical composition','respect the selected vertical composition'],['Do not crop shoes in full-body shot','keep shoes visible when a full-body framing is selected']]);
const photoTexture=makeOpts([['Natural fine image grain','natural fine image grain'],['Crisp clean digital image','a crisp, clean digital image with no excessive sharpening'],['Subtle documentary grain','subtle documentary-style grain'],['Soft highlight roll-off','soft highlight roll-off with preserved texture'],['Realistic lens contrast','realistic lens contrast and natural edge detail'],['No synthetic skin blur','no synthetic blur over skin'],['Keep fabric microtexture','preserve fine fabric microtexture'],['Keep hair strand separation','preserve fine hair-strand separation'],['Natural color noise only','only subtle, natural-looking color noise'],['Authentic candid photo texture','authentic candid-photograph texture with small imperfections']]);
Object.assign(extraFields,{
hairTexture:{label:'Hair texture pattern',section:'look',opts:makeOpts([['🔒 Preserve original reference hair texture','strictly preserve the exact natural hair texture, fine-to-medium strand thickness, natural organic straight-to-subtle-wave behavior, and realistic strand separation of the reference photo without artificial curling, straightening, or heat-styling'],['Smooth straight strands','smooth straight strands with believable separation'],['Natural silky straight with soft blowout bend','natural silky straight hair with a soft blow-dry bend at the ends'],['Loose S-waves','loose S-waves with natural variation'],['Defined soft curls','defined soft curls'],['Natural ringlets','natural ringlets with individual curl definition'],['Soft bends through lengths','soft bends through the lengths'],['Piecey feathered ends','piecey feathered ends'],['Airy shag texture','airy shag texture with irregular layers'],['Blowout bend at ends','a blowout bend concentrated at the ends'],['Natural curl and flyaway mix','a natural curl and flyaway mix'],['Sleek crown with textured lengths','a sleek crown with lightly textured lengths'],['Brushed-out curls','brushed-out curls with a soft outline'],['Soft waves with a deep part','soft waves with a deep part']]),def:0},
hairColorTechnique:{label:'Color technique',section:'look',opts:makeOpts([['No color change','no color change; preserve the reference hair color'],['Subtle face-framing highlights','subtle face-framing highlights'],['Soft balayage blend','a soft balayage blend with realistic transitions'],['Natural root shadow','a natural root shadow'],['Fine babylights','fine babylights with restrained contrast'],['Gloss refresh only','a gloss refresh without changing the overall color'],['Single-tone salon color','a single-tone salon color with believable depth'],['Low-contrast dimensional color','low-contrast dimensional color'],['Subtle ombre ends','subtle ombre ends with a natural blend'],['Hidden underlayer accent','a restrained hidden underlayer color accent'],['No visible color demarcation','no visible color demarcation or artificial stripe'],['Keep roots realistic','keep root color and growth realistic']]),def:0},
garmentDetail:{label:'Garment construction details',section:'wardrobe',opts:garmentDetail,def:0},accentColors:{label:'Accent color details',section:'wardrobe',opts:accentColors,def:0},browStyle:{label:'Brow styling',section:'wardrobe',opts:browStyle,def:0},complexion:{label:'Complexion finish',section:'wardrobe',opts:complexion,def:0},
sceneActivity:{label:'What is happening around her',section:'scene',opts:sceneActivity,def:0},cameraDistance:{label:'Camera distance',section:'camera',opts:cameraDistance,def:1},blurControl:{label:'Motion blur control',section:'camera',opts:blurControl,def:0},cropRules:{label:'Cropping safeguards',section:'camera',opts:cropRules,def:0},photoTexture:{label:'Photo texture finish',section:'scene',opts:photoTexture,def:9}
});

const P=t=>makeOpts(t.split(';').map(x=>x.split('|')));
Object.assign(extraFields,{
ponyStyle:{label:'Ponytail & updo styling',section:'look',opts:makeOpts([
  ['Sleek low-to-mid pony with curtain bangs (nape to upper shoulders)', 'a sleek low-to-mid ponytail with a clean near-center part and long, wispy curtain bangs softly framing the forehead and cheekbones, with the ponytail ending around the nape to upper shoulders'],
  ['Sleek high ponytail, side part & short wavy nape tail', 'a sleek high ponytail with a subtle deep side part, smoothly swept-back crown, and a short wavy tail ending at the nape of the neck just above the shoulders with softly tousled ends'],
  ['Short sleek high pony ending at nape / neck', 'a snatched high ponytail anchored at the crown with a short straight tail dropping cleanly to the base of the neck'],
  ['Short blunt high pony with flipped ends', 'a high crown ponytail with a short blunt tail flicked playfully outward at the upper neck'],
  ['Short micro-tail high pony (jawline level)', 'an ultra-high snatched ponytail with a cropped micro-tail grazing the upper nape, putting full focus on jawline and neck'],
  ['Short sleek mid-height pony', 'a mid-height ponytail with clean horizontal tension and a straight tail falling flush to the neck curve'],
  ['Short wet-look high pony', 'a high-gloss wet-lacquered high ponytail with a saturated short tail resting lightly at the neck'],
  ['Short bouncy ponytail with rounded neck sweep', 'a high ponytail with soft blowout volume and inward-curved ends skimming the upper neck'],
  ['Short high pony with hair-wrapped base', 'a high-tension crown ponytail with a section of hair wrapped smoothly around the elastic and a short tail ending at the nape'],
  ['Short low sleek pony flat against neck hollow', 'a low sleek ponytail anchored tight at the nape, tail laying flush against the neck hollow'],
  ['Short high pony with two compact bubbles', 'a high ponytail styled into two compact structured bubble sections ending at neck level'],
  ['Short textured high pony with piecey separation', 'a high ponytail with a piecey, separated short tail and relaxed movement around the neck'],
  ['Short high pony with wispy curtain bangs', 'a snatched high crown ponytail with a short neck-length tail contrasted by soft airy curtain bangs'],
  ['Short blunt low pony with razor-sharp ends', 'a low ponytail secured tight at the nape with a blunt razor-cut tail resting against the neck'],
  ['Snatched ultra-high crown pony (Ariana-style)', 'an ultra-high snatched ponytail anchored at the apex of the crown with dramatic upward tension'],
  ['Two delicate face-framing temple tendrils', 'a snatched high ponytail contrasted with two delicate, wispy tendrils framing the cheekbones'],
  ['Clean snatched hairline with zero flyaways', 'a completely sleek, mirror-smooth hairline brushed back with zero loose hairs'],
  ['Soft feathered baby hairs along temples', 'artfully arranged feathered baby hairs brushed gently along the forehead and sideburns'],
  ['Hair-wrapped elastic base', 'a clean section of hair wrapped smoothly around the base to completely conceal the elastic'],
  ['Minimalist metallic cuff at ponytail base', 'a sleek metallic gold or silver cuff encircling the base of the ponytail'],
  ['Black silk ribbon wrap on ponytail', 'a black silk ribbon tied in a neat minimal wrap around the ponytail base'],
  ['Leather cord wrapped 2 inches down base', 'a black leather cord wrapped down the base of the ponytail for an architectural fashion silhouette'],
  ['Straight razor-cut glass tail', 'a pin-straight razor-sharp glass tail with clean strand separation'],
  ['Braided high tail with smooth glass crown', 'a smooth glass-finish crown transitioning into a tight, glossy braided ponytail'],
  ['Soft blowout bend through ponytail tail', 'a ponytail tail with soft blowout bounce and subtle outward bend'],
  ['Slight side-tilt high pony', 'a high ponytail angled slightly off-center for a playful fashion-editorial silhouette'],
  ['Textured messy high pony with undone crown', 'a casually undone high ponytail with textured crown lift and natural wisps']
]),def:0},
hairLength:{label:'Hair length',section:'look',opts:P("Ear-length crop|ear-length hair;Jawline length|jaw-length hair;Chin length|chin-length hair;Shoulder length|shoulder-length hair;Collarbone length|collarbone-length hair;Mid-back length|mid-back-length hair;Waist length|waist-length hair;Length from reference|hair length consistent with the reference, only reshaped by the new cut"),def:0},
styleEra:{label:'Fashion era influence',section:'wardrobe',opts:P("1960s mod|a 1960s mod influence with clean graphic lines;1970s glam|a 1970s glam influence with fluid fabrics;1980s power dressing|a 1980s power-dressing influence with strong shoulders;1990s minimalism|1990s minimalism with sleek understated lines;Y2K revival|a refined Y2K-inspired influence;Art-deco evening|an art-deco evening influence with elegant geometry;Bollywood retro|a retro Bollywood-inspired glamour;Contemporary runway|a contemporary runway sensibility;Timeless classic|timeless classic styling"),def:0},
eyewear:{label:'Eyewear',section:'wardrobe',opts:P("No eyewear|no eyewear;Oversized sunglasses worn|oversized black sunglasses worn;Thin-frame glasses|thin-frame glasses;Cat-eye sunglasses|cat-eye sunglasses;Tinted aviators|lightly tinted aviators;Sunglasses pushed into hair|sunglasses pushed up into the hair without hiding the cut;Keep reference glasses|the same glasses as the reference image"),def:0},
bag:{label:'Bag / carry',section:'wardrobe',opts:P("No bag|no bag;Structured top-handle bag|a structured top-handle bag;Mini shoulder bag|a mini shoulder bag;Slim clutch|a slim clutch;Oversized tote|an oversized tote slung casually;Chain crossbody|a chain crossbody bag;Embroidered potli|an embroidered potli bag"),def:0},
locale:{label:'City / region feel',section:'scene',opts:P("Mumbai sea-facing promenade|a Mumbai sea-facing promenade feel;Jaipur haveli courtyard|a Jaipur haveli courtyard with warm stone;Goa heritage villa|a Goan heritage villa with pastel walls;Delhi modern gallery|a modern Delhi gallery space;Udaipur palace terrace|an Udaipur palace terrace;Kerala veranda|a Kerala veranda with soft greenery;Bengaluru cafe street|a leafy Bengaluru cafe street;Paris apartment balcony|a Parisian apartment balcony;Tokyo night street|a Tokyo side street at night;New York loft|a New York loft with big windows;Milan arcade|a Milan arcade with marble and arches;Dubai skyline lounge|a high-rise Dubai lounge;Scandinavian minimal interior|a Scandinavian minimal interior;Mediterranean white terrace|a whitewashed Mediterranean terrace"),def:0},
season:{label:'Season / occasion',section:'scene',opts:P("Summer|a summer feel;Monsoon|a monsoon-season mood with soft damp light;Winter|a winter feel with layered styling;Spring|a spring feel with fresh light;Autumn|an autumn feel with warm tones;Festive season|a festive-season glow with warm lamps;Wedding season|a wedding-season occasion feel with refined styling;Date night|a date-night occasion;Office to evening|an office-to-evening occasion"),def:0}
});
Object.values(extraFields).forEach(f=>{f.opts=[O('Auto · follow my other choices',''),...f.opts];f.def=0});
Object.assign(fields,extraFields);

// ==========================================
// AQUATIC & WET-LOOK EDITORIAL EXPANSION
// ==========================================

addOptions(hairFinish, makeOpts([
  ['Drenched fresh-from-water texture', 'drenched fresh-from-water texture with fine droplets and naturally grouped wet strands'],
  ['High-gloss wet lacquer glaze', 'a high-gloss wet lacquer glaze with liquid reflections and clean strand definition'],
  ['Damp post-swim air-dried texture', 'a damp post-swim air-dried texture with subtle natural wave clumping and delicate temple flyaways'],
  ['Rain-slicked sheen with droplet trails', 'a glistening rain-slicked sheen with fine water droplet trails clinging to individual hair strands'],
  ['Ocean-mist salt texture with wet root separation', 'an ocean-mist salty damp texture with defined root separation and soft saturated movement']
]));

addOptions(hairVolume, makeOpts([
  ['Wet-look compressed crown with clinging lengths', 'wet-look compressed crown sculpted flat with saturated lengths clinging naturally to shoulders'],
  ['Saturated heavy strand separation', 'heavy saturated strand separation with realistic aquatic weight and zero dry frizz'],
  ['Damp air-dried piecey volume', 'damp air-dried piecey volume with touchable clumping and natural movement']
]));

addOptions(fringeDetail, makeOpts([
  ['Wet clinging curtain bangs', 'wet curtain bangs clinging delicately to the forehead with fine water bead accents'],
  ['Separated damp brow strands', 'piecey separated damp strands skimming the eyebrows with high-gloss sheen'],
  ['Slicked-back hairline with baby-hair swirls', 'a slicked-back hairline with delicate damp baby hairs swirled along the temples']
]));


addOptions(eyeLook, makeOpts([
  ['Wet-look glossy eyelid wash', 'a wet-look glossy eyelid wash catching specular light highlights'],
  ['Waterproof smudged kohl liner', 'waterproof smudged kohl eyeliner with clean water-resistant definition']
]));

addOptions(pose, makeOpts([
  ['Sitting upright with relaxed shoulders and calm candid expression', 'seated upright with relaxed shoulders, hands resting naturally in lap, looking forward with a calm, gentle, candid expression'],
  ['Emerging from pool brushing hair back', 'emerging from swimming pool water while sweeping wet hair back off her face with both hands'],
  ['Resting forearms on wet pool edge', 'resting her forearms on the wet stone pool edge, chin slightly lifted with confident direct gaze'],
  ['Rain-soaked stance under city streetlight', 'standing rain-soaked under a warm city streetlight, water glistening on skin and clothes'],
  ['Leaning back against wet poolside tiles', 'leaning back against wet poolside mosaic tiles with one knee raised and relaxed shoulders'],
  ['Sitting on pool steps half-submerged', 'sitting on marble pool steps half-submerged in clear water, looking toward the camera'],
  ['Stepping out of outdoor rain shower', 'stepping out of an outdoor teakwood rain shower with eyes softly closed and head tilted back'],
  ['Reclining on wet sun lounger', 'reclining gracefully on a poolside sun lounger with wet hair swept over one shoulder'],
  ['Wiping water droplet from cheekbone', 'lightly brushing a single water droplet away from her cheekbone with confident eye contact'],
  ['Arching neck under water droplets', 'arching her neck gracefully as fine water droplets fall across her collarbones and shoulders'],
  ['Head tilted down with introspective gaze', 'head tilted down with eyes glancing softly toward the ground, contemplative fashion attitude with hair parting and crown visible'],
  ['Bent forward at waist with hands on knees', 'bent forward at the waist with hands resting firmly on slightly bent knees, torso angled forward in a bold editorial power pose'],
  ['Deep forward bend with arms hanging loose', 'bent deeply down toward her feet with arms loosely dangling and hair falling forward naturally around her face and shoulders'],
  ['Seated leaning forward with head tilted down', 'seated on a stool leaning forward with forearms on thighs and head tilted down, eyes looking up through dark lashes'],
  ['Standing with chin tilted down and subtle side angle', 'standing with chin tilted down toward her chest, angled slightly three-quarter to reveal the nape, neckline, and shoulder contour'],
  ['Leaning forward over balcony railing, head tilted down', 'leaning forward over a railing with elbows resting on the ledge, head tilted down watching the scene below'],
  ['Turned sideways looking away with hand shielding face', 'turned sideways in profile looking away from the camera, with one hand casually raised to her temple or forehead to naturally shield her face so her facial features are not visible, emphasizing her posture, hair, and styling'],
  ['Turned away in side-profile with hair completely hiding face', 'standing in side-profile turned away from the camera looking into the distant background, her thick hair naturally falling forward and shielding her face so it is completely occluded from the lens'],
  ['Turned sideways in profile looking away from camera', 'standing or seated turned sideways in profile looking away from the camera into the distance, head angled away so her face is not visible to the lens, maintaining her natural hair styling and poised posture'],
  ['Standing flush lateral profile with arms crossed & gaze away', 'standing in crisp 90-degree lateral side profile with arms loosely crossed over her chest, head turned away gazing into the distance, highlighting her jawline contour, shoulder line, and silhouette'],
  ['Walking sideways in profile with thumb hooked in pocket', 'captured in natural lateral motion walking sideways across the frame, with one thumb hooked casually into a pocket, head angled away from the camera in candid editorial stride'],
  ['Seated sideways on high stool with one knee bent & torso angled away', 'perched sideways on a minimalist high stool with one foot on the crossbar, knee raised, torso angled away in lateral silhouette while gazing into the background'],
  ['Leaning sideways hip against textured wall with gaze away', 'resting her side hip and shoulder against a textured studio wall, body turned completely sideways in profile with head turned away into soft ambient shadow'],
  ['Sideways profile adjusting collar with chin turned away', 'standing in clean side profile with fingers lightly holding the lapel or collar, head turned away looking toward the horizon, emphasizing neck curvature and wardrobe tailoring'],
  ['Seated on floor sideways with arms draped over bent knee', 'seated on the studio floor in full lateral profile with one leg extended and the other knee drawn up, arms loosely draped over her knee while looking away into the setting'],
  ['Sideways profile leaning elbows on railing looking into distance', 'leaning forward sideways with forearms resting comfortably along a railing or ledge, head turned away in profile watching the distant background in natural contemplation'],
  ['Sideways stride with jacket slung over shoulder gazing away', 'captured mid-step in dynamic lateral profile holding a jacket slung casually over one shoulder blade, head turned away from the lens in effortless, unposed fashion motion']
]));

addOptions(gesture, makeOpts([
  ['Sweeping wet hair off face', 'sweeping wet hair back away from the face with natural finger separation'],
  ['Fingers grazing water surface', 'resting one hand with fingertips grazing the calm water surface'],
  ['Lightly touching wet collarbone', 'lightly resting fingers on her wet collarbone as water droplets glisten'],
  ['Tucking damp strand behind ear', 'tucking a single damp hair strand behind her ear'],
  ['Hand raised to temple / forehead shielding face', 'one hand gracefully raised with fingers touching the hairline or forehead, naturally shielding and obscuring the face from the camera lens']
]));

addOptions(stance, makeOpts([
  ['Wet poolside lean with arched back', 'a relaxed poolside lean with natural spine curvature and water reflections'],
  ['Planted pool-step posture with arms rested', 'a confident planted posture on pool steps with arms resting casually on knees'],
  ['Rain-swept street stance with head high', 'a strong rain-swept stance with head held high and relaxed posture']
]));

addOptions(background, makeOpts([
  ['Indian salon with styling mirrors & barber chair', 'an authentic Indian hair salon interior with wide mirrors, glass shelves with hair products, a black leather hydraulic styling chair, and bright salon ceiling lighting'],
  ['Luxury infinity pool overlooking ocean', 'a luxury cliffside infinity pool with still turquoise water blending into the open ocean at sunset'],
  ['Rain-slicked hotel rooftop terrace', 'a rain-slicked luxury hotel rooftop terrace with reflective wet marble and city lights in puddles'],
  ['Outdoor tropical teakwood rain shower', 'an outdoor tropical rain shower surrounded by dark teakwood slats and lush monstera foliage'],
  ['Steamy thermal spa pool with volcanic stone', 'a steamy natural thermal spa pool with mist rising off warm water against dark volcanic stone'],
  ['Private yacht swim platform', 'a sun-drenched teak swim platform of a private yacht with crystal-clear turquoise sea caustics'],
  ['Architectural indoor lap pool with limestone', 'a minimalist architectural indoor lap pool with smooth grey limestone and still water reflections'],
  ['Drenched seaside rocky cove at dusk', 'a dramatic seaside rocky cove with ocean spray and wet dark basalt boulders at dusk'],

  // Heritage Havelis & Palaces Expansion
  ['Jodhpur Umaid Bhawan Palace Art Deco sandstone terrace', 'an imposing golden sandstone palace terrace in Jodhpur overlooking royal courtyards, sweeping monumental steps, and warm desert horizon'],
  ['Jaipur City Palace courtyard with peacock gate', 'a vibrant historic royal courtyard in Jaipur with intricate hand-painted enamel peacock archways and pale pink scalloped corridors'],
  ['Chettinad heritage mansion with Burma teak pillars & Athangudi tiles', 'an expansive South Indian heritage mansion courtyard with massive polished Burma teak pillars and glossy geometric Athangudi floor tiles'],
  ['Kashmir Dal Lake royal house-boat salon with walnut carvings', 'an opulent heritage Kashmiri cedarwood boathouse salon with hand-carved walnut wall lattices and morning lake mist'],

  // Aquatic Pools & Coastal Expansion
  ['Sun-drenched Goan private pool villa with laterite stone', 'a private coastal villa in North Goa with a turquoise plunge pool bordered by warm laterite stone and swaying coconut palm reflections'],
  ['Santorini cliffside whitewashed infinity pool at blue hour', 'a breathtaking Greek Aegean cliffside infinity pool carved into volcanic rock, deep twilight blue sky and tranquil water reflections'],
  ['Private superyacht aft deck with teak loungers and ocean wake', 'a sleek luxury yacht aft deck with polished teak planking, stainless steel railings, and glistening turquoise ocean wake'],
  ['Boutique riad plunge pool courtyard with emerald zellij tiles', 'an intimate Moroccan riad courtyard with an emerald-green zellij mosaic plunge pool, floating white jasmine blossoms, and sunbeam shafts'],

  // Luxury Nightlife & Speakeasies Expansion
  ['Tokyo Ginza subterranean cocktail lounge with smoky amber backlighting', 'an exclusive underground Ginza cocktail bar with dark polished hinoki wood counter, smoky amber glass bottles, and sultry low-light intimacy'],
  ['Mumbai Lower Parel rooftop sky lounge overlooking sea link', 'a glamorous open-air rooftop sky lounge with glowing ambient glass bar, plush charcoal velvet banquettes, and distant glittering bridge lights'],
  ['Mayfair London private members club velvet salon', 'an opulent British private club lounge with oxblood velvet upholstery, dark mahogany wainscoting, and warm glowing bankers lamps'],
  ['Parisian subterranean jazz club with arched stone vaults', 'an intimate Left Bank jazz cellar with rough-hewn limestone vaulted ceilings, low cabaret tables, and soft warm spotlighting'],

  // Runways & Backstages Expansion
  ['Milan Fashion Week high-gloss black mirrored catwalk', 'a high-editorial runway with high-gloss black lacquer runway floor reflecting strobe flashes, minimalist white lighting scrims, and blurred front row'],
  ['Paris Haute Couture grand Palais glass atrium runway', 'a monumental glass-domed runway space filled with diffused pale daylight, polished white runway floor, and architectural steel arches'],
  ['Backstage quick-change area with clothes racks and warm clip lights', 'an energetic fashion week backstage bustling with metallic garment racks, designer moodboards pinned to cork, and focused clip lights'],

  // Salons & Hair Studios Expansion
  ['Luxury duplex hair atelier with floating backlit glass mirrors', 'a high-end designer hair salon spanning two open floors, with floating frameless mirrors, pale travertine stations, and professional ring lights'],
  ['Backstage celebrity hair & makeup trailer with illuminated vanity', 'an intimate luxury production trailer setup with chrome styling chair, Hollywood bulb mirror frame, and professional haircare bottles'],
  ['Soho loft hair laboratory with bespoke oak workstations', 'a boutique New York hair salon with exposed brick, bespoke blackened-steel and white-oak cutting stations, and abundant diffused northern light'],

  // Exotic Nature, Botanical & Dunes Expansion
  ['Rajasthan Thar desert golden sand dunes at sunset', 'pristine sweeping wind-sculpted sand dunes glowing in deep saffron and amber twilight, with dramatic sharp-edge shadow ridges'],
  ['Kerala backwaters shaded palm grove on tranquil canals', 'a serene palm-fringed canal bank in Alleppey with emerald-green water reflections, dappled tropical light, and traditional wooden canoes in soft focus'],
  ['Alpine wildflower meadow with distant snowcapped peaks', 'a vibrant high-altitude meadow blooming with mountain flora under crisp, clear sunlight with blue mountain silhouettes'],
  ['Kyoto Arashiyama bamboo grove with morning sunbeams', 'towering emerald bamboo stalks filtering vertical rays of soft morning light onto a moss-carpeted earthen footpath'],

  // Modernist Architecture & Museums Expansion
  ['Chandigarh Le Corbusier raw concrete pavilion with geometric cutouts', 'an iconic modernist monument with textured board-marked concrete, sculptural shadows, and monumental geometric windows'],
  ['Museum of Contemporary Art soaring spiral concrete ramp', 'an architectural masterpiece featuring a sweeping curving white spiral ramp, overhead circular skylight, and pristine spatial clarity'],
  ['Travertine stone colonnade overlooking reflecting basin', 'monumental pale beige travertine stone columns with crisp linear shadows cast across a mirror-still shallow water pool'],
  ['Minimalist concrete loft with 20-foot glass walls & city view', 'an expansive double-height urban loft with polished concrete floors, minimalist floating staircase, and floor-to-ceiling glass'],

  // Luxury Interiors & Suites Expansion
  ['Art Deco presidential penthouse with curved panoramic windows', 'a grand luxury penthouse suite featuring dark fluted wood, custom brass bar cart, geometric floor rugs, and breathtaking skyline vistas'],
  ['Venetian canal palazzo grand salon with Murano chandelier', 'an authentic Venetian palazzo room with high beamed ceilings, terrazzo alla veneziana floors, tall gothic arched windows, and soft canal reflections'],
  ['Contemporary Mumbai sea-facing apartment balcony with sunset view', 'a high-floor sea-facing apartment with white marble terrace floor, glass balustrade, and the glowing Arabian Sea at dusk'],

  // Urban Streets & Rooftops Expansion
  ['Colaba Mumbai heritage street with colonial stone facades', 'a vibrant, tree-shaded South Mumbai avenue flanked by yellow basalt colonial architecture, vintage street lamps, and dappled sunlight'],
  ['SoHo Manhattan cobblestone street with cast-iron fire escapes', 'classic New York cobblestone street during golden hour, with historic black fire escapes, warm brick facades, and soft atmospheric haze'],
  ['London Mayfair mews street with pastel townhouses & black railings', 'a charming cobblestone mews street with pastel-painted brick townhouses, blooming window boxes, and classic British character'],

  // Studio Backdrops & Cycs Expansion
  ['Warm sandstone lime-wash textured studio backdrop', 'a tactile lime-wash painted studio wall in warm desert sandstone tones, creating organic micro-textures and subtle shadow gradient'],
  ['Deep emerald velvet infinity drape with soft puddling', 'a luxurious heavy emerald-green velvet backdrop falling in deep sculptural folds with soft puddles on the dark studio floor'],
  ['Two-tone architectural studio set with curved partition wall', 'a bespoke photo studio set featuring a curving pastel peach partition wall against a matte charcoal floor sweep']
]));

addOptions(lighting, makeOpts([
  ['Pool water caustics ripple lighting', 'shimmering pool water light caustics dancing organically across wet skin, hair and outfit'],
  ['Rain-backlit flash with water droplets', 'direct on-camera flash backlit against falling rain, freezing glistening water droplets in sharp bokeh'],
  ['Wet specular highlight key light', 'a high-contrast key light sculpting wet skin and hair with bright specular pin-highlights'],
  ['Warm sunset glancing off wet surfaces', 'warm low-angle sunset rays glancing off wet skin, damp fabrics and pool ripples with golden sheen'],
  ['Steamy spa backlight with diffused glow', 'diffused warm backlight through rising pool steam, creating a soft ethereal glow around wet contours']
]));


addOptions(weather, makeOpts([
  ['Warm tropical rain shower', 'a warm tropical rain shower with gentle falling droplets and damp humid ambience'],
  ['Post-swim poolside humidity', 'fresh post-swim poolside humidity with glistening moisture in the air'],
  ['Steamy thermal mist', 'soft rising thermal steam creating gentle atmospheric mist without obscuring the subject'],
  ['Rain-slicked urban evening', 'rain-slicked urban conditions with wet asphalt and reflective damp surfaces']
]));


addOptions(hairAccessories, makeOpts([
  ['Minimalist metallic ponytail cuff', 'a sleek brushed gold or silver metallic cuff encircling the base of the ponytail'],
  ['Black silk ribbon wrap on ponytail', 'a black silk ribbon tied in a neat minimal wrap around the ponytail base'],
  ['Architectural cord-wrapped base', 'an architectural leather or metallic cord wrapped down the base of the ponytail']
]));

addOptions(hairVolume, makeOpts([
  ['Snatched crown tension with compact neck tail', 'snatched high-tension crown styling with a short, compact tail at the neck'],
  ['Full voluminous ponytail body with root lift', 'full airy ponytail volume with bouncy movement and lifted base']
]));

addOptions(fringeDetail, makeOpts([
  ['Snatched open forehead with high pony', 'a clean snatched open forehead pulling back smoothly into a high ponytail'],
  ['Wispy 90s antenna bangs with high pony', 'two fine 90s antenna bangs framing the bridge of the nose with a high ponytail']
]));

addOptions(hairFinish, makeOpts([
  ['Snatched mirror-lacquer finish', 'ultra-sleek mirror-lacquer finish along the scalp with clean tension lines'],
  ['Textured piecey ponytail tail', 'piecey, separated texture through the tail with soft movement']
]));

const photoshootSections=[
  {id:'look',name:'Look & hair',short:'LOOK',icon:'✂',desc:'Lock in the makeover reveal and build her new hairstyle from cut to finish.'},
  {id:'wardrobe',name:'Wardrobe & glam',short:'STYLE',icon:'✧',desc:'Choose a bold fashion direction, outfit fit, makeup and accessories.'},
  {id:'pose',name:'Pose & attitude',short:'POSE',icon:'↗',desc:'Direct the body language and the energy of the moment.'},
  {id:'camera',name:'Camera & crop',short:'CAMERA',icon:'◎',desc:'Fine-tune framing, perspective, lens feel and image ratio.'},
  {id:'scene',name:'Scene & lighting',short:'SCENE',icon:'☼',desc:'Set the location, lighting approach, color character and photo style.'},
  {id:'finish',name:'Finish & controls',short:'FINISH',icon:'✦',desc:'Control identity preservation, realism, exclusions, and custom instructions.'}
];

const salonSections=[
  {id:'salonVenueSec',name:'Salon & Vibe',short:'VENUE',icon:'💈',desc:'Reference workflow, authentic salon venue, and neighborhood bustle.'},
  {id:'salonStageSec',name:'Haircut & Barber',short:'STAGE',icon:'✂',desc:'Pick the in-progress cutting moment and barber presence in frame.'},
  {id:'salonHairSec',name:'Haircut Style',short:'HAIR',icon:'💇‍♀️',desc:'Specify the haircut being cut from 260+ styles, face-behind-hair veil %, and authentic hair texture.'},
  {id:'wardrobe',name:'Wardrobe & Styling',short:'WARDROBE',icon:'👗',desc:'Choose full-look ensembles or two-piece separates (tops & bottoms) for our model.'},
  {id:'salonCameraSec',name:'Cape & Camera',short:'CAMERA',icon:'📸',desc:'Set the draped cutting cape, mirror perspective POV, and salon lighting. (💡 Note: To direct 2×2 Storyboard Collage panels, choose \'2×2 collage\' under Output format in Finish.)'},
  {id:'finish',name:'Finish & controls',short:'FINISH',icon:'✦',desc:'Control identity preservation, realism, exclusions, and custom instructions.'}
];

const DEFAULT_MODE = (window.DEFAULT_STUDIO_MODE === 'salon') ? 'salon' : 'photoshoot';
let currentStudioMode = DEFAULT_MODE;
let salonHairMoisture = 'damp';
let photoHairMoisture = 'dry';
let salonSeatingMode = 'chair';
let sections = (DEFAULT_MODE === 'salon') ? salonSections : photoshootSections;
const ENERGIES={
aquatic:{name:'wet-look editorial',icon:'💧',settings:['outdoor','studio','night'],pick:{hair:/wet|slicked|hydro|soaked|damp|mermaid/i,outfit:/monokini|swimsuit|slip|liquid|latex|wet-look|sheer|vinyl|drenched/i,makeup:/dewy|glossy|droplet|waterproof|glistening/i,pose:/pool|water|emerging|rain|leaning|hair|collarbone/i,expression:/fierce|intense|calm|smirk|direct/i,mood:/fearless|mysterious|high-fashion/i}},
power:{name:'power',icon:'⬡',settings:['studio','urban','night'],pick:{hair:/bob|wolf|shag|asymmetric|blunt|pixie|sleek/i,outfit:/suit|jumpsuit|blazer|structured|power|leather|statement|tailored/i,makeup:/liner|red lip|graphic|bold|berry|sculpted/i,pose:/stance|hip|folded|commanding|over-the-shoulder|straight-on|power/i,expression:/fierce|serious|confident|direct|determined/i,mood:/fearless|high-fashion|powerful/i}},
soft:{name:'soft candid',icon:'☼',settings:['indoor','outdoor'],pick:{hair:/wave|curl|layer|butterfly|curtain|natural|beach|half-up/i,outfit:/white|ivory|knit|shirt|satin|slip|wrap|midi|champagne|soft|dress/i,makeup:/soft|dewy|natural|minimal|rose|fresh|clean/i,pose:/laugh|looking|candid|window|walking|tuck|hair/i,expression:/smile|laugh|warm|soft|candid|grin/i,mood:/relaxed|warm|fresh|celebrat/i}},
glam:{name:'glam',icon:'◇',settings:['indoor','night','studio'],pick:{hair:/hollywood|wave|blowout|sleek|ponytail|flip|voluminous/i,outfit:/gown|satin|velvet|evening|sequin|dress|saree/i,makeup:/glam|red lip|smoky|berry|shimmer|bronze|wing/i,pose:/seated|over|profile|chin|stool|hand/i,expression:/poised|elegant|composed|confident|smirk/i,mood:/glamorous|mysterious|composed/i}},
edge:{name:'rock-chic',icon:'⚡',settings:['urban','night','studio'],pick:{hair:/shag|wolf|rock|choppy|piecey|wet|slicked/i,outfit:/leather|black|denim|monochrome|jacket|sequin/i,makeup:/smoky|charcoal|graphic|liner|bold/i,pose:/lean|wall|walk|folded|pocket|backwards|floor/i,expression:/smirk|unbothered|cool|fierce|mischievous|raised/i,mood:/edgy|cool|cheeky|playful/i}},
heritage:{name:'modern heritage',icon:'❋',settings:['indoor','outdoor'],pick:{hair:/braid|bun|twist|chignon|wave|half-up|low/i,outfit:/saree|nauvari|fusion|dhoti|silk|tunic/i,makeup:/red|berry|classic|bronze|glam|warm/i,accessories:/jhumka|oxidized|traditional|pearl|bangle|mangalsutra/i,pose:/seated|window|adjust|profile|chin|standing/i,expression:/smile|elegant|serene|warm/i,mood:/warm|glamorous|quiet|celebrat/i}},
minimal:{name:'clean minimal',icon:'◻',settings:['studio','indoor'],pick:{hair:/sleek|low|bob|straight|bun|blunt/i,outfit:/minimal|column|crisp|tailored|monochrome|white|ivory|black/i,makeup:/minimal|clean|natural|fresh|bare/i,pose:/stance|standing|profile|straight|seated/i,expression:/calm|composed|quiet|neutral|serene/i,mood:/quiet|cool|composed/i}}};
const SETTINGS={
studio:{background:/studio|seamless|backdrop|cyclorama|cyc|paper/i,lighting:/studio|softbox|beauty|key|flash|bright/i,style:/editorial|campaign|lookbook|magazine/i},
indoor:{background:/salon|hotel|apartment|living|cafe|suite|loft|corridor|stairwell|window|dressing|lounge|gallery/i,lighting:/window|soft|practical|tungsten|salon|diffused/i,style:/candid|documentary|reveal|lifestyle|unposed/i},
outdoor:{background:/terrace|garden|rooftop|stone|veranda|balcony|courtyard|street|wall/i,lighting:/golden|sun|overcast|daylight|open shade|dusk/i,style:/street|documentary|lifestyle|candid/i,timeOfDay:/golden|morning|afternoon|overcast/i},
urban:{background:/concrete|urban|rooftop|stair|loft|arcade|sidewalk|industrial/i,lighting:/flash|hard|sun|overcast|mixed/i,style:/street|flash|candid|lookbook/i},
night:{background:/night|city|bokeh|rooftop|dusk|lounge|hotel/i,lighting:/flash|low-key|moody|neon|tungsten|cinematic/i,style:/flash|campaign|luxury|editorial|snapshot/i,timeOfDay:/night|blue-hour|evening/i}};
const COLORS=[['red',/red|crimson|ruby|scarlet|cherry/i],['black',/black|ink|graphite/i],['emerald',/emerald|green|jade|forest|moss|olive/i],['burgundy',/burgundy|oxblood|plum|aubergine|mahogany/i],['ivory',/ivory|white|pearl|cream/i],['cobalt',/cobalt|blue|sapphire|midnight|navy|teal/i],['rose',/rose|pink|fuchsia|blush/i],['gold',/champagne|gold|copper|sand|bronze/i],['charcoal',/charcoal|grey|silver|slate|pewter/i]];
const rnd=a=>a[Math.floor(Math.random()*a.length)];let lookN=0;
function pool(id,re,extra){const f=fields[id];return f?f.opts.filter(o=>o.text&&re.test(o.label)&&(!extra||extra.test(o.label))):[]}
function genLook(){const E=rnd(Object.values(ENERGIES)),S=SETTINGS[rnd(E.settings)],[cn,cre]=rnd(COLORS),set={};let cw='';
const put=(id,re)=>{const m=pool(id,re);if(m.length)set[id]=rnd(m)};
Object.entries(E.pick).forEach(([id,re])=>{if(id==='outfit'){const m=pool(id,re,cre);if(m.length){set.outfit=rnd(m);cw=cn}else put(id,re)}else put(id,re)});
Object.entries(S).forEach(([id,re])=>put(id,re));
['hairFinish','gesture','framing'].forEach(id=>{if(fields[id])set[id]=rnd(fields[id].opts)});
const t=(cw?cw+' ':'')+E.name;const hl=set.hair?set.hair.label:'',bl=set.background?set.background.label:'';
return{id:'gen'+(++lookN),icon:E.icon,title:t.charAt(0).toUpperCase()+t.slice(1),sub:[hl,bl].filter(Boolean).join(' · '),set}}
let presets=[];
const finishChecks=[
{id:'identity',label:'Preserve recognizable facial identity',detail:'Keep the same adult woman; no face replacement or identity drift.',checked:true},
{id:'soloSubject',label:'Solo subject only (exclude stylist & extra people)',detail:'Strictly omit any hairdresser, stylist, man in background, hands touching hair, or secondary person from reference photos.',checked:true},
{id:'hairTexturePreserve',label:'Preserve original reference hair texture',detail:'Strictly preserve original natural hair strand texture, thickness, density and organic movement across all haircuts.',checked:true},
{id:'skin',label:'Natural skin texture',detail:'Visible pores, natural texture and facial asymmetry.',checked:true},
{id:'body',label:'Preserve natural body proportions',detail:'No slimming, reshaping or exaggerated anatomy.',checked:true},
{id:'skinTone',label:'Preserve the reference skin tone',detail:'Keep skin color believable and consistent.',checked:true},
{id:'hairStrands',label:'Individual hair strands and flyaways',detail:'Avoid clumped, helmet-like or synthetic hair.',checked:true},
{id:'fabric',label:'Realistic fabric and tailoring',detail:'Natural folds, seams, texture, weight and garment fit.',checked:true},
{id:'hands',label:'Believable hands and anatomy',detail:'Natural finger positions and plausible body structure.',checked:true},
{id:'lightingReal',label:'Physically believable lighting',detail:'Consistent shadows, highlights and reflected light.',checked:true},
{id:'waterReal',label:'Aquatic & wet physics',detail:'Authentic water droplets, wet hair physics and damp fabric weight; no plastic textures.',checked:true},
{id:'retouch',label:'No excessive beauty retouching',detail:'Avoid airbrushed, waxy, plastic or filtered skin.',checked:true},
{id:'accessoryKeep',label:'Retain signature reference accessories',detail:'Keep visible nose ring, glasses or jewelry when requested.',checked:true},
{id:'backgroundReal',label:'Natural environmental details',detail:'Lived-in details instead of a generic artificial set.',checked:false},
{id:'noMirror',label:'Avoid mirrors and reflections',detail:'Reduce incorrect reflections and duplicated subjects.',checked:false},
{id:'noText',label:'No text, logo or watermark',detail:'Keep the photo clean of graphic overlays.',checked:true},
{id:'candid',label:'Candid, not overly staged',detail:'Natural posture, unforced expression and imperfect timing.',checked:true}
];
const GROUPS=[
['salonVenueSec','Establishment & Design',['mode','salonVenueCategory','salonVenue','salonDesign']],
['salonVenueSec','Staffing, Crowd & Atmosphere',['salonBarberStaff','salonBustle','salonTime','salonStationProps']],
['salonStageSec','Haircut Progress & Barber',['salonStage','salonStylist']],
['salonStageSec','Client Pose, Expression & Reaction',['salonChairPose','salonBarberPose','salonExpression']],
['salonStageSec','Stool & Intimate Barber Setup',['salonStoolType','salonBarberProximity']],
['salonStageSec','Hair Work & Model Posture',['salonIntimateHairAction','salonStoolModelPosture']],
['salonHairSec','Haircut Blueprint & State',['salonHairCategory','salonHaircut','salonFaceHairCoverage','salonFaceObfuscMode','salonHairTexture','salonClipperGuard']],
['salonCameraSec','Cutting Cape & Realism',['salonCape']],
['salonCameraSec','Mirror Angle & Lighting',['salonCamera','salonLighting','salonQuality']],
['look','The moment',['makeover','mode']],['look','Cut & shape',['hairCategory','hair','hairFaceCoverage','faceObfuscMode','hairTexture','hairLength','hairVolume','fringe','parting']],['look','Colour & finish',['hairColor','hairColorTechnique','hairFinish','hairAccessories']],
['wardrobe','Outfit',['outfitCategory','outfit']],
['wardrobe','Top Piece & Styling',['topCategory','topPiece']],
['wardrobe','Bottom Piece & Cut',['bottomCategory','bottomPiece','midriffStyling']],
['wardrobe','Fit & Fabric Details',['outfitFit','palette','fabric','neckline','sleeves','layering','garmentDetail']],['wardrobe','Colour story',['palette','accentColors']],['wardrobe','Accessories',['accessories','eyewear','bag','footwear','nailStyle']],['wardrobe','Makeup & skin',['makeup','lipLook','eyeLook','browStyle','complexion']],
['pose','Male Presence & Interaction',['malePresence','maleInteraction']],['pose','Body',['poseCategory','pose','stance','gesture','motion']],['pose','Face & energy',['expression','gaze','mood','shotEnergy']],['pose','Story',['interaction']],
['camera','Framing',['shotCategory','framing','cameraDistance','angle','composition','aspect','cropRules']],['camera','Optics',['lens','focusDetail','blurControl','filmFeel']],
['scene','Location',['sceneCategory','background','placeDetail','locale','setProps','sceneActivity','depth']],['scene','Light & time',['lightingCategory','lighting','timeOfDay','season','weather']],['scene','Photo look',['style','grade','quality','photoTexture']]];
const CORE_FIELD_IDS = {
salonVenueSec: new Set(['mode', 'salonVenueCategory', 'salonVenue', 'salonDesign', 'salonBarberStaff', 'salonBustle', 'salonTime', 'salonStationProps']),
salonStageSec: new Set(['salonStage', 'salonStylist', 'salonChairPose', 'salonBarberPose', 'salonExpression', 'salonStoolType', 'salonBarberProximity', 'salonIntimateHairAction', 'salonStoolModelPosture']),
salonHairSec: new Set(['salonHairCategory', 'salonHaircut', 'salonFaceHairCoverage', 'salonFaceObfuscMode', 'salonHairTexture', 'salonClipperGuard']),
salonCameraSec: new Set(['salonCape', 'salonCamera', 'salonLighting', 'salonQuality']),
look: new Set(['mode', 'hairCategory', 'hair', 'hairFaceCoverage', 'faceObfuscMode', 'hairTexture', 'hairLength', 'hairColor', 'hairFinish']),
wardrobe: new Set(['outfitCategory', 'outfit', 'topCategory', 'topPiece', 'bottomCategory', 'bottomPiece', 'midriffStyling', 'outfitFit', 'palette', 'makeup', 'accessories']),
pose: new Set(['poseCategory', 'pose', 'malePresence', 'maleInteraction', 'expression', 'gesture', 'mood']),
camera: new Set(['shotCategory', 'framing', 'angle', 'lens', 'aspect']),
scene: new Set(['sceneCategory', 'background', 'placeDetail', 'lightingCategory', 'lighting', 'style', 'grade'])
};

const COLLAGE_FIELD_IDS = new Set(['salonCollageFlow', 'salonCollageFrame1', 'salonCollageFrame2', 'salonCollageFrame3', 'salonCollageFrame4']);

function orderedFields(){
const list=[];
GROUPS.forEach(([sec,g,ids])=>{
  if(sec!==activeSection)return;
  ids.forEach(id=>{
    if(fields[id]){
      fields[id]._grp=g;
      list.push([id,fields[id]]);
    }
  });
});
Object.entries(fields).forEach(([id,f])=>{
  if(COLLAGE_FIELD_IDS.has(id)) return;
  if(f.section===activeSection&&!list.some(x=>x[0]===id)){
    f._grp='More detail';
    list.push([id,f]);
  }
});
return list;
}

const el=id=>document.getElementById(id);
let activeSection='look';
let activePreset='';
let customDirection='';
let extraNegative='';
let outputType='single';
let lookbookMode = false;
let activeShot = 'all';
let lookbookShots = { all: '', '1': '', '2': '', '3': '', '4': '' };
let extractedPalette = [];
let harmonizePalette = false;
let promptHistory = [];
const HIST_KEY = 'afterglow-prompt-history-v2';

let detailLevel='full';
let values={};
Object.entries(fields).forEach(([id,f])=>values[id]=f.opts[f.def]);
let checkState={};
finishChecks.forEach(c=>checkState[c.id]=c.checked);
let lockedFields=new Set();
let preserveHairTexture=true;
let subjectRef = null;
let styleRef = null;
let transferToggles = { hair: true, outfit: false, palette: false, scene: false };
let customPresets=[];

const totalOptions=Object.values(fields).reduce((sum,f)=>sum+f.opts.length,0);
el('totalOptionCount').textContent=totalOptions.toLocaleString()+' searchable choices';
function renderTabs(){
  const tabs=el('tabs');
  if(!tabs)return;
  tabs.innerHTML='';
  sections.forEach((s,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='tab'+(s.id===activeSection?' active':'');
    b.dataset.section=s.id;
    b.innerHTML=`<span class="tab-no">${String(i+1).padStart(2,'0')}</span>${s.name}`;
    b.addEventListener('click',()=>goSection(s.id));
    tabs.appendChild(b);
  });
}
renderTabs();

function switchStudioMode(mode){
  if(mode !== 'photoshoot' && mode !== 'salon') mode = 'photoshoot';
  currentStudioMode = mode;
  
  const btnPhoto = el('btnModePhotoshoot');
  const btnSalon = el('btnModeSalon');
  if(btnPhoto) {
    btnPhoto.classList.toggle('active', mode === 'photoshoot');
    btnPhoto.setAttribute('aria-selected', mode === 'photoshoot');
  }
  if(btnSalon) {
    btnSalon.classList.toggle('active', mode === 'salon');
    btnSalon.setAttribute('aria-selected', mode === 'salon');
  }
  
  const hEyebrow = el('heroEyebrow');
  const hTitle = el('heroTitle');
  const hDesc = el('heroDescription');
  if(mode === 'salon'){
    if(hEyebrow) hEyebrow.textContent = 'Realistic In-Progress Haircut & Salon Experience';
    if(hTitle) hTitle.innerHTML = 'Salon & <span>Barbershop</span><br>Experience Studio';
    if(hDesc) hDesc.textContent = 'Craft gritty, authentic, photorealistic salon & barber scenes. Direct in-progress scissor snips, draped black capes with cut hair clippings, Indian male barbers, mirror reflections, and bustling shop atmosphere.';
    sections = salonSections;
  } else {
    if(hEyebrow) hEyebrow.textContent = 'Reference-led creative direction · Editorial Fashion';
    if(hTitle) hTitle.innerHTML = 'Makeover <span>Photoshoot</span><br>Prompt Studio';
    if(hDesc) hDesc.textContent = 'Build a confident, candid, bold fashion-editorial prompt after the makeover. Mix hairstyles, statement looks, expressive poses, camera direction, lighting and realism controls—then copy a finished prompt ready for your image editor.';
    sections = photoshootSections;
  }
  
  // Studio mode url hash tracking removed (each studio has its own HTML file)
  
  activeSection = sections[0].id;
  const numImagesEl = el('numImages');
  if(numImagesEl && numImagesEl.options && numImagesEl.options.length > 1){
    numImagesEl.options[1].text = (mode === 'salon') ? 'One 2×2 collage · 4 haircut stages' : 'One 2×2 collage · 4 poses';
  }

  renderTabs();
  goSection(activeSection, false);
  buildPrompt();
  toast(mode === 'salon' ? '💈 Switched to Realistic Salon & Barbershop Studio!' : '📸 Switched to Editorial Fashion Photoshoot Studio!');
}

const btnModePhoto = el('btnModePhotoshoot');
const btnModeSal = el('btnModeSalon');
if(btnModePhoto) btnModePhoto.addEventListener('click', () => switchStudioMode('photoshoot'));
if(btnModeSal) btnModeSal.addEventListener('click', () => switchStudioMode('salon'));

// Check initial hash
if(false && window.location.hash === '#salon'){
  setTimeout(() => switchStudioMode('salon'), 10);
}

const presetHost=el('presets');
let hoverP=false;

function pickThemes(n,cur){
const out=[];
for(let i=0;i<n;i++)out.push(genLook());
return out;
}

function renderPresets(){
presetHost.innerHTML='';
customPresets.forEach(p=>{
  const b=document.createElement('button');
  b.type='button';
  b.className='preset custom-preset'+(p.id===activePreset?' active':'');
  b.dataset.preset=p.id;
  b.innerHTML=`<div style="display:flex;align-items:center;width:100%"><span class="preset-icon">${p.icon||'⭐'}</span><strong style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</strong><button type="button" class="preset-del" title="Delete custom look" data-del="${p.id}">✕</button></div><small>${p.sub||'Custom look'}</small>`;
  b.addEventListener('click',(e)=>{
    if(e.target.closest('.preset-del')){
      deleteCustomPreset(p.id,e);
    }else{
      applyPreset(p.id,p);
    }
  });
  presetHost.appendChild(b);
});

presets.forEach(p=>{
  const b=document.createElement('button');
  b.type='button';
  b.className='preset'+(p.id===activePreset?' active':'')+(p._new?' fresh':'');
  p._new=false;
  b.dataset.preset=p.id;
  b.innerHTML=`<span class="preset-icon">${p.icon}</span><strong>${p.title}</strong><small>${p.sub}</small>`;
  b.addEventListener('click',()=>applyPreset(p.id));
  presetHost.appendChild(b);
});
}

function rotatePresets(all){
if(all||!presets.length){
  presets=pickThemes(8,[]);
  presets.forEach(p=>p._new=true);
}else{
  const idx=presets.map((p,i)=>i).filter(i=>presets[i].id!==activePreset).sort(()=>Math.random()-.5).slice(0,3);
  const fresh=pickThemes(idx.length,presets);
  idx.forEach((i,j)=>{
    if(fresh[j]){
      fresh[j]._new=true;
      presets[i]=fresh[j];
    }
  });
}
renderPresets();
}

function startRotation(){
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const strip=document.querySelector('.preset-strip');
strip.addEventListener('mouseenter',()=>hoverP=true);
strip.addEventListener('mouseleave',()=>hoverP=false);
setInterval(()=>{
  if(!hoverP&&!document.hidden&&!document.querySelector('.custom-select.open'))rotatePresets();
},6000);
el('shuffleLooks').addEventListener('click',()=>rotatePresets(true));
if(el('saveCustomLook')) el('saveCustomLook').addEventListener('click',saveCustomPreset);
}

function syncSalonStageWithSeatingMode(){
  if (!fields.salonStage || !fields.salonStage.opts) return;
  const isGroomingStage = Boolean(values.salonStage?.label?.includes('Female model (barber)') || values.salonStage?.text?.includes('adult female model'));
  if (salonSeatingMode === 'grooming_men') {
    if (!isGroomingStage) {
      const match = fields.salonStage.opts.find(o => o.label.includes('Female model (barber)'));
      if (match) values.salonStage = match;
    }
  } else {
    if (isGroomingStage) {
      const clientOpt = fields.salonStage.opts.find(o => !o.label.includes('Female model (barber)')) || fields.salonStage.opts[0];
      values.salonStage = clientOpt;
    }
  }
}

function activateMenGrooming(){
  if(currentStudioMode === 'salon'){
    salonSeatingMode = 'grooming_men';
    syncSalonStageWithSeatingMode();
    goSection('salonStageSec');
    buildPrompt();
    toast('Switched to Female Model (Barber) Grooming Male Client.');
    const card = document.getElementById('stepCard');
    if(card) card.scrollIntoView({behavior: 'smooth', block: 'start'});
    return;
  }
  values.malePresence = fields.malePresence.opts.find(o => o.text === 'female_grooming_men') || fields.malePresence.opts[5];
  const match = fields.maleInteraction.opts.find(opt => opt.cat === 'female_grooming_men' && opt.text !== 'none');
  if (match) values.maleInteraction = match;
  goSection('pose');
  buildPrompt();
  toast('Switched to Female Model Grooming Men (Shaving, beard & champi).');
  const card = document.getElementById('stepCard');
  if(card) card.scrollIntoView({behavior: 'smooth', block: 'start'});
}
if(el('btnQuickGrooming')) el('btnQuickGrooming').addEventListener('click', activateMenGrooming);

function saveCustomPreset(){
const name=prompt('Enter a name for this custom look:','My Look '+(customPresets.length+1));
if(!name||!name.trim())return;
const curSet={};
Object.entries(values).forEach(([k,v])=>{curSet[k]=v});
const newPreset={
  id:'user_'+Date.now(),
  title:name.trim(),
  sub:[values.hair?.label,values.outfit?.label].filter(Boolean).join(' · '),
  icon:'⭐',
  isCustom:true,
  set:curSet
};
customPresets.unshift(newPreset);
save();
renderPresets();
toast(`Saved “${name.trim()}” to presets.`);
}

function deleteCustomPreset(id,e){
e.stopPropagation();
customPresets=customPresets.filter(p=>p.id!==id);
if(activePreset===id)activePreset='';
save();
renderPresets();
toast('Custom preset removed.');
}

function exportCustomPresets(){
  const payload = {
    version: 1,
    studio: currentStudioMode,
    exportedAt: new Date().toISOString(),
    customPresets: customPresets.map(p => ({
      id: p.id,
      title: p.title,
      sub: p.sub,
      icon: p.icon || '⭐',
      set: Object.fromEntries(Object.entries(p.set || {}).map(([k, v]) => [k, v?.label || '']))
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `afterglow-${currentStudioMode}-presets.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(customPresets.length
    ? `✓ Exported ${customPresets.length} custom look(s) as .json.`
    : '✓ Exported preset backup template (save custom looks with ⭐ Save look first).');
}

function importCustomPresetsFromData(parsed){
  const list = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.customPresets) ? parsed.customPresets : null);
  if(!list) throw new Error('Invalid preset JSON format');
  let added = 0;
  list.forEach(raw => {
    if(!raw || !raw.title || !raw.set) return;
    const reconstructedSet = {};
    Object.entries(raw.set).forEach(([k, lbl]) => {
      const m = fields[k] && fields[k].opts.find(x => x.label === lbl);
      if(m) reconstructedSet[k] = m;
    });
    if(!Object.keys(reconstructedSet).length) return;
    const exists = customPresets.some(p => p.id === raw.id || p.title === raw.title);
    if(exists) return;
    customPresets.unshift({
      id: raw.id || ('user_' + Date.now() + '_' + added),
      title: String(raw.title).slice(0, 80),
      sub: raw.sub || 'Imported look',
      icon: raw.icon || '⭐',
      isCustom: true,
      set: reconstructedSet
    });
    added++;
  });
  save();
  renderPresets();
  return added;
}

if(el('exportPresetsBtn')) el('exportPresetsBtn').addEventListener('click', exportCustomPresets);
if(el('importPresetsBtn') && el('importPresetsInput')){
  el('importPresetsBtn').addEventListener('click', () => el('importPresetsInput').click());
  el('importPresetsInput').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const count = importCustomPresetsFromData(JSON.parse(reader.result));
        toast(count ? `✓ Imported ${count} custom look(s).` : 'No new custom looks found in file (already present or empty).');
      } catch(err){
        toast('Could not import presets: invalid .json file.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });
}

function rollTheme(p){
Object.entries(p.set).forEach(([id,o])=>{
  if(lockedFields.has(id))return;
  if(fields[id])values[id]=o;
});
if(values.hair){
  const hCat = getItemCategory('hair', values.hair);
  const match = fields.hairCategory.opts.find(c => c.text === hCat);
  if(match) values.hairCategory = match;
}
if(preserveHairTexture && fields.hairTexture){
  const pOpt = fields.hairTexture.opts.find(o => o.label.includes('Preserve original')) || fields.hairTexture.opts[0];
  values.hairTexture = pOpt;
}
if(values.outfit){
  const oCat = getItemCategory('outfit', values.outfit);
  const match = fields.outfitCategory.opts.find(c => c.text === oCat);
  if(match) values.outfitCategory = match;
}
if(values.pose){
  const pCat = getItemCategory('pose', values.pose);
  const match = fields.poseCategory.opts.find(c => c.text === pCat);
  if(match) values.poseCategory = match;
}
if(values.framing){
  const sCat = getItemCategory('framing', values.framing);
  const match = fields.shotCategory.opts.find(c => c.text === sCat);
  if(match) values.shotCategory = match;
}
if(values.background){
  const bCat = getItemCategory('background', values.background);
  const match = fields.sceneCategory.opts.find(c => c.text === bCat);
  if(match) values.sceneCategory = match;
}
if(values.lighting){
  const lCat = getItemCategory('lighting', values.lighting);
  const match = fields.lightingCategory.opts.find(c => c.text === lCat);
  if(match) values.lightingCategory = match;
}
}

function toggleLock(id){
if(lockedFields.has(id)){
  lockedFields.delete(id);
  toast(`Unlocked ${fields[id]?.label||id}`);
}else{
  lockedFields.add(id);
  toast(`Locked ${fields[id]?.label||id} (won't change during shuffle)`);
}
save();
renderFields();
}

function createFieldElement(id, f) {
const wrap=document.createElement('div');
wrap.className='field'+(['pose','background'].includes(id)?' full':'');
const lab=document.createElement('div');
lab.className='label-row';

const titleWrap=document.createElement('div');
titleWrap.className='label-title-wrap';

const label=document.createElement('label');
label.textContent=f.label;
label.htmlFor='field-'+id;

const isLocked = lockedFields.has(id);
const lockBtn=document.createElement('button');
lockBtn.type='button';
lockBtn.className='lock-btn'+(isLocked?' locked':'');
lockBtn.title=isLocked?'Locked (will not change during shuffle). Click to unlock.':'Lock this choice during shuffle';
lockBtn.innerHTML=isLocked?'🔒':'🔓';
lockBtn.addEventListener('click',()=>toggleLock(id));

titleWrap.append(label, lockBtn);

// Determine options to display (filtered by category if applicable)
let visibleOpts = f.opts;
if (id === 'salonStage' && salonSeatingMode === 'grooming_men') {
  visibleOpts = f.opts.filter(o => o.label.includes('Female model (barber)'));
  if (!visibleOpts.includes(values.salonStage)) {
    values.salonStage = visibleOpts[0] || f.opts[0];
  }
} else if (id === 'salonStage' && salonSeatingMode !== 'grooming_men') {
  visibleOpts = f.opts.filter(o => !o.label.includes('Female model (barber)'));
  if (!visibleOpts.includes(values.salonStage)) {
    values.salonStage = visibleOpts[0] || f.opts[0];
  }
} else if (id === 'hair' && values.hairCategory && values.hairCategory.text && values.hairCategory.text !== 'all') {
  const cat = values.hairCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('hair', o) === cat);
  if (!visibleOpts.includes(values.hair)) {
    values.hair = visibleOpts[0] || f.opts[0];
  }
} else if (id === 'salonVenue' && values.salonVenueCategory && values.salonVenueCategory.text && values.salonVenueCategory.text !== 'all') {
  const cat = values.salonVenueCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('salonVenue', o) === cat);
  if (!visibleOpts.includes(values.salonVenue)) {
    values.salonVenue = visibleOpts[0] || f.opts[0];
  }
} else if (id === 'salonHaircut' && values.salonHairCategory && values.salonHairCategory.text && values.salonHairCategory.text !== 'all') {
  const cat = values.salonHairCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('hair', o) === cat);
  if (!visibleOpts.includes(values.salonHaircut)) {
    values.salonHaircut = visibleOpts[0] || f.opts[0];
  }
} else if (id === 'topPiece' && values.topCategory && values.topCategory.text && values.topCategory.text !== 'all') {
    const cat = values.topCategory.text;
    visibleOpts = f.opts.filter(o => o.cat === cat);
    if (!visibleOpts.includes(values.topPiece)) {
      values.topPiece = visibleOpts[0] || f.opts[0];
    }
  } else if (id === 'bottomPiece' && values.bottomCategory && values.bottomCategory.text && values.bottomCategory.text !== 'all') {
    const cat = values.bottomCategory.text;
    visibleOpts = f.opts.filter(o => o.cat === cat);
    if (!visibleOpts.includes(values.bottomPiece)) {
      values.bottomPiece = visibleOpts[0] || f.opts[0];
    }
  } else if (id === 'outfit' && values.outfitCategory && values.outfitCategory.text && values.outfitCategory.text !== 'all') {
  const cat = values.outfitCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('outfit', o) === cat);
} else if (id === 'pose' && values.poseCategory && values.poseCategory.text && values.poseCategory.text !== 'all') {
  const cat = values.poseCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('pose', o) === cat);
} else if (id === 'framing' && values.shotCategory && values.shotCategory.text && values.shotCategory.text !== 'all') {
  const cat = values.shotCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('framing', o) === cat);
} else if (id === 'background' && values.sceneCategory && values.sceneCategory.text && values.sceneCategory.text !== 'all') {
  const cat = values.sceneCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('background', o) === cat);
} else if (id === 'maleInteraction' && values.malePresence && values.malePresence.text && values.malePresence.text !== 'all') {
  const pres = values.malePresence.text;
  if (pres === 'solo') {
    visibleOpts = f.opts.filter(o => o.cat === 'solo' || o.text === 'none');
  } else {
    visibleOpts = f.opts.filter(o => o.cat === pres || o.text === 'none');
  }
  if (!visibleOpts.includes(values.maleInteraction)) {
    values.maleInteraction = visibleOpts[0] || f.opts[0];
  }
} else if (id === 'lighting' && values.lightingCategory && values.lightingCategory.text && values.lightingCategory.text !== 'all') {
  const cat = values.lightingCategory.text;
  visibleOpts = f.opts.filter(o => getItemCategory('lighting', o) === cat);
} else if (id === 'composition' && values.framing && values.framing.text) {
  const tightFramings = ['close-up beauty portrait', 'detail crop: hair + face', 'tight side-profile portrait'];
  const framingLower = values.framing.label.toLowerCase();
  if (tightFramings.some(tf => framingLower.includes(tf))) {
    const incompatible = ['hair silhouette visible', 'outfit silhouette emphasized', 'environmental storytelling'];
    visibleOpts = f.opts.filter(o => !incompatible.includes(o.label.toLowerCase()));
    if (!visibleOpts.includes(values.composition)) {
      values.composition = visibleOpts[0] || f.opts[0];
    }
  }
}

const count=document.createElement('span');
count.className='option-count';
count.textContent=visibleOpts.length+' options';
lab.append(titleWrap,count);

const custom=document.createElement('div');
custom.className='custom-select';
custom.dataset.id=id;

const trigger=document.createElement('button');
trigger.type='button';
trigger.className='select-trigger';
trigger.setAttribute('aria-expanded','false');
trigger.innerHTML=`<span class="current"></span><span class="chevron">⌄</span>`;

const menu=document.createElement('div');
menu.className='select-menu';
menu.innerHTML=`<input class="select-search" type="search" placeholder="Search ${f.label.toLowerCase()}…" aria-label="Search ${f.label}"><div class="option-list"></div>`;

const list=menu.querySelector('.option-list');

// Populate choices
visibleOpts.forEach((o)=>{
  const b=document.createElement('button');
  b.type='button';
  b.className='choice' + (values[id] === o ? ' selected' : '');
  b.dataset.index=fields[id].opts.indexOf(o);
  b.textContent=o.label;
  b.addEventListener('click',()=>{
    values[id]=o;
    
    // Auto-sync parent category if a specific style was selected directly
    if (id === 'hair') {
      const itemCat = getItemCategory('hair', o);
      const matchCat = fields.hairCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.hairCategory.text !== 'all') values.hairCategory = matchCat;
    } else if (id === 'salonHaircut') {
      const itemCat = getItemCategory('hair', o);
      const matchCat = fields.salonHairCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.salonHairCategory.text !== 'all') values.salonHairCategory = matchCat;
    } else if (id === 'outfit') {
      const itemCat = getItemCategory('outfit', o);
      const matchCat = fields.outfitCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.outfitCategory.text !== 'all') values.outfitCategory = matchCat;
    } else if (id === 'pose') {
      const itemCat = getItemCategory('pose', o);
      const matchCat = fields.poseCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.poseCategory.text !== 'all') values.poseCategory = matchCat;
    } else if (id === 'framing') {
      const itemCat = getItemCategory('framing', o);
      const matchCat = fields.shotCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.shotCategory.text !== 'all') values.shotCategory = matchCat;
    } else if (id === 'background') {
      const itemCat = getItemCategory('background', o);
      const matchCat = fields.sceneCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.sceneCategory.text !== 'all') values.sceneCategory = matchCat;
    } else if (id === 'lighting') {
      const itemCat = getItemCategory('lighting', o);
      const matchCat = fields.lightingCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.lightingCategory.text !== 'all') values.lightingCategory = matchCat;
    } else if (id === 'hairCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.hair.opts.find(opt => getItemCategory('hair', opt) === cat);
        if (firstInCat && getItemCategory('hair', values.hair) !== cat) values.hair = firstInCat;
      }
    } else if (id === 'salonVenue') {
      const itemCat = getItemCategory('salonVenue', o);
      const matchCat = fields.salonVenueCategory.opts.find(c => c.text === itemCat);
      if (matchCat && values.salonVenueCategory.text !== 'all') values.salonVenueCategory = matchCat;
    } else if (id === 'salonVenueCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.salonVenue.opts.find(opt => getItemCategory('salonVenue', opt) === cat);
        if (firstInCat && getItemCategory('salonVenue', values.salonVenue) !== cat) values.salonVenue = firstInCat;
      }
    } else if (id === 'salonHairCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.salonHaircut.opts.find(opt => getItemCategory('hair', opt) === cat);
        if (firstInCat && getItemCategory('hair', values.salonHaircut) !== cat) values.salonHaircut = firstInCat;
      }
    } else if (id === 'topCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const matchFirst = fields.topPiece.opts.find(opt => opt.cat === cat);
        if (matchFirst) values.topPiece = matchFirst;
      }
    } else if (id === 'bottomCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const matchFirst = fields.bottomPiece.opts.find(opt => opt.cat === cat);
        if (matchFirst) values.bottomPiece = matchFirst;
      }
    } else if (id === 'outfitCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.outfit.opts.find(opt => getItemCategory('outfit', opt) === cat);
        if (firstInCat && getItemCategory('outfit', values.outfit) !== cat) values.outfit = firstInCat;
      }
    } else if (id === 'poseCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.pose.opts.find(opt => getItemCategory('pose', opt) === cat);
        if (firstInCat && getItemCategory('pose', values.pose) !== cat) values.pose = firstInCat;
      }
    } else if (id === 'shotCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.framing.opts.find(opt => getItemCategory('framing', opt) === cat);
        if (firstInCat && getItemCategory('framing', values.framing) !== cat) values.framing = firstInCat;
      }
    } else if (id === 'sceneCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.background.opts.find(opt => getItemCategory('background', opt) === cat);
        if (firstInCat && getItemCategory('background', values.background) !== cat) values.background = firstInCat;
      }
    } else if (id === 'lightingCategory') {
      const cat = o.text || 'all';
      if (cat !== 'all') {
        const firstInCat = fields.lighting.opts.find(opt => getItemCategory('lighting', opt) === cat);
        if (firstInCat && getItemCategory('lighting', values.lighting) !== cat) values.lighting = firstInCat;
      }
    } else if (id === 'malePresence') {
      const pres = o.text;
      if (pres === 'solo') {
        values.maleInteraction = fields.maleInteraction.opts.find(opt => opt.text === 'none') || fields.maleInteraction.opts[0];
      } else {
        const match = fields.maleInteraction.opts.find(opt => opt.cat === pres && opt.text !== 'none');
        if (match) values.maleInteraction = match;
      }
    }

    updateCustom(custom,id);
    custom.classList.remove('open');
    trigger.setAttribute('aria-expanded','false');

    const RE_RENDER_IDS = new Set(['salonVenueCategory', 'salonVenue', 'salonDesign', 'salonBarberStaff', 'salonBustle', 'salonHairCategory', 'salonHaircut', 'salonFaceObfuscMode', 'salonCollageFlow', 'salonCollageFrame1', 'salonCollageFrame2', 'salonCollageFrame3', 'salonCollageFrame4', 'hairCategory', 'hair', 'faceObfuscMode', 'outfitCategory', 'outfit', 'topCategory', 'topPiece', 'bottomCategory', 'bottomPiece', 'midriffStyling', 'poseCategory', 'pose', 'malePresence', 'maleInteraction', 'shotCategory', 'framing', 'sceneCategory', 'background', 'lightingCategory', 'lighting', 'ponyTailFall', 'ponyTailEnd', 'sideSweepSide', 'sideSweepFlip', 'sideSweepEnd', 'sideSweepFinish']);
    if (id === 'salonStage' && currentStudioMode === 'salon' && outputType === 'collage') {
      const curFlow = values.salonCollageFlow?.text || 'journey';
      if (curFlow === 'journey') {
        const newStageScene = getStageMatchingSceneId(values.salonStage?.label, values.salonStage?.text);
        const matchSceneObj = salonCollageScenes.find(s => s.text === newStageScene);
        if (matchSceneObj && values.salonCollageFrame2?.text !== newStageScene) {
          values.salonCollageFrame2 = matchSceneObj;
          markCollageCustom();
          syncCollageDirectorCardUI();
          toast('Panel 2 updated to match chosen haircut stage.');
        }
      }
    }

    if (RE_RENDER_IDS.has(id)) {
      renderFields();
    }
    buildPrompt();
    updateFineTuneBadge();
  });
  list.appendChild(b);
});

trigger.querySelector('.current').textContent = values[id]?.label || '';

trigger.addEventListener('click',()=>{
  const was=custom.classList.contains('open');
  document.querySelectorAll('.custom-select.open').forEach(x=>{
    x.classList.remove('open');
    x.querySelector('.select-trigger').setAttribute('aria-expanded','false');
  });
  if(!was){
    custom.classList.add('open');
    trigger.setAttribute('aria-expanded','true');
    const inp = menu.querySelector('input');
    inp.value = '';
    filterChoices(menu, '');
    inp.focus({preventScroll:true});
    const sel=menu.querySelector('.choice.selected:not(.hidden)');
    if(sel)sel.scrollIntoView({block:'nearest'});
  }
});

menu.querySelector('input').addEventListener('input',e=>filterChoices(menu,e.target.value));
menu.querySelector('input').addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    e.preventDefault();
    const f=menu.querySelector('.choice:not(.hidden)');
    if(f)f.click();
  }
});

custom.append(trigger,menu);
wrap.append(lab,custom);
updateCustom(custom,id);
return wrap;
}
function updateFineTuneBadge(){
const countEl=el('fineTuneActiveCount');
if(!countEl)return;
const coreSet=CORE_FIELD_IDS[activeSection]||new Set();
const allOrdered=orderedFields();
let customized=0;
allOrdered.forEach(([id,f])=>{
  if(!coreSet.has(id)){
    if(values[id]&&values[id]!==f.opts[f.def])customized++;
  }
});
if(customized>0){
  countEl.textContent=`${customized} custom`;
  countEl.className='fine-tune-badge';
}else{
  countEl.textContent='';
  countEl.className='';
}
}

function renderFields(){
const host=el('fields');
const fineArea=el('fineTuneArea');
host.innerHTML='';
if(fineArea) fineArea.innerHTML='';

if(currentStudioMode === 'salon' && activeSection === 'salonCameraSec'){
  const banner = document.createElement('div');
  banner.className = 'collage-redirect-hint';
  banner.style.cssText = 'grid-column: 1 / -1; margin: 0 0 14px 0; padding: 12px 14px; background: rgba(244, 114, 182, 0.08); border: 1px solid rgba(244, 114, 182, 0.22); border-radius: 10px; font-size: 12px; color: var(--text); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;';
  banner.innerHTML = `<span>🎬 <strong>Directing a 2×2 Storyboard Collage?</strong> The 4-panel Scene Director is located in the <strong>Finish</strong> step when "2×2 collage" is selected under Output format.</span>
  <button type="button" class="btn-director-sync" id="btnGoToCollageDirector" style="font-size:11px; padding:5px 12px; cursor:pointer;">Open 2×2 Director ➔</button>`;
  banner.querySelector('#btnGoToCollageDirector').addEventListener('click', () => {
    outputType = 'collage';
    goSection('finish');
    buildPrompt();
  });
  host.appendChild(banner);
}

if(currentStudioMode === 'photoshoot' && activeSection === 'pose'){
  const pres = values.malePresence?.text || 'solo';
  const isSolo = (!values.malePresence || pres === 'solo');
  const isGrooming = (pres === 'female_grooming_men');
  const isCoStar = (!isSolo && !isGrooming);
  
  const switchWrap = document.createElement('div');
  switchWrap.className = 'pose-mode-switch-card';
  switchWrap.style.cssText = 'grid-column: 1 / -1; margin: 0 0 16px 0; padding: 14px 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; display: flex; flex-direction: column; gap: 10px;';
  
  switchWrap.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <strong style="font-size: 13px; color: var(--text, #fff); display: block;">Shoot Setup & Presence</strong>
        <span style="font-size: 11px; color: var(--text-dim, #999);">Choose whether our female model is posing solo, interacting with male co-stars / crew, or grooming & pampering men.</span>
      </div>
      <div class="seg-control" style="display: flex; background: rgba(0,0,0,0.4); padding: 3px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); gap: 4px; flex-wrap: wrap;">
        <button type="button" class="seg-btn ${isSolo ? 'active' : ''}" id="btnPoseSolo" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isSolo ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">👩 Solo Posing</button>
        <button type="button" class="seg-btn ${isCoStar ? 'active' : ''}" id="btnPoseInteract" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isCoStar ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">👥 Co-Star & Crew</button>
        <button type="button" class="seg-btn ${isGrooming ? 'active' : ''}" id="btnPoseGrooming" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isGrooming ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">✂️ Model Grooming Men</button>
      </div>
    </div>
  `;

  switchWrap.querySelector('#btnPoseSolo').addEventListener('click', () => {
    values.malePresence = fields.malePresence.opts.find(o => o.text === 'solo') || fields.malePresence.opts[0];
    values.maleInteraction = fields.maleInteraction.opts.find(o => o.text === 'none') || fields.maleInteraction.opts[0];
    renderFields();
    buildPrompt();
    toast('Switched to Solo Model Posing.');
  });

  switchWrap.querySelector('#btnPoseInteract').addEventListener('click', () => {
    if (!values.malePresence || values.malePresence.text === 'solo' || values.malePresence.text === 'female_grooming_men') {
      values.malePresence = fields.malePresence.opts.find(o => o.text === 'romantic') || fields.malePresence.opts[1];
      const match = fields.maleInteraction.opts.find(opt => opt.cat === values.malePresence.text && opt.text !== 'none');
      if (match) values.maleInteraction = match;
    }
    renderFields();
    buildPrompt();
    toast('Switched to Co-Star & Crew Interaction.');
  });

  switchWrap.querySelector('#btnPoseGrooming').addEventListener('click', () => {
    values.malePresence = fields.malePresence.opts.find(o => o.text === 'female_grooming_men') || fields.malePresence.opts[5];
    const match = fields.maleInteraction.opts.find(opt => opt.cat === 'female_grooming_men' && opt.text !== 'none');
    if (match) values.maleInteraction = match;
    renderFields();
    buildPrompt();
    toast('Switched to Female Model Grooming Men (Shaving, beard & champi).');
  });

  host.appendChild(switchWrap);
}

if(activeSection === 'wardrobe'){
    const isSeparates = (wardrobeMode === 'separates');
    const switchWrap = document.createElement('div');
    switchWrap.className = 'wardrobe-mode-card';
    switchWrap.innerHTML = `
      <div>
        <strong style="font-size: 13px; color: var(--text, #fff); display: block;">Wardrobe Configuration</strong>
        <span style="font-size: 11px; color: var(--text-muted, #b8adbd);">Choose between a complete one-piece ensemble (gowns, suits, sarees, jumpsuits) or modular two-piece separates (crop tops, baby tees, denim shorts, cutoffs).</span>
      </div>
      <div class="seg-control" style="display: flex; background: rgba(0,0,0,0.4); padding: 3px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
        <button type="button" class="seg-btn ${!isSeparates ? 'active' : ''}" id="btnWardrobeEnsemble" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${!isSeparates ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">👗 Full Ensemble / One-Piece</button>
        <button type="button" class="seg-btn ${isSeparates ? 'active' : ''}" id="btnWardrobeSeparates" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isSeparates ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">👚 Tops & Bottoms Separates</button>
      </div>
    `;

    switchWrap.querySelector('#btnWardrobeEnsemble').addEventListener('click', () => {
      wardrobeMode = 'ensemble';
      renderFields();
      buildPrompt();
      toast('Switched to Full Ensemble Wardrobe.');
    });

    switchWrap.querySelector('#btnWardrobeSeparates').addEventListener('click', () => {
      wardrobeMode = 'separates';
      renderFields();
      buildPrompt();
      toast('Switched to Modular Tops & Bottoms Separates.');
    });

    host.appendChild(switchWrap);
  }

  if(currentStudioMode === 'salon' && activeSection === 'salonStageSec'){
  syncSalonStageWithSeatingMode();
  const isStool = (salonSeatingMode === 'stool');
  const isGrooming = (salonSeatingMode === 'grooming_men');
  const isChair = (!isStool && !isGrooming);
  
  const switchWrap = document.createElement('div');
  switchWrap.className = 'salon-seating-switch-card';
  switchWrap.style.cssText = 'grid-column: 1 / -1; margin: 0 0 16px 0; padding: 14px 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; display: flex; flex-direction: column; gap: 10px;';
  
  switchWrap.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <strong style="font-size: 13px; color: var(--text, #fff); display: block;">Barber Role, Seating & Presence</strong>
        <span style="font-size: 11px; color: var(--text-dim, #999);">Choose whether our female model is the client getting a haircut (chair / stool) or the skilled barber grooming a male client.</span>
      </div>
      <div class="seg-control" style="display: flex; background: rgba(0,0,0,0.4); padding: 3px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); gap: 4px; flex-wrap: wrap;">
        <button type="button" class="seg-btn ${isChair ? 'active' : ''}" id="btnSeatingChair" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isChair ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">💈 Classic Chair (Client)</button>
        <button type="button" class="seg-btn ${isStool ? 'active' : ''}" id="btnSeatingStool" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isStool ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">🪑 Stool & Close Barber (Client)</button>
        <button type="button" class="seg-btn ${isGrooming ? 'active' : ''}" id="btnRoleGrooming" style="padding: 6px 14px; font-size: 11px; border-radius: 6px; cursor: pointer; border: none; background: ${isGrooming ? 'var(--pink, #ec4899)' : 'transparent'}; color: #fff; font-weight: 600;">✂️ Model Grooming Men (Barber)</button>
      </div>
    </div>
  `;

  switchWrap.querySelector('#btnSeatingChair').addEventListener('click', () => {
    salonSeatingMode = 'chair';
    syncSalonStageWithSeatingMode();
    renderFields();
    buildPrompt();
    toast('Switched to Classic Hydraulic Barber Chair (Client).');
  });

  switchWrap.querySelector('#btnSeatingStool').addEventListener('click', () => {
    salonSeatingMode = 'stool';
    syncSalonStageWithSeatingMode();
    renderFields();
    buildPrompt();
    toast('Switched to Intimate Stool & Close-Contact Barber (Client).');
  });

  switchWrap.querySelector('#btnRoleGrooming').addEventListener('click', () => {
    salonSeatingMode = 'grooming_men';
    syncSalonStageWithSeatingMode();
    renderFields();
    buildPrompt();
    toast('Switched to Female Model (Barber) Grooming Male Client.');
  });

  host.appendChild(switchWrap);
}

const allOrdered=orderedFields();
const coreSet=CORE_FIELD_IDS[activeSection]||new Set();

const primaryFields=[];
const secondaryFields=[];

const isSoloPose = (currentStudioMode === 'photoshoot' && activeSection === 'pose' && (!values.malePresence || values.malePresence.text === 'solo'));
const isInteractPose = (currentStudioMode === 'photoshoot' && activeSection === 'pose' && values.malePresence && values.malePresence.text !== 'solo');

allOrdered.forEach(([id,f])=>{
  if(activeSection === 'pose'){
    if(isSoloPose){
      if(id === 'malePresence' || id === 'maleInteraction') return;
      if(coreSet.has(id)) primaryFields.push([id,f]);
      else secondaryFields.push([id,f]);
    } else {
      if(id === 'poseCategory' || id === 'pose' || id === 'gesture' || id === 'stance' || id === 'motion') return;
      if(coreSet.has(id) || id === 'malePresence' || id === 'maleInteraction') primaryFields.push([id,f]);
      else secondaryFields.push([id,f]);
    }
    return;
  }

  if(activeSection === 'wardrobe'){
    const isSeparates = (wardrobeMode === 'separates');
    if(!isSeparates){
      if(id === 'topCategory' || id === 'topPiece' || id === 'bottomCategory' || id === 'bottomPiece' || id === 'midriffStyling') return;
      if(coreSet.has(id)) primaryFields.push([id,f]);
      else secondaryFields.push([id,f]);
    } else {
      if(id === 'outfitCategory' || id === 'outfit') return;
      if(coreSet.has(id) || id === 'topCategory' || id === 'topPiece' || id === 'bottomCategory' || id === 'bottomPiece' || id === 'midriffStyling') primaryFields.push([id,f]);
      else secondaryFields.push([id,f]);
    }
    return;
  }

  if(currentStudioMode === 'salon' && activeSection === 'salonStageSec'){
    const isStool = (salonSeatingMode === 'stool');
    const isGrooming = (salonSeatingMode === 'grooming_men');
    if(!isStool){
      if(id === 'salonStoolType' || id === 'salonBarberProximity' || id === 'salonIntimateHairAction' || id === 'salonStoolModelPosture') return;
      if(isGrooming && (id === 'salonStylist' || id === 'salonChairPose')) return;
      if(!isGrooming && id === 'salonBarberPose') return;
      if(coreSet.has(id)) primaryFields.push([id,f]);
      else secondaryFields.push([id,f]);
    } else {
      if(id === 'salonStage' || id === 'salonStylist' || id === 'salonChairPose' || id === 'salonBarberPose') return;
      if(coreSet.has(id)) primaryFields.push([id,f]);
      else secondaryFields.push([id,f]);
    }
    return;
  }

  if(coreSet.has(id)||activeSection==='finish'){
    primaryFields.push([id,f]);
  }else{
    if(!PONY_FIELD_IDS.has(id) && !SWEEP_FIELD_IDS.has(id)) secondaryFields.push([id,f]);
  }
});

let lastGrp='';
primaryFields.forEach(([id,f])=>{
  if(f._grp!==lastGrp){
    lastGrp=f._grp;
    const g=document.createElement('h3');
    g.className='grp';
    g.textContent=lastGrp;
    host.appendChild(g);
    if(lastGrp==='Cut & shape' && activeSection==='look'){
      host.appendChild(createHairTextureProtectionCard());
      if(styleRef && transferToggles && transferToggles.hair){
        const notice = document.createElement('div');
        notice.className = 'image2-hair-notice';
        notice.innerHTML = `
          <div class="notice-left">
            <span class="notice-icon">✂️</span>
            <div>
              <strong>Hairstyle Transferred from Image 2 · Solo Subject Mode</strong>
              <small>Haircut below is nullified. Hair copied from Image 2 with stylist/man & hands strictly excluded.</small>
            </div>
          </div>
          <button type="button" class="btn-use-builder-hair" id="btnOverrideImage2Hair">Use builder haircut instead</button>
        `;
        notice.querySelector('#btnOverrideImage2Hair').addEventListener('click', () => {
          transferToggles.hair = false;
          const chip = document.querySelector('.transfer-chip[data-transfer="hair"]');
          if(chip) chip.classList.remove('active');
          updateDualRefAdvisor();
          renderFields();
          buildPrompt();
          toast('Nullification lifted: Using builder haircut in prompt.');
        });
        host.appendChild(notice);
      }
    }
  }
  host.appendChild(createFieldElement(id, f));
  if((id==='salonHaircut' && activeSection==='salonHairSec') || (id==='hair' && activeSection==='look')){
    host.appendChild(createMoisturePillsCard());
  }

  if((id==='hair' && activeSection==='look') || (id==='salonHaircut' && activeSection==='salonHairSec')){
    host.appendChild(createPonytailCard());
    host.appendChild(createSideSweepCard());
  }
});

if(secondaryFields.length>0 && fineArea){
  const details=document.createElement('details');
  details.className='fine-tune-drawer';
  details.id='fineTuneDrawer';

  const summary=document.createElement('summary');
  summary.className='fine-tune-summary';
  summary.innerHTML=`
    <div class="fine-tune-title">
      <span class="fine-tune-icon">✦</span>
      <strong>Fine-tune & micro-controls (${secondaryFields.length} options)</strong>
      <span id="fineTuneActiveCount"></span>
    </div>
    <span class="fine-tune-chevron">⌄</span>
  `;

  const grid=document.createElement('div');
  grid.className='field-grid fine-tune-grid';

  let secLastGrp='';
  secondaryFields.forEach(([id,f])=>{
    if(f._grp!==secLastGrp){
      secLastGrp=f._grp;
      const g=document.createElement('h3');
      g.className='grp';
      g.textContent=secLastGrp;
      grid.appendChild(g);
    }
    grid.appendChild(createFieldElement(id, f));
  });

  details.append(summary, grid);
  fineArea.appendChild(details);
  updateFineTuneBadge();
}

el('specialContent').innerHTML=activeSection==='finish'?finishMarkup():'';
if(activeSection==='finish')bindFinish();
}

function filterChoices(menu,q){
let shown=0;
const list=menu.querySelector('.option-list');
[...list.querySelectorAll('.choice')].forEach(b=>{
  const ok=b.textContent.toLowerCase().includes(q.toLowerCase());
  b.classList.toggle('hidden',!ok);
  if(ok)shown++;
});
let no=menu.querySelector('.no-results');
if(!shown){
  if(!no){
    no=document.createElement('div');
    no.className='no-results';
    no.textContent='No matching options. Try another search.';
    list.appendChild(no);
  }
}else if(no)no.remove();
}

function updateCustom(custom,id){
const curr=custom.querySelector('.current');
if(curr && values[id])curr.textContent=values[id].label;
custom.querySelectorAll('.choice').forEach(b=>{
  const active=fields[id].opts[Number(b.dataset.index)]===values[id];
  b.classList.toggle('selected',active);
  const old=b.querySelector('.checkmark');
  if(old)old.remove();
  if(active){
    const span=document.createElement('span');
    span.className='checkmark';
    span.textContent='✓';
    b.appendChild(span);
  }
});
}

function finishMarkup(){
const visibleChecks=finishChecks.filter(c=>currentStudioMode==='photoshoot'||c.id!=='soloSubject');
const showCollageDirector = (currentStudioMode === 'salon' && outputType === 'collage');
return `<div class="field-grid" style="margin-top:22px"><div class="field full"><div class="label-row"><label for="customDirection">Your own creative direction</label><span class="option-count">Optional</span></div><textarea id="customDirection" placeholder="Add details: hairstyle length, jewelry to retain, room details, exact outfit color, pose adjustments…"></textarea><p class="help">This text is added to the generated prompt as your custom instructions.</p></div><div class="field full"><div class="label-row"><label for="negative">Extra exclusions / negative prompt</label><span class="option-count">Optional</span></div><textarea id="negative" placeholder="e.g. no mirror, no blurry face, no extra fingers, no artificial hair…"></textarea><p class="help">Additional things the image model should avoid.</p></div><div class="field full"><label>Identity, realism and output safeguards</label><div class="checks" id="finishChecks">${visibleChecks.map(c=>`<label class="check"><input type="checkbox" data-check="${c.id}" ${checkState[c.id]?'checked':''}><span>${c.label}<small>${c.detail}</small></span></label>`).join('')}</div></div><div class="field"><div class="label-row"><label for="numImages">Output format</label></div><div class="select-wrap"><select id="numImages"><option value="single">One final image</option>${currentStudioMode === 'salon' ? '<option value="collage">One 2×2 collage · 4 haircut stages</option>' : '<option value="collage">One 2×2 collage · 4 poses</option>'}<option value="set">Four separate images</option><option value="triptych">Three-panel editorial triptych</option><option value="contact">Six-frame contact sheet</option></select></div></div><div class="field"><div class="label-row"><label for="detailLevel">Prompt detail</label></div><div class="select-wrap"><select id="detailLevel"><option value="full">Highly detailed</option><option value="balanced">Balanced detail</option><option value="compact">Compact prompt</option></select></div></div><div class="collage-director-wrap full" id="finishCollageDirectorWrap" style="${showCollageDirector?'':'display:none;'}"></div></div>`;
}

function bindFinish(){
el('customDirection').value=customDirection;
el('negative').value=extraNegative;
el('numImages').value=outputType;
el('detailLevel').value=detailLevel;
el('customDirection').addEventListener('input',e=>{customDirection=e.target.value;buildPrompt()});
el('negative').addEventListener('input',e=>{extraNegative=e.target.value;buildPrompt()});

const renderDirector = () => {
  const wrap = el('finishCollageDirectorWrap');
  if(!wrap) return;
  const isSalonCollage = (currentStudioMode === 'salon' && outputType === 'collage');
  wrap.style.display = isSalonCollage ? '' : 'none';
  wrap.innerHTML = '';
  if(isSalonCollage){
    wrap.appendChild(createCollageDirectorCard());
    syncCollageDirectorCardUI();
  }
};

renderDirector();

el('numImages').addEventListener('change',e=>{
  outputType=e.target.value;
  renderDirector();
  buildPrompt();
});
el('detailLevel').addEventListener('change',e=>{detailLevel=e.target.value;buildPrompt()});
el('finishChecks').querySelectorAll('input').forEach(i=>i.addEventListener('change',()=>{checkState[i.dataset.check]=i.checked;buildPrompt()}));
}

function goSection(id,shouldScroll=true){
const section=sections.find(s=>s.id===id) || sections[0];
activeSection=section.id;
tabs.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.section===activeSection));
el('stepEyebrow').textContent='Creative direction · '+String(sections.indexOf(section)+1).padStart(2,'0');
el('stepTitle').textContent=section.name;
el('stepDescription').textContent=section.desc;
el('stepIcon').textContent=section.icon;
el('stepCount').textContent=`Step ${sections.indexOf(section)+1} of ${sections.length}`;
el('prevStep').disabled=sections.indexOf(section)===0;
el('prevStep').style.opacity=el('prevStep').disabled?'.42':'1';
el('nextStep').textContent=sections.indexOf(section)===sections.length-1?(currentStudioMode==='salon'?'Back to venue ↺':'Back to look ↺'):'Next step →';
const advBar=document.querySelector('.advanced-bar');
if(advBar) advBar.style.display=activeSection==='finish'?'none':'flex';
renderFields();
if(shouldScroll)window.scrollTo({top:Math.max(0,el('stepCard').getBoundingClientRect().top+window.scrollY-12),behavior:'smooth'});
}

function applyPreset(id,presetObj){
const p=presetObj||presets.find(x=>x.id===id)||customPresets.find(x=>x.id===id);
if(!p)return;
if(currentStudioMode==='salon'){
  switchStudioMode('photoshoot');
}
activePreset=id;
document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('active',b.dataset.preset===id));
rollTheme(p);
goSection('look');
buildPrompt();
toast(`Applied “${p.title}”. Customize any option now.`);
}


function chooseRandom(){
recordHistory();
Object.entries(fields).forEach(([id,f])=>{
  if(COLLAGE_FIELD_IDS.has(id)) return;
  if(lockedFields.has(id)) return;
  if(id === 'salonStage'){
    const pool = (salonSeatingMode === 'grooming_men')
      ? f.opts.filter(o => o.label.includes('Female model (barber)'))
      : f.opts.filter(o => !o.label.includes('Female model (barber)'));
    values[id] = pool[Math.floor(Math.random()*pool.length)] || f.opts[0];
    return;
  }
  values[id]=f.opts[Math.floor(Math.random()*f.opts.length)];
});
if(currentStudioMode==='salon' && checkState.noMirror && !lockedFields.has('salonCamera')){
  const nonFaceHiddenCams = fields.salonCamera.opts.filter(o => !o.label.toLowerCase().includes('face hidden'));
  if(nonFaceHiddenCams.length && values.salonCamera.label.toLowerCase().includes('face hidden')) {
    values.salonCamera = nonFaceHiddenCams[Math.floor(Math.random()*nonFaceHiddenCams.length)];
  }
}
if(currentStudioMode==='salon' && outputType==='collage'){
  const presetKeys = Object.keys(COLLAGE_PRESETS);
  const randKey = presetKeys[Math.floor(Math.random()*presetKeys.length)];
  applyCollagePreset(randKey);
}
if(values.malePresence && fields.maleInteraction){
  const pres = values.malePresence.text;
  if(pres === 'solo'){
    values.maleInteraction = fields.maleInteraction.opts.find(opt => opt.text === 'none') || fields.maleInteraction.opts[0];
  } else {
    const match = fields.maleInteraction.opts.find(opt => opt.cat === pres && opt.text !== 'none');
    if(match) values.maleInteraction = match;
  }
}
if(!lockedFields.has('hairCategory') && values.hair){
  const hCat = getItemCategory('hair', values.hair);
  const match = fields.hairCategory.opts.find(c => c.text === hCat);
  if(match) values.hairCategory = match;
}
if(!lockedFields.has('salonVenueCategory') && values.salonVenue && fields.salonVenueCategory){
  const vCat = getItemCategory('salonVenue', values.salonVenue);
  const match = fields.salonVenueCategory.opts.find(c => c.text === vCat);
  if(match) values.salonVenueCategory = match;
}
if(values.framing && values.composition && fields.composition){
  const tightFramings = ['close-up beauty portrait', 'detail crop: hair + face', 'tight side-profile portrait'];
  const fLabel = (values.framing.label || '').toLowerCase();
  if(tightFramings.some(tf => fLabel.includes(tf))){
    const incompatible = ['hair silhouette visible', 'outfit silhouette emphasized', 'environmental storytelling'];
    if(incompatible.includes((values.composition.label || '').toLowerCase())){
      const valid = fields.composition.opts.filter(o => !incompatible.includes((o.label || '').toLowerCase()));
      if(valid.length) values.composition = valid[0];
    }
  }
}
if(!lockedFields.has('salonHairCategory') && values.salonHaircut && fields.salonHairCategory){
  const hCat = getItemCategory('hair', values.salonHaircut);
  const match = fields.salonHairCategory.opts.find(c => c.text === hCat);
  if(match) values.salonHairCategory = match;
}
if(preserveHairTexture && fields.hairTexture){
  const pOpt = fields.hairTexture.opts.find(o => o.label.includes('Preserve original')) || fields.hairTexture.opts[0];
  values.hairTexture = pOpt;
}
if(!lockedFields.has('outfitCategory') && values.outfit){
  const oCat = getItemCategory('outfit', values.outfit);
  const match = fields.outfitCategory.opts.find(c => c.text === oCat);
  if(match) values.outfitCategory = match;
}
if(!lockedFields.has('poseCategory') && values.pose){
  const pCat = getItemCategory('pose', values.pose);
  const match = fields.poseCategory.opts.find(c => c.text === pCat);
  if(match) values.poseCategory = match;
}
if(!lockedFields.has('shotCategory') && values.framing){
  const sCat = getItemCategory('framing', values.framing);
  const match = fields.shotCategory.opts.find(c => c.text === sCat);
  if(match) values.shotCategory = match;
}
if(!lockedFields.has('sceneCategory') && values.background){
  const bCat = getItemCategory('background', values.background);
  const match = fields.sceneCategory.opts.find(c => c.text === bCat);
  if(match) values.sceneCategory = match;
}
if(!lockedFields.has('lightingCategory') && values.lighting){
  const lCat = getItemCategory('lighting', values.lighting);
  const match = fields.lightingCategory.opts.find(c => c.text === lCat);
  if(match) values.lightingCategory = match;
}
activePreset='';
document.querySelectorAll('.preset').forEach(b=>b.classList.remove('active'));
goSection(activeSection,false);
buildPrompt();
toast(lockedFields.size>0?`Fresh combination generated (${lockedFields.size} locked).`:'A fresh combination is ready.');
}

function isPonySelected(){
  const h = (currentStudioMode === 'salon' && values.salonHaircut)
    ? values.salonHaircut.label.toLowerCase()
    : (values.hair ? values.hair.label.toLowerCase() : '');
  const isPonyInHair = h.includes('pony') || h.includes('ponytail');
  const hasPonyDetail = Boolean((values.ponyTailEnd && values.ponyTailEnd.text) || 
                                (values.ponyTailFall && values.ponyTailFall.text) || 
                                (values.ponyBaseHeight && values.ponyBaseHeight.text));
  return isPonyInHair || hasPonyDetail;
}

function isSideSweepSelected(){
  const h = (currentStudioMode === 'salon' && values.salonHaircut)
    ? values.salonHaircut.label.toLowerCase()
    : (values.hair ? values.hair.label.toLowerCase() : '');
  const isSweepInHair = h.includes('side-swept') || h.includes('swept to one side') || h.includes('side sweep') || h.includes('one shoulder') || h.includes('side waves') || h.includes('side-part layers') || h.includes('swept-back');
  const hasSweepDetail = Boolean((values.sideSweepSide && values.sideSweepSide.text) || 
                                 (values.sideSweepFlip && values.sideSweepFlip.text) || 
                                 (values.sideSweepEnd && values.sideSweepEnd.text) ||
                                 (values.sideSweepFinish && values.sideSweepFinish.text));
  return isSweepInHair || hasSweepDetail;
}

function getFullHairDescription(){
  const baseHair = val('hair');
  const hairLabel = (values.hair?.label || '').toLowerCase();
  const hairLower = baseHair.toLowerCase();
  const isPony = hairLabel.includes('pony') || hairLower.includes('pony') || (values.hairCategory && values.hairCategory.text === 'pony');
  const isSweep = hairLabel.includes('side-swept') || hairLabel.includes('swept to one side') || hairLower.includes('side-swept') || hairLower.includes('swept to one side');
  
  const details = [];
  
  if (isPony) {
    const fall = val('ponyTailFall');
    const end = val('ponyTailEnd');
    const height = val('ponyBaseHeight');
    const wrap = val('ponyBaseWrap');
    const tail = val('ponyTailStyle');
    const updo = val('ponyStyle');

    if(fall) details.push(`ponytail falls ${fall}`);
    if(end) details.push(`tail ${end}`);
    if(height) details.push(`anchored at ${height}`);
    if(wrap) details.push(`base ${wrap}`);
    if(tail) details.push(`tail texture: ${tail}`);
    if(updo) details.push(updo);
  }

  if (isSweep) {
    const sweepSide = val('sideSweepSide');
    const sweepFlip = val('sideSweepFlip');
    const sweepEnd = val('sideSweepEnd');
    const sweepFinish = val('sideSweepFinish');

    if(sweepSide) details.push(sweepSide);
    if(sweepFlip) details.push(sweepFlip);
    if(sweepEnd) details.push(sweepEnd);
    if(sweepFinish) details.push(sweepFinish);
  }

  const fringeLabel = values.fringe?.label || '';
  const partLabel = values.parting?.label || '';
  const fringeVal = val('fringe');
  const partVal = val('parting');
  const isDefaultFringe = !fringeVal || fringeLabel.startsWith('Auto') || fringeLabel === 'No fringe / open forehead';
  const isDefaultPart = !partVal || partLabel.startsWith('Auto') || partLabel === 'Natural part matching reference';

  let cleanedBaseHair = baseHair;

  // Wire formerly dropped micro-controls: hairLength, hairVolume, hairAccessories
  const lenVal = val('hairLength');
  const lenLabel = values.hairLength?.label || '';
  if(lenVal && !lenLabel.startsWith('Auto')){
    cleanedBaseHair = cleanedBaseHair.replace(/\b(?:ear-length|jawline-length|jaw-length|chin-length|neck-length|shoulder-length|collarbone-length|collarbone-grazing|mid-neck|lip-grazing|mid-back-length|waist-length)\b/gi, '').replace(/ {2,}/g, ' ').trim();
    details.push(`length: ${lenVal}`);
  }
  const volVal = val('hairVolume');
  const volLabel = values.hairVolume?.label || '';
  if(volVal && !volLabel.startsWith('Auto')){
    details.push(`volume: ${volVal}`);
  }
  const hairAccVal = val('hairAccessories');
  const hairAccLabel = values.hairAccessories?.label || '';
  if(hairAccVal && !hairAccLabel.startsWith('Auto')){
    details.push(`hair accessory: ${hairAccVal}`);
  }

  if (!isDefaultPart) {
    if (cleanedBaseHair.toLowerCase().includes('center part') && !partVal.toLowerCase().includes('center part')) {
      cleanedBaseHair = cleanedBaseHair.replace(/(?:with a |with )?(?:clean |subtle )?(?:deep )?center part/gi, `with ${partVal}`);
    } else if (cleanedBaseHair.toLowerCase().includes('side part') && !partVal.toLowerCase().includes('side part')) {
      cleanedBaseHair = cleanedBaseHair.replace(/(?:with a |with )?(?:clean |subtle )?(?:deep )?side part/gi, `with ${partVal}`);
    } else if (!cleanedBaseHair.toLowerCase().includes(partVal.toLowerCase())) {
      details.push(`parting: ${partVal}`);
    }
  }

  if (!isDefaultFringe) {
    if (cleanedBaseHair.toLowerCase().includes('curtain bangs') && !fringeVal.toLowerCase().includes('curtain')) {
      cleanedBaseHair = cleanedBaseHair.replace(/(?:with |featuring )?(?:soft |airy |wispy )?(?:arched )?bottleneck curtain bangs/gi, `featuring ${fringeVal}`);
      cleanedBaseHair = cleanedBaseHair.replace(/(?:with |featuring )?(?:soft |airy |wispy )?curtain bangs/gi, `featuring ${fringeVal}`);
    } else if (!cleanedBaseHair.toLowerCase().includes(fringeVal.toLowerCase())) {
      details.push(`fringe: ${fringeVal}`);
    }
  }

  if(details.length > 0){
    return `${cleanedBaseHair} (${details.join(', ')})`;
  }
  return cleanedBaseHair;
}


function getEffectiveHairstyle(){
  if(styleRef && transferToggles && transferToggles.hair){
    return 'authentic salon-styled mid-height ponytail with soft naturally rounded crown and gentle scalp volume, featuring soft arched bottleneck curtain bangs parted at the center hairline with brow-grazing wispy strands that curve naturally outward around the temples to the upper cheekbones with delicate piecey strand separation, side hair combed smoothly back and gently tucked behind the ears, anchored at the mid-occipital back of the head into a relaxed mid ponytail with a smooth natural straight-to-softly-tapered tail falling flush against the nape of the neck just above the shoulders, strictly preserving her original natural silky-fine Indian hair texture, strand density, and organic healthy sheen (solo finished look with zero hairdresser, stylist, or hands touching hair)';
  }
  return getFullHairDescription();
}

const PONY_FIELD_IDS = new Set(['ponyTailFall','ponyTailEnd','ponyBaseHeight','ponyBaseWrap','ponyTailStyle']);
const SWEEP_FIELD_IDS = new Set(['sideSweepSide','sideSweepFlip','sideSweepEnd','sideSweepFinish']);

function createHairTextureProtectionCard(){
  const card = document.createElement('div');
  card.className = 'hair-texture-protect-card';
  card.innerHTML = `
    <div class="texture-protect-left">
      <div class="texture-protect-title-row">
        <span class="texture-protect-badge">🔒 1-Click Universal Lock</span>
        <strong class="texture-protect-title">Preserve Original Hair Texture</strong>
      </div>
      <p class="texture-protect-desc">
        Strictly preserves the subject's authentic organic hair texture, natural strand thickness, density, and realistic strand behavior across <strong>every haircut</strong> (no artificial curls, synthetic straightener or texture drift).
      </p>
    </div>
    <div class="texture-protect-actions">
      <button type="button" class="texture-protect-toggle-btn ${preserveHairTexture ? 'active' : ''}" id="preserveTextureToggleBtn">
        <span class="lock-state-icon">${preserveHairTexture ? '🔒' : '🔓'}</span>
        <span>Original Texture: <b>${preserveHairTexture ? 'LOCKED (ON)' : 'CUSTOM (OFF)'}</b></span>
      </button>
    </div>
  `;

  card.querySelector('#preserveTextureToggleBtn').addEventListener('click', () => {
    preserveHairTexture = !preserveHairTexture;
    checkState.hairTexturePreserve = preserveHairTexture;
    if(preserveHairTexture){
      if(fields.hairTexture) values.hairTexture = fields.hairTexture.opts.find(o => o.label.includes('Preserve original')) || fields.hairTexture.opts[0];
      toast('🔒 Hair Texture Locked: Strictly preserving original hair texture in every haircut!');
    } else {
      toast('🔓 Hair Texture Unlocked: Custom hair textures enabled.');
    }
    renderFields();
    buildPrompt();
  });

  return card;
}


function syncCollageDirectorCardUI(cardEl){
  const card = cardEl || el('collageDirectorCard');
  if(!card) return;
  const presetSel = card.querySelector('#collagePresetSelect');
  const sel1 = card.querySelector('#selectCollageFrame1');
  const sel2 = card.querySelector('#selectCollageFrame2');
  const sel3 = card.querySelector('#selectCollageFrame3');
  const sel4 = card.querySelector('#selectCollageFrame4');
  const desc1 = card.querySelector('#descCollageFrame1');
  const desc2 = card.querySelector('#descCollageFrame2');
  const desc3 = card.querySelector('#descCollageFrame3');
  const desc4 = card.querySelector('#descCollageFrame4');

  if(presetSel && values.salonCollageFlow) presetSel.value = values.salonCollageFlow.text || 'journey';
  if(sel1 && values.salonCollageFrame1) {
    sel1.value = values.salonCollageFrame1.text;
    if(desc1) desc1.textContent = values.salonCollageFrame1.desc || values.salonCollageFrame1.label;
  }
  if(sel2 && values.salonCollageFrame2) {
    sel2.value = values.salonCollageFrame2.text;
    if(desc2) desc2.textContent = values.salonCollageFrame2.desc || values.salonCollageFrame2.label;
  }
  if(sel3 && values.salonCollageFrame3) {
    sel3.value = values.salonCollageFrame3.text;
    if(desc3) desc3.textContent = values.salonCollageFrame3.desc || values.salonCollageFrame3.label;
  }
  if(sel4 && values.salonCollageFrame4) {
    sel4.value = values.salonCollageFrame4.text;
    if(desc4) desc4.textContent = values.salonCollageFrame4.desc || values.salonCollageFrame4.label;
  }
  const hintsEl = card.querySelector('#collageDirectorHints');
  if(hintsEl){
    let hintsHtml = '';
    const isSolo = (values.salonStylist?.label || '').toLowerCase().includes('solo client');
    if(isSolo){
      hintsHtml += '<div class="collage-director-hint solo-hint">👤 <strong>Solo Client Mode:</strong> Preparatory & reveal panels adapt to feature the client alone; active cutting panels still depict the barber\'s hands and tools.</div>';
    }
    const hasWash = [values.salonCollageFrame1?.text, values.salonCollageFrame2?.text, values.salonCollageFrame3?.text, values.salonCollageFrame4?.text].some(s => 
      ['shampoo_basin', 'scalp_massage_rinse', 'towel_turban_dry', 'spray_misting'].includes(s)
    );
    if(salonHairMoisture === 'dry' && hasWash){
      hintsHtml += '<div class="collage-director-hint dry-hint">💡 <strong>Dry Hair Mode:</strong> Wash and misting preparatory panels describe pre-drying blowout prep, harmonizing with dry haircut physics.</div>';
    }
    hintsEl.innerHTML = hintsHtml;
  }
}

function applyCollagePreset(presetKey){
  const p = COLLAGE_PRESETS[presetKey];
  if(p){
    const f1 = salonCollageScenes.find(s => s.text === p[0]);
    const f2 = salonCollageScenes.find(s => s.text === p[1]);
    const f3 = salonCollageScenes.find(s => s.text === p[2]);
    const f4 = salonCollageScenes.find(s => s.text === p[3]);
    if(f1) values.salonCollageFrame1 = f1; else console.warn(`Scene ${p[0]} not found in salonCollageScenes`);
    if(f2) values.salonCollageFrame2 = f2; else console.warn(`Scene ${p[1]} not found in salonCollageScenes`);
    if(f3) values.salonCollageFrame3 = f3; else console.warn(`Scene ${p[2]} not found in salonCollageScenes`);
    if(f4) values.salonCollageFrame4 = f4; else console.warn(`Scene ${p[3]} not found in salonCollageScenes`);
    const flowOpt = salonCollageFlow.find(f => f.text === presetKey);
    if(flowOpt) values.salonCollageFlow = flowOpt;
    syncCollageDirectorCardUI();
    buildPrompt();
  } else {
    console.warn(`Preset ${presetKey} not found in COLLAGE_PRESETS`);
  }
}

function markCollageCustom(){
  const customOpt = salonCollageFlow.find(f => f.text === 'custom');
  if(customOpt) values.salonCollageFlow = customOpt;
  syncCollageDirectorCardUI();
  buildPrompt();
}

function createCollageDirectorCard(){
  const card = document.createElement('div');
  card.className = 'collage-director-card';
  card.id = 'collageDirectorCard';

  const cats = [];
  const catMap = {};
  salonCollageScenes.forEach(s => {
    const c = s.cat || 'Other';
    if(!catMap[c]){
      catMap[c] = [];
      cats.push(c);
    }
    catMap[c].push(s);
  });

  const buildOptionsHtml = (selectedVal) => {
    return cats.map(c => {
      const opts = catMap[c].map(item => {
        return `<option value="${escapeHtml(item.text)}" ${item.text === selectedVal ? 'selected' : ''}>${escapeHtml(item.label)}</option>`;
      }).join('');
      return `<optgroup label="${escapeHtml(c)}">${opts}</optgroup>`;
    }).join('');
  };

  const getSceneSnippet = (sceneId) => {
    const item = salonCollageScenes.find(s => s.text === sceneId);
    return item?.desc || item?.label || sceneId;
  };

  const curPreset = (values.salonCollageFlow && values.salonCollageFlow.text) ? values.salonCollageFlow.text : 'journey';
  const f1Val = (values.salonCollageFrame1 && values.salonCollageFrame1.text) ? values.salonCollageFrame1.text : 'consultation_chair';
  const f2Val = (values.salonCollageFrame2 && values.salonCollageFrame2.text) ? values.salonCollageFrame2.text : 'scissor_blunt_perimeter';
  const f3Val = (values.salonCollageFrame3 && values.salonCollageFrame3.text) ? values.salonCollageFrame3.text : 'side_profile_check';
  const f4Val = (values.salonCollageFrame4 && values.salonCollageFrame4.text) ? values.salonCollageFrame4.text : 'front_mirror_admire';

  card.innerHTML = `
    <div class="collage-director-header">
      <div class="collage-director-title-group">
        <span class="collage-director-badge">🎬 2×2 Storyboard Grid</span>
        <h4 class="collage-director-title">Direct Individual Scenes for All 4 Collage Panels</h4>
        <p class="collage-director-subtitle">Choose from 32 authentic salon moments or quick-load curated storyboards. Fully synced with your haircut, cape, and lighting.</p>
        <div id="collageDirectorHints" class="collage-director-hints"></div>
      </div>
      <div class="collage-director-actions">
        <button type="button" class="btn-director-sync" id="btnSyncStageToCollage" title="Set Panel 2 to match your chosen haircut stage">↺ Sync Panel 2 with Haircut Stage</button>
      </div>
    </div>
    <div class="collage-preset-bar">
      <label for="collagePresetSelect">Quick Storyboard Preset:</label>
      <div class="select-wrap">
        <select id="collagePresetSelect" class="director-preset-select" aria-label="Quick Storyboard Preset">
          <option value="journey" ${curPreset==='journey'?'selected':''}>Chronological Haircut Journey (Prep → Cut → Profile → Reveal)</option>
          <option value="multi_angle" ${curPreset==='multi_angle'?'selected':''}>Multi-Angle Moment Showcase (Wide → Macro Hands → Profile → POV)</option>
          <option value="makeover_arc" ${curPreset==='makeover_arc'?'selected':''}>Full Makeover Arc (Arrival → Misting → Crown Layers → Blowout)</option>
          <option value="tool_craft" ${curPreset==='tool_craft'?'selected':''}>Barber Craft & Tool Detailing (Parting → Scissor-over-Comb → Razor → Duster)</option>
          <option value="wash_and_cut" ${curPreset==='wash_and_cut'?'selected':''}>Wash, Cut & Blowout (Basin → Spray → Blunt Cut → Curved Ends)</option>
          <option value="dual_mirror" ${curPreset==='dual_mirror'?'selected':''}>Dual-Mirror Reveal & Aftercare (Face Framing → Duster → Rear Mirror → Admire)</option>
          <option value="precision_craft" ${curPreset==='precision_craft'?'selected':''}>Close-Up Precision Craft (Parting → Macro Fingers → Thinning → POV)</option>
          <option value="grooming_shave" ${curPreset==='grooming_shave'?'selected':''}>Barber Grooming & Body Shave (Consultation → Armpit Shave → Chest Shave → Reveal)</option>
          <option value="custom" ${curPreset==='custom'?'selected':''}>✦ Custom 4-Panel Selection (Individually Chosen Below)</option>
        </select>
      </div>
    </div>
    <div class="collage-quadrants-grid">
      <div class="quadrant-card q-top-left">
        <div class="quadrant-header">
          <span class="quadrant-pin">⬉ Panel 1</span>
          <span class="quadrant-pos">Top-Left</span>
        </div>
        <div class="select-wrap">
          <select id="selectCollageFrame1" class="quadrant-select" aria-label="Panel 1 Scene (Top-Left)">
            ${buildOptionsHtml(f1Val)}
          </select>
        </div>
        <div class="quadrant-desc" id="descCollageFrame1">${escapeHtml(getSceneSnippet(f1Val))}</div>
      </div>
      <div class="quadrant-card q-top-right">
        <div class="quadrant-header">
          <span class="quadrant-pin">⬈ Panel 2</span>
          <span class="quadrant-pos">Top-Right</span>
        </div>
        <div class="select-wrap">
          <select id="selectCollageFrame2" class="quadrant-select" aria-label="Panel 2 Scene (Top-Right)">
            ${buildOptionsHtml(f2Val)}
          </select>
        </div>
        <div class="quadrant-desc" id="descCollageFrame2">${escapeHtml(getSceneSnippet(f2Val))}</div>
      </div>
      <div class="quadrant-card q-bottom-left">
        <div class="quadrant-header">
          <span class="quadrant-pin">⬋ Panel 3</span>
          <span class="quadrant-pos">Bottom-Left</span>
        </div>
        <div class="select-wrap">
          <select id="selectCollageFrame3" class="quadrant-select" aria-label="Panel 3 Scene (Bottom-Left)">
            ${buildOptionsHtml(f3Val)}
          </select>
        </div>
        <div class="quadrant-desc" id="descCollageFrame3">${escapeHtml(getSceneSnippet(f3Val))}</div>
      </div>
      <div class="quadrant-card q-bottom-right">
        <div class="quadrant-header">
          <span class="quadrant-pin">⬊ Panel 4</span>
          <span class="quadrant-pos">Bottom-Right</span>
        </div>
        <div class="select-wrap">
          <select id="selectCollageFrame4" class="quadrant-select" aria-label="Panel 4 Scene (Bottom-Right)">
            ${buildOptionsHtml(f4Val)}
          </select>
        </div>
        <div class="quadrant-desc" id="descCollageFrame4">${escapeHtml(getSceneSnippet(f4Val))}</div>
      </div>
    </div>
  `;

  const presetSel = card.querySelector('#collagePresetSelect');
  const sel1 = card.querySelector('#selectCollageFrame1');
  const sel2 = card.querySelector('#selectCollageFrame2');
  const sel3 = card.querySelector('#selectCollageFrame3');
  const sel4 = card.querySelector('#selectCollageFrame4');
  const desc1 = card.querySelector('#descCollageFrame1');
  const desc2 = card.querySelector('#descCollageFrame2');
  const desc3 = card.querySelector('#descCollageFrame3');
  const desc4 = card.querySelector('#descCollageFrame4');

  presetSel.addEventListener('change', (e) => {
    const val = e.target.value;
    if(val !== 'custom'){
      applyCollagePreset(val);
    } else {
      markCollageCustom();
    }
  });

  const onQuadrantChange = (selEl, descEl, fieldKey) => {
    const chosen = salonCollageScenes.find(s => s.text === selEl.value);
    if(!chosen) return;
    values[fieldKey] = chosen;
    descEl.textContent = chosen.desc || chosen.label;
    markCollageCustom();
  };

  sel1.addEventListener('change', () => onQuadrantChange(sel1, desc1, 'salonCollageFrame1'));
  sel2.addEventListener('change', () => onQuadrantChange(sel2, desc2, 'salonCollageFrame2'));
  sel3.addEventListener('change', () => onQuadrantChange(sel3, desc3, 'salonCollageFrame3'));
  sel4.addEventListener('change', () => onQuadrantChange(sel4, desc4, 'salonCollageFrame4'));

  const syncBtn = card.querySelector('#btnSyncStageToCollage');
  syncBtn.addEventListener('click', () => {
    const stageLbl = values.salonStage?.label || '';
    const stageTxt = values.salonStage?.text || '';
    const matchedSceneId = getStageMatchingSceneId(stageLbl, stageTxt);
    sel2.value = matchedSceneId;
    const chosen = salonCollageScenes.find(s => s.text === matchedSceneId) || salonCollageScenes[0];
    values.salonCollageFrame2 = chosen;
    desc2.textContent = chosen.desc || chosen.label;
    markCollageCustom();
    toast(`Panel 2 synced with: ${chosen.label}`);
  });

  syncCollageDirectorCardUI(card);
  return card;
}

function getActiveHairMoisture(){
  return (currentStudioMode === 'salon') ? salonHairMoisture : photoHairMoisture;
}

function setActiveHairMoisture(val){
  if(currentStudioMode === 'salon') salonHairMoisture = val;
  else photoHairMoisture = val;
}

function createMoisturePillsCard(){
  const card = document.createElement('div');
  card.className = 'moisture-toggle-card';
  card.id = 'moistureToggleCard';

  const curMoisture = getActiveHairMoisture();
  const isSalon = (currentStudioMode === 'salon');
  const head = document.createElement('div');
  head.className = 'moisture-header';
  head.innerHTML = `
    <span class="moisture-label">💧 Hair Moisture State</span>
    <span class="moisture-hint">${isSalon ? 'Direct spray-bottle misting, strand clumping & blowout physics' : 'Dry airy blowout vs freshly misted dampness vs soaked wet-look ribbons'}</span>
  `;

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'moisture-pills';
  pillsWrap.setAttribute('role', 'radiogroup');
  pillsWrap.setAttribute('aria-label', 'Hair moisture state');

  const options = [
    { id: 'dry', label: '💨 Dry & Blown-out', desc: 'bone-dry blowout with natural bounce and airy volume' },
    { id: 'damp', label: '💦 Damp / Spray-Misted', desc: 'spray-bottle water mist with glistening droplets and clumped cutting tension' },
    { id: 'wet', label: '🌊 Soaked / Wet-Look', desc: 'deeply saturated wet look slicked to scalp with heavy drape' }
  ];

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'moisture-pill' + (curMoisture === opt.id ? ' active' : '');
    btn.dataset.moisture = opt.id;
    btn.textContent = opt.label;
    btn.title = opt.desc;
    btn.setAttribute('aria-checked', curMoisture === opt.id ? 'true' : 'false');

    btn.addEventListener('click', () => {
      setActiveHairMoisture(opt.id);
      pillsWrap.querySelectorAll('.moisture-pill').forEach(b => {
        const isAct = b.dataset.moisture === opt.id;
        b.classList.toggle('active', isAct);
        b.setAttribute('aria-checked', isAct ? 'true' : 'false');
      });
      buildPrompt();
      toast(`💧 Hair moisture set to: ${opt.label}`);
    });

    pillsWrap.appendChild(btn);
  });

  card.append(head, pillsWrap);
  return card;
}

function createPonytailCard(){
  const card = document.createElement('div');
  card.className = 'ponytail-callout-card';
  card.id = 'ponytailCalloutCard';
  
  if(!isPonySelected()) card.style.display = 'none';

  const head = document.createElement('div');
  head.className = 'ponytail-callout-head';
  head.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="pony-badge">✨ Ponytail Architecture</span>
      <p class="pony-subtext">Direct whether tail falls on front or back, where it ends & base styling</p>
    </div>
  `;

  const quickBox = document.createElement('div');
  quickBox.className = 'pony-quick-section';


  // Front curtain bangs row
  const frontRow = document.createElement('div');
  frontRow.className = 'pony-quick-row';
  frontRow.innerHTML = `<span class="pony-quick-label">✦ Front Framing: Curtain Bangs & Parting</span>`;
  const frontChips = document.createElement('div');
  frontChips.className = 'pony-chips';

  const frontMap = [
    { label: '💇‍♀️ Bottleneck Bangs', fringeMatch: 'Arched bottleneck curtain bangs grazing brows & cheekbones', partMatch: 'Clean center part with bottleneck curtain opening' },
    { label: '✨ Wispy Curtain Fringe', fringeMatch: 'Wispy curtain fringe', partMatch: 'Soft center part' },
    { label: '💫 Long Cheekbone Fringe', fringeMatch: 'Long cheekbone fringe', partMatch: 'Center part with curtain opening' },
    { label: '⚡ Clean Forehead (No Fringe)', fringeMatch: 'No fringe / open forehead', partMatch: 'Slicked-back no visible part' }
  ];

  frontMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    const isAct = values.fringe?.label === item.fringeMatch;
    chip.className = 'pony-chip' + (isAct ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const fOpt = fields.fringe.opts.find(o => o.label === item.fringeMatch) || fields.fringe.opts[0];
      const pOpt = fields.parting.opts.find(o => o.label === item.partMatch) || fields.parting.opts[0];
      values.fringe = (values.fringe === fOpt) ? fields.fringe.opts[0] : fOpt;
      values.parting = (values.parting === pOpt) ? fields.parting.opts[0] : pOpt;
      renderFields();
      buildPrompt();
    });
    frontChips.appendChild(chip);
  });
  frontRow.appendChild(frontChips);

  // Fall chips row
  const fallRow = document.createElement('div');
  fallRow.className = 'pony-quick-row';
  fallRow.innerHTML = `<span class="pony-quick-label">⚡ Quick Placement: Fall on Front vs Back</span>`;
  const fallChips = document.createElement('div');
  fallChips.className = 'pony-chips';

  const fallMap = [
    { label: '⤹ Falling Down Back', match: 'Falling straight down the back' },
    { label: '↷ Front (Left Shoulder)', match: 'Draped forward over left shoulder (front)' },
    { label: '↶ Front (Right Shoulder)', match: 'Draped forward over right shoulder (front)' },
    { label: '⤸ Front (Both Shoulders)', match: 'Split over both shoulders to the front' },
    { label: '💨 Floating in Motion', match: 'Floating in motion behind her' }
  ];

  fallMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pony-chip' + (values.ponyTailFall?.label === item.match ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const opt = fields.ponyTailFall.opts.find(o => o.label === item.match) || fields.ponyTailFall.opts[0];
      values.ponyTailFall = (values.ponyTailFall === opt) ? fields.ponyTailFall.opts[0] : opt;
      renderFields();
      buildPrompt();
    });
    fallChips.appendChild(chip);
  });
  fallRow.appendChild(fallChips);

  // Length chips row
  const endRow = document.createElement('div');
  endRow.className = 'pony-quick-row';
  endRow.innerHTML = `<span class="pony-quick-label">⚡ Quick Length: Where The Ponytail Ends</span>`;
  const endChips = document.createElement('div');
  endChips.className = 'pony-chips';

  const endMap = [
    { label: 'Neck (Short & Sleek)', match: 'Ending around the neck (short & sleek)' },
    { label: 'Nape (Above Shoulders)', match: 'Ending at nape of neck just above shoulders' },
    { label: 'Nape (Ultra-cropped)', match: 'Ending at upper nape (ultra-cropped)' },
    { label: 'Collarbone', match: 'Ending at collarbone' },
    { label: 'Mid-Back', match: 'Ending at shoulder blades / mid-back' },
    { label: 'Waist (Dramatic Long)', match: 'Ending at waist / lower back (dramatic)' }
  ];

  endMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'pony-chip' + (values.ponyTailEnd?.label === item.match ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const opt = fields.ponyTailEnd.opts.find(o => o.label === item.match) || fields.ponyTailEnd.opts[0];
      values.ponyTailEnd = (values.ponyTailEnd === opt) ? fields.ponyTailEnd.opts[0] : opt;
      renderFields();
      buildPrompt();
    });
    endChips.appendChild(chip);
  });
  endRow.appendChild(endChips);

  quickBox.append(frontRow, fallRow, endRow);

  const subgrid = document.createElement('div');
  subgrid.className = 'ponytail-subgrid';

  ['ponyTailFall', 'ponyTailEnd', 'ponyBaseHeight', 'ponyBaseWrap', 'ponyTailStyle'].forEach(fId => {
    if (fields[fId]) {
      subgrid.appendChild(createFieldElement(fId, fields[fId]));
    }
  });

  card.append(head, quickBox, subgrid);
  return card;
}

function createSideSweepCard(){
  const card = document.createElement('div');
  card.className = 'side-swept-callout-card';
  card.id = 'sideSweptCalloutCard';
  
  if(!isSideSweepSelected()) card.style.display = 'none';

  const head = document.createElement('div');
  head.className = 'ponytail-callout-head';
  head.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="sweep-badge">✦ Side-Swept Architecture</span>
      <p class="pony-subtext">Direct shoulder drape direction (left vs right), root flip, length & wet/dry finish</p>
    </div>
  `;

  const quickBox = document.createElement('div');
  quickBox.className = 'pony-quick-section';

  // 1. Shoulder placement row
  const sideRow = document.createElement('div');
  sideRow.className = 'pony-quick-row';
  sideRow.innerHTML = `<span class="pony-quick-label">✦ Shoulder Placement (Left vs Right)</span>`;
  const sideChips = document.createElement('div');
  sideChips.className = 'pony-chips';

  const sideMap = [
    { label: '👈 Left Shoulder', match: 'Swept completely over left shoulder' },
    { label: '👉 Right Shoulder', match: 'Swept completely over right shoulder' },
    { label: '💨 Tossed in Motion (Left)', match: 'Tossed forward over left shoulder in motion' },
    { label: '💨 Tossed in Motion (Right)', match: 'Tossed forward over right shoulder in motion' }
  ];

  sideMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sweep-chip' + (values.sideSweepSide?.label === item.match ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const opt = fields.sideSweepSide.opts.find(o => o.label === item.match) || fields.sideSweepSide.opts[0];
      values.sideSweepSide = (values.sideSweepSide === opt) ? fields.sideSweepSide.opts[0] : opt;
      renderFields();
      buildPrompt();
    });
    sideChips.appendChild(chip);
  });
  sideRow.appendChild(sideChips);

  // 2. Hair flip row
  const flipRow = document.createElement('div');
  flipRow.className = 'pony-quick-row';
  flipRow.innerHTML = `<span class="pony-quick-label">✦ Hair Flip & Crown Lift</span>`;
  const flipChips = document.createElement('div');
  flipChips.className = 'pony-chips';

  const flipMap = [
    { label: '✨ Dramatic Root Flip', match: 'Dramatic voluminous hair flip at roots' },
    { label: '💨 Soft Natural Flip', match: 'Soft natural hair flip with airy volume' },
    { label: '⚡ Sleek (No Flip)', match: 'Smooth sleek transition (no flip, flat-ironed)' },
    { label: '🌪️ Tousled Texture Flip', match: 'Tousled textured flip with loose flyaways' }
  ];

  flipMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sweep-chip' + (values.sideSweepFlip?.label === item.match ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const opt = fields.sideSweepFlip.opts.find(o => o.label === item.match) || fields.sideSweepFlip.opts[0];
      values.sideSweepFlip = (values.sideSweepFlip === opt) ? fields.sideSweepFlip.opts[0] : opt;
      renderFields();
      buildPrompt();
    });
    flipChips.appendChild(chip);
  });
  flipRow.appendChild(flipChips);

  // 3. Length termination row
  const endRow = document.createElement('div');
  endRow.className = 'pony-quick-row';
  endRow.innerHTML = `<span class="pony-quick-label">✦ Where Side-Swept Hair Ends</span>`;
  const endChips = document.createElement('div');
  endChips.className = 'pony-chips';

  const endMap = [
    { label: 'Collarbone / Upper Chest', match: 'Ending at collarbone / upper chest' },
    { label: 'Mid-Chest Cascade', match: 'Ending at mid-chest / breast level' },
    { label: 'Ribs / Waist (Dramatic)', match: 'Ending at ribs / waist level (dramatic long)' },
    { label: 'Shoulder Tops (Lob)', match: 'Grazing shoulder tops (medium lob length)' }
  ];

  endMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sweep-chip' + (values.sideSweepEnd?.label === item.match ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const opt = fields.sideSweepEnd.opts.find(o => o.label === item.match) || fields.sideSweepEnd.opts[0];
      values.sideSweepEnd = (values.sideSweepEnd === opt) ? fields.sideSweepEnd.opts[0] : opt;
      renderFields();
      buildPrompt();
    });
    endChips.appendChild(chip);
  });
  endRow.appendChild(endChips);

  // 4. Finish (Wet or Dry) row
  const finRow = document.createElement('div');
  finRow.className = 'pony-quick-row';
  finRow.innerHTML = `<span class="pony-quick-label">✦ Finish: Wet vs Dry</span>`;
  const finChips = document.createElement('div');
  finChips.className = 'pony-chips';

  const finMap = [
    { label: '🌬️ Dry & Airy Bounce', match: 'Dry, soft & touchable with airy volume' },
    { label: '💧 High-Gloss Wet Clumps', match: 'High-gloss wet-look saturated clumps' },
    { label: '🌊 Damp Beachy Waves', match: 'Damp post-swim salty beach texture' },
    { label: '✨ Mirror Glass Shine', match: 'Glossy glass-shine editorial finish' }
  ];

  finMap.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sweep-chip' + (values.sideSweepFinish?.label === item.match ? ' active' : '');
    chip.textContent = item.label;
    chip.addEventListener('click', () => {
      const opt = fields.sideSweepFinish.opts.find(o => o.label === item.match) || fields.sideSweepFinish.opts[0];
      values.sideSweepFinish = (values.sideSweepFinish === opt) ? fields.sideSweepFinish.opts[0] : opt;
      renderFields();
      buildPrompt();
    });
    finChips.appendChild(chip);
  });
  finRow.appendChild(finChips);

  quickBox.append(sideRow, flipRow, endRow, finRow);

  const subgrid = document.createElement('div');
  subgrid.className = 'ponytail-subgrid';

  ['sideSweepSide', 'sideSweepFlip', 'sideSweepEnd', 'sideSweepFinish'].forEach(fId => {
    if (fields[fId]) {
      subgrid.appendChild(createFieldElement(fId, fields[fId]));
    }
  });

  card.append(head, quickBox, subgrid);
  return card;
}

function val(id){return values[id]?.text||''}

function sanitizeCapeText(capeText, isFemaleModelBarber){
  if(!capeText) return 'a silky black nylon salon cutting cape fastened cleanly at the collar';
  const hasHardcodedGarment = /kurti|cropped tank|crop top|baby tee|denim shorts|denim cutoffs|denim waistband|bandeau|halter/i.test(capeText);
  if(isFemaleModelBarber){
    if(hasHardcodedGarment || /client's|her\b/i.test(capeText)){
      if(/pinstriped|striped/i.test(capeText)) return 'a retro pinstriped barber cape draped neatly across the seated male client\'s shoulders and lap';
      if(/navy/i.test(capeText)) return 'a lightweight dark navy salon cape fastened snugly around the seated male client\'s neck';
      if(/white/i.test(capeText)) return 'a crisp white nylon salon cutting cape draped cleanly over the seated male client\'s shoulders';
      if(/terracotta/i.test(capeText)) return 'a warm terracotta cotton barber drape fastened cleanly over the seated male client\'s collar';
      if(/dusty rose/i.test(capeText)) return 'a soft cotton barber cutting drape fastened cleanly around the seated male client\'s shoulders';
      return 'a silky black nylon salon cutting cape fastened snugly around the seated male client\'s collar over a crisp white sanitary strip';
    }
    return capeText;
  }
  if(hasHardcodedGarment && wardrobeMode !== 'separates'){
    const capeBase = capeText
      .replace(/^(?:.*?,\s*)?(?:draped loosely over|revealing|peeking out beneath|showing|over a|over the|leaving a|over cropped|over graphic|over asymmetric|over black).*$/i, '')
      .replace(/peeking open over[\s\S]*/i, 'loosely parted down the front')
      .replace(/(?:draped loosely|loosely fastened|partially unfastened|partially unsnapped|parted slightly|loosely draped|falling back)[\s\S]*/i, m => m.split(/\b(?:over|revealing|showing|leaving)\b/i)[0].trim())
      .replace(/,\s*$/, '')
      .trim();
    return `${capeBase || 'a silky black nylon cutting cape'}, loosely draped to reveal subtle hints of her chosen under-cape wardrobe`;
  }
  return capeText;
}

function sanitizeSoloClientCamera(camText){
  if(!camText) return camText;
  return camText
    .replace(/while the male barber leans[^,.]+/gi, 'with zero barbers in the frame')
    .replace(/while the barber leans[^,.]+/gi, 'with zero barbers in the frame')
    .replace(/the male barber's skilled hands,?\s*/gi, '')
    .replace(/the male barber's hands,?\s*/gi, '')
    .replace(/the barber's[^,.]*(?:hands|fingers|knuckles|profile|focused face|gloved)[^,.]*/gi, 'delicate salon tools resting on the tray beside the chair')
    .replace(/with blurred male barber shoulder in the foreground framing the composition/gi, 'framed softly in the foreground by the styling station counter')
    .replace(/looking past the male barber (?:toward|framing) /gi, 'framing ')
    .replace(/showing the male barber proudly presenting /gi, 'framing ')
    .replace(/and the male barber standing beside inspecting balance/gi, 'with empty styling space beside the chair')
    .replace(/capturing the barber presenting /gi, 'capturing ')
    .replace(/\bmale barber\b/gi, 'styling station')
    .replace(/ {2,}/g, ' ').replace(/,\s*,/g, ',').trim();
}

function buildLookbookSeries(checks = [], negatives = [], extraLines = [], opts = {}){
  const isFaceHidden = !!opts.isFaceHidden;
  const isFullVeil = !!opts.isFullVeil;
  const veilTier = opts.veilTier || (isFullVeil ? '95_100' : 'auto');
  const isDeepOrFullVeil = isFullVeil || ['65_70', '80_85', '95_100'].includes(veilTier);
  const isFemaleGroomingMen = !!opts.isFemaleGroomingMen;
  const hideEyes = isFaceHidden || isDeepOrFullVeil;
  const S = t => (checkState.noMirror && typeof sanitizeMirrorProse === 'function') ? sanitizeMirrorProse(t) : t;

  const hairDesc = sanitizeHairForVeil(S(getEffectiveHairstyle()), veilTier);
  const faceCovVal = val('hairFaceCoverage') || '';
  const hairCol = val('hairColor');
  const hairFin = val('hairFinish');
  const moistClause = (photoHairMoisture === 'wet')
    ? ' Hair moisture: thoroughly water-soaked drenched wet ribbons with glistening aquatic sheen.'
    : (photoHairMoisture === 'damp'
      ? ' Hair moisture: evenly spray-misted damp hair with cool hydrated luster.'
      : ' Hair moisture: completely dry, airy blowout with natural bounce.');
  const makeupDesc = sanitizeMakeupForVeil(val('makeup'), veilTier);
  const outfitDesc = opts.outfitDesc || ((wardrobeMode === 'separates')
    ? `a modern two-piece separates ensemble featuring ${val('topPiece')} paired with ${val('bottomPiece')}, with ${val('midriffStyling')}`
    : val('outfit'));
  const outfitFitDesc = val('outfitFit');
  const accDesc = val('accessories');
  const poseDesc = sanitizeHiddenFaceText(S(val('pose')), hideEyes, veilTier);
  const exprDesc = sanitizeHiddenFaceText(S(val('expression')), hideEyes, veilTier);
  const gestDesc = val('gesture');
  const bgDesc = S(val('background'))
    .replace(/tri-fold mirrors/gi, checkState.noMirror ? 'architectural folding screens' : 'tri-fold mirrors')
    .replace(/wall mirrors/gi, checkState.noMirror ? 'wall paneling' : 'wall mirrors');
  const lightDesc = val('lighting');
  const gradeDesc = val('grade');
  const qualDesc = val('quality');
  const aspDesc = val('aspect');

  const hasMalePresence = values.malePresence && values.malePresence.text !== 'solo' && values.maleInteraction && values.maleInteraction.text !== 'none';
  const maleInterDesc = hasMalePresence ? S(val('maleInteraction')) : '';

  let palNote = '';
  if(harmonizePalette && extractedPalette.length > 0){
    palNote = `\nColor harmony: Subtly harmonize environmental lighting, backdrop tones, and wardrobe accents to complement the reference photo's extracted palette (${extractedPalette.join(', ')}).`;
  }
  let custNote = customDirection.trim() ? `\nAdditional direction: ${customDirection.trim()}` : '';
  const eyeFocusText = hideEyes ? 'Framing the thick opaque hair curtain veiling her upper face and eyes cleanly.' : 'Eye-level camera angle framing her expression.';
  const facePortraitFocusText = hideEyes ? 'head/face orientation and heavy opaque draped hair veil' : 'face and haircut';
  const hairArch = detectHairArchitecture(values.hair, hairDesc);
  const veilRuleObj = getVeilRule(veilTier, hairArch);
  const veilLine = faceCovVal
    ? ` Face-behind-hair veil: ${faceCovVal}.${veilRuleObj && !['auto','0','10_15'].includes(veilTier) ? ' ' + veilRuleObj.strict : ''}`
    : '';
  const intentContext = isFemaleGroomingMen
    ? 'capturing the same adult woman as the active barber/groomer performing relaxing grooming services for her seated male partner'
    : 'immediately post-makeover';

  const dedupedNegs = dedupeNegatives(negatives);
  const negsText = (Array.isArray(dedupedNegs) && dedupedNegs.length) ? dedupedNegs.map(x=>'• '+x).join('\n') : '';

  const shot1 = [
    'REFERENCE-IMAGE EDIT — SHOT 1: BEAUTY CLOSE-UP PORTRAIT',
    '',
    'CREATIVE INTENT',
    `Extreme close-up beauty portrait of the same adult woman ${intentContext}. Razor-sharp photographic focus on the ${facePortraitFocusText}.${hasMalePresence ? ' The female model is strictly the only woman in the frame (solitary female model rule).' : ''}`,
    '',
    'HAIR & BEAUTY FOCUS',
    `Hairstyle: ${hairDesc}.${veilLine}${moistClause} Hair color: ${hairCol}. Finish: ${hairFin}. Makeup: ${makeupDesc}. Ensure fine individual hair strand separation, natural flyaways, authentic scalp parting, and delicate volume.`,
    '',
    'FRAMING & LIGHTING',
    `Framing: Intimate macro headshot crop. ${eyeFocusText} Lighting: ${lightDesc}. Color grade: ${gradeDesc}.${palNote}`,
    '',
    'IDENTITY & REALISM SAFEGUARDS',
    (Array.isArray(checks) && checks.length) ? checks.map(x=>'• '+x).join('\n') : '• Maintain exact facial identity, realistic skin pores and believable facial anatomy.',
    custNote,
    '',
    'AVOID / NEGATIVE GUIDANCE',
    negsText
  ].filter(Boolean).join('\n');

  const shot2 = [
    'REFERENCE-IMAGE EDIT — SHOT 2: 3/4 MEDIUM FASHION POSE',
    '',
    'CREATIVE INTENT',
    `Three-quarter torso editorial portrait of the same adult woman (${intentContext}). Captures spontaneous posture and wardrobe tailoring.${hasMalePresence ? ' The shoot incorporates authentic interaction with her male colleague / partner.' : ''}`,
    '',
    'WARDROBE & STYLING',
    `Outfit: ${outfitDesc}. Garment fit: ${outfitFitDesc}. Accessories: ${accDesc}. Natural fabric drape, realistic seam lines and believable garment construction.`,
    '',
    'POSE, EXPRESSION & HAIR',
    hasMalePresence
      ? `Interaction-driven posture: ${maleInterDesc}. Expression: ${exprDesc}. Hair: ${hairDesc}${veilLine} (${hairCol}), styled cleanly in its natural silhouette.`
      : `Pose: ${poseDesc}. Expression: ${exprDesc}. Hand detail: ${gestDesc}. Hair: ${hairDesc}${veilLine} (${hairCol}), styled cleanly in its natural silhouette.`,
    '',
    'SETTING & LIGHTING',
    `Location: ${bgDesc}. Lighting: ${lightDesc}. Color grade: ${gradeDesc}. Camera framing: Medium 3/4 portrait crop.${palNote}`,
    '',
    'SERIES CONTINUITY & REALISM',
    '• Maintain strict identity and wardrobe continuity with Shot 1.\n' + ((Array.isArray(checks) && checks.length) ? checks.map(x=>'• '+x).join('\n') : ''),
    custNote,
    '',
    'AVOID / NEGATIVE GUIDANCE',
    negsText
  ].filter(Boolean).join('\n');

  const shot3 = [
    'REFERENCE-IMAGE EDIT — SHOT 3: FULL-LENGTH ENVIRONMENTAL SILHOUETTE',
    '',
    'CREATIVE INTENT',
    `Full-length head-to-toe editorial action photograph of the same adult woman in ${bgDesc}.${hasMalePresence ? ` Interaction: ${maleInterDesc}.` : ''}`,
    '',
    'FULL SILHOUETTE & WARDROBE',
    `Complete head-to-toe styling of ${outfitDesc}. Believable movement, footwear and authentic garment silhouette against the environment.`,
    '',
    'HAIR & POSE IN MOTION',
    hasMalePresence
      ? `Hairstyle: ${hairDesc}${veilLine} caught in natural motion. Dynamic interaction & posture: ${maleInterDesc}. Expression: ${exprDesc}.`
      : `Hairstyle: ${hairDesc}${veilLine} caught in natural motion. Pose: ${poseDesc} with confident posture and open body language. Expression: ${exprDesc}.`,
    '',
    'PERSPECTIVE & CAMERA',
    `Wide environmental composition showing authentic scale and architectural depth. Lighting: ${lightDesc}. Color grade: ${gradeDesc}. Aspect ratio: ${aspDesc}.${palNote}`,
    '',
    'SERIES CONTINUITY & REALISM',
    '• Unbroken continuity: same woman, exact haircut, outfit and palette as Shots 1 and 2.\n' + ((Array.isArray(checks) && checks.length) ? checks.map(x=>'• '+x).join('\n') : ''),
    custNote,
    '',
    'AVOID / NEGATIVE GUIDANCE',
    negsText
  ].filter(Boolean).join('\n');

  const shot4 = [
    'REFERENCE-IMAGE EDIT — SHOT 4: CINEMATIC DETAIL MACRO',
    '',
    'CREATIVE INTENT',
    `Artistic editorial detail macro shot highlighting craftsmanship, accessories and rich photographic textures.${hasMalePresence ? ' Solitary female model rule: zero secondary women.' : ''}`,
    '',
    'TEXTURE & ACCENT FOCUS',
    `Close focal crop on signature accessories (${accDesc}), tactile texture of ${outfitDesc}, silhouette details of ${hairDesc}${veilLine}, and the delicate play of light.`,
    '',
    'LIGHTING & DEPTH OF FIELD',
    `Atmospheric shallow depth of field, creamy background blur and cinematic highlight roll-off. Lighting: ${lightDesc}. Color grade: ${gradeDesc}.${palNote}`,
    '',
    'SERIES HARMONY & REALISM',
    '• Consistent materials, color grade and lighting from the complete 4-shot series.',
    (Array.isArray(checks) && checks.length) ? checks.map(x=>'• '+x).join('\n') : '',
    custNote,
    '',
    'AVOID / NEGATIVE GUIDANCE',
    negsText
  ].filter(Boolean).join('\n');

  const allShots = [
    'REFERENCE-IMAGE EDIT — 4-SHOT EDITORIAL LOOKBOOK SERIES',
    '',
    'SERIES CONCEPT & CONTINUITY',
    `Capture the same adult woman across a coordinated 4-shot high-fashion editorial story (${intentContext}).${hasMalePresence ? ' The shoot features dynamic interactions with her male colleague / partner while strictly maintaining her as the sole woman in the frame.' : ''}`,
    `STRICT CONTINUITY: Identical identity from reference, exact same haircut (${hairDesc})${veilLine}, matching hair color (${hairCol}), consistent wardrobe (${outfitDesc}), and unified color grade (${gradeDesc}) across all four frames.${hasMalePresence ? ' Solitary female model rule: strictly zero secondary women in any frame; all interacting co-stars or crew members are male.' : ''}${palNote}`,
    '',
    '=== SHOT 1: BEAUTY CLOSE-UP PORTRAIT ===',
    `Tight macro headshot. Razor-sharp focus on the hairstyle (${hairDesc})${veilLine}, natural skin texture, and ${hideEyes ? 'cascading front hair drape framing her veiled profile' : 'expressive eye contact with authentic skin pores'}. Finish: ${hairFin}. Makeup: ${makeupDesc}.`,
    '',
    '=== SHOT 2: 3/4 MEDIUM FASHION POSE ===',
    hasMalePresence
      ? `Medium torso crop. Garment: ${outfitDesc} (${outfitFitDesc}). Interaction & posture: ${maleInterDesc}. Expression: ${exprDesc}. Captures spontaneous connection and tailoring.`
      : `Medium torso crop. Garment: ${outfitDesc} (${outfitFitDesc}). Pose: ${poseDesc}. Expression: ${exprDesc}. Hand detail: ${gestDesc}. Captures spontaneous movement and tailoring.`,
    '',
    '=== SHOT 3: FULL-LENGTH ENVIRONMENTAL SILHOUETTE ===',
    hasMalePresence
      ? `Head-to-toe wide composition in ${bgDesc}. Full outfit silhouette, footwear, architectural depth, and dynamic interaction: ${maleInterDesc}.`
      : `Head-to-toe wide composition in ${bgDesc}. Full outfit silhouette, footwear, architectural depth, and dynamic motion.`,
    '',
    '=== SHOT 4: CINEMATIC DETAIL MACRO ===',
    `Artistic close-up accent. Tactile fabric texture, accessories (${accDesc}), hair silhouette texture, and atmospheric lighting highlights.`,
    '',
    'LIGHTING, CAMERA & FINISH',
    `Lighting: ${lightDesc}. Camera angle & lens: ${val('angle')}, ${val('lens')}. Photography style: ${val('style')}. Color grade: ${gradeDesc}. Quality: ${qualDesc}. Aspect ratio: ${aspDesc}.`,
    '',
    (extraLines && extraLines.length ? 'ADDITIONAL STYLING DETAILS\n' + extraLines.join('\n') + '\n\n' : '') +
    'IDENTITY & REALISM SAFEGUARDS',
    (Array.isArray(checks) && checks.length) ? checks.map(x=>'• '+x).join('\n') : '• Natural photographic texture, consistent identity and believable materials.',
    custNote,
    '',
    'AVOID / NEGATIVE GUIDANCE',
    negsText
  ].filter(Boolean).join('\n');

  return {
    all: allShots.replace(/\n{3,}/g, '\n\n'),
    '1': shot1.replace(/\n{3,}/g, '\n\n'),
    '2': shot2.replace(/\n{3,}/g, '\n\n'),
    '3': shot3.replace(/\n{3,}/g, '\n\n'),
    '4': shot4.replace(/\n{3,}/g, '\n\n')
  };
}


function buildSalonPrompt(){
  const mode = val('mode');
  const stageRawVal = val('salonStage') || '';
  const stageLabelVal = values['salonStage']?.label || '';
  const isFemaleModelBarber = (salonSeatingMode === 'grooming_men');
  const S = t => (checkState.noMirror ? sanitizeMirrorProse(t) : t);
  const lines = [];
  const isStool = (salonSeatingMode === 'stool');
  const sanitizeStool = (text) => {
    if(!isStool || !text) return text;
    return text
      .replace(/vintage hydraulic Belmont chair/gi, 'low backless salon cutting stool')
      .replace(/classic chrome hydraulic barber chair/gi, 'low backless salon cutting stool')
      .replace(/hydraulic Belmont chair/gi, 'low backless salon cutting stool')
      .replace(/hydraulic barber chair/gi, 'low backless salon cutting stool')
      .replace(/black leather hydraulic styling chair/gi, 'low backless cutting stool')
      .replace(/black leather salon styling chair/gi, 'low backless cutting stool')
      .replace(/hydraulic chair/gi, 'low backless stool')
      .replace(/Belmont chair/gi, 'low backless stool')
      .replace(/tall styling chair/gi, 'low backless stool')
      .replace(/styling chair/gi, 'low backless salon stool')
      .replace(/barber chair/gi, 'low backless stool')
      .replace(/tufted Belmont leather headrest|padded leather headrest|crescent headrest|headrest/gi, 'open seating perimeter behind her neck')
      .replace(/chrome leather armrests|chrome armrests|chair armrest|leather armrest|armrests?/gi, 'the open stool rim')
      .replace(/the chrome pump pedal/gi, 'the stool perimeter')
      .replace(/foot on the heavy chrome hydraulic pump lever[^,.]+/gi, "careful hand positioning to adjust the client's seating on the low stool");
  };

  const sanitizeGrooming = (text) => {
    if(!isFemaleModelBarber || !text) return text;
    return text
      .replace(/to the female client in the chair/gi, 'to the male client in the chair')
      .replace(/female model is the sole client/gi, 'female model is the sole barber attending to her male client')
      .replace(/the female client rests her hands/gi, 'the seated male client rests his hands')
      .replace(/the female client sits/gi, 'the seated male client sits')
      .replace(/adjusting the client's seating height/gi, "adjusting the male client's seating height")
      .replace(/allowing the female client to inspect/gi, 'allowing the seated male client to inspect')
      .replace(/female client in the chair/gi, 'male client in the chair')
      .replace(/female client in the styling chair/gi, 'male client in the styling chair')
      .replace(/to the female client/gi, 'to the male client')
      .replace(/the female client(?:'s)?/gi, m => m.endsWith('s') || m.endsWith('S') ? "the seated male client's" : 'the seated male client')
      .replace(/female client/gi, 'male client')
      .replace(/female customer/gi, 'male customer')
      .replace(/\bThe male barber\b/g, 'Our female model (barber)')
      .replace(/\bthe male barber\b/g, 'our female model (barber)')
      .replace(/\bmale barber\b/gi, 'female model (barber)')
      .replace(/\bBarber \((?:[^)]+)\)/gi, 'Our female model (barber)')
      .replace(/\bhis focused hands|his hands|his fingers|his other hand|his warm fingers/gi, 'her skilled hands')
      .replace(/\bwatches approvingly\b/gi, 'works with focused artisan precision');
  };

  const stoolTypeVal = S(val('salonStoolType'));
  const stoolProxVal = S(val('salonBarberProximity'));
  const rawStoolActVal = S(val('salonIntimateHairAction'));
  const stoolPostRaw = S(val('salonStoolModelPosture'));
  const salonCamStr = ((values.salonCamera?.label || '') + ' ' + (val('salonCamera') || '')).toLowerCase();
  const salonPoseStageStr = (isFemaleModelBarber
    ? ((values.salonStage?.label || '') + ' ' + (val('salonStage') || '') + ' ' + (values.salonBarberPose?.label || '') + ' ' + (val('salonBarberPose') || ''))
    : (isStool
      ? ((values.salonStoolModelPosture?.label || '') + ' ' + (val('salonStoolModelPosture') || '') + ' ' + (values.salonIntimateHairAction?.label || '') + ' ' + (val('salonIntimateHairAction') || ''))
      : ((values.salonStage?.label || '') + ' ' + (val('salonStage') || '') + ' ' + (values.salonChairPose?.label || '') + ' ' + (val('salonChairPose') || '')))
  ).toLowerCase();
  const salonObfuscMode = values.salonFaceObfuscMode?.text || 'none';
  const hasSalonObfusc = (salonObfuscMode !== 'none' && salonObfuscMode !== 'hair_veil');
  const isFaceHidden = hasSalonObfusc || /shield\w*.*face|conceal\w*.*face|face.*hidden|hid\w*.*face|touching temple|face.*not visible|zero facial exposure|looking away into shop|face turned away/i.test(salonCamStr + ' ' + salonPoseStageStr);
  const salonFaceCovVal = val('salonFaceHairCoverage') || '';
  const salonFaceCovLabel = values['salonFaceHairCoverage']?.label || '';
  const salonVeilTier = parseVeilTier(salonFaceCovLabel);
  const isSalonZeroVeil = (salonVeilTier === '0');
  const isSalon95_100 = (salonVeilTier === '95_100');
  const isSalon80_85 = (salonVeilTier === '80_85');
  const isSalon65_70 = (salonVeilTier === '65_70');
  const isSalonFullVeil = isSalon95_100;
  const isSalonHeavyVeil = isSalon80_85 || isSalon95_100;
  const isSalonDeepVeil = isSalon65_70 || isSalonHeavyVeil;
  const hideEyes = isFaceHidden || isSalonDeepVeil || hasSalonObfusc;
  const stoolActVal = sanitizeHiddenFaceText(rawStoolActVal, hideEyes, salonVeilTier, salonObfuscMode);
  const stoolPostVal = sanitizeHiddenFaceText(stoolPostRaw, hideEyes, salonVeilTier, salonObfuscMode);

  const salonHairLower = (values.salonHaircut?.label || '').toLowerCase();
  const isSalonPony = salonHairLower.includes('pony') || salonHairLower.includes('ponytail') || isPonySelected();
  const isSalonSweep = salonHairLower.includes('side-swept') || salonHairLower.includes('swept to one side') || salonHairLower.includes('side sweep') || isSideSweepSelected();

  let haircutText = S(val('salonHaircut'));
  const hairTextureText = S(val('salonHairTexture'));

  if(isSalonPony){
    const pDetails = [];
    if(val('ponyBaseHeight')) pDetails.push(`anchored at ${val('ponyBaseHeight')}`);
    if(val('ponyBaseWrap')) pDetails.push(`base ${val('ponyBaseWrap')}`);
    if(val('ponyTailFall')) pDetails.push(`tail falling ${val('ponyTailFall')}`);
    if(val('ponyTailEnd')) pDetails.push(`tail ends ${val('ponyTailEnd')}`);
    if(pDetails.length) haircutText += ` (${pDetails.join(', ')})`;
  } else if(isSalonSweep){
    const sDetails = [];
    if(val('sideSweepSide')) sDetails.push(val('sideSweepSide'));
    if(val('sideSweepFlip')) sDetails.push(val('sideSweepFlip'));
    if(val('sideSweepEnd')) sDetails.push(val('sideSweepEnd'));
    if(sDetails.length) haircutText += ` (${sDetails.join(', ')})`;
  }
  const salonHairArch = detectHairArchitecture(values.salonHaircut, haircutText);

  let rawStageText = S(val('salonStage'));
  if(!isSalonPony){
    rawStageText = rawStageText
      .replace(/rear ponytail and nape silhouette/gi, 'rear haircut perimeter and nape silhouette')
      .replace(/ponytail tail ends/gi, 'tapered hair ends')
      .replace(/gathers the ponytail tail, twisting the ends/gi, 'gathers the damp ends gently, twisting the tips');
  }
  const stageText = sanitizeHiddenFaceText(sanitizeGrooming(sanitizeStool(rawStageText)), hideEyes, salonVeilTier);

  // Moisture vs Stage / Haircut compatibility awareness
  const stageCheckBlob = (isStool ? ((values.salonIntimateHairAction?.label || '') + ' ' + stoolActVal) : (stageLabelVal + ' ' + stageText)).toLowerCase();
  const hairCheckBlob = (salonHairLower + ' ' + haircutText).toLowerCase();
  const isExplicitWetStage = /spray bottle|water mist|mist soak|spray-soak|water-mist soak|towel blotting damp|towel-squeezing|towel-scrubbing|shampoo basin|shampoo bowl|conditioning mask|comb-down veil/i.test(stageCheckBlob);
  const isExplicitDryStage = /blowout|hairdryer|flat-iron|c-curve beveling|round-brush|curling wand|dry visual carving|dry freehand|dry sculpting|curl-by-curl dry|loose hair blast/i.test(stageCheckBlob);
  const isExplicitWetCut = /\bwet\b|\bdamp\b|hydro|ocean-soaked|drenched|post-swim/i.test(hairCheckBlob);

  const moistureDescriptions = {
    dry: (isExplicitWetStage || isExplicitWetCut)
      ? 'light transitional moisture where active misting/wet detailing appears before finishing with smooth airy dry movement'
      : 'completely dry and styled with natural bounce, airy volume, smooth strand separation, and zero wetness',
    damp: isExplicitDryStage
      ? 'transitional damp-to-blowout hair smoothing smoothly under thermal brush tension into clean separated movement'
      : 'damp hair with authentic spray-bottle water misting, fine glistening water droplets on hair fibers, realistic damp strand clumping held taut for haircutting',
    wet: isExplicitDryStage
      ? 'high-moisture freshly washed hair undergoing partial thermal shaping along the ends with glossy luster'
      : 'thoroughly drenched, saturated soaked wet hair dripping heavily with water sheen, hair ribbons clinging flush to the scalp, temples, and nape with zero airy puffiness'
  };
  const moisturePrimaryBullet = (salonHairMoisture === 'wet' && !isExplicitDryStage)
    ? '• Mandatory Soaked Wet Hair Physics: The female model\'s hair is thoroughly water-soaked and dripping wet—heavy dark wet hair ribbons clinging flush against her scalp, temples, cheeks, and neck with glistening aquatic water sheen and zero dry fluffy flyaways.'
    : (salonHairMoisture === 'damp' && !isExplicitDryStage)
      ? '• Damp Hair Physics: Evenly spray-misted damp hair texture held smoothly in comb tension with fine translucent water droplets catching salon light.'
      : (salonHairMoisture === 'dry' && !isExplicitWetStage && !isExplicitWetCut)
        ? '• Dry Blown-Out Hair Physics: Completely bone-dry, freshly blown-out airy hair with natural bounce, lightweight separation, and zero water dampness or wet clumping.'
        : '';

  // Header / Subject preservation
  if(isFemaleModelBarber){
    lines.push(mode.startsWith('Edit') ? 'REFERENCE-IMAGE EDIT · FEMALE MODEL (BARBER) GROOMING MALE CLIENT' : 'REFERENCE-GUIDED PORTRAIT · FEMALE MODEL (BARBER) GROOMING MALE CLIENT');
  } else {
    lines.push(mode.startsWith('Edit') ? 'REFERENCE-IMAGE EDIT · AUTHENTIC SALON & BARBERSHOP SCENE' : 'REFERENCE-GUIDED PORTRAIT · AUTHENTIC SALON & BARBERSHOP SCENE');
  }
  lines.push('');

  const buildSalonSubjectIdentityBullet = (barberSuffix) => {
    if(isFaceHidden){
      return '• Maintain her authentic Indian heritage features, warm skin tone, natural hair texture, and silhouette while respecting that her face is turned sideways looking away and not visible to the lens.';
    }
    if(isSalon95_100){
      return `• Maintain her authentic Indian heritage features, warm skin tone, lower-cheek skin texture, and hair density while keeping 95–100% of her face (forehead, eyes, nose) frontally veiled behind a continuous, sleek, fine-tooth-combed glossy hair veil matched strictly to her haircut length + chin-tucked poise (ZERO visible eyes, ZERO eyebrows, ZERO nose, ZERO mouth)${barberSuffix ? ' as she concentrates on her craft' : ''}.`;
    }
    if(isSalon80_85){
      return `• Maintain her authentic Indian heritage features, warm skin tone, hair density, and lower-chin/lip skin texture while hiding 80–85% of her upper face—ZERO visible eyeballs, ZERO pupils, ZERO eyebrows, ZERO bare forehead—beneath a continuous, fine-tooth-combed glossy front hair sheet matched to her haircut length + slight chin dip${barberSuffix ? ' as she concentrates on her craft' : ''}.`;
    }
    if(isSalon65_70){
      return `• Maintain her authentic Indian heritage features, warm skin tone, hair density, and lower-lip/chin texture while hiding ~65–70% of her face (forehead, both eyebrows, nose bridge, and one full eye 100% unseen; zero open wide eyes) behind a sleek fine-tooth-combed satin sweep + 3/4 chin dip${barberSuffix ? ' as she focuses on her craft' : ''}.`;
    }
    if(salonVeilTier === '50' || salonVeilTier === '40_45'){
      return `• Retain her recognizable Indian heritage identity on her exposed lower face and single uncovered eye, while keeping the opposite eye 100% hidden (ZERO covered eyeball visible) behind a continuous, sleek, fine-tooth-combed diagonal hair wave matched strictly to her haircut length${barberSuffix ? ' as she focuses on grooming her client' : ''}.`;
    }
    return barberSuffix
      ? '• Retain her recognizable facial identity, Indian heritage facial structure, natural eye shape, and realistic skin texture with visible pores as she focuses with artisan concentration on grooming her client.'
      : '• Retain her recognizable facial identity, Indian heritage facial structure, natural eye shape, and realistic skin texture with visible pores.';
  };
  const salonVeilRuleObj = getVeilRule(salonVeilTier, salonHairArch);
  const salonVeilPrimaryBullet = salonVeilRuleObj?.primary || '';

  lines.push('PRIMARY SUBJECT (REFERENCE IMAGE):');
  const salonObfuscClause = buildObfuscClause(salonObfuscMode, salonHairArch);
  if(salonObfuscClause) lines.push('• ' + salonObfuscClause);
  if(isFemaleModelBarber){
    lines.push('• Strictly preserve the adult woman from the reference image as the skilled female barber / practitioner actively attending to her seated male client.');
    lines.push(`• Signature Haircut & Styling: Transform our female model's hair into her chosen signature haircut—${haircutText} (${values.salonHaircut?.label || 'selected cut'})—preserving authentic natural Indian hair strand density and texture sculpted into this exact silhouette.`);
    lines.push(buildSalonSubjectIdentityBullet(true));
    if(salonVeilPrimaryBullet) lines.push(salonVeilPrimaryBullet);
    if(moisturePrimaryBullet) lines.push(moisturePrimaryBullet);
  } else if(isStool){
    lines.push(`• Strictly preserve the adult woman from the reference image as the client seated on the ${stoolTypeVal}.`);
    lines.push(buildSalonSubjectIdentityBullet(false));
    if(salonVeilPrimaryBullet) lines.push(salonVeilPrimaryBullet);
    lines.push('• Maintain her authentic natural Indian hair strand density and texture.');
    if(moisturePrimaryBullet) lines.push(moisturePrimaryBullet);
  } else {
    lines.push('• Strictly preserve the adult woman from the reference image as the client in the barber chair.');
    lines.push(buildSalonSubjectIdentityBullet(false));
    if(salonVeilPrimaryBullet) lines.push(salonVeilPrimaryBullet);
    lines.push('• Maintain her authentic natural Indian hair strand density and texture.');
    if(moisturePrimaryBullet) lines.push(moisturePrimaryBullet);
  }
  lines.push('');

  const rawStylistLabel = values['salonStylist']?.label || 'Male barber';
  const stylistLabel = S(rawStylistLabel);
  const isSoloClient = !isFemaleModelBarber && !isStool && (rawStylistLabel || '').toLowerCase().includes('solo client');

  if(isFemaleModelBarber){
    lines.push('SOLITARY FEMALE PRACTITIONER & ALL-MALE ENVIRONMENT:');
    lines.push('• Solitary Female Model (Barber): The adult female model from the reference image (acting as the skilled barber/practitioner) is strictly and exclusively the ONLY woman/girl in the entire image.');
    lines.push('• Seated Male Client: The person seated in the barber chair receiving grooming is strictly an adult male client.');
    lines.push('• All-Male Patrons & Apprentices: Any secondary customers in neighboring chairs, waiting on benches, or secondary shop assistants must strictly be male.');
    lines.push('• Exclude All Other Women: Absolutely zero secondary women, zero female clients, zero female customers, and zero other female staff anywhere in the background, shop interior, or mirrors.');
  } else if(isSoloClient){
    lines.push('SOLO FEMALE CLIENT SCENE:');
    lines.push('• Solitary Female Model: The female client seated in the styling chair (our model) is strictly the ONLY person beside the styling station; no barber or stylist stands next to her chair.');
    lines.push(checkState.noMirror
      ? '• Exclude All Other Women: Absolutely zero secondary women, zero female stylists, zero female assistants, and zero female customers anywhere in the shop interior or background.'
      : '• Exclude All Other Women: Absolutely zero secondary women, zero female stylists, zero female assistants, and zero female customers anywhere in the background or mirrors.');
  } else {
    lines.push('SOLITARY FEMALE SUBJECT & ALL-MALE ENVIRONMENT:');
    lines.push(isStool
      ? `• Solitary Female Model: The female client seated on the ${stoolTypeVal} (our model) is strictly and exclusively the ONLY woman/girl in the entire image.`
      : '• Solitary Female Model: The female client seated in the styling chair (our model) is strictly and exclusively the ONLY woman/girl in the entire image.');
    lines.push('• All-Male Staff & Patrons: All barbers, hair stylists, apprentices, and secondary shop customers in neighboring chairs or waiting on benches must strictly be male.');
    lines.push(checkState.noMirror
      ? '• Exclude All Other Women: Absolutely zero secondary women, zero female stylists, zero female assistants, and zero female customers anywhere in the shop interior or background.'
      : '• Exclude All Other Women: Absolutely zero secondary women, zero female stylists, zero female assistants, and zero female customers anywhere in the background or mirrors.');
  }
  lines.push('');

  if(isFaceHidden){
    lines.push('FACE CONCEALMENT & OCCLUSION:');
    if(isFemaleModelBarber){
      lines.push('• The female barber is turned sideways looking away from the camera or leaning over her client with her face not visible to the lens (head angled away into the salon background or shielded from view). Zero facial features or direct facial exposure are visible to the lens; the model retains her natural hair styling and professional practitioner posture while the photographic composition focuses purely on her grooming craft, artisan hands, neckline silhouette, and salon atmosphere.');
    } else {
      lines.push('• The female client is turned sideways looking away from the camera with her face not visible to the lens (head angled away into the salon background or shielded from view). Zero facial features or direct facial exposure are visible to the lens; the model retains her natural hair styling while the photographic composition focuses purely on her haircut perimeter, hair texture, neckline silhouette, and salon atmosphere.');
    }
    lines.push('');
  }

  const outputText = {
    single: 'Create one finished photorealistic image.',
    collage: 'Generate one single high-resolution 2×2 editorial collage with four distinct, non-identical frames of the salon scene.',
    set: 'Generate a curated set of four distinct individual photographs of the salon scene from different angles.',
    triptych: 'Generate a continuous three-panel editorial triptych depicting the salon haircut progression.',
    contact: 'Generate a classic contact sheet layout featuring six contiguous film frames of the salon scene.'
  };

  lines.push('CREATIVE INTENT');
  if(isFemaleModelBarber){
    lines.push(`${mode}. ${outputText[outputType] || outputText.single} Capture the female model as the skilled barber executing an authentic grooming service on a male client with realistic salon details.`);
  } else {
    lines.push(`${mode}. ${outputText[outputType] || outputText.single} Capture an authentic salon and barbershop scene with realistic haircut progress and atmospheric shop details.`);
  }
  lines.push('');

  lines.push('VENUE & ATMOSPHERE');
  const venueText = sanitizeGrooming(sanitizeStool(S(val('salonVenue'))));
  const designText = (val('salonDesign') && !val('salonDesign').startsWith('Preset Default') && !val('salonDesign').startsWith('harmonized with')) ? S(val('salonDesign')) : '';
  const staffText = isSoloClient
    ? 'Solo client seated comfortably alone at her styling station while her stylist has stepped away'
    : sanitizeGrooming(sanitizeStool(S(val('salonBarberStaff'))));
  const bustleText = S(val('salonBustle'));
  const bustleLabel = values['salonBustle']?.label || '';
  const timeText = S(val('salonTime'));
  const rawStationProps = val('salonStationProps') ? sanitizeStool(S(val('salonStationProps'))) : '';

  let venueLine = `${venueText}.`;
  if(designText) venueLine += ` Shop interior design: ${designText}.`;
  venueLine += ` Barber staffing: ${staffText}. Crowd density: ${bustleText}. Time & ambient light: ${timeText}.`;
  if(rawStationProps) venueLine += ` Station props: ${rawStationProps}.`;
  lines.push(venueLine);
  lines.push('');

  let rawCameraText = checkState.noMirror ? (SALON_CAMERA_MIRROR_FREE[val('salonCamera')] || sanitizeMirrorProse(val('salonCamera'))) : val('salonCamera');
  rawCameraText = sanitizeStool(rawCameraText);
  const salonHairLowerCam = salonHairLower;
  const isPonyCam = isSalonPony;
  let cameraText = isPonyCam ? rawCameraText : rawCameraText.replace(/ponytail profile/gi, 'haircut silhouette');
  if(isFemaleModelBarber){
    cameraText = cameraText
      .replace(/the male barber's hands/gi, "the female barber's hands")
      .replace(/male barber's hands/gi, "female barber's hands")
      .replace(/male barber/gi, "female model (barber)")
      .replace(/the client's front reflection/gi, "the seated male client and standing female barber")
      .replace(/the client's reflection/gi, "the male client and female barber reflection")
      .replace(/client's front reflection/gi, "seated male client and standing female barber");
  } else if(isSoloClient){
    cameraText = sanitizeSoloClientCamera(cameraText);
  }
  cameraText = sanitizeHiddenFaceText(cameraText, hideEyes, salonVeilTier);

  const stylistText = S(val('salonStylist'));
  const lightingText = S(val('salonLighting'));
  const qualityText = S(val('salonQuality'));
  const cleanSalonExpr = sanitizeHiddenFaceText(S(val('salonExpression')), hideEyes, salonVeilTier);

  if(isFemaleModelBarber){
    lines.push('GROOMING SERVICE & BARBER ARTISAN ACTION');
    lines.push(`Active grooming moment: ${stageText}.`);
    const barberPoseText = sanitizeHiddenFaceText(
      val('salonBarberPose') ? S(val('salonBarberPose')) : 'the adult female model acts as the skilled barber standing tightly beside the hydraulic chair, executing the grooming service with authentic posture, artisan hand positioning, and attentive focus',
      hideEyes,
      salonVeilTier
    );
    lines.push(`Female model artisan posture: ${barberPoseText}.`);
    let maleReactionText = cleanSalonExpr
      ? cleanSalonExpr
          .replace(/watching her hair transformation in the mirror with quiet satisfaction, relaxed eyes, and a subtle self-assured smile/gi, 'reclining calmly with eyes closed or head tilted comfortably, enjoying the soothing grooming service')
          .replace(/watching her hair transformation/gi, 'enjoying the relaxing treatment')
          .replace(/her hair transformation/gi, 'the grooming treatment')
          .replace(/\bher\b/gi, 'his')
      : 'reclining calmly with eyes closed or head tilted comfortably, enjoying the soothing grooming service';
    lines.push(`Male client reaction & composure: The seated male client responds with calm relaxation (${maleReactionText}).`);
    lines.push('');
  } else if(isStool){
    lines.push('CLIENT SEATING & INTIMATE BARBER PROXIMITY');
    lines.push(`Seating setup: The female client is seated on a low ${stoolTypeVal}, completely backless with zero headrest, leaving her upper body, neck, and hair completely open in the space.`);
    lines.push(`Barber proximity & body contact: The male barber stands directly behind her, ${stoolProxVal}. His physical presence is intimately close, authentic, and attentively focused on her hair.`);
    lines.push(`Active hair work: He is actively working on her hair: ${stoolActVal}.`);
    const exprText = cleanSalonExpr ? ` Client facial reaction: ${cleanSalonExpr}.` : '';
    lines.push(`Client posture & expression: ${stoolPostVal}.${exprText}`);
    lines.push('');
  } else {
    lines.push('HAIRCUT STAGE & ACTIVE ACTION');
    if(isSoloClient){
      lines.push(`Haircut progress: the female client sits calmly as a solo subject, contemplating and reviewing her freshly styled haircut with zero other people standing beside her chair.`);
    } else {
      lines.push(`Haircut progress: ${stageText}.`);
    }
    if(val('salonChairPose')){
      lines.push(`Client chair pose & body posture: ${sanitizeHiddenFaceText(S(val('salonChairPose')), hideEyes, salonVeilTier)}.`);
    }
    if(cleanSalonExpr){
      lines.push(`Client expression & reaction: ${cleanSalonExpr}.`);
    }
    lines.push('');

    if(isSoloClient){
      lines.push('SOLO CLIENT PRESENCE');
      lines.push('Stylist presence: Zero barbers or stylists present in frame; the solo female client rests alone at her styling station.');
    } else {
      lines.push('BARBER / STYLIST PRESENCE');
      lines.push(`Stylist presence: ${stylistText}.`);
    }
    lines.push('');
  }

  const wetHaircutNote = (salonHairMoisture === 'wet' && !isExplicitDryStage)
    ? ' (rendered right now thoroughly water-soaked: hair hangs heavy, dark, and clumped with water droplets rather than dry airy fluff)'
    : '';
  const clipperGuardVal = val('salonClipperGuard');
  const clipperGuardNote = clipperGuardVal ? ` (clipper guard & taper: ${clipperGuardVal})` : '';
  const haircutDisplay = `${haircutText}${clipperGuardNote}${wetHaircutNote}`;
  const moistureEnforceDirective = (salonHairMoisture === 'wet' && !isExplicitDryStage)
    ? 'MANDATORY SOAKED / WET-LOOK PHYSICS: Hair fibers are thoroughly drenched from root to tip; strands clump tightly into glossy dark wet ribbons; roots press flat and heavy against crown and nape; gleaming water droplets bead along temples, neck, and collarbones; zero dry puffy volume or loose flyaways.'
    : (salonHairMoisture === 'damp' && !isExplicitDryStage)
      ? 'MANDATORY DAMP / SPRAY-MISTED PHYSICS: Even spray-bottle misting across mid-lengths and ends; fine translucent water droplets catching salon light; clean comb-held damp strand clumping.'
      : (salonHairMoisture === 'dry' && !isExplicitWetStage && !isExplicitWetCut)
        ? 'MANDATORY BONE-DRY / BLOWN-OUT PHYSICS: Zero water moisture and zero wet clumping; weightless dry strand movement, airy crown lift, natural bounce, and soft feathery ends.'
        : '';

  if(isFemaleModelBarber){
    lines.push('GROOMING SERVICE & MODEL STYLING');
    lines.push(`Grooming service on male client: authentic gentlemen's grooming and hair care—${stageText}. The seated male client has a classic clean gentlemen's taper haircut with natural hair texture.`);
    const modelPersonalBase = `Her hair is freshly cut and styled into ${haircutDisplay}. Hair texture: ${hairTextureText}. Moisture state: ${moistureDescriptions[salonHairMoisture] || moistureDescriptions.damp}. Maintain her authentic natural Indian hair strand density and shine sculpted cleanly into this exact haircut silhouette.`;
    lines.push(`Female model's personal hair: ${modelPersonalBase}${salonFaceCovVal ? ' Face-behind-hair veil on female model: ' + salonFaceCovVal + '.' : ''}`);
    if(moistureEnforceDirective) lines.push(moistureEnforceDirective);
    if(salonFaceCovVal && salonVeilTier !== 'auto'){
      const strictEnforce = salonVeilRuleObj?.strict || '';
      lines.push('');
      lines.push('HAIR VEIL DIRECTIVE ON FEMALE MODEL / BARBER (MANDATORY — STRICT FACIAL COVERAGE ENFORCEMENT):');
      lines.push(`• Selected Tier: ${salonFaceCovLabel}`);
      lines.push(`• Drape & Coverage: ${salonFaceCovVal}`);
      lines.push(`• Strict Enforcement: ${strictEnforce}`);
      lines.push(`• Silhouette Integrity: Strictly keep her chosen haircut (${values.salonHaircut?.label || 'selected cut'}) 100% authentic in length, parting, and back structure while styling this cohesive facial framing.`);
    }
  } else {
    lines.push('HAIRSTYLE BEING CUT');
    lines.push(`Haircut: ${haircutDisplay}. Hair texture: ${hairTextureText}. Moisture state: ${moistureDescriptions[salonHairMoisture] || moistureDescriptions.damp}.`);
    if(moistureEnforceDirective) lines.push(moistureEnforceDirective);
    if(salonFaceCovVal && salonVeilTier !== 'auto'){
      const strictEnforce = salonVeilRuleObj?.strict || '';
      lines.push(`Face-behind-hair veil: ${salonFaceCovVal}. Keep the base haircut silhouette (${values.salonHaircut?.label || 'selected cut'}) intact while applying this exact percentage of facial hair coverage.`);
      lines.push('');
      lines.push('HAIR VEIL DIRECTIVE (MANDATORY — STRICT FACIAL COVERAGE ENFORCEMENT):');
      lines.push(`• Selected Tier: ${salonFaceCovLabel}`);
      lines.push(`• Drape & Coverage: ${salonFaceCovVal}`);
      lines.push(`• Strict Enforcement: ${strictEnforce}`);
      lines.push(`• Silhouette Integrity: Strictly keep the chosen haircut (${values.salonHaircut?.label || 'selected cut'}) authentic in length, crown, and shape—integrate this cohesive veil cleanly without spawning mismatched loose strings.`);
    }
  }
  lines.push('');

  const capeText = sanitizeCapeText(sanitizeStool(S(val('salonCape'))), isFemaleModelBarber);
  const capeMoistureNote = (salonHairMoisture === 'wet' && !isExplicitDryStage)
    ? ' The waterproof cape surface shows glistening specular water droplets, faint dark wet patches around the collar strip, and heavy wet cut strands clinging lightly to cape folds.'
    : (salonHairMoisture === 'damp' && !isExplicitDryStage)
      ? ' Subtle water mist speckles and freshly snipped damp clippings rest lightly across the upper shoulders of the cape.'
      : (salonHairMoisture === 'dry' && !isExplicitWetStage && !isExplicitWetCut)
        ? ' The bone-dry matte cape surface is dotted cleanly with loose feathery dry hair dust brushed lightly downward.'
        : ' Freshly snipped hair clippings rest naturally across the upper shoulders of the cape.';

  lines.push('CUTTING CAPE & SALON DETAILS');
  if(isFemaleModelBarber){
    lines.push(`Draped cape on male client: ${capeText} draped securely around the seated male client's neck and shoulders over a sanitary collar strip, catching foam and clippings as our female model grooms him.${capeMoistureNote}`);
  } else {
    lines.push(`Draped cape: ${capeText}.${capeMoistureNote}`);
  }
  lines.push('');

  lines.push(checkState.noMirror ? 'CAMERA PERSPECTIVE & LIGHTING' : 'CAMERA, MIRROR PERSPECTIVE & LIGHTING');
  lines.push(`Camera angle: ${cameraText}. Lighting: ${lightingText}. Quality: ${qualityText}.`);
  lines.push('');
  lines.push(isFemaleModelBarber ? 'MODEL BARBER WARDROBE & STYLING' : 'CLIENT UNDER-CAPE WARDROBE & STYLING');
  if(wardrobeMode === 'separates'){
    const topText = val('topPiece') || 'a minimalist white ribbed racerback crop tank top';
    const bottomText = val('bottomPiece') || 'high-waisted vintage wash denim cutoff shorts';
    const waistText = val('midriffStyling') || 'bare midriff with natural skin texture & subtle tone';
    const fitText = val('outfitFit') || 'clean tailored fit';
    if(isFemaleModelBarber){
      lines.push(`Model barber attire: a stylish two-piece separates ensemble featuring ${topText} paired with ${bottomText}. Midriff & waist styling: ${waistText}. Garment fit: ${fitText}. The female model wears her stylish salon practitioner separates with authentic fabric drape and realistic seams as she actively moves around the chair grooming her male client.`);
    } else {
      lines.push(`Client under-cape wardrobe: a modern two-piece separates ensemble featuring ${topText} paired with ${bottomText}. Midriff & waist styling: ${waistText}. Garment fit: ${fitText}. Fabric folds and hemlines naturally visible beneath the draped cutting cape neckline and lap.`);
    }
  } else {
    const outfitText = val('outfit') || 'a chic contemporary outfit';
    const fitText = val('outfitFit') || 'natural tailored fit';
    if(isFemaleModelBarber){
      lines.push(`Model barber attire: ${outfitText}. Garment fit: ${fitText}. The female model wears her stylish salon practitioner outfit with authentic fabric drape and realistic seams as she actively moves around the chair grooming her male client.`);
    } else {
      lines.push(`Client under-cape wardrobe: ${outfitText}. Garment fit: ${fitText}. Fabric drape visible beneath the draped cutting cape neckline and lap.`);
    }
  }
  lines.push('');

  const stageLabel = S(values['salonStage']?.label || 'Active haircut moment');
  const moistureText = moistureDescriptions[salonHairMoisture] || moistureDescriptions.damp;

  const flowType = (values.salonCollageFlow && values.salonCollageFlow.text) ? values.salonCollageFlow.text : 'journey';
  let rawFlowLabel = (flowType === 'custom') ? 'Custom Storyboard'
    : (values.salonCollageFlow?.label || 'Chronological Haircut Journey').replace(/\s*\(.*\)$/, '');
  const flowLabel = S(rawFlowLabel);

  const f1Val = (values.salonCollageFrame1 && values.salonCollageFrame1.text) ? values.salonCollageFrame1.text : 'consultation_chair';
  const f2Val = (values.salonCollageFrame2 && values.salonCollageFrame2.text) ? values.salonCollageFrame2.text : 'scissor_blunt_perimeter';
  const f3Val = (values.salonCollageFrame3 && values.salonCollageFrame3.text) ? values.salonCollageFrame3.text : 'side_profile_check';
  const f4Val = (values.salonCollageFrame4 && values.salonCollageFrame4.text) ? values.salonCollageFrame4.text : 'front_mirror_admire';

  const f1Label = (values.salonCollageFrame1 && values.salonCollageFrame1.label) ? values.salonCollageFrame1.label : 'In-Chair Consultation';
  const f2Label = (values.salonCollageFrame2 && values.salonCollageFrame2.label) ? values.salonCollageFrame2.label : 'Precision Scissor Work';
  const f3Label = (values.salonCollageFrame3 && values.salonCollageFrame3.label) ? values.salonCollageFrame3.label : 'Side Profile Inspection';
  const f4Label = (values.salonCollageFrame4 && values.salonCollageFrame4.label) ? values.salonCollageFrame4.label : 'Front Mirror Reveal';

  let collageThemeIntro = 'documenting the haircut progression with complete photographic realism';
  if(flowType === 'multi_angle'){
    collageThemeIntro = 'capturing the haircut moment simultaneously from four synchronized camera perspectives';
  } else if(flowType === 'wash_and_cut'){
    collageThemeIntro = 'documenting the complete salon wash, haircut, and blowout transformation';
  } else if(flowType === 'tool_craft'){
    collageThemeIntro = 'showcasing artisanal barber craftsmanship, precision tool mechanics, and dedicated detailing';
  } else if(flowType === 'makeover_arc'){
    collageThemeIntro = checkState.noMirror
      ? 'chronicling the full haircut makeover journey from initial consultation to final silhouette admiration'
      : 'chronicling the full haircut makeover journey from initial consultation to final mirror admiration';
  } else if(flowType === 'dual_mirror'){
    collageThemeIntro = checkState.noMirror
      ? 'highlighting the meticulous haircut finish, perimeter inspection, and celebratory rear silhouette reveal'
      : 'highlighting the meticulous haircut finish, perimeter inspection, and celebratory rear reveal';
  } else if(flowType === 'precision_craft'){
    collageThemeIntro = 'celebrating intricate sectioning, guarded razor detailing, and geometric cutting mechanics';
  } else if(flowType === 'grooming_shave'){
    collageThemeIntro = 'documenting traditional barbershop straight-razor shaving, warm lather underarm & chest grooming, and soothing aftercare';
  } else if(flowType === 'custom'){
    collageThemeIntro = 'bringing together four individually curated salon moments into a seamless cinematic narrative';
  }

  const collageCtx = {
    venueText, designText: designText || 'authentic salon interior', staffText, bustleText, bustleLabel,
    stylistText, stylistLabel, haircutText, moistureText, hairMoisture: salonHairMoisture,
    capeText, cameraText, lightingText, stationProps: rawStationProps,
    stageText, stageLabel, noMirror: !!checkState.noMirror,
    isSoloClient: isSoloClient,
    isStool: isStool,
    isFemaleModelBarber: isFemaleModelBarber,
    veilTier: salonVeilTier,
    veilLabel: salonFaceCovLabel
  };

  if(outputType === 'collage'){
    lines.push(`2×2 EDITORIAL COLLAGE COMPOSITION & PANEL BLUEPRINT (${flowLabel.toUpperCase()})`);
    if(isFemaleModelBarber){
      lines.push(`Generate exactly one single high-definition image formatted as a 2×2 grid (two rows of two square/editorial panels) ${collageThemeIntro}. Maintain 100% strict identity, hair color, and styling consistency across all 4 frames: identical female model as the skilled barber (solitary female in the shop), identical male client, consistent draped cape on the male client, and identical salon station:`);
    } else if(isSoloClient){
      lines.push(`Generate exactly one single high-definition image formatted as a 2×2 grid (two rows of two square/editorial panels) ${collageThemeIntro}. Maintain 100% strict identity, hair color, and styling consistency across all 4 frames: identical solo female client, consistent styling cape, and identical salon station:`);
    } else {
      lines.push(`Generate exactly one single high-definition image formatted as a 2×2 grid (two rows of two square/editorial panels) ${collageThemeIntro}. Maintain 100% strict identity, hair color, and styling consistency across all 4 frames: identical female client (solitary female in the shop), identical male barber, consistent styling cape or wash draping, and identical salon station:`);
    }
    lines.push('');
    const formatFrameHeader = (frameLabel) => {
      let lbl = frameLabel || 'Salon Scene';
      if(isStool) lbl = sanitizeStool(lbl);
      if(isFemaleModelBarber) lbl = sanitizeGrooming(lbl);
      if(checkState.noMirror){
        lbl = lbl.replace(/client smiling at front wall mirror admiring cut/gi, 'Client Smiling in Styling Chair Admiring Cut')
                 .replace(/front wall mirror\s*/gi, 'styling station ')
                 .replace(/dual-mirror reveal: barber holding oval handheld mirror/gi, 'Rear Silhouette Reveal: Client Evaluating Cut')
                 .replace(/dual-mirror reveal:?/gi, 'Rear Reveal:')
                 .replace(/over-the-shoulder pov mirror reflection of client/gi, 'Over-the-Shoulder Angle Framing Client')
                 .replace(/pov mirror reflection/gi, 'POV Camera Framing')
                 .replace(/mirror reflection/gi, 'direct perspective')
                 .replace(/\bmirror\b/gi, 'styling chair angle');
        lbl = sanitizeMirrorProse(lbl);
        lbl = lbl.replace(/ {2,}/g, ' ').trim();
      }
      return lbl.toUpperCase();
    };

    const getCleanDir = (val, ctx) => {
      let res = getCollageSceneDirective(val, ctx);
      if(isFemaleModelBarber) res = sanitizeGrooming(res);
      if(isSoloClient) res = sanitizeSoloClientCamera(res);
      return isStool ? sanitizeStool(res) : res;
    };
    lines.push(`• FRAME 1 (TOP-LEFT) — ${formatFrameHeader(f1Label)}:\n${getCleanDir(f1Val, collageCtx)}`);
    lines.push('');
    lines.push(`• FRAME 2 (TOP-RIGHT) — ${formatFrameHeader(f2Label)}:\n${getCleanDir(f2Val, collageCtx)}`);
    lines.push('');
    lines.push(`• FRAME 3 (BOTTOM-LEFT) — ${formatFrameHeader(f3Label)}:\n${getCleanDir(f3Val, collageCtx)}`);
    lines.push('');
    lines.push(`• FRAME 4 (BOTTOM-RIGHT) — ${formatFrameHeader(f4Label)}:\n${getCleanDir(f4Val, collageCtx)}`);
    lines.push('');
  } else if(outputType === 'triptych'){
    lines.push('THREE-PANEL EDITORIAL TRIPTYCH PROGRESSION (DYNAMIC 3-FRAME SEQUENCE)');
    const activeClientStageLabel = isStool ? S(values['salonIntimateHairAction']?.label || 'Active hair work') : stageLabel;
    const activeClientStageText = isStool ? stoolActVal : stageText;
    if(isFemaleModelBarber){
      lines.push('Generate a continuous 3-panel horizontal triptych depicting the grooming service progression from left to right, maintaining strict identity and scene consistency across all 3 panels:');
      lines.push(`• PANEL 1 (LEFT) — PRE-SERVICE PREP: Male client draped in ${capeText} at ${venueText}; female model (barber) preparing tools and consulting with her client.`);
      lines.push(`• PANEL 2 (CENTER) — ACTIVE MOMENT: ${stageLabel.toUpperCase()}: Close-up of active grooming: ${stageText} with professional artisan grip, deliberate technique, and focused composure.`);
      lines.push(`• PANEL 3 (RIGHT) — ${checkState.noMirror ? 'FINISHED REVEAL & INSPECTION: Direct styling station view showing the completed grooming service under ' + lightingText + ', with the male client refreshed and our female model reviewing the clean result.' : 'FINISHED MIRROR REVEAL: Mirror perspective showing the completed grooming service under ' + lightingText + ', with the male client refreshed and our female model reviewing the clean result.'}`);
    } else if(isSoloClient){
      lines.push('Generate a continuous 3-panel horizontal triptych capturing the solo client at her styling station from left to right, maintaining strict identity and scene consistency across all 3 panels:');
      lines.push(`• PANEL 1 (LEFT) — INITIAL SEATING: Solo female client draped in ${capeText} sitting peacefully in the styling chair at ${venueText}.`);
      lines.push(`• PANEL 2 (CENTER) — POST-CUT POISE: Medium close-up of the solo client admiring the silhouette of her ${haircutText} with calm expression.`);
      lines.push(`• PANEL 3 (RIGHT) — FINISHED REVEAL: Direct styling station view showcasing her completed ${haircutText} under ${lightingText}.`);
    } else {
      lines.push('Generate a continuous 3-panel horizontal triptych depicting the salon haircut journey from left to right, maintaining strict identity and scene consistency across all 3 panels:');
      lines.push(isStool
        ? `• PANEL 1 (LEFT) — PRE-CUT PREP & SEATING: Client draped in ${capeText} seated on a ${stoolTypeVal} at ${venueText}; male barber (${stylistLabel}) standing closely behind (${stoolProxVal}) sectioning hair.`
        : `• PANEL 1 (LEFT) — PRE-CUT PREP & SECTIONING: Client draped in ${capeText} at ${venueText}; barber (${stylistLabel}) sectioning hair with a black carbon comb and clips.`);
      lines.push(`• PANEL 2 (CENTER) — ACTIVE MOMENT: ${activeClientStageLabel.toUpperCase()}: Close-up of active moment: ${activeClientStageText} on ${haircutText} with professional barber grip, authentic tool mechanics, and proper hair strand tension.`);
      lines.push(`• PANEL 3 (RIGHT) — ${checkState.noMirror ? (isStool ? 'FINISHED REVEAL & INSPECTION: Direct styling station view showing the finished ' + haircutText + ' under ' + lightingText + ', natural strand texture, and client seated on the low stool admiring the balanced result with hair clippings on ' + capeText + '.' : 'FINISHED REVEAL & INSPECTION: Direct styling station view showing the finished ' + haircutText + ' under ' + lightingText + ', natural strand texture, and client admiring the balanced result with hair clippings on ' + capeText + '.') : (isStool ? 'FINISHED MIRROR REVEAL: Front mirror reflection showing the finished ' + haircutText + ' under ' + lightingText + ', natural strand texture, and client seated on the low stool admiring the balanced result with hair clippings on ' + capeText + '.' : 'FINISHED MIRROR REVEAL: Front mirror reflection showing the finished ' + haircutText + ' under ' + lightingText + ', natural strand texture, and client admiring the balanced result with hair clippings on ' + capeText + '.')}`);
    }
    lines.push('');
  } else if(outputType === 'set'){
    const activeClientStageText = isStool ? stoolActVal : stageText;
    lines.push('FOUR-FRAME EDITORIAL PHOTOGRAPHY SET');
    if(isFemaleModelBarber){
      lines.push(`Generate four distinct photographic captures covering the male grooming service: 1) Initial preparation and consultation with the female model at ${venueText}, 2) Macro close-up of active moment: ${stageText} with authentic barber tool grip, 3) Side profile showing the draped cape and precise artisan handwork, ${checkState.noMirror ? '4) Direct station view of the completed grooming service under ' + lightingText + '.' : '4) Frontal mirror perspective of the completed grooming service under ' + lightingText + '.'}`);
    } else if(isSoloClient){
      lines.push(`Generate four distinct photographic captures of the solo female client at ${venueText}: 1) Seated draped in ${capeText}, 2) Macro detail of her finished ${haircutText}, 3) Side profile showing the cape drape, 4) Final reveal under ${lightingText}.`);
    } else {
      lines.push(`Generate four distinct photographic captures covering the salon experience: 1) Consultation and sectioning with ${stylistLabel} at ${venueText}, 2) Macro close-up of active moment: ${activeClientStageText} on ${haircutText} with authentic barber tool grip, 3) Profile angle showing ${capeText} draped with realistic cut hair clippings, ${checkState.noMirror ? (isStool ? '4) Direct stool reveal with completed silhouette under ' + lightingText + '.' : '4) Direct chair reveal with completed silhouette under ' + lightingText + '.') : (isStool ? '4) Frontal mirror reveal with completed silhouette from the stool under ' + lightingText + '.' : '4) Frontal mirror reveal with completed silhouette under ' + lightingText + '.')}`);
    }
    lines.push('');
  } else if(outputType === 'contact'){
    const activeClientStageText = isStool ? stoolActVal : stageText;
    lines.push('SIX-FRAME 35MM FILM CONTACT SHEET SEQUENCE');
    if(isFemaleModelBarber){
      lines.push(`Generate a classic six-frame contact sheet strip chronicling the grooming service from cape fastening with ${capeText}, preparatory lathering or hot towel, active moment: ${stageText}, precision detailing, soothing after-shave or scalp work, ${checkState.noMirror ? 'to final inspection at the chair in ' + venueText + '.' : 'to final mirror inspection in ' + venueText + '.'}`);
    } else if(isSoloClient){
      lines.push(`Generate a classic six-frame contact sheet strip of the solo client seated comfortably in ${venueText}, draped in ${capeText}, showcasing the layered texture and movement of ${haircutText} across six candid poses.`);
    } else {
      const contactFrame2 = (salonHairMoisture === 'dry') ? 'dry sectioning with comb and clips' : 'water spray misting';
      lines.push(`Generate a classic six-frame contact sheet strip chronicling the haircut from cape fastening with ${capeText}, ${contactFrame2}, active moment: ${activeClientStageText}, layer detailing of ${haircutText}, blow-dry styling, ${checkState.noMirror ? (isStool ? 'to final inspection from the low stool in ' + venueText + '.' : 'to final inspection from the styling chair in ' + venueText + '.') : (isStool ? 'to final mirror inspection from the low stool in ' + venueText + '.' : 'to final mirror inspection in ' + venueText + '.')}`);
    }
    lines.push('');
  } else {
    lines.push('HAIRCUT TOOL & ACTION ERGONOMICS');
    if(isFemaleModelBarber){
      lines.push(`When grooming action is depicted, the adult female model acts as the skilled practitioner and barber (${stageText}) with authentic posture, focused artisan concentration, and believable physical ergonomics. The receptive male client is seated or reclining comfortably in the chair. Her hands and body are fully connected with zero floating limbs, executing deliberate professional technique.`);
    } else if(isSoloClient){
      lines.push(`Solo client composition: the female client sits calmly alone in the styling chair draped in ${capeText}, with zero hairstylists or barber hands touching her hair.`);
    } else if(isStool){
      lines.push(`When haircutting action is depicted on the stool, the male barber performs ${stoolActVal} with attentive physical posture standing directly behind her, chest practically touching her back. His arms and body are fully connected to his hands with zero floating limbs, executing deliberate professional technique with authentic salon tools.`);
    } else {
      lines.push(`When haircutting action is depicted, the male barber (${stylistLabel}) performs ${stageText} on ${haircutText} using authentic professional Japanese stainless steel cutting shears (thumb and ring finger in rings, pinky on tang) and a black carbon comb, cutting hair held taut between index and middle fingers. The barber's arms and body must be fully connected to his hands with zero floating limbs.`);
    }
    if(!isSoloClient){
      if(salonHairMoisture === 'wet' && !isExplicitDryStage){
        lines.push('Water droplets bead on the steel blades and comb teeth as heavy soaked hair ribbons cling cleanly between the fingers during cutting tension.');
      } else if(salonHairMoisture === 'damp' && !isExplicitDryStage){
        lines.push('Fine spray-misted droplets catch light on the metal comb and scissor blades while damp strands hold clean cutting tension.');
      } else if(salonHairMoisture === 'dry' && !isExplicitWetStage && !isExplicitWetCut){
        lines.push('Crisp dry strand tension releases loose dry feathery tips cleanly off the steel blades with zero clumping or moisture residue.');
      }
    }
    lines.push('');
  }

  const salonChecks = [];

  if(checkState.identity) {
    if(isFaceHidden){
      salonChecks.push('• Identity & Silhouette Preservation: Faithfully preserve the adult woman from the reference, maintaining her authentic Indian skin tone, body proportions, and hair fiber, while respecting that her face is turned sideways looking away and shielded from the lens.');
    } else if(isSalonFullVeil){
      salonChecks.push('• Identity & Veil Preservation: Maintain her authentic Indian heritage features, skin tone, and hair fiber while keeping ZERO visible eyes, ZERO eyebrows, ZERO nose, or ZERO mouth—95–100% of her face hidden cleanly behind a sleek continuous fine-tooth-combed satin hair sheet matched to her haircut length.');
    } else if(isSalon80_85){
      salonChecks.push('• Identity & Shield Preservation: Maintain her authentic Indian heritage features, skin tone, and lower-chin texture with ZERO visible eyeballs/eyebrows/forehead—80–85% of her upper face cleanly hidden behind a sleek fine-tooth-combed satin hair sheet matched to her haircut length.');
    } else if(isSalon65_70){
      salonChecks.push('• Identity & Deep Veil Preservation: Maintain her authentic Indian heritage features, skin tone, and hair fiber while keeping forehead, both eyebrows, nose bridge, and one full eye 100% hidden behind a sleek fine-tooth-combed satin sweep + 3/4 chin dip.');
    } else if(salonVeilTier === '50' || salonVeilTier === '40_45'){
      salonChecks.push('• Identity & Half-Veil Preservation: Faithfully preserve her recognizable features on the exposed lower face and single uncovered eye while keeping the covered eye 100% hidden behind a continuous sleek glossy diagonal hair sheet matched to her haircut length.');
    } else {
      salonChecks.push('• Facial Identity Preservation: Faithfully preserve the recognizable facial structure, natural eye shape, jawline, and adult features of the reference woman; zero facial drift or face replacement.');
    }
  }
  if(hasSalonObfusc){
    salonChecks.push('• Face Privacy & Concealment: Apply strict face privacy (' + (values.salonFaceObfuscMode?.label || salonObfuscMode) + ')—facial features must remain concealed per chosen obfuscation method with zero clear identity portraits.');
  }
  if(checkState.skin) {
    salonChecks.push('• Authentic Skin Texture: Visible micro-pores, natural skin luster, authentic facial asymmetry; zero plastic airbrushing or digital doll smoothing.');
  }
  if(checkState.body) {
    if(isFemaleModelBarber){
      salonChecks.push('• Female Model Artisan Posture: Believable standing or leaning posture of the female model as she works around the chair, authentic spinal ergonomics, and focused concentration.');
      salonChecks.push(`• Female Barber Haircut Execution: Explicitly render the female model with her selected signature haircut (${values.salonHaircut?.label || 'selected cut'} — ${haircutText}), ensuring her haircut silhouette, length, and layered movement are unmistakably distinct.`);
    } else if(isStool){
      salonChecks.push('• Realistic Seated Stool Posture & Anatomy: Believable seated posture on a low backless stool, natural spinal drape, relaxed shoulders, and convincing physical contact and proximity between the male barber standing directly behind her and the female client.');
    } else {
      salonChecks.push('• Natural Seated Posture: Realistic seated posture in the hydraulic barber chair, natural shoulder slope, and believable body proportions.');
    }
  }
  if(checkState.skinTone) {
    salonChecks.push('• Consistent Skin Tone: Authentic skin undertones consistent with the reference image under the venue ambient lighting.');
  }
  if(checkState.hairStrands) {
    if(salonHairMoisture === 'wet' && !isExplicitDryStage) {
      salonChecks.push('• Soaked Hair Strand Physics: Heavy saturated wet strand separation, glossy water-clumped hair ribbons clinging smoothly around temples and hairline, and zero fluffy flyaways.');
    } else if(salonHairMoisture === 'damp' && !isExplicitDryStage) {
      salonChecks.push('• Damp Hair Strand Physics: Cleanly aligned damp hair strands held taut, subtle translucent moisture luster along temples and parting line, controlled natural density.');
    } else {
      salonChecks.push('• Fine Hair Strand Physics: Distinct individual hair strands, natural parting line, delicate micro-flyaways at the temples and hairline, airy organic volume.');
    }
  }
  if(checkState.hairTexturePreserve || preserveHairTexture) {
    if(isFemaleModelBarber){
      salonChecks.push("• Hair Texture Integrity: Maintain our female model's authentic natural Indian hair fiber, natural density, and organic shine, alongside authentic hair texture for the male client.");
    } else {
      salonChecks.push("• Hair Texture Integrity: Maintain the client's authentic natural Indian hair fiber, natural density, and organic behavior without artificial smoothing or mismatched texture.");
    }
  }
  if(checkState.fabric) {
    if(isFemaleModelBarber){
      salonChecks.push("• Realistic Cape & Fabric Behavior: Authentic draping folds of the cutting cape across the male client's chest and shoulders, crisp crêpe paper neck strip, snap fasteners, and natural drape.");
    } else {
      salonChecks.push('• Realistic Cape & Fabric Behavior: Authentic draping folds of the cutting cape, crisp crêpe paper neck strip, snap fasteners, and believable fabric tension across shoulders.');
    }
  }

  // Strict Solitary Female Model & Exclusive Male Staff / Solo Safeguard:
  if(isFemaleModelBarber){
    salonChecks.push('• Exclusive Solitary Female Model & Male Client/Staff: The adult female model from the reference is strictly and exclusively the ONLY woman in the scene, acting as the skilled barber/groomer. The client in the chair and any secondary shop patrons or staff must strictly be male; zero other women in frame.');
  } else if(isSoloClient){
    salonChecks.push('• Exclusive Solo Female Client: The adult female client seated in the chair is strictly alone with zero stylists, barbers, or extra hands touching her hair.');
  } else {
    salonChecks.push(isStool
      ? '• Exclusive Male Staff & Solitary Female Client: The client seated on the stool is the solitary female subject. All barbers, stylists, apprentices, and secondary shop patrons must be male; zero other women in frame.'
      : '• Exclusive Male Staff & Solitary Female Client: The client in the styling chair is the solitary female subject. All barbers, stylists, apprentices, and secondary shop patrons must be male; zero other women in frame.');
  }

  if(checkState.hands) {
    if(isFemaleModelBarber){
      salonChecks.push("• Female Barber Tool Ergonomics & Anatomy: The female model's hands must always connect naturally to visible wrists, forearms, arms, and torso (zero floating hands, zero disembodied limbs). Professional tool grip with deliberate artisan technique.");
      salonChecks.push('• Receptive Male Client Posture: Natural seated or reclining posture of the male client in the hydraulic chair, relaxed neck, and calm receptive composure.');
    } else if(isSoloClient){
      salonChecks.push("• Solo Client Anatomy: Natural relaxed hand posture tucked neatly beneath or resting calmly beside the cape with zero third-party hands in frame.");
    } else if(isStool){
      salonChecks.push("• Professional Barber Tool Ergonomics & Anatomy: The male barber's hands must always connect naturally to visible wrists, forearms, arms, and torso (zero floating hands, zero disembodied limbs). Professional haircutting shears held with precision, cutting hair held taut between fingers with natural body proximity and authentic posture.");
    } else {
      salonChecks.push("• Professional Barber Tool Ergonomics & Anatomy: The male barber's hands must always connect naturally to visible wrists, forearms, arms, and torso (zero floating hands, zero disembodied limbs). Professional haircutting scissors held strictly with traditional barber grip (thumb in moving ring, ring finger in still ring, pinky resting on tang), shears cutting hair held taut between index and middle fingers.");
    }
  }

  if(checkState.lightingReal) {
    const bulbSource = checkState.noMirror ? 'overhead studio troffers and vanity bulb strips' : 'overhead studio troffers and vanity mirror bulb strips';
    const hairLightSpec = (salonHairMoisture === 'wet' && !isExplicitDryStage)
      ? 'crisp liquid specular highlights on drenched hair ribbons and wet skin'
      : (salonHairMoisture === 'dry' && !isExplicitWetStage && !isExplicitWetCut)
        ? 'soft diffused luster across dry blown-out hair strands and brushed chrome scissor blades'
        : 'realistic specular highlights on damp hair strands and scissor blades';
    salonChecks.push(`• Believable Salon Lighting Physics: Coherent illumination from ${bulbSource}, ${hairLightSpec}, soft authentic shadow falloff under chin and cape.`);
  }
  if(checkState.livedIn) {
    if(isFemaleModelBarber){
      salonChecks.push("• Authentic Lived-in Barbershop Atmosphere: Fine cut hair clippings scattered across the male client's draped cape and vinyl floor around the chair base, Barbicide jars, and authentic background depth.");
    } else {
      salonChecks.push(isStool
        ? '• Authentic Lived-in Salon Atmosphere: Fine cut hair clippings scattered across the draped cape and vinyl floor around the stool base, Barbicide jars, and authentic background depth.'
        : '• Authentic Lived-in Salon Atmosphere: Fine cut hair clippings scattered across the draped cape and vinyl floor around the chair base, Barbicide jars, and authentic background depth.');
    }
  }
  if(checkState.noMirror) {
    if(isFemaleModelBarber){
      salonChecks.push('• Direct Styling Perspective: Frame the female barber and seated male client directly with direct lens framing and zero secondary glass surfaces.');
    } else if(isStool){
      salonChecks.push('• Direct Stool Perspective: Frame the client directly on the low stool with direct lens framing and zero secondary glass surfaces.');
    } else {
      salonChecks.push('• Direct Chair Perspective: Frame the client directly in the styling chair with direct lens framing and zero secondary glass surfaces.');
    }
  }
  if(checkState.candid) {
    if(hideEyes){
      salonChecks.push('• Candid Documentary Realism: Natural unforced composure, candid in-between salon moment, and authentic serene posture.');
    } else if(isSoloClient){
      salonChecks.push('• Candid Documentary Realism: Natural unforced expression, candid quiet moment at the styling station, and relaxed solitary posture.');
    } else if(isFemaleModelBarber){
      salonChecks.push('• Candid Documentary Realism: Natural unforced expression, candid in-between grooming moment, authentic practitioner-client interaction and posture.');
    } else {
      salonChecks.push('• Candid Documentary Realism: Natural unforced expression, candid in-between haircut moment, authentic client-barber interaction and posture.');
    }
  }

  const hasWashOrSprayPanel = (outputType === 'collage') && [f1Val, f2Val, f3Val, f4Val].some(s => 
    ['shampoo_basin', 'scalp_massage_rinse', 'towel_turban_dry', 'spray_misting'].includes(s)
  );

  if(salonHairMoisture === 'dry') {
    if(hasWashOrSprayPanel || isExplicitWetStage || isExplicitWetCut) {
      salonChecks.push('• Transitional Moisture Physics: Crisp dry styling and natural strand movement on finished dry sections alongside localized damp prep / misting droplets where depicted.');
    } else {
      salonChecks.push('• Dry Hair Physics: Lightweight individual hair strand movement, airy crown volume, soft natural flyaways, and zero moisture clumping.');
    }
  } else if(salonHairMoisture === 'wet' && !isExplicitDryStage) {
    salonChecks.push('• Soaked Wet-Look Aquatic Physics: Thoroughly water-drenched hair hanging heavy and dark with liquid specular sheen, soaked slicked roots against scalp, and glistening water droplets trailing onto skin and cape.');
  } else if(salonHairMoisture === 'wet' && isExplicitDryStage) {
    salonChecks.push('• High-Moisture Wash-to-Style Physics: Freshly washed soaked hair sections transitioning under localized thermal shaping along the ends with glossy luster.');
  } else {
    salonChecks.push("• Water Spray & Damp Physics: Fine glistening water droplets clinging to hair fibers, believable damp strand tension between fingers, and authentic non-plastic misted sheen.");
  }

  lines.push('REALISM, IDENTITY & PHYSICAL SAFEGUARDS');
  if(salonChecks.length){
    lines.push(salonChecks.join('\n'));
  } else {
    lines.push('• Maintain natural salon realism, consistent identity, and believable physical haircut behavior.');
  }
  lines.push('');

  if(customDirection.trim()){
    lines.push('ADDITIONAL CREATIVE DIRECTION');
    lines.push(customDirection.trim());
    lines.push('');
  }

  lines.push('AVOID / NEGATIVE GUIDANCE');
  const primaryExclusion = isFemaleModelBarber
    ? 'male barber cutting female hair, female client seated in chair, woman in salon cape, female customer in cutting chair, secondary woman in shop, female customers in neighboring chairs, other women, multiple women in frame'
    : 'female barber, woman hairdresser, female stylist, female assistant, secondary woman in shop, female customers in neighboring chairs, other women, multiple women in frame';

  const needsClippers = /(clipper|trimmer|undercut|shaved-nape|buzz)/i.test(stageCheckBlob + ' ' + hairCheckBlob);
  const salonNegatives = [
    primaryExclusion,
    'cartoon, anime, 3d render, CGI plastic skin, doll-like hair',
    'floating hands, disembodied hands, hands without body, hands detached from arms, phantom limbs, third hand',
    'deformed scissors, melted shears, backwards scissors, giant shears, fused scissors and comb, hybrid grooming tools, mutant styling gadgets, scissors with extra blades, missing scissor finger rings, crooked blades',
    isFemaleModelBarber
      ? 'female client getting hair cut, woman draped in cape in chair, messy cut, razor cuts or bleeding'
      : (needsClippers
          ? 'accidental uneven scalp patches, clumsy gouged buzz, ruined crown length'
          : 'clippers cutting long female hair, buzzing hair off clumsily, electric trimmer disaster'),
    'extra fingers, missing fingers, malformed knuckles, fused fingers, backwards thumbs',
    'floating hair clips, missing salon cape, unfastened neck strip, floating combs',
    'warped mirrors, distorted mirror reflections, duplicated faces in glass, impossible reflective geometry',
    'over-airbrushed skin, waxy plastic sheen, heavy beauty retouching, fake studio glamour glow'
  ];

  if(isSoloClient){
    salonNegatives.push('barber standing beside chair, hair stylist hands touching hair, second person beside chair');
  }
  if(isFaceHidden){
    salonNegatives.push('visible face, front facial view, frontal eyes, open direct eye contact, revealing hidden face, artificial frontal facial features');
  }
  const salonObfuscNegs = getObfuscNegatives(salonObfuscMode);
  if(salonObfuscNegs.length){
    salonNegatives.push(...salonObfuscNegs);
  }
  if(salonVeilRuleObj?.neg){
    salonNegatives.push(salonVeilRuleObj.neg);
  }
  if(checkState.noMirror) salonNegatives.push('mirrors, mirror reflections, duplicated faces, reflective glass distortion');
  if(checkState.retouch) salonNegatives.push('airbrushed skin, waxy skin, heavy beauty filters, CGI plastic sheen');
  if(checkState.hairTexturePreserve || preserveHairTexture) salonNegatives.push('altered ethnic hair texture, synthetic straightener sheen, doll-like artificial hair');
  if(checkState.hands) salonNegatives.push('extra fingers, malformed hands, floating scissors, distorted barber grip, disembodied hands');
  if(salonHairMoisture === 'dry') {
    if(hasWashOrSprayPanel || isExplicitWetStage || isExplicitWetCut) {
      salonNegatives.push('greasy hair, artificial oily sheen, completely soaked waterlogged blowout');
    } else {
      salonNegatives.push('wet hair, damp hair, dripping hair, soaked clumps, slicked-down wet scalp, water sheen, oily sheen');
    }
  } else if(!isExplicitDryStage) {
    if(salonHairMoisture === 'wet') {
      salonNegatives.push('dry hair, blown-out volume, airy fluffy ends, static flyaways, dry puffy crown, dry un-clumped strands, merely lightly misted dry-looking hair, cottony dryness');
    } else {
      salonNegatives.push('completely dry fluffy hair, static flyaways, dry blown-out volume, frizzy dryness');
    }
  }
  if(checkState.waterReal) salonNegatives.push('artificial plastic gloss, greasy shine, floating water blobs');
  if(checkState.noText) salonNegatives.push('text overlays, salon logos, graphic watermarks, typography');
  if(extraNegative.trim()) salonNegatives.push(extraNegative.trim());

  const dedupedNegs = dedupeNegatives(salonNegatives);
  lines.push(dedupedNegs.map(x=>'• '+x).join('\n'));

  save();
  const text = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  el('prompt').value = text; el('prompt').textContent = text;
  const words = text.trim().split(/\s+/).length;
  const tokens = estimateTokens(text);
  el('wordCount').textContent = `${words.toLocaleString()} words · ${text.length.toLocaleString()} chars · ~${tokens.toLocaleString()} tokens · Salon Mode`;

  const summaryIds = isFemaleModelBarber
    ? ['mode', 'salonVenue', 'salonTime', 'salonStage', 'salonBarberPose', 'salonHaircut', 'salonFaceHairCoverage', 'salonClipperGuard', 'salonCape', 'salonCamera']
    : (isStool
      ? ['mode', 'salonVenue', 'salonTime', 'salonStoolType', 'salonBarberProximity', 'salonIntimateHairAction', 'salonStoolModelPosture', 'salonHaircut', 'salonFaceHairCoverage', 'salonClipperGuard', 'salonCape', 'salonCamera']
      : ['mode', 'salonVenue', 'salonTime', 'salonStage', 'salonChairPose', 'salonStylist', 'salonExpression', 'salonHaircut', 'salonFaceHairCoverage', 'salonClipperGuard', 'salonCape', 'salonCamera']);
  if(hasSalonObfusc){
    const covIdx = summaryIds.indexOf('salonFaceHairCoverage');
    if(covIdx >= 0) summaryIds.splice(covIdx + 1, 0, 'salonFaceObfuscMode');
  }
  const summaryTags = summaryIds
    .filter(id => fields[id] && values[id])
    .map(id => `<span class="summary-tag" title="${fields[id].label}: ${val(id).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${fields[id].label}: ${values[id].label}</span>`);
  const moistureLabels = { dry: 'Dry & Blown-out', damp: 'Damp / Misted', wet: 'Soaked Wet' };
  summaryTags.splice(6, 0, `<span class="summary-tag" title="Hair moisture state: ${moistureLabels[salonHairMoisture] || 'Damp'}">Moisture: ${moistureLabels[salonHairMoisture] || 'Damp'}</span>`);
  el('summary').innerHTML = summaryTags.join('');
  return text;
}


function buildPrompt(){
if(currentStudioMode==='salon'){return buildSalonPrompt();}
const selected=Object.values(values);
const S = t => (checkState.noMirror && typeof sanitizeMirrorProse === 'function') ? sanitizeMirrorProse(t) : t;
const hasMalePresence = values.malePresence && values.malePresence.text !== 'solo' && values.maleInteraction && values.maleInteraction.text !== 'none';
const isFemaleGroomingMen = hasMalePresence && values.malePresence.text === 'female_grooming_men';

const angleObj = values['angle'];
const poseObj = values['pose'];
const gestObj = values['gesture'];
const gazeObj = values['gaze'];
const angleStr = (angleObj?.label || '') + ' ' + (val('angle') || '');
const poseStr = (poseObj?.label || '') + ' ' + (val('pose') || '');
const gestStr = (gestObj?.label || '') + ' ' + (val('gesture') || '');
const gazeStr = (gazeObj?.label || '') + ' ' + (val('gaze') || '');
const isFaceHidden = /shield\w*.*face|conceal\w*.*face|face.*hidden|hid\w*.*face|touching temple|face.*not visible|face.*turned away|turned.*looking away|gazing away|gaze.*away|turned.*away|sideways.*away|gazing.*distance/i.test(angleStr) ||
                     /shield\w*.*face|conceal\w*.*face|face.*hidden|hid\w*.*face|touching temple|face.*not visible|face.*turned away|turned.*looking away|gazing away|gaze.*away|turned.*away|sideways.*away|gazing.*distance/i.test(poseStr) ||
                     /shield\w*.*face|conceal\w*.*face|face.*hidden|hid\w*.*face|touching temple/i.test(gestStr) ||
                     /face.*hidden|hid\w*.*face|face.*not visible/i.test(gazeStr);
const psObfuscMode = values.faceObfuscMode?.text || 'none';
const hasPsObfusc = (psObfuscMode !== 'none' && psObfuscMode !== 'hair_veil');
const psFaceCovVal = val('hairFaceCoverage') || '';
const psFaceCovLabel = values['hairFaceCoverage']?.label || '';
const psTier = parseVeilTier(psFaceCovLabel);
const isZeroVeil = (psTier === '0');
const isPs95_100 = (psTier === '95_100');
const isPs80_85 = (psTier === '80_85');
const isPs65_70 = (psTier === '65_70');
const isFullVeil = isPs95_100;
const isHeavyVeil = isPs80_85 || isPs95_100;
const isDeepOrHeavyVeil = isPs65_70 || isHeavyVeil;
const hideEyes = isFaceHidden || isDeepOrHeavyVeil || hasPsObfusc;

const checks=[];
if(hasPsObfusc){
  checks.push(`Apply strict face privacy (${values.faceObfuscMode?.label || psObfuscMode}): facial features must remain concealed per chosen obfuscation method with zero clear identity portraits.`);
}
if(checkState.identity){
  if(isFaceHidden){
    checks.push('Preserve the same adult woman from the supplied reference, retaining her warm Indian skin tone, body proportions, and hair fiber while respecting that her face is turned sideways looking away and not visible to the lens.');
  } else if(isFullVeil){
    checks.push('Preserve the same adult woman from the supplied reference, retaining her warm Indian skin tone, body proportions, and hair fiber with ZERO visible eyes, brows, nose, or lips—95–100% of her face hidden cleanly behind a sleek continuous fine-tooth-combed satin hair sheet matched strictly to her haircut length + 3/4 chin-tucked poise.');
  } else if(isPs80_85){
    checks.push('Preserve the same adult woman from the supplied reference, retaining her warm Indian skin tone and lower-chin/lip texture with ZERO visible eyeballs/pupils/eyebrows—80–85% of her upper face hidden behind a sleek fine-tooth-combed satin hair sheet matched to her haircut length + slight chin dip.');
  } else if(isPs65_70){
    checks.push('Preserve the same adult woman from the supplied reference, retaining her warm Indian skin tone and lower-cheek texture while keeping forehead, both eyebrows, nose bridge, and one full eye 100% hidden behind a sleek fine-tooth-combed satin sweep + 3/4 chin dip.');
  } else if(psTier === '50' || psTier === '40_45'){
    checks.push('Preserve the same adult woman from the supplied reference through her exposed lower face and single uncovered eye, while keeping the covered eye 100% hidden behind a continuous sleek glossy diagonal hair sheet matched strictly to her haircut length.');
  } else {
    checks.push('Preserve the same adult woman from the supplied reference, retaining her recognizable facial identity and features; do not replace her with another person or introduce identity drift.');
  }
}
if(hasMalePresence){
  checks.push('Strictly feature ONLY one woman in the image—she is the solitary female model. All colleagues, co-models, hair stylists, makeup artists, wardrobe assistants, and groomers interacting with her must strictly be male (completely exclude any secondary women or female background subjects).');
} else if(checkState.soloSubject || (styleRef && transferToggles && transferToggles.hair) || styleRef){
  checks.push('Strictly feature ONLY the single solo female subject in the image; completely exclude any hairdresser, hair stylist, man working on hair, salon staff, stylist hands touching hair, or secondary person from reference photos.');
}
if(checkState.skin)checks.push('Keep natural skin texture, visible pores, realistic facial asymmetry and fine details; no waxy or airbrushed skin.');
if(checkState.body)checks.push('Preserve her natural body proportions; do not slim, reshape or exaggerate anatomy.');
if(checkState.skinTone)checks.push('Keep skin tone consistent with the reference image and maintain believable colors.');
const psFullHairDesc = S(getFullHairDescription());
const psIsExplicitWetHair = /\bwet\b|\bdamp\b|hydro|ocean-soaked|drenched|post-swim|wet-look/i.test((values.hair?.label || '') + ' ' + psFullHairDesc);
if(checkState.hairStrands){
  if(isDeepOrHeavyVeil){
    checks.push('Render a continuous, smooth, fine-tooth-combed glossy satin sheet over the covered facial zone with zero thin patchy skin gaps and zero separated wet spaghetti strings over the mouth.');
  } else if(photoHairMoisture === 'wet'){
    checks.push('Soaked Hair Strand Physics: Heavy saturated wet strand separation, glossy water-clumped hair ribbons clinging smoothly around temples and hairline, and zero fluffy flyaways.');
  } else if(photoHairMoisture === 'damp'){
    checks.push('Damp Hair Strand Physics: Cleanly aligned damp hair strands with subtle translucent moisture luster along temples and parting line.');
  } else {
    checks.push('Render individual hair strands, believable volume, natural movement and subtle flyaways.');
  }
}
if(checkState.hairTexturePreserve || preserveHairTexture)checks.push('Strictly preserve the reference subject\'s natural organic hair texture, authentic strand density, natural fiber thickness, and organic straight-to-subtle-wave behavior; do not alter her natural hair texture into synthetic curls, artificial waves, or heavy blowout distortion.');
if(checkState.fabric)checks.push('Render realistic fabric weight, stitching, folds, seams, fit and garment behavior.');
if(checkState.hands)checks.push('Keep hands, fingers and anatomy believable with natural hand placement.');
if(checkState.lightingReal)checks.push('Maintain consistent, physically believable lighting, reflections, shadows and highlights.');
if(checkState.waterReal && (photoHairMoisture !== 'dry' || psIsExplicitWetHair))checks.push('Authentic water droplets, believable wet hair clumping, and damp fabric saturation; realistic physics without artificial plastic gloss.');
if(checkState.retouch)checks.push('Avoid excessive beauty retouching, plastic skin, synthetic gloss and artificial filters.');
if(checkState.accessoryKeep)checks.push('Retain signature reference accessories when visible and requested, such as glasses, a nose ring or recognizable jewelry.');
if(checkState.backgroundReal)checks.push('Use plausible environmental details and a lived-in scene rather than generic or artificial background elements.');
if(checkState.noMirror)checks.push('Avoid mirrors and reflection-heavy surfaces; do not create duplicate or inaccurate reflections.');
if(checkState.noText)checks.push('No text overlays, logos, graphic labels or watermarks.');
if(checkState.candid)checks.push('Keep body language and expression candid, natural and spontaneous rather than stiffly staged.');

const mode=val('mode');
const outputText={
  single:(checkState.soloSubject || styleRef)
    ? (hasMalePresence
        ? 'Create one finished photorealistic image featuring the female model with the specified male co-star / crew interaction (she is strictly the solitary woman in the frame).'
        : 'Create one finished photorealistic image featuring strictly one solo female subject with zero other people, no hairstylist, and no hands in her hair.')
    : (hasMalePresence
        ? 'Create one finished photorealistic image featuring the female model with the specified male co-star / crew interaction (solitary female model rule).'
        : 'Create one finished photorealistic image.'),
  collage: hasMalePresence
    ? 'Create one 2×2 collage with four clearly distinct poses and interaction moments. Keep the same female model, her haircut, outfit, color grade and male colleague / crew consistent across all four panels (she is strictly the solitary woman in all frames, zero secondary women).'
    : 'Create one 2×2 collage with four clearly distinct poses and expressions. Keep the same single woman, haircut, outfit, color grade and overall scene consistent across all four panels (strictly solo female subject in all frames, no secondary person or stylist).',
  set: hasMalePresence
    ? 'Create four separate photorealistic images with different poses and interaction angles. Keep the same female model, haircut, outfit and male co-star / crew styling consistent across the set (solitary female model rule: zero secondary women).'
    : 'Create four separate photorealistic images with different poses and expressions. Keep the same single woman, haircut, outfit and overall visual styling consistent across the set (solo female subject only).',
  triptych: hasMalePresence
    ? 'Create one three-panel editorial triptych with three distinct candid interaction moments; maintain continuity of identity, hairstyle, outfit and male colleague / crew presence across panels (solitary female model rule: zero secondary women).'
    : 'Create one three-panel editorial triptych with three distinct candid poses; maintain continuity of identity, hairstyle, outfit and setting across panels (solo female subject only).',
  contact: hasMalePresence
    ? 'Create one six-frame contact sheet with varied candid interaction moments and expressions; maintain the same identity, hairstyle, outfit, setting and male co-star / crew in every frame (solitary female model rule: zero secondary women).'
    : 'Create one six-frame contact sheet with varied candid poses and facial expressions; maintain the same identity, hairstyle, outfit, setting and mood in every frame (solo female subject only).'
}[outputType];

const detail=detailLevel||'full';
const lines=[];

lines.push(mode.startsWith('Edit') ? 'REFERENCE-IMAGE EDIT · BOLD POST-MAKEOVER PHOTOSHOOT' : 'REFERENCE-GUIDED PORTRAIT · BOLD POST-MAKEOVER PHOTOSHOOT');
lines.push('');
const psHairArch = detectHairArchitecture(values.hair, S(getFullHairDescription()));
const psVeilRuleObj = getVeilRule(psTier, psHairArch);

lines.push('PRIMARY SUBJECT (REFERENCE IMAGE):');
lines.push('• Strictly preserve the adult woman from the reference image as the primary model.');
const psObfuscClause = buildObfuscClause(psObfuscMode, psHairArch);
if(psObfuscClause){
  lines.push('• ' + psObfuscClause);
}
if(isFaceHidden){
  lines.push('• Maintain her authentic Indian heritage features, warm skin tone, natural hair texture, and silhouette while respecting that her face is turned sideways looking away and not visible to the lens.');
} else if(isFullVeil){
  lines.push('• Maintain her authentic Indian heritage features, warm skin tone, hair density, and silhouette while keeping 95–100% of her face (forehead, eyes, nose) frontally veiled behind a continuous, sleek, fine-tooth-combed glossy hair veil matched strictly to her haircut length + chin-tucked poise (ZERO visible eyes, ZERO eyebrows, ZERO nose, ZERO mouth).');
} else if(isPs80_85){
  lines.push('• Maintain her authentic Indian heritage features, warm skin tone, hair density, and lower-chin/lip skin texture while hiding 80–85% of her upper face—ZERO visible eyeballs, ZERO pupils, ZERO eyebrows, ZERO bare forehead—beneath a continuous, fine-tooth-combed glossy front hair sheet matched to her haircut length + slight chin dip.');
} else if(isPs65_70){
  lines.push('• Maintain her authentic Indian heritage features, warm skin tone, and hair density while hiding ~65–70% of her face (forehead, both eyebrows, nose bridge, and one full eye 100% unseen; zero open wide eyes) behind a sleek fine-tooth-combed satin sweep + 3/4 chin dip.');
} else if(psTier === '50' || psTier === '40_45'){
  lines.push('• Retain her recognizable Indian heritage identity on her exposed lower face and single uncovered eye, while keeping the opposite eye 100% hidden (ZERO covered eyeball visible) behind a continuous, sleek, fine-tooth-combed diagonal hair wave matched strictly to her haircut length.');
} else {
  lines.push('• Retain her recognizable facial identity, Indian heritage facial structure, natural eye shape, and realistic skin texture with visible pores.');
}
if(psVeilRuleObj?.primary){
  lines.push(psVeilRuleObj.primary);
}
lines.push('• Strictly preserve her authentic natural Indian hair strand density and texture.');
if(photoHairMoisture === 'wet'){
  lines.push("• Mandatory Soaked Wet Hair Physics: The female model's hair is thoroughly water-soaked and dripping wet—heavy dark wet hair ribbons clinging flush against her scalp, temples, cheeks, and neck with glistening aquatic water sheen and zero dry fluffy flyaways.");
} else if(photoHairMoisture === 'damp'){
  lines.push('• Damp Hair Physics: Evenly misted damp hair texture with fine translucent water droplets catching light and softly clumped strand separation.');
} else if(!psIsExplicitWetHair){
  lines.push('• Dry Blown-Out Hair Physics: Completely dry, freshly blown-out airy hair with natural bounce, lightweight separation, and zero water dampness or wet clumping.');
}
lines.push('');
lines.push('CREATIVE INTENT');
if(isFemaleGroomingMen){
  lines.push(`${mode}. Capture the same adult woman as the active barber/grooming practitioner attending to a seated male client with artisan poise and authentic editorial realism (she is strictly the solitary woman in the frame). Overall attitude: ${val('mood')}.`);
} else {
  lines.push(`${mode}. Capture the same adult woman just after her makeover, during a bold, confident, candid fashion photoshoot. Overall attitude: ${val('mood')}.${hasMalePresence ? ' The shoot features dynamic interactions with her male colleague / creative crew while strictly maintaining her as the sole woman in the frame.' : ''} Make it feel like a genuine moment between poses, with confident energy and natural personality.`);
}
lines.push('');
lines.push('MAKEOVER MOMENT');
let moVal = S(val('makeover'));
if(hasMalePresence && (values.malePresence.text === 'crew_prep' || values.malePresence.text === 'bts_shaving')){
  const isCustomInProgressMo = /in-progress|mid-makeover|mid-cut|live |between-|duckbill|butterfly|damp|wisps|comb|razor-feathered|flat-iron|blowout/i.test(moVal);
  moVal = isCustomInProgressMo
    ? `${moVal}; active backstage crew styling & grooming preparation on set`
    : 'the female model is in the midst of an authentic backstage beauty and grooming prep session just before her high-fashion shoot';
} else if(isFemaleGroomingMen){
  moVal = 'the adult female model is captured in an intimate, artisan grooming and pampering session as the active practitioner shaving, detailing, or performing soothing massage on her seated male partner';
} else if(!hasMalePresence && ((styleRef && transferToggles && transferToggles.hair) || checkState.soloSubject)){
  if(moVal.includes('stylist') || moVal.includes('styling chair')){
    moVal = 'the sleek post-makeover haircut has just been completed, showcasing her finished salon styling with a confident, candid reaction as a solo subject';
  }
}
lines.push(moVal + '.');
lines.push('');
lines.push('HAIR AND BEAUTY');
const textureDirective = (preserveHairTexture || (values.hairTexture && values.hairTexture.label.includes('Preserve original')))
  ? "strictly preserve the subject's authentic natural organic hair texture, natural strand thickness, strand density, realistic straight-to-softly-tapered blowout curve, and authentic hair fiber behavior from the reference image (no artificial curls, synthetic straightener, perm, or texture alteration)"
  : (val('hairTexture') || "natural hair texture with realistic strand separation");

const psMakeupSafe = sanitizeMakeupForVeil(val('makeup'), psTier);
const hasActiveHeavyVeil = ['25_30','40_45','50','65_70','80_85','95_100'].includes(psTier);

if(styleRef && transferToggles && transferToggles.hair){
  const rawBlueprint = "authentic salon-styled mid-height ponytail with softly rounded crown and natural scalp volume; delicate arched bottleneck curtain bangs parted at the center hairline with brow-grazing wispy strands curving gracefully outward around the temples to frame the cheekbones with piecey separation; side hair combed smoothly back and tucked behind the ears; ponytail anchored at the mid-occipital back of the head into a relaxed mid ponytail with a straight-to-softly-tapered tail falling flush against the nape of the neck just above the shoulders with soft tousled ends; 100% authentic natural silky-fine Indian hair texture with organic strand separation and healthy sheen";
  const hairBlueprint = sanitizeHairForVeil(rawBlueprint, psTier);
  lines.push(`Hairstyle: ${hairBlueprint}.${psFaceCovVal ? ' Face-behind-hair veil: ' + psFaceCovVal + '.' : ''} Finished solo hairstyle with zero hairdresser, stylist, or hands touching her hair. Hair texture: ${textureDirective}. Hair color: ${val('hairColor')}. Finish: ${val('hairFinish')}. Makeup: ${psMakeupSafe}.`);
} else {
  const psHairDesc = sanitizeHairForVeil(psFullHairDesc, psTier);
  const psMoistureClause = (photoHairMoisture === 'wet')
    ? ' Hair moisture: thoroughly water-soaked dripping wet hair with liquid specular sheen and heavy clumped ribbons.'
    : (photoHairMoisture === 'damp')
      ? ' Hair moisture: evenly spray-misted damp strands with fine droplets and cool sheen.'
      : (!psIsExplicitWetHair ? ' Hair moisture: completely dry, airy, blown-out strands with zero wet clumping.' : '');
  const psHairLine = `Hairstyle: ${psHairDesc}.${psFaceCovVal ? ' Face-behind-hair veil: ' + psFaceCovVal + ' (preserve back haircut length and silhouette intact).' : ''}${psMoistureClause} Hair texture: ${textureDirective}. Hair color: ${val('hairColor')}. Finish: ${val('hairFinish')}. Makeup: ${psMakeupSafe}. Make the haircut immediately readable, with a convincing silhouette, realistic strand separation, natural volume and movement.`;
  lines.push(psHairLine);
}

if(psFaceCovVal && psTier !== 'auto' && (!(styleRef && transferToggles && transferToggles.hair) || hasActiveHeavyVeil)){
  const strictEnforce = psVeilRuleObj?.strict || '';
  lines.push('');
  lines.push('HAIR VEIL DIRECTIVE (MANDATORY — STRICT FACIAL COVERAGE ENFORCEMENT):');
  lines.push(`• Selected Tier: ${psFaceCovLabel}`);
  lines.push(`• Drape & Coverage: ${psFaceCovVal}`);
  lines.push(`• Strict Enforcement: ${strictEnforce}`);
  lines.push(`• Silhouette Integrity: Strictly keep the chosen haircut (${values.hair?.label || 'selected style'}) authentic in length, crown, and shape—integrate this cohesive veil cleanly without spawning mismatched loose strings.`);
  lines.push('');
}
lines.push('');
lines.push('WARDROBE AND STYLING');
let outfitSummary = '';
if(wardrobeMode === 'separates'){
  const topText = val('topPiece') || 'a minimalist white ribbed racerback crop tank top';
  const bottomText = val('bottomPiece') || 'high-waisted vintage wash denim cutoff shorts';
  const waistText = val('midriffStyling') || 'bare midriff with natural skin texture & subtle tone';
  const fitText = val('outfitFit');
  const accText = val('accessories');
  outfitSummary = `a modern two-piece separates ensemble featuring ${topText} paired with ${bottomText}, with ${waistText}`;
  lines.push(`Outfit: ${outfitSummary}. Garment fit: ${fitText}. Accessories: ${accText}. Let the wardrobe feel bold, fashion-forward, sophisticated and adult without looking costume-like. Preserve realistic garment construction, midriff proportions, and fabric behavior.`);
} else {
  outfitSummary = val('outfit');
  lines.push(`Outfit: ${outfitSummary}. Garment fit: ${val('outfitFit')}. Accessories: ${val('accessories')}. Let the wardrobe feel bold, fashion-forward, sophisticated and adult without looking costume-like. Preserve realistic garment construction and fabric behavior.`);
}
lines.push('');
const exprCleaned = sanitizeHiddenFaceText(S(val('expression')), hideEyes, psTier);
const poseCleaned = sanitizeHiddenFaceText(S(val('pose')), hideEyes, psTier);
if(hasMalePresence){
  if(isFemaleGroomingMen){
    lines.push('FEMALE MODEL PROTAGONIST & ACTIVE GROOMING ACTION');
    lines.push('• Active Practitioner Role: The adult woman from the reference image is the primary protagonist and active practitioner (grooming stylist / therapist) standing cleanly over or seated attentively beside her male partner.');
    lines.push(`• Action & Physical Connection: ${S(val('maleInteraction'))}. Believable finger placement, accurate tool grip, rich warm foam or soothing oil sheen, and authentic anatomy with zero floating hands.`);
    lines.push('• Receptive Male Subject: A handsome, sharply groomed adult male model/client (receptive partner), seated or reclining comfortably with calm, trusting posture.');
    lines.push('• Solitary Female Model Rule: The adult female model is strictly and exclusively the ONLY woman in the scene. Zero secondary women, zero female stylists, and zero female bystanders in the frame or background.');
    lines.push('');
    lines.push('POSE AND EXPRESSION');
    lines.push(`Active grooming posture: ${S(val('maleInteraction'))}. Keep her body language focused, caring, natural, and authentic to the moment.`);
    lines.push(`Expression: ${exprCleaned}. Overall attitude: ${val('mood')}.`);
  } else {
    lines.push('MALE PRESENCE & EDITORIAL CO-STAR / CREW INTERACTION');
    lines.push(`Setup category: ${values.malePresence.label}.`);
    lines.push(`Action & body posture: ${S(val('maleInteraction'))}. The interaction directly dictates her physical positioning, body contact, and hand placement, with our model as the clear visual protagonist.`);
    lines.push('Solitary Female Model Rule: The adult female model is strictly and exclusively the ONLY woman in the scene. All colleagues, co-models, hair stylists, makeup artists, wardrobe assistants, and groomers interacting with her must strictly be male (completely exclude any secondary women, female stylists, or female background subjects).');
    lines.push('');
    lines.push('POSE AND EXPRESSION');
    lines.push(`Interaction-driven body posture: ${S(val('maleInteraction'))}. Keep her body language responsive, natural, and authentic to the moment.`);
    lines.push(`Expression: ${exprCleaned}. Overall attitude: ${val('mood')}.`);
  }
} else if(styleRef && transferToggles && transferToggles.hair){
  lines.push('POSE AND EXPRESSION');
  lines.push(`Pose: ${poseCleaned}. Expression: ${exprCleaned}. Hand / gesture detail: ${val('gesture')}. Solo subject composition: The adult woman is completely alone in the frame with her finished hair resting naturally; strictly no hairdresser standing beside or behind her, no man in the background, and zero stylist hands touching, holding, or styling her hair.`);
} else {
  lines.push('POSE AND EXPRESSION');
  lines.push(`Pose: ${poseCleaned}. Expression: ${exprCleaned}. Hand / gesture detail: ${val('gesture')}. Keep the body language open, believable and relaxed; capture a specific spontaneous moment rather than a generic stock pose.`);
}
lines.push('');
if(isFaceHidden){
  lines.push('FACE CONCEALMENT & OCCLUSION');
  lines.push('• Face concealment directive: The model is turned sideways looking away from the camera with her face not visible to the lens (head turned away into the background / shielded from view); zero facial features or front eye contact are exposed to the lens. Preserve her authentic hair silhouette while focusing the photograph entirely on her hair perimeter, garment construction, and setting.');
  lines.push('');
}

lines.push('CAMERA AND FRAMING');
const framingText = val('framing') || '';
let angleText = val('angle') || '';
const isTightFraming = framingText.includes('close-up') || framingText.includes('head-and-shoulders') || framingText.includes('detail crop') || framingText.includes('side-profile') || framingText.includes('headshot');
const angleImpliedByFraming = (
  (framingText.includes('side-profile') && angleText.includes('side-profile')) ||
  (framingText.includes('side profile') && angleText.includes('side profile'))
);
if (isTightFraming && angleText.includes('behind and beside the subject')) {
  angleText = 'an intimate three-quarter angle focusing closely on her facial profile and hair from just beside her shoulder';
}
const cameraAnglePart = angleImpliedByFraming ? '' : ` Camera angle: ${angleText}.`;
lines.push(`Framing: ${val('framing')}.${cameraAnglePart} Lens / perspective: ${val('lens')}. Composition: ${val('composition')}. Aspect ratio: ${val('aspect')}. Ensure the chosen crop shows the most important elements cleanly without awkward cropping or distorted perspective.`);
lines.push('');
lines.push('SCENE, LIGHT AND FINISH');
let bgValText = val('background');
let placeDetailText = val('placeDetail');
if(checkState.noMirror && typeof sanitizeMirrorProse === 'function'){
  bgValText = sanitizeMirrorProse(bgValText)
    .replace(/tri-fold mirrors/gi, 'architectural folding screens')
    .replace(/wall mirrors/gi, 'wall paneling')
    .replace(/mirrors/gi, 'studio panels');
  placeDetailText = sanitizeMirrorProse(placeDetailText);
}
const locDetail = placeDetailText ? ` Setting detail: ${placeDetailText}.` : '';
lines.push(`Location: ${bgValText}.${locDetail} Lighting: ${val('lighting')}. Photography style: ${val('style')}. Color grade: ${val('grade')}. Image quality: ${val('quality')}. Aim for believable depth, balanced colors, coherent shadows, authentic photographic texture and realistic environment details.`);
lines.push('');
const HAIR_MICRO_FIELD_IDS = new Set([
  'fringe', 'parting', 'hairVolume', 'hairAccessories', 'hairTexture', 'hairLength',
  'ponyStyle', 'ponyBaseHeight', 'ponyBaseWrap', 'ponyTailStyle', 'ponyTailFall', 'ponyTailEnd',
  'sideSweepSide', 'sideSweepFlip', 'sideSweepEnd', 'sideSweepFinish'
]);
const extraLines=detail==='compact'?[]:Object.entries(extraFields).filter(([id])=>{
  if(id==='cameraDistance' && values.framing && values.framing.text) return false;
  if(HAIR_MICRO_FIELD_IDS.has(id)) return false;
  if(hasMalePresence && (id === 'stance' || id === 'gesture' || id === 'motion')) return false;
  if(isTightFraming && id === 'footwear') return false;
  if(hideEyes && (id === 'eyewear' || id === 'eyeLook' || id === 'gaze' || id === 'browStyle')) return false;
  return val(id);
}).map(([id,f])=>`${f.label}: ${sanitizeHiddenFaceText(S(val(id)), hideEyes, psTier)}.`);
if(extraLines.length){
  lines.push('ADDITIONAL CREATIVE DETAILS');
  lines.push(extraLines.join('\n'));
}
lines.push('');
lines.push('IDENTITY AND REALISM CHECKLIST');
lines.push(checks.length?checks.map(x=>'• '+x).join('\n'):'Use a natural photographic look, consistent identity, realistic anatomy and believable materials.');
if(customDirection.trim()){
  lines.push('');
  lines.push('ADDITIONAL CREATIVE DIRECTION');
  lines.push(customDirection.trim());
}
lines.push('');
lines.push('AVOID / NEGATIVE GUIDANCE');
let negatives=['identity drift or a different face','unrequested facial feature changes or body reshaping','over-smoothed, waxy or plastic skin','synthetic hair clumps or helmet-like hair','distorted hands, fingers or anatomy','unrealistic fabric, impossible folds or wardrobe artifacts','stiff posing, vacant expressions or generic AI-stock-photo styling','excessive saturation, oversharpening or fake-looking lighting','duplicate accessories, visual glitches or obvious AI artifacts'];
if(hasMalePresence){
  negatives.push('any secondary woman, female co-model, female stylist, female makeup artist, female assistant, or other women in background (strictly solitary female model)');
} else if(checkState.soloSubject || (styleRef && transferToggles && transferToggles.hair) || styleRef){
  negatives.push('hairdresser, hair stylist, barber, salon staff, man working on hair, secondary person, extra person, man in background, stylist hands, hands touching hair, hands holding hair, hands styling hair, scissors, comb in hair, salon cape, two people, multiple people, male figure, companion, bystander, photobomb');
}
if(styleRef && transferToggles && transferToggles.hair){
  negatives.push(hasActiveHeavyVeil
    ? 'loose hair down, hair down, un-tied hair, messy bun, topknot bun, curly afro, pixie cut, short crop'
    : 'loose hair down, hair down, un-tied hair, messy bun, topknot bun, curly afro, pixie cut, short crop, blunt straight fringe, hair covering eyes');
}
if(isFaceHidden){
  negatives.push('visible face, front facial view, frontal eyes, open direct eye contact, revealing hidden face, artificial frontal facial features');
}
const psObfuscNegs = getObfuscNegatives(psObfuscMode);
if(psObfuscNegs.length){
  negatives.push(...psObfuscNegs);
}
if(psVeilRuleObj?.neg){
  negatives.push(psVeilRuleObj.neg);
}
if(photoHairMoisture === 'wet'){
  negatives.push('dry hair, blown-out airy volume, static flyaways, dry puffy crown, dry un-clumped strands, cottony dryness');
} else if(photoHairMoisture === 'damp'){
  negatives.push('completely dry fluffy hair, static flyaways, frizzy bone dryness');
} else if(!psIsExplicitWetHair){
  negatives.push('soaked wet hair, dripping hair, wet slicked scalp, greasy wet clumps');
}
if(checkState.hairTexturePreserve || preserveHairTexture)negatives.push('altered hair texture, artificial curls, synthetic perm, heat-damaged hair texture, unnatural straightener sheen or mismatched ethnic hair texture');
if(checkState.noMirror)negatives.push('mirrors and incorrect reflections');
if(checkState.noText)negatives.push('text overlays, logos and watermarks');
if(extraNegative.trim())negatives.push(extraNegative.trim());
const dedupedNegs = dedupeNegatives(negatives);
lines.push((Array.isArray(dedupedNegs) && dedupedNegs.length) ? dedupedNegs.map(x=>'• '+x).join('\n') : '');

if(detail==='full'){
  lines.push('');
  lines.push('OUTPUT INSTRUCTIONS');
  const focusClause = hideEyes
    ? 'Keep the hairstyle silhouette, draped hair veil, and photographic textures in clear focus'
    : 'Keep the face and hairstyle in clear focus, with photographic detail and natural imperfections';
  lines.push(`${outputText} ${val('quality')}. ${focusClause}.`);
}else if(detail==='balanced'){
  lines.push('');
  lines.push('OUTPUT');
  lines.push(outputText);
}else{
  lines.push('');
  lines.push('OUTPUT');
  lines.push(`${outputText} Preserve identity, keep the bold styling and pose, and prioritize natural photorealism.`);
}

if(harmonizePalette && extractedPalette.length > 0){
  lines.push('');
  lines.push('COLOR HARMONY');
  lines.push(`Subtly harmonize environmental lighting, backdrop tones, and wardrobe accents to complement the reference photo\'s extracted palette (${extractedPalette.join(', ')}).`);
}

lookbookShots = buildLookbookSeries(checks, negatives, extraLines, {
  isFaceHidden,
  isFullVeil,
  veilTier: psTier,
  isFemaleGroomingMen,
  outfitDesc: outfitSummary
});

save();
let text = '';
if(lookbookMode){
  text = lookbookShots[activeShot] || lookbookShots.all;
}else{
  text = lines.join('\n').replace(/\n{3,}/g,'\n\n');
}
el('prompt').value = text; el('prompt').textContent = text;
const words = text.trim().split(/\s+/).length;
const tokens = estimateTokens(text);
const shotSuffix = lookbookMode ? ` · Lookbook (${activeShot === 'all' ? 'All 4 Shots' : 'Shot ' + activeShot})` : '';
el('wordCount').textContent = `${words.toLocaleString()} words · ${text.length.toLocaleString()} chars · ~${tokens.toLocaleString()} tokens${shotSuffix}`;
syncRatioChips();

if(el('mobileWordCount')) el('mobileWordCount').textContent=`${words} words`;
if(el('mobileSummaryMini')) el('mobileSummaryMini').textContent=`${values.hair?.label||''} · ${values.outfit?.label||''}`;

const summaryIds = hasMalePresence
  ? ['hair', 'hairFaceCoverage', 'outfit', 'malePresence', 'maleInteraction', 'background', 'placeDetail']
  : ['hair', 'hairFaceCoverage', 'outfit', 'pose', 'expression', 'background', 'placeDetail'];
if(hasPsObfusc){
  const covIdx = summaryIds.indexOf('hairFaceCoverage');
  if(covIdx >= 0) summaryIds.splice(covIdx + 1, 0, 'faceObfuscMode');
}
const psMoistLabels = { dry: 'Dry & Blown-out', damp: 'Damp / Misted', wet: 'Soaked Wet' };
const psSummaryTags = summaryIds.filter(id=>fields[id]&&values[id]).map(id=>`<span class="summary-tag" title="${fields[id].label}: ${val(id).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${fields[id].label}: ${values[id].label}</span>`);
psSummaryTags.splice(2, 0, `<span class="summary-tag" title="Hair moisture state: ${psMoistLabels[photoHairMoisture] || 'Dry'}">Moisture: ${psMoistLabels[photoHairMoisture] || 'Dry'}</span>`);
el('summary').innerHTML = psSummaryTags.join('');
return text;
}


function extractPalette(img, maxColors=5){
  try{
    const c=document.createElement('canvas');
    const ctx=c.getContext('2d');
    c.width=48;c.height=48;
    ctx.drawImage(img,0,0,48,48);
    const d=ctx.getImageData(0,0,48,48).data;
    const buckets={};
    for(let i=0;i<d.length;i+=4){
      const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
      if(a<128)continue;
      const lum=0.299*r+0.587*g+0.114*b;
      if(lum<20||lum>245)continue;
      const qr=Math.round(r/32)*32,qg=Math.round(g/32)*32,qb=Math.round(b/32)*32;
      const key=`${qr},${qg},${qb}`;
      buckets[key]=(buckets[key]||0)+1;
    }
    const sorted=Object.keys(buckets).sort((a,b)=>buckets[b]-buckets[a]);
    const hexes=[];
    for(const k of sorted){
      const [r,g,b]=k.split(',').map(Number);
      const hex='#'+[r,g,b].map(x=>Math.min(255,Math.max(0,x)).toString(16).padStart(2,'0')).join('');
      const distinct=hexes.every(h=>{
        const hr=parseInt(h.slice(1,3),16),hg=parseInt(h.slice(3,5),16),hb=parseInt(h.slice(5,7),16);
        return Math.hypot(r-hr,g-hg,b-hb)>40;
      });
      if(distinct)hexes.push(hex);
      if(hexes.length>=maxColors)break;
    }
    return hexes;
  }catch(e){return [];}
}

function renderPalette(colors){
  extractedPalette=colors;
  const pal=el('refPalette');
  const sw=el('refSwatches');
  if(!pal||!sw||!colors.length){if(pal)pal.classList.add('hidden');return;}
  sw.innerHTML=colors.map(hex=>`<div class="ref-swatch" style="background:${hex}" data-hex="${hex}" title="Hex ${hex} (Tap to copy)"></div>`).join('');
  sw.querySelectorAll('.ref-swatch').forEach(s=>{
    s.addEventListener('click',()=>{
      const h=s.dataset.hex;
      copy(h);
      toast(`Copied ${h} to clipboard.`);
    });
  });
  pal.classList.remove('hidden');
}

function syncRatioChips(){
  const cur=values.aspect?.label||'';
  document.querySelectorAll('.ratio-chip').forEach(c=>{
    c.classList.toggle('active',cur.includes(c.dataset.ratio));
  });
}

function updateModeButtons(){
  const bSingle=el('btnSingleMode');
  const bLookbook=el('btnLookbookMode');
  const segWrap=bSingle?.parentElement;
  const tabs=el('shotTabs');
  const isSalon = (currentStudioMode === 'salon');
  if(segWrap) segWrap.style.display = isSalon ? 'none' : 'flex';
  if(bSingle)bSingle.classList.toggle('active',!lookbookMode);
  if(bLookbook)bLookbook.classList.toggle('active',lookbookMode);
  if(tabs)tabs.classList.toggle('hidden', isSalon || !lookbookMode);
}

function loadHistory(){
  try{
    promptHistory=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');
  }catch(e){promptHistory=[];}
  updateHistoryBadge();
}

function updateHistoryBadge(){
  const b=el('historyBadge');
  if(b)b.textContent=promptHistory.length;
}

function recordHistory(){
  const currentText=el('prompt').value.trim();
  if(!currentText)return;
  if(promptHistory.length&&promptHistory[0].text===currentText)return;
  const entry={
    id:Date.now(),
    time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
    title:`${values.hair?.label||'Look'} · ${values.outfit?.label||'Outfit'}`,
    sub:`${values.pose?.label||''} · ${values.lighting?.label||''} · ${values.aspect?.label?.split(' ')[0]||''}`,
    words:currentText.split(/\s+/).length,
    text:currentText,
    state:{
      v:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.label])),
      c:{...checkState},
      d:customDirection,
      n:extraNegative,
      l:lookbookMode
    }
  };
  promptHistory.unshift(entry);
  if(promptHistory.length>15)promptHistory.pop();
  try{localStorage.setItem(HIST_KEY,JSON.stringify(promptHistory));}catch(e){}
  updateHistoryBadge();
}

function openHistory(){
  renderHistoryList();
  el('historyModal').classList.add('active');
  el('historyBackdrop').classList.add('active');
}

function closeHistory(){
  el('historyModal').classList.remove('active');
  el('historyBackdrop').classList.remove('active');
}

function clearHistory(){
  promptHistory=[];
  try{localStorage.removeItem(HIST_KEY);}catch(e){}
  updateHistoryBadge();
  renderHistoryList();
  toast('Prompt history cleared.');
}

function renderHistoryList(){
  const l=el('historyList');
  if(!promptHistory.length){
    l.innerHTML='<div class="history-empty"><p>No saved history yet.</p><small>Prompts you generate, randomize or copy are automatically preserved here.</small></div>';
    return;
  }
  l.innerHTML=promptHistory.map((item,idx)=>`
    <div class="history-item">
      <div class="history-item-top">
        <strong class="history-item-title">${item.title}</strong>
        <span class="history-item-time">${item.time}</span>
      </div>
      <div class="history-item-sub">${item.sub} · ${item.words} words</div>
      <div class="history-item-actions">
        <button class="btn btn-secondary btn-small restore-hist" data-idx="${idx}" type="button">Restore look ↺</button>
        <button class="btn btn-primary btn-small copy-hist" data-idx="${idx}" type="button">Copy ▣</button>
        <button class="btn-quiet btn-small del-hist" data-idx="${idx}" type="button" title="Delete entry">✕</button>
      </div>
    </div>
  `).join('');
  l.querySelectorAll('.restore-hist').forEach(b=>{
    b.addEventListener('click',()=>{
      const item=promptHistory[b.dataset.idx];
      if(item&&item.state){
        Object.entries(item.state.v||{}).forEach(([k,lbl])=>{
          const m=fields[k]&&fields[k].opts.find(x=>x.label===lbl);
          if(m)values[k]=m;
        });
        Object.assign(checkState,item.state.c||{});
        customDirection=item.state.d||'';
        extraNegative=item.state.n||'';
        lookbookMode=!!item.state.l;
        updateModeButtons();
        buildPrompt();
        renderFields();
        closeHistory();
        toast('Restored look from history!');
      }
    });
  });
  l.querySelectorAll('.copy-hist').forEach(b=>{
    b.addEventListener('click',()=>{
      const item=promptHistory[b.dataset.idx];
      if(item){
        copy(item.text);
        toast('Copied historical prompt.');
      }
    });
  });
  l.querySelectorAll('.del-hist').forEach(b=>{
    b.addEventListener('click',()=>{
      promptHistory.splice(b.dataset.idx,1);
      try{localStorage.setItem(HIST_KEY,JSON.stringify(promptHistory));}catch(e){}
      updateHistoryBadge();
      renderHistoryList();
    });
  });
}

function generateShareUrl(){
  const payload={
    v:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.label])),
    c:checkState,
    d:customDirection,
    n:extraNegative,
    l:lookbookMode,
    m:currentStudioMode,
    sm:salonSeatingMode,
    wm:wardrobeMode,
    hm:salonHairMoisture,
    pm:photoHairMoisture,
    pt:preserveHairTexture,
    o:outputType
  };
  try{
    const str=JSON.stringify(payload);
    const b64=btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,(match,p1)=>String.fromCharCode('0x'+p1)));
    const url=window.location.origin+window.location.pathname+'#look='+encodeURIComponent(b64);
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(url).then(()=>toast('Shareable look link copied to clipboard!')).catch(()=>copy(url));
    }else{
      copy(url);
      toast('Shareable link copied to clipboard!');
    }
    recordHistory();
  }catch(e){
    toast('Could not generate share link.');
  }
}

function loadFromHash(){
  if(!window.location.hash.startsWith('#look='))return;
  try{
    const raw=decodeURIComponent(window.location.hash.slice(6));
    const str=decodeURIComponent(Array.prototype.map.call(atob(raw),c=>'%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const o=JSON.parse(str);
    if(o&&o.v){
      Object.entries(o.v).forEach(([k,lbl])=>{
        const m=fields[k]&&fields[k].opts.find(x=>x.label===lbl);
        if(m)values[k]=m;
      });
      if(o.c)Object.assign(checkState,o.c);
      if(o.d!==undefined)customDirection=o.d;
      if(o.n!==undefined)extraNegative=o.n;
      if(o.l!==undefined)lookbookMode=!!o.l;
      if(o.sm)salonSeatingMode=o.sm;
      if(o.wm==='ensemble'||o.wm==='separates') wardrobeMode=o.wm;
      if(o.hm)salonHairMoisture=o.hm;
      if(o.pm)photoHairMoisture=o.pm;
      if(o.pt!==undefined)preserveHairTexture=!!o.pt;
      if(o.o)outputType=o.o;
      syncSalonStageWithSeatingMode();
      if(o.m && (o.m === 'salon' || o.m === 'photoshoot')) switchStudioMode(o.m);
      updateModeButtons();
      buildPrompt();
      renderFields();
      toast('Shared look loaded from URL!');
    }
  }catch(e){
    console.warn('Failed to parse share hash:',e);
  }
}

function toast(msg){
const t=el('toast');
t.textContent=msg;
t.classList.remove('flash');
void t.offsetWidth;
t.classList.add('flash');
}

function copy(text){
recordHistory();
if(navigator.clipboard&&window.isSecureContext){
  navigator.clipboard.writeText(text).then(()=>toast('Copied to clipboard.')).catch(()=>fallbackCopy(text));
}else fallbackCopy(text);
}

function fallbackCopy(text){
const ta=document.createElement('textarea');
ta.value=text;
ta.style.position='fixed';
ta.style.opacity='0';
document.body.appendChild(ta);
ta.select();
try{
  const ok=document.execCommand('copy');
  toast(ok?'Copied to clipboard.':'Copy was blocked—select the text box and use Ctrl+C.');
}catch(e){
  toast('Select the text and use Ctrl+C.');
}
ta.remove();
}

function resetAll(){
Object.entries(fields).forEach(([id,f])=>{
  if(!lockedFields.has(id)) values[id]=f.opts[f.def];
});
applyCollagePreset('journey');
finishChecks.forEach(c=>checkState[c.id]=c.checked);
customDirection='';
extraNegative='';
outputType='single';
detailLevel='full';
salonHairMoisture='damp';
photoHairMoisture='dry';
salonSeatingMode='chair';
wardrobeMode='ensemble';
syncSalonStageWithSeatingMode();
lookbookMode=false;
activeShot='all';
subjectRef=null;
styleRef=null;
harmonizePalette=false;
transferToggles={ hair: true, outfit: false, palette: false, scene: false };
activePreset='';
document.querySelectorAll('.preset').forEach(b=>b.classList.remove('active'));
updateModeButtons();
goSection(currentStudioMode==='salon'?'salonVenueSec':'look');
buildPrompt();
toast(lockedFields.size>0?'Reset choices to defaults (locked choices kept).':'Builder reset to defaults.');
}

function download(){
const blob=new Blob([el('prompt').value],{type:'text/plain;charset=utf-8'});
const a=document.createElement('a');
const url=URL.createObjectURL(blob);
a.href=url;
a.download='afterglow-makeover-photoshoot-prompt.txt';
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(()=>URL.revokeObjectURL(url),1000);
toast('Prompt saved as a text file.');
}

function initMobileDrawer(){
const drawerBtn=el('openDrawerBtn');
const closeBtn=el('closeDrawer');
const backdrop=el('drawerBackdrop');
const preview=document.querySelector('.preview');
const mobileCopy=el('mobileCopyBtn');
const topCopy=el('topQuickCopy');
const handle=el('sheetHandle');



function openDrawer(){
  preview.classList.add('drawer-open');
  backdrop.classList.add('active');
  document.body.style.overflow='hidden';
}

function closeDrawer(){
  preview.classList.remove('drawer-open');
  backdrop.classList.remove('active');
  document.body.style.overflow='';
}

if(drawerBtn)drawerBtn.addEventListener('click',openDrawer);
if(closeBtn)closeBtn.addEventListener('click',closeDrawer);
if(backdrop)backdrop.addEventListener('click',closeDrawer);
if(handle)handle.addEventListener('click',closeDrawer);
if(mobileCopy){
  mobileCopy.addEventListener('click',()=>{
    copy(el('prompt').value);
    mobileCopy.textContent='✓ Copied';
    setTimeout(()=>mobileCopy.textContent='▣ Copy',1500);
  });
}
if(topCopy){
  topCopy.addEventListener('click',()=>{
    copy(el('prompt').value);
    topCopy.textContent='✓ Copied';
    setTimeout(()=>topCopy.textContent='▣ Copy',1500);
  });
}
}

el('randomTop').addEventListener('click',chooseRandom);
el('copyTop').addEventListener('click',()=>copy(el('prompt').value));
el('resetTop').addEventListener('click',resetAll);
el('copy').addEventListener('click',()=>copy(el('prompt').value));
if(el('copyPositive')){
  el('copyPositive').addEventListener('click',()=>{
    const pos = extractPositivePrompt(el('prompt').value);
    copy(pos || el('prompt').value);
    toast('✓ Copied positive prompt only (exclusions omitted).');
  });
}
if(el('copyNegative')){
  el('copyNegative').addEventListener('click',()=>{
    const dynamicNeg = extractNegativePrompt(el('prompt').value);
    const fallbackNeg = 'AVOID / NEGATIVE GUIDANCE\n'+['identity drift or a different face','unrequested facial feature changes or body reshaping','over-smoothed, waxy or plastic skin','synthetic hair clumps or helmet-like hair','distorted hands, fingers or anatomy','unrealistic fabric or wardrobe artifacts','stiff posing and generic AI styling','obvious AI artifacts',...(extraNegative.trim()?[extraNegative.trim()]:[])].map(x=>'• '+x).join('\n');
    copy(dynamicNeg || fallbackNeg);
    toast('✓ Copied exclusions only to clipboard.');
  });
}
el('download').addEventListener('click',download);
el('selectPrompt').addEventListener('click',()=>{
el('prompt').focus();
el('prompt').select();
toast('Prompt selected. Press Ctrl+C to copy.');
});
el('prevStep').addEventListener('click',()=>{
const i=sections.findIndex(s=>s.id===activeSection);
goSection(sections[Math.max(0,i-1)].id);
});
el('nextStep').addEventListener('click',()=>{
const i=sections.findIndex(s=>s.id===activeSection);
goSection(sections[(i+1)%sections.length].id);
});
el('finishJump').addEventListener('click',()=>goSection('finish'));

// Mode switcher (Single vs Lookbook)
const btnSingle=el('btnSingleMode');
const btnLookbook=el('btnLookbookMode');
if(btnSingle){
  btnSingle.addEventListener('click',()=>{
    lookbookMode=false;
    activeShot='all';
    updateModeButtons();
    buildPrompt();
  });
}
if(btnLookbook){
  btnLookbook.addEventListener('click',()=>{
    lookbookMode=true;
    activeShot='all';
    updateModeButtons();
    buildPrompt();
    toast('Lookbook 4-shot series mode activated. Shot framing is fixed (macro → 3/4 → wide → detail). Your Angle & Lens choices still apply within each shot.');
  });
}

// Shot tabs
document.querySelectorAll('.shot-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    if(currentStudioMode === 'salon') return;
    document.querySelectorAll('.shot-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    activeShot=tab.dataset.shot;
    el('prompt').value=lookbookShots[activeShot]||lookbookShots.all;
    const words=el('prompt').value.trim().split(/\s+/).length;
    const shotLabel=activeShot==='all'?'All 4 Shots':`Shot ${activeShot}`;
    el('wordCount').textContent=`${words.toLocaleString()} words · ${el('prompt').value.length.toLocaleString()} characters · Lookbook (${shotLabel})`;
    toast(`Viewing Lookbook: ${shotLabel}`);
  });
});

// Ratio chips
document.querySelectorAll('.ratio-chip').forEach(chip=>{
  chip.addEventListener('click',()=>{
    const ratio=chip.dataset.ratio;
    const match=fields.aspect.opts.find(o=>o.label.includes(ratio));
    if(match){
      values.aspect=match;
      buildPrompt();
      renderFields();
      toast(`Aspect ratio set to ${ratio}.`);
    }
  });
});

// History modal triggers
const openHist=el('openHistoryBtn');
const closeHist=el('closeHistoryBtn');
const clearHist=el('clearHistoryBtn');
const histBackdrop=el('historyBackdrop');
if(openHist)openHist.addEventListener('click',openHistory);
if(closeHist)closeHist.addEventListener('click',closeHistory);
if(clearHist)clearHist.addEventListener('click',clearHistory);
if(histBackdrop)histBackdrop.addEventListener('click',closeHistory);

// Share buttons
const shareTop=el('shareLookTop');
const shareSide=el('shareLookBtn');
if(shareTop)shareTop.addEventListener('click',generateShareUrl);
if(shareSide)shareSide.addEventListener('click',generateShareUrl);


document.addEventListener('click',e=>{
if(!e.target.closest('.custom-select'))document.querySelectorAll('.custom-select.open').forEach(c=>{
  c.classList.remove('open');
  c.querySelector('.select-trigger').setAttribute('aria-expanded','false');
});
});
document.addEventListener('keydown',e=>{
if(e.key==='Escape')document.querySelectorAll('.custom-select.open').forEach(c=>{
  c.classList.remove('open');
  c.querySelector('.select-trigger').setAttribute('aria-expanded','false');
});
});

const KEY='afterglow-prompt-studio-v2';

function save(){
try{
  const o={
    v:{},
    c:checkState,
    d:customDirection,
    n:extraNegative,
    o:outputType,
    l:detailLevel,
    m:salonHairMoisture,
    pm:photoHairMoisture,
    sm:salonSeatingMode,
    wm:wardrobeMode,
    mode:currentStudioMode,
    pt:preserveHairTexture,
    lb:lookbookMode,
    tt:transferToggles,
    k:[...lockedFields],
    u:customPresets.map(p=>({id:p.id,title:p.title,sub:p.sub,icon:p.icon,set:Object.fromEntries(Object.entries(p.set).map(([k,v])=>[k,v.label]))}))
  };
  Object.entries(values).forEach(([k,x])=>o.v[k]=x.label);
  localStorage.setItem(KEY,JSON.stringify(o));
}catch(e){}
}

function load(){
try{
  const o=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!o)return;
  Object.entries(o.v||{}).forEach(([k,l])=>{
    const m=fields[k]&&fields[k].opts.find(x=>x.label===l);
    if(m)values[k]=m;
  });
  Object.assign(checkState,o.c||{});
  customDirection=o.d||'';
  extraNegative=o.n||'';
  outputType=o.o||'single';
  detailLevel=o.l||'full';
  if(o.m) salonHairMoisture=o.m;
  if(o.pm) photoHairMoisture=o.pm;
  if(o.sm) salonSeatingMode=o.sm;
  syncSalonStageWithSeatingMode();
  if(o.wm==='ensemble'||o.wm==='separates') wardrobeMode=o.wm;
  if(o.mode && (o.mode === 'salon' || o.mode === 'photoshoot')) currentStudioMode=o.mode;
  if(o.pt !== undefined) preserveHairTexture=!!o.pt;
  if(o.lb !== undefined) lookbookMode=!!o.lb;
  if(o.tt) transferToggles=Object.assign(transferToggles, o.tt);
  if(Array.isArray(o.k)) lockedFields=new Set(o.k);
  if(Array.isArray(o.u)){
    customPresets=o.u.map(p=>{
      const reconstructedSet={};
      Object.entries(p.set||{}).forEach(([k,l])=>{
        const m=fields[k]&&fields[k].opts.find(x=>x.label===l);
        if(m) reconstructedSet[k]=m;
      });
      return {id:p.id,title:p.title,sub:p.sub,icon:p.icon||'⭐',isCustom:true,set:reconstructedSet};
    });
  }
}catch(e){}
}

if(el('fab')){
el('fab').addEventListener('click',()=>{
  copy(el('prompt').value);
  const b=el('fab');
  b.textContent='✓ Copied';
  setTimeout(()=>b.textContent='▣ Copy prompt',1500);
});
}

load();

if(window.location.hash === '#salon' || window.location.hash === '#photoshoot'){
  if(history.replaceState) history.replaceState(null, null, window.location.pathname);
}

currentStudioMode = DEFAULT_MODE;
if(currentStudioMode === 'salon'){
  switchStudioMode('salon');
} else {
  goSection('look', false);
}
buildPrompt();
initMobileDrawer();
loadHistory();
loadFromHash();
rotatePresets(true);
if(window.location.hash === '#grooming' || window.location.hash === '#men-grooming'){
  activateMenGrooming();
}
window.addEventListener('hashchange', () => {
  if(window.location.hash === '#grooming' || window.location.hash === '#men-grooming'){
    activateMenGrooming();
  }
});

window.AfterglowStudio = {
  getMode: () => currentStudioMode,
  switchStudioMode,
  goSection,
  buildPrompt,
  buildSalonPrompt,
  renderFields,
  renderPresets,
  saveCustomPreset,
  importCustomPresetsFromData,
  resetAll,
  save,
  load,
  getHair: () => hair,
  getHairFaceCoverageOpts: () => hairFaceCoverageOpts,
  getFaceObfuscModeOpts: () => faceObfuscModeOpts,
  getBikeScenes: () => bikeScenes,
  getDateVenues: () => dateVenues,
  getCoupleInteractions: () => coupleInteractions,
  getFields: () => fields,
  getValues: () => values,
  getCheckState: () => checkState,
  getMoisture: () => getActiveHairMoisture(),
  setMoisture: (m) => { setActiveHairMoisture(m); buildPrompt(); },
  getSeatingMode: () => salonSeatingMode,
  setSeatingMode: (m) => { salonSeatingMode = m; syncSalonStageWithSeatingMode(); renderFields(); buildPrompt(); },
  getWardrobeMode: () => wardrobeMode,
  setWardrobeMode: (m) => { wardrobeMode = m; renderFields(); buildPrompt(); },
  getOutputType: () => outputType,
  setOutputType: (t) => { outputType = t; buildPrompt(); },
  setLookbookMode: (b, shot='all') => { lookbookMode = !!b; activeShot = shot; updateModeButtons(); buildPrompt(); },
  setStyleRef: (r) => { styleRef = r; buildPrompt(); },
  getCustomPresets: () => customPresets,
  getExtractedPositive: () => extractPositivePrompt(el('prompt').value),
  getExtractedNegative: () => extractNegativePrompt(el('prompt').value)
};

startRotation();
})();
