#!/usr/bin/env python3
"""
Verification suite for Salon and Photoshoot studio expansions:
1. Salon venues (66 total) with explicit category routing (18 barbershop, 17 studio, 16 salon, 15 parlour)
2. Photoshoot poses (288 total) with explicit category routing
3. Cinematic lightings (70 total) with category routing (20 daylight, 19 studio, 10 moody, 9 warm, 6 flash, 6 aquatic)
4. 16 authentic Indian barbershop rituals & sensory stages
5. 10 tactile cape silhouettes
6. 8 authentic ritual lotions & tonics (18 total)
7. 6 new collage preset flows
8. Lookbook multi-format suite (campaign_4, triptych_3, feature_5, contact_6)
9. Herbal oil collision guard and stool sanitization
10. UI elements (lookbook format bar, quick-chips cards)
"""

import html as pyhtml
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME_CANDIDATES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]


def find_browser():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    raise RuntimeError('No headless Chromium/Chrome binary found in standard Windows locations.')


def run_page_test(browser, rel_path, test_js):
    page_path = os.path.join(ROOT, rel_path)
    with open(page_path, 'r', encoding='utf-8') as f:
        src = f.read()

    harness = f'''
<script>
window.__testErrors = [];
window.addEventListener('error', function(e) {{
  window.__testErrors.push('Error: ' + (e.message || e.error));
}});
window.addEventListener('unhandledrejection', function(e) {{
  window.__testErrors.push('Rejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)));
}});
setTimeout(function() {{
  const results = [];
  const ok = (name, cond, detail) => results.push({{ name, ok: !!cond, detail: cond ? '' : (detail || 'assertion failed') }});
  try {{
    ok('zero_startup_js_errors', window.__testErrors.length === 0, window.__testErrors.join(' | '));
    (function() {{
      {test_js}
    }})();
    ok('zero_runtime_js_errors', window.__testErrors.length === 0, window.__testErrors.join(' | '));
  }} catch (err) {{
    results.push({{ name: 'fatal_harness_exception', ok: false, detail: (err && err.stack) ? err.stack : String(err) }});
  }}
  const out = document.createElement('div');
  out.id = 'afterglow-test-report';
  out.textContent = JSON.stringify(results);
  document.body.appendChild(out);
}}, 220);
</script>
'''
    injected = src.replace('</body>', harness + '\n</body>', 1)
    assert injected != src, f'</body> not found in {rel_path}'

    fd, tmp_path = tempfile.mkstemp(prefix='_tmp_test_exp_', suffix='.html', dir=ROOT)
    os.close(fd)
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(injected)

    user_data_dir = tempfile.mkdtemp(prefix='_tmp_chrome_profile_')

    try:
        proc = subprocess.run(
            [
                browser,
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                '--virtual-time-budget=4000',
                f'--user-data-dir={user_data_dir}',
                '--dump-dom',
                'file:///' + tmp_path.replace('\\', '/'),
            ],
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=35,
        )
        dom = proc.stdout
    finally:
        if os.path.exists(tmp_path):
            import time
            for _ in range(5):
                try:
                    os.remove(tmp_path)
                    break
                except OSError:
                    time.sleep(0.1)
        if os.path.exists(user_data_dir):
            import time
            for _ in range(5):
                try:
                    shutil.rmtree(user_data_dir, ignore_errors=True)
                    break
                except OSError:
                    time.sleep(0.1)

    m = re.search(r'<div id="afterglow-test-report">([\s\S]*?)</div>', dom)
    if not m:
        return [{'name': 'missing_test_report_element', 'ok': False, 'detail': 'Chrome did not emit #afterglow-test-report'}]
    return json.loads(pyhtml.unescape(m.group(1)))


SALON_EXPANSION_JS = r'''
const api = window.AfterglowStudio;
ok('salon_api_available', !!api);

// 1. Salon Venues (66 total) & Category Routing
const venues = api.getFields().salonVenue.opts;
ok('salon_venues_count_66', venues.length === 66, `Expected 66, got ${venues.length}`);

const venueCats = {};
venues.forEach(o => {
  const c = api.getItemCategory('salonVenue', o);
  venueCats[c] = (venueCats[c] || 0) + 1;
});
ok('salon_venues_barbershop_count', venueCats.barbershop === 18, `barbershop=${venueCats.barbershop}`);
ok('salon_venues_salon_count', venueCats.salon === 16, `salon=${venueCats.salon}`);
ok('salon_venues_parlour_count', venueCats.parlour === 15, `parlour=${venueCats.parlour}`);
ok('salon_venues_studio_count', venueCats.studio === 17, `studio=${venueCats.studio}`);

// Authentic Indian & Global Venues
ok('venue_varanasi_ghat_exists', venues.some(o => o.label.includes('Varanasi Dashashwamedh Ghat')));
ok('venue_jodhpur_haveli_exists', venues.some(o => o.label.includes('Jodhpur Blue City')));
ok('venue_kumartuli_exists', venues.some(o => o.label.includes('Kolkata Kumartuli')));
ok('venue_dubai_marina_exists', venues.some(o => o.label.includes('Dubai Marina High-Floor')));
ok('venue_chettinad_exists', venues.some(o => o.label.includes('Chettinad Heritage Mansion')));

// 2. Authentic Ritual Stages (Expanded with Ayurvedic champi, wash basin, shears & blowout)
const stages = api.getFields().salonStage.opts;
ok('stage_champi_thapki_exists', stages.some(o => o.label.includes('Authentic Indian champi head massage with rhythmic thapki drumming')));
ok('stage_fitkari_glide_exists', stages.some(o => o.label.includes('Natural fitkari (alum) crystal glide across freshly shaved nape hairline')));
ok('stage_flame_singeing_exists', stages.some(o => o.label.includes('Turkish flame singeing technique')));
ok('stage_shavette_lineup_exists', stages.some(o => o.label.includes('Precision shavette lineup')));
ok('stage_talc_duster_exists', stages.some(o => o.label.includes('Horsehair talcum powder duster')));
ok('stage_oster_wand_exists', stages.some(o => o.label.includes('Vibrating Oster shoulder massage wand')));
ok('stage_brahmi_pour_exists', stages.some(o => o.label.includes('Warm Brahmi & Bhringraj oil crown pour')));
ok('stage_turban_wrap_exists', stages.some(o => o.label.includes('Steaming herbal towel turban wrap')));
ok('stage_silk_press_exists', stages.some(o => o.label.includes('High-tension round brush silk press')));

// 3. Tactile Capes (10 new capes added)
const capes = api.getFields().salonCape.opts;
ok('salon_capes_expanded', capes.length >= 18, `capes=${capes.length}`);
ok('cape_matka_silk_exists', capes.some(o => o.label.includes('Matka silk')));
ok('cape_phone_peek_exists', capes.some(o => o.label.includes('Clear-window phone-peek')));
ok('cape_glossy_vinyl_exists', capes.some(o => o.label.includes('heavy black vinyl industrial cape with water beading')));
ok('cape_chalkstripe_exists', capes.some(o => o.label.includes('chalkstripe charcoal flannel')));

// 4. Ritual Lotions & Skin Treatments (22 total)
const lotions = api.getFields().salonLotion.opts;
ok('salon_lotions_count_expanded', lotions.length >= 22, `lotions=${lotions.length}`);
ok('lotion_sarson_tel_exists', lotions.some(o => o.label.includes('Sarson tel')));
ok('lotion_fitkari_exists', lotions.some(o => o.label.includes('Fitkari (potash alum) block glide')));
ok('lotion_chandan_exists', lotions.some(o => o.label.includes('Chandan')));
ok('lotion_kolonya_exists', lotions.some(o => o.label.includes('Turkish 80° lemon kolonya')));
ok('lotion_coconut_champi_exists', lotions.some(o => o.label.includes('Virgin coconut & fresh curry leaf champi')));
ok('lotion_brahmi_exists', lotions.some(o => o.label.includes('Warm Brahmi & Bhringraj')));
ok('lotion_hibiscus_exists', lotions.some(o => o.label.includes('Virgin coconut & ruby hibiscus')));

// 4b. Salon Camera Expansion (48+ categorized setups)
const salonCams = api.getFields().salonCamera.opts;
ok('salon_cameras_expanded', salonCams.length >= 48, `cameras=${salonCams.length}`);
ok('salon_cam_mirror_exists', salonCams.some(o => o.cat === 'mirror'));
ok('salon_cam_macro_exists', salonCams.some(o => o.cat === 'macro'));
ok('salon_cam_wash_exists', salonCams.some(o => o.cat === 'wash'));

// 5. Herbal Oil Collision Guard Verification
const sarsonOpt = lotions.find(o => o.label.includes('Sarson tel'));
api.getValues().salonLotion = sarsonOpt;
const sPrompt = api.buildSalonPrompt();
const sNegs = api.getExtractedNegative();
ok('oil_guard_sheen_in_prompt', sPrompt.includes('Herbal Oil Conditioning Luster') && sPrompt.includes('warm luster'));
ok('oil_guard_suppresses_blowout', !sPrompt.includes('freshly blown-out salon finish'));
ok('oil_guard_suppresses_oily_neg', !sNegs.includes('oily sheen'));

// 6. Collage Presets (6 new flows)
const presets = api.COLLAGE_PRESETS;
ok('preset_barber_ritual_exists', !!presets['barber_ritual']);
ok('preset_champi_flow_exists', !!presets['indian_champi_flow']);
ok('preset_glass_bob_exists', !!presets['glass_bob_transformation']);
ok('preset_razor_sculpt_exists', !!presets['razor_sculpt_flow']);
ok('preset_backstage_exists', !!presets['backstage_editorial_flow']);
ok('preset_close_sensory_exists', !!presets['close_sensory_macro']);

// 7. Cape Quick-Chips Card in UI
api.goSection('salonCameraSec');
const quickChips = document.querySelector('.quick-chips-card');
ok('salon_cape_quick_chips_rendered', !!quickChips && quickChips.textContent.includes('Cape Quick-Select'));
'''


PHOTOSHOOT_EXPANSION_JS = r'''
const api = window.AfterglowStudio;
ok('photoshoot_api_available', !!api);

// 8. Photoshoot Poses (288 total) & Category Routing
const poses = api.getFields().pose.opts;
ok('photoshoot_poses_count_288', poses.length === 288, `poses=${poses.length}`);

const poseCats = {};
poses.forEach(o => {
  const c = api.getItemCategory('pose', o);
  poseCats[c] = (poseCats[c] || 0) + 1;
});
ok('pose_beauty_count', poseCats.beauty === 86, `beauty=${poseCats.beauty}`);
ok('pose_standing_count', poseCats.standing === 53, `standing=${poseCats.standing}`);
ok('pose_motion_count', poseCats.motion === 49, `motion=${poseCats.motion}`);
ok('pose_candid_count', poseCats.candid === 35, `candid=${poseCats.candid}`);
ok('pose_leaning_count', poseCats.leaning === 33, `leaning=${poseCats.leaning}`);
ok('pose_seated_count', poseCats.seated === 20, `seated=${poseCats.seated}`);
ok('pose_wet_count', poseCats.wet === 12, `wet=${poseCats.wet}`);

// 9. Cinematic Lightings (70 total) & Category Routing
const lightings = api.getFields().lighting.opts;
ok('photoshoot_lightings_count_70', lightings.length === 70, `lighting=${lightings.length}`);

const lightingCats = {};
lightings.forEach(o => {
  const c = api.getItemCategory('lighting', o);
  lightingCats[c] = (lightingCats[c] || 0) + 1;
});
ok('lighting_daylight_count', lightingCats.daylight === 20, `daylight=${lightingCats.daylight}`);
ok('lighting_studio_count', lightingCats.studio === 19, `studio=${lightingCats.studio}`);
ok('lighting_moody_count', lightingCats.moody === 10, `moody=${lightingCats.moody}`);
ok('lighting_warm_count', lightingCats.warm === 9, `warm=${lightingCats.warm}`);
ok('lighting_flash_count', lightingCats.flash === 6, `flash=${lightingCats.flash}`);
ok('lighting_aquatic_count', lightingCats.aquatic === 6, `aquatic=${lightingCats.aquatic}`);

// 10. Multi-Format Lookbook Suite (campaign_4, triptych_3, feature_5, contact_6)
const formats = ['campaign_4', 'triptych_3', 'feature_5', 'contact_6'];
formats.forEach(f => {
  api.setLookbookMode(true, 'all');
  api.setLookbookFormat(f);
  const series = api.buildLookbookSeries([], [], [], {});
  const expectedShots = (f === 'triptych_3') ? 3 : (f === 'feature_5') ? 5 : (f === 'contact_6') ? 6 : 4;
  const shotKeys = Object.keys(series).filter(k => k !== 'all');
  ok(`lookbook_${f}_shot_count`, shotKeys.length === expectedShots, `expected ${expectedShots}, got ${shotKeys.length}`);
  ok(`lookbook_${f}_has_full_text`, series.all && series.all.length > 250);
  ok(`lookbook_${f}_no_undefined`, !series.all.includes('undefined') && !series.all.includes('null'));
});

// 11. Lookbook Format Bar UI in Photoshoot
api.setLookbookMode(true, 'all');
const fmtBar = document.getElementById('lookbookFormatBar');
ok('photoshoot_lookbook_format_bar_exists', !!fmtBar);
ok('photoshoot_lookbook_format_bar_visible', fmtBar && fmtBar.style.display !== 'none');
const fmtButtons = fmtBar ? fmtBar.querySelectorAll('.seg-btn') : [];
ok('photoshoot_lookbook_format_buttons_4', fmtButtons.length === 4);

// 12. Wind Dynamics Quick-Chips Card in Photoshoot UI
document.querySelector('[data-section="pose"]').click();
const windChips = document.querySelector('.quick-chips-card');
ok('photoshoot_wind_chips_rendered', !!windChips && windChips.textContent.includes('Wind Dynamics'));
'''


def main():
    browser = find_browser()
    all_results = []
    
    print("\n--- SALON & BARBERSHOP STUDIO EXPANSIONS ---")
    salon_res = run_page_test(browser, 'salon.html', SALON_EXPANSION_JS)
    for r in salon_res:
        all_results.append(r)
        status = "PASS" if r["ok"] else "FAIL"
        extra = f" ({r['detail']})" if not r["ok"] else ""
        print(f"  [{status}] {r['name']}{extra}")

    print("\n--- MAKEOVER PHOTOSHOOT STUDIO EXPANSIONS ---")
    photo_res = run_page_test(browser, 'photoshoot.html', PHOTOSHOOT_EXPANSION_JS)
    for r in photo_res:
        all_results.append(r)
        status = "PASS" if r["ok"] else "FAIL"
        extra = f" ({r['detail']})" if not r["ok"] else ""
        print(f"  [{status}] {r['name']}{extra}")

    passed = sum(1 for r in all_results if r["ok"])
    failed = sum(1 for r in all_results if not r["ok"])
    print(f"\n==========================================")
    print(f"EXPANSION TEST RESULTS: {passed} passed, {failed} failed")
    print(f"==========================================")

    if failed > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
