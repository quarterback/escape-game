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
  const DICE = [5, 4, 5, 3, 6, 5];
  // Inquiry actions at hours 4, 8 and 12. After the demo releases, the inquiry rolls as usual.
  const ENEMY = ['circulate', 'press_story', 'check_belief'];

  const NONE = { approaches: [], calls: [], options: [], wait: false, next: false };
  const info = (title, html, highlight) => ({ title, html, highlight: highlight || [], allow: Object.assign({}, NONE, { next: true }), done: () => false });
  const act = (title, html, highlight, allow, done) => ({ title, html, highlight: highlight || [], allow: Object.assign({}, NONE, allow), done });

  const STEPS = [
    info('A guided first run',
      `<p>This run is scripted, so every step works. A real run is not.</p>
       <p>You are Teresā Albukerkē. You lost the presidency on Saturday. A court has barred you from leaving.</p>
       <p>Cross the border into Esmeralda and leave its airspace in a jet bound for Atlanta. You have 72 hours.</p>`),
    info('The map',
      `<p>The strip at the top of the picture is the route. The <span style="color:#ffd24a">gold dot</span> is you. The <span style="color:#ff8a8a">red eye</span> is where the inquiry thinks you are. When both sit on one place, exposure climbs.</p>
       <p><b>Exposure</b> is top right. At 10, Inspector Sosā's people arrive.</p>`, ['#scene', '#heat']),
    info('Two problems at once',
      `<p><b>Here</b> is the problem in front of you. Solve it to move on.</p>
       <p><b>The phone</b> is what your allies are doing elsewhere: a jet, a document, landing rights. They keep working while you travel. Each one is a promise until the person delivers.</p>`, ['#here-panel', '#phone-panel']),
    act('Answer your brother',
      `<p>Duartē has a jet. The operator wants a destination before he gives you a crew. Each answer shows its cost and what it unlocks.</p>
       <p>Choose <b>Name Atlanta now</b>.</p>`,
      ['#inbox'], { options: ['name_atlanta'] }, (s) => s.flags.destination),
    act('Start an arrangement',
      `<p>Each line under Arrangements must be ready before you need it. <b>Call Duartē about aircraft</b>. The call takes an hour. He rolls a die against his reliability, and you hear back at the hour shown.</p>`,
      ['#calls'], { calls: ['aircraft'] }, (s) => s.jobs.some(j => j.arr === 'aircraft')),
    info('A promise is not an arrangement',
      `<p>The aircraft line says Duartē is working and when he is due. Nothing has changed yet. If his roll fails, you call again.</p>
       <p>Reliability differs by person. Your driver of 11 years delivers on a 2 or more. A banker you have never met needs a 4.</p>`, ['#arrangements']),
    act('Leave the house',
      `<p>Now the local problem. Each approach shows the hours it takes and the die it needs. <b>Decoy convoy</b> needs the card Nando gave you. Select it, read what helps it, then press <b>Commit</b>.</p>`,
      ['#approaches'], { approaches: ['decoy'] }, (s) => s.pos === 1),
    info('The die',
      `<p>The number you needed was the approach's difficulty minus the help you held. Cards are not spent. They lower the die.</p>
       <p>You are in Santa Laura. The inquiry still watches an empty house. A message is waiting.</p>`, ['#scene']),
    act('A second document',
      `<p>Every Valdórian has a Nelôxian civil-name record on file. Issued fresh, it is a travel document the court order does not name. Mārtā needs your signature. Choose <b>Go in person, one hour</b>.</p>`,
      ['#inbox'], { options: ['sign_person'] }, (s) => s.arr.document.stage >= 1),
    info('The inquiry acts',
      `<p>While you signed, Sosā sent the departure order to every post and the border. He acts every four hours, in the open. The list is at the bottom right. This action makes the border die one harder unless you hold a card that delays the report.</p>`, ['#enemy']),
    act('Engage the sponsor',
      `<p>Atlanta will not land a stranger's jet. Bīr Amādū Salek, a banker in Lāyūna, can ask the ministry. <b>Call Salek about permission</b>. Read the inspection first: he has terms, and the call accepts them. Your promises are listed under People.</p>`,
      ['#calls'], { calls: ['permission'] }, (s) => s.jobs.some(j => j.arr === 'permission') || s.arr.permission.stage >= 1),
    act('Pay someone who takes money',
      `<p>Money is never short. The question is whether the person takes it. Nando's cousin does. <b>Pay for a second driver and a plain car</b>.</p>`,
      ['#approaches'], { approaches: ['second_driver'] }, (s) => s.pos === 2),
    info('Work finished while you drove',
      `<p>The aircraft now has a crew. Duartē's roll came in while you were on the road. That is the phone: people you set in motion keep working.</p>
       <p>The inquiry told the papers you had left the country. The red eye went back to Portô Venla.</p>`, ['#arrangements']),
    act("Nonā Rosa's problem",
      `<p>You are at the colônia for the night. Nonā Rosa has a room and a problem: her cooperative's truck was impounded. Helping costs three hours and earns something you cannot buy. Choose <b>Spend the evening on Nonā Rosa's problem</b>.</p>`,
      ['#approaches'], { approaches: ['help_host'] }, (s) => s.pos === 3),
    info('Relationships give cards',
      `<p>Nonā Rosa trusts you. Her grape truck is in your hand. A card is specific help from a specific person. It stays with you until it is used or the person turns. Allies who trust you hold up better when Sosā presses them.</p>`, ['#hand', '#people']),
    act('Who meets you across the line',
      `<p>You are in Salta, a day from the border. Nobody waits on the other side yet. <b>Call Duartē about reception</b>. He knows the interior minister's aide in Baca. Reception turns a border post into a handshake.</p>`,
      ['#calls'], { calls: ['reception'] }, (s) => s.jobs.some(j => j.arr === 'reception') || s.arr.reception.stage >= 1),
    act('Onto the freight',
      `<p>Two men can put you on the midnight freight. Holt takes money. The yardmaster takes money and calls the ministry; his die needs a 7. <b>Pay Holt for a crate</b>. The truck card lowers his die.</p>`,
      ['#approaches'], { approaches: ['crate'] }, (s) => s.pos === 4),
    info('The border',
      `<p>This is the one crossing. Everything you carried counts: the civil record Mārtā finished, the order Sosā circulated, Gianlūka's card, and whether anyone waits across the line. Nobody does yet. You could wait for Duartē's call, or go now.</p>`, ['#approaches', '#hand']),
    act('Present the civil record',
      `<p>Choose <b>Present the Nelôxian civil record</b>. Read the inspection. The die needs more than it did at the house because the order is on the desk, and less than it would without Gianlūka's card.</p>`,
      ['#approaches'], { approaches: ['civil_doc'] }, (s) => s.pos === 5),
    info('Susana airfield. The rest is yours.',
      `<p>You are across. The jet still needs fuel and a spot on the apron. Atlanta still has to say yes. The inquiry has asked Esmeralda to hold you. The party card means nothing here.</p>
       <p>From here the die is real and the inquiry picks its own moves. Fuel the jet. Keep calling Salek until Atlanta answers. Depart when Aircraft reads "waiting on the apron" and Permission reads "Atlanta will receive you". Or go without the answer and roll against a nervous pilot.</p>
       <p>Press <b>Finish</b> to play on without the coach.</p>`, ['#arrangements', '#hand']),
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
