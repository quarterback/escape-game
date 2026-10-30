/* ============================================================
   The demo: a guided first run on a fixed seed with a scripted die
   and scripted inquiry actions, so every step lands. The sim does not
   know the demo exists beyond the two queues and a flag. The UI asks
   Tutorial.allow() what the player may do and shows the coach box.
   The demo walks through the border; the airfield is handed over live.
   ============================================================ */
'use strict';
const Tutorial = (() => {
  const SEED = 11, WHO = 'woman';
  // Die results in the order the sim will ask for them along the scripted path.
  const DICE = [5, 4, 5, 5, 6, 5, 5, 6, 5, 5, 6, 5];
  // Inquiry actions at hours 4, 8 and 12. After the demo releases, the inquiry rolls as usual.
  const ENEMY = ['circulate', 'press_story', 'check_belief', 'press_story', 'check_belief', 'press_story', 'check_belief', 'press_story'];

  const NONE = { approaches: [], calls: [], options: [], wait: false, next: false };
  const info = (title, html, highlight) => ({ title, html, highlight: highlight || [], allow: Object.assign({}, NONE, { next: true }), done: () => false });
  const act = (title, html, highlight, allow, done) => ({ title, html, highlight: highlight || [], allow: Object.assign({}, NONE, allow), done });

  const STEPS = [
    info('A guided first run',
      `<p>You are Teresā Albukerkē, the defeated candidate. Reach Atlanta within 72 hours.</p><p>This tutorial guides you to the border. The airfield is yours to play.</p>`),
    info('The map',
      `<p>The gold dot marks you. The red eye marks where the inquiry is looking. Exposure rises when they match.</p><p>At exposure 10, Sosā catches you.</p>`, ['#scene', '#heat']),
    info('Two problems at once',
      `<p><b>Here</b> shows your next move. <b>The phone</b> lets you arrange help elsewhere while you travel.</p>`, ['#here-panel', '#phone-panel']),
    act('Answer your brother',
      `<p>Duartē found a jet. He needs a destination to book the crew.</p><p>Choose <b>Name Atlanta now</b>.</p>`,
      ['#inbox'], { options: ['name_atlanta'] }, (s) => s.flags.destination),
    act('Start an arrangement',
      `<p><b>Call Duartē about aircraft</b>. The call takes an hour; his reply is due six hours later.</p>`,
      ['#calls'], { calls: ['aircraft'] }, (s) => s.jobs.some(j => j.arr === 'aircraft')),
    info('A promise is not an arrangement',
      `<p>Check Arrangements for the reply time. An ally must pass a reliability roll to deliver. If the call fails, try again.</p>`, ['#arrangements']),
    act('Leave the house',
      `<p>Select <b>Decoy convoy</b>. Read the time and roll required, then press <b>Commit</b>. Nando’s card makes this approach available.</p>`,
      ['#approaches'], { approaches: ['decoy'] }, (s) => s.pos === 1),
    info('The die',
      `<p>Cards lower the roll you need. They stay in your hand unless used or withdrawn.</p><p>You reached Santa Laura. The inquiry still watches the house.</p>`, ['#scene']),
    act('A second document',
      `<p>Mārtā can issue a civil record the restriction does not name.</p><p>Choose <b>Go in person, one hour</b>. The record will take eight hours.</p>`,
      ['#inbox'], { options: ['sign_person'] }, (s) => s.arr.document.stage >= 1),
    info('The inquiry acts',
      `<p>Sosā sent the restriction to every post. Border rolls are now one point harder unless you have a delay-report card.</p><p>The inquiry acts every four hours.</p>`, ['#enemy']),
    act('Engage the sponsor',
      `<p><b>Call Salek about permission</b>. He can ask Atlanta to receive you.</p><p>Read his terms before committing. Calling accepts them.</p>`,
      ['#calls'], { calls: ['permission'] }, (s) => s.jobs.some(j => j.arr === 'permission') || s.arr.permission.stage >= 1),
    act('Pay someone who takes money',
      `<p>Nando’s cousin accepts money. Choose <b>Hire a driver and plain car</b>.</p>`,
      ['#approaches'], { approaches: ['second_driver'] }, (s) => s.pos === 2),
    info('Work finished while you drove',
      `<p>Duartē confirmed the crew while you drove.</p><p>The inquiry told the papers you had left. They are now looking in Portô Venla.</p>`, ['#arrangements']),
    act("Nonā Rosa's problem",
      `<p>Nonā Rosa’s cooperative truck was impounded.</p><p>Choose <b>Help Nonā Rosa free the truck</b>. It takes three hours and earns her help.</p>`,
      ['#approaches'], { approaches: ['help_host'] }, (s) => s.pos === 3),
    info('Relationships give cards',
      `<p>Nonā Rosa offers her truck and a driver. Their card can help you later.</p><p>Trusted allies are less likely to inform when Sosā questions them.</p>`, ['#hand', '#people']),
    act('Who meets you across the line',
      `<p><b>Call Duartē about reception</b>. He can reach Vélez in Esmeralda. Her officials could meet you at the border.</p>`,
      ['#calls'], { calls: ['reception'] }, (s) => s.jobs.some(j => j.arr === 'reception') || s.arr.reception.stage >= 1),
    act('Onto the freight',
      `<p>Choose <b>Pay Holt for a crate</b>. Your truck card improves the roll.</p><p>The yardmaster will take your money and report you.</p>`,
      ['#approaches'], { approaches: ['crate'] }, (s) => s.hand.includes('crate')),
    act('Board at midnight',
      `<p>Holt's crate is in your hand. It works in one place: this yard, tonight. <b>Board the midnight freight</b>. The card makes the roll certain, and it is spent when the train leaves.</p>`,
      ['#approaches'], { approaches: ['board'] }, (s) => s.pos === 4),
    info('The border',
      `<p>Mārtā’s civil record is ready. The border has Sosā’s order, but Gianlūka’s card helps.</p><p>You can cross now or wait for reception to be arranged.</p>`, ['#approaches', '#hand']),
    act('Present the civil record',
      `<p>Select <b>Present the Nelôxian civil record</b>. Read how the order and your cards affect the roll, then commit.</p>`,
      ['#approaches'], { approaches: ['civil_doc'] }, (s) => s.pos === 5),
    info('Susana airfield. The rest is yours.',
      `<p>You crossed. Now fuel the jet and arrange Atlanta’s permission. Your party card has no influence here.</p><p>Call Duartē and Salek as needed. Depart when the aircraft and permission are ready, or risk leaving without permission.</p><p>Press <b>Finish</b> to continue. Rolls and inquiry moves are no longer scripted.</p>`, ['#arrangements', '#hand']),
  ];

  let i = -1;
  function start() { i = 0; }
  function stop() { i = -1; }
  const active = () => i >= 0 && i < STEPS.length;
  const step = () => active() ? STEPS[i] : null;
  const index = () => i;
  const isLast = () => i === STEPS.length - 1;
  function allow() { return active() ? step().allow : { approaches: 'all', calls: 'all', options: 'all', wait: true, next: false }; }
  function allowsApproach(id) { const a = allow(); return a.approaches === 'all' || a.approaches.includes(id); }
  function allowsCall(arr) { const a = allow(); return a.calls === 'all' || a.calls.includes(arr); }
  function allowsOption(id) { const a = allow(); return a.options === 'all' || a.options.includes(id); }
  function allowsWait() { return allow().wait; }
  // called after each resolved action: advance past any done act-step
  function sync(s) { let moved = false; while (active() && !step().allow.next && step().done(s)) { i += 1; moved = true; } return moved; }
  function next() { if (active() && step().allow.next) { if (isLast()) stop(); else i += 1; } }
  return { SEED, WHO, DICE, ENEMY, STEPS, start, stop, active, step, index, isLast, allow, allowsApproach, allowsCall, allowsOption, allowsWait, sync, next };
})();
if (typeof module !== 'undefined') module.exports = Tutorial;
