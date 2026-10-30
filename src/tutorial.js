/* ============================================================
   Tutorial: a scripted practice night on a fixed deck.
   The sim is untouched. The tutorial only decides what the player is
   allowed to do at each step (UI asks Tutorial.allow()) and what the
   coach box says. Steps advance when their done() test passes.
   ============================================================ */
'use strict';
const Tutorial = (() => {
  // Drawn from the END. Opening hand: Commission papers, Sell maps, Distraction, Sweet talk.
  // Then, in draw order: Bribe, Lay low, Pick lock, Call in a favor, Hire courier, Call in a favor...
  const DECK = ['bribe', 'forgery', 'distract', 'talk', 'picklock', 'sellmaps', 'laylow', 'favor', 'courier',
                'favor', 'picklock', 'laylow', 'bribe', 'talk', 'distract', 'sellmaps', 'forgery'];
  const SEED = 7;
  const PERSONA = 'cartographer';

  const NONE = { cards: [], targets: [], move: 0, wait: false, swap: false, board: false, commit: false, next: false };
  const ALL = { cards: 'all', targets: 'all', move: 2, wait: true, swap: true, board: true, commit: true, next: false };
  const info = (title, html, highlight) => ({ title, html, highlight: highlight || [], allow: Object.assign({}, NONE, { next: true }), done: () => false });
  const act = (title, html, highlight, allow, done) => ({ title, html, highlight: highlight || [], allow: Object.assign({}, NONE, allow), done });

  const STEPS = [
    info('A practice night',
      `<p>This is a guided run. The deck is fixed so every step works, and the coach box tells you what to do and why. On a real night the deck is shuffled and the coach is gone.</p>
       <p><b>Who you are.</b> Inēs Biankī, a chart-maker in a rail town in Salta, Valdória. You owe money you cannot pay, and your name is in the bailiffs' ledger.</p>
       <p><b>What you want.</b> The midnight freight is the last train over the mountains to Esmeralda before the line closes. Be hidden on it when it leaves and the debt stays behind.</p>
       <p><b>How long you have.</b> Seven hours. It is 17:00 now. Every action takes half an hour, so you get about 14 moves.</p>`),
    info('The top bar',
      `<p><b>Clock</b> shows the time and how much of the night is used up.</p>
       <p><b>Coin</b> is australs, the money here. You spend it on bribes and on hiring people.</p>
       <p><b>Favors</b> are a second currency. Some people owe you. Two cards spend a favor instead of money, and there is no way to buy more.</p>
       <p><b>Heat</b> is how much the town is talking about you. It goes up when people notice you. From 3, the bailiffs start asking around each half-hour. At 8 they find you and the night is over.</p>
       <p><b>Where</b> is which of the five places you are standing in.</p>`, ['header']),
    info('The route',
      `<p>The picture is the town. Five places, left to right: your attic, the market, the customs post, the rail yard and the freight platform. The train is on the right.</p>
       <p>The dots along the top of the picture are the same five places. A <span style="color:#ff6a6a">red bar</span> between two dots means you cannot walk that way yet. There are two: Gaspār the customs guard blocks the way into the yard, and the registry window blocks the way onto the platform.</p>
       <p>Hover over anyone in the picture to see who they are and what they are doing.</p>`, ['#scene']),
    info('What you still need',
      `<p>To board you need four things. This list tracks them and tells you how to get each one.</p>
       <p><b>Papers</b>: a forged passport, so the registry lets you into the yard.<br>
          <b>Passage</b>: a way past the customs guard.<br>
          <b>Yard</b>: a way across the yard, either your papers or the foreman's goodwill.<br>
          <b>Berth</b>: a hiding place on the train, which only the brakeman can give you.</p>
       <p>Each has at least two ways to get it. Tonight we will use one way for each.</p>`, ['#needs-panel']),
    act('Walk to the market',
      `<p>Nothing useful happens in the attic. Press <b>Walk on to the market</b> (or the right arrow key). Walking between places takes 30 minutes.</p>`,
      ['#fwd'], { move: 1 }, (s) => s.pos === 1),
    info('The market',
      `<p>The clock says 17:30. You are at the market, where Lūçīā the forger has her bench, Pipô the lookout is kicking stones, and your own stall of charts is still stocked.</p>
       <p>Now the cards. Your hand holds four. Each card is a trick you can play on a person, an object or a place. The colored stripe on top says which: <span style="color:#7ab0ff">blue</span> for people, <span style="color:#d0a060">tan</span> for objects, <span style="color:#5cd65c">green</span> for places, <span style="color:#b48ad8">purple</span> for a service you order.</p>
       <p>The line under each name shows what it costs and how long it takes. The small print at the bottom says how many uses it has from where you stand.</p>`, ['#hand']),
    act('Pick the Commission papers card',
      `<p>Click <b>Commission papers</b>. It costs 2 australs and hires Lūçīā to forge your passport.</p>`,
      ['#hand .card.t-forgery'], { cards: ['forgery'] }, (s, c) => c.selCard === 'forgery'),
    act('Choose who it affects',
      `<p>With a card selected, the <b>Targets</b> panel lists every person, object or place it can touch, and the same people glow in the picture. Grey entries say why they are not possible right now.</p>
       <p>Click <b>Lūçīā Ferrārô</b>, in the list or in the picture.</p>`,
      ['#targets', '#scene'], { cards: ['forgery'], targets: ['forger'] }, (s, c) => c.selTarget === 'forger'),
    act('Read it, then commit',
      `<p>The panel under the list is the <b>inspection</b>. It says exactly what will happen, what it costs and how long it takes, before you spend anything. Nothing is final until you press <b>Commit</b>.</p>
       <p>Press Commit now.</p>`,
      ['#inspect'], { cards: ['forgery'], targets: ['forger'], commit: true }, (s) => s.objects.papers.state !== 'blank'),
    info('Work in progress',
      `<p>You paid 2 australs and half an hour passed. Lūçīā has a bubble over her head with dots in it: each dot is a half-hour of work left. The <b>In progress</b> list says the same thing in words.</p>
       <p>Pending work keeps going while you do other things. Every half-hour that passes, for any reason, counts toward it.</p>
       <p>A new card was drawn to replace the one you played. Your hand is always four cards.</p>`, ['#pending-panel', '#scene']),
    act('Raise some money',
      `<p>Two australs is tight. Play <b>Sell maps</b> on <b>your market stall</b>: select the card, click the stall, commit.</p>
       <p>Read the inspection first. You gain 4 australs, but heat goes up by 1, because everyone here knows your charts.</p>`,
      ['#hand .card.t-sellmaps'], { cards: ['sellmaps'], targets: ['stall'], commit: true }, (s) => s.objects.stall.state === 'sold'),
    info('Heat',
      `<p>Heat is now 1 of 8. Most useful things raise it: bribes, lock picking, selling your own work, making a scene. From 3 the bailiffs may stop you on the street each half-hour and raise it further. At 8 you are caught.</p>
       <p>The <b>Lay low</b> card lowers it: 1 in a doorway anywhere, 3 if you go back to the attic. Tonight your heat will stay low, so you will not need it.</p>`, ['#heat']),
    act('Send Pipô ahead',
      `<p>Now for Passage past the guard. You could bribe Gaspār or kick over his brazier yourself, but both cost you something. Pipô will do it for free.</p>
       <p>Play <b>Distraction</b> on <b>Pipô Rosī</b>. He runs ahead to the customs post and starts a fight. Gaspār will be busy for three half-hours, and none of the heat lands on you.</p>`,
      ['#hand .card.t-distract'], { cards: ['distract'], targets: ['lookout'], commit: true }, (s) => s.people.lookout.state === 'running'),
    info('Two things done at once',
      `<p>Look at <b>What you still need</b>. <b>Passage</b> is arranged: Gaspār has a question mark over his head and the red bar on the route is gone. It is temporary, two half-hours left, so move soon.</p>
       <p><b>Papers</b> is also done. Lūçīā finished while you were busy with Pipô. That is the point of pending work: start it early, do other things while it runs.</p>`, ['#needs-panel', '#scene']),
    act('Walk to the customs post',
      `<p>Press <b>Walk on to the customs post</b>.</p>`, ['#fwd'], { move: 1 }, (s) => s.pos === 2),
    act('Slip past Gaspār',
      `<p>He is shouting at the smoke. Keep going: <b>Walk on to the yard</b>. If you wait here until he turns around, the way shuts again.</p>`,
      ['#fwd'], { move: 1 }, (s) => s.pos === 3),
    info('The rail yard',
      `<p>Mārtā at the registry window glanced at your stamped passport and waved you on, which is why <b>Yard</b> is already marked arranged. Theo the foreman is here too. He does not like you yet.</p>
       <p>Look at your hand. <b>Pick lock</b> is greyed out: its only targets are the side gate back at customs and the crate on the platform, so it has 0 uses here. A card you cannot use is a dead card.</p>`, ['#hand .card.t-picklock']),
    act('Swap a dead card',
      `<p>Select <b>Pick lock</b>, then press <b>Wait 30 minutes and swap the selected card</b>. You lose half an hour, and the card is replaced with a fresh draw.</p>
       <p>This is also how you pass time on purpose, say while the forger finishes.</p>`,
      ['#hand .card.t-picklock', '#wait'], { cards: ['picklock'], wait: true, swap: true }, (s) => s.tick >= 7 && !s.hand.some(c => c.type === 'picklock')),
    act('Make a friend of Theo',
      `<p>You need Theo for the last step: Holt the brakeman only takes money from Theo's friends.</p>
       <p>Play <b>Sweet talk</b> on <b>Theo Bascom</b>. It costs one favor instead of money. Favors are scarce, so this is what they are for: the moments money will not work.</p>`,
      ['#hand .card.t-talk'], { cards: ['talk'], targets: ['teo'], commit: true }, (s) => s.people.teo.state === 'friendly'),
    act('Walk to the platform',
      `<p>Theo will walk you past the window. Press <b>Walk on to the platform</b>.</p>`, ['#fwd'], { move: 1 }, (s) => s.pos === 4),
    act('Buy your berth',
      `<p>Last thing: a <b>Berth</b>. Play <b>Bribe</b> on <b>Holt Greer</b>. It costs 3 australs. You have 7.</p>
       <p>Note the warning on the card: every bribe you pay raises the price of the next one by 1 austral, because the town learns what you will pay. Plan to bribe at most twice in a night.</p>`,
      ['#hand .card.t-bribe'], { cards: ['bribe'], targets: ['brakeman'], commit: true }, (s) => s.people.brakeman.state === 'agreed'),
    act('Board the freight',
      `<p>All four things are arranged and the <b>Board the freight</b> button is lit. Press it. You do not have to wait for midnight; once you are in the crate, you are out.</p>`,
      ['#board'], { board: true }, (s) => !!s.over),
    info('That was a night',
      `<p>You boarded at 22:00 with 4 australs and heat 1. On a real night the deck is shuffled, so you will not always have the right card at the right place. When you do not: pass time, swap a dead card, or take the other route to the same thing.</p>
       <p><b>Who you are changes how you play.</b></p>
       <p><b>The chart-maker</b> starts with 5 australs and 2 favors. A balanced night: one bribe or a forgery, and two favor cards.</p>
       <p><b>The toll-taker's niece</b> starts with 8 australs, 1 favor and heat 1. You can bribe your way through, but each bribe is dearer and hotter than the last, and the bailiffs are already asking about you. Lay low more.</p>
       <p><b>The settlement clerk</b> starts with 2 australs and 4 favors. You cannot afford a single bribe. You live on Sweet talk, Call in a favor, Pipô, and selling your maps.</p>
       <p>Press <b>Finish</b> to choose who you are and start a real night.</p>`),
  ];

  let active = false, step = 0, hooks = { onRender: null, onFinish: null };

  function start(hk) { Object.assign(hooks, hk); active = true; step = 0; }
  function stop() { active = false; step = 0; }
  function isActive() { return active; }
  function current() { return active ? STEPS[step] : null; }
  function allow() { return active ? STEPS[step].allow : ALL; }
  function isLast() { return active && step === STEPS.length - 1; }
  function next() {
    if (!active) return;
    if (step < STEPS.length - 1) step += 1;
    else { stop(); if (hooks.onFinish) hooks.onFinish(); return; }
    if (hooks.onRender) hooks.onRender();
  }
  // Called by the UI after every render. ctx = {selCard: type|null, selTarget: id|null}. Returns true if the step changed.
  function sync(s, ctx) {
    if (!active) return false;
    const st = STEPS[step];
    if (st.allow.next) return false;              // info steps wait for the button
    if (st.done(s, ctx)) { step = Math.min(step + 1, STEPS.length - 1); return true; }
    return false;
  }
  function allowsCard(type) { const a = allow(); return a.cards === 'all' || a.cards.includes(type); }
  function allowsTarget(id) { const a = allow(); return a.targets === 'all' || a.targets.includes(id); }
  function allowsMove(dir) { const a = allow(); return a.move === 2 || a.move === dir; }

  return { DECK, SEED, PERSONA, STEPS, start, stop, isActive, current, allow, allowsCard, allowsTarget, allowsMove, next, sync, isLast, stepIndex: () => step };
})();
if (typeof module !== 'undefined') module.exports = Tutorial;
