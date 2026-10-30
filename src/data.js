/* ============================================================
   COALITION data: levels, people, arrangements, cards, enemy actions.
   Plain tables. Names from quarterback/kels (world/names.md,
   verdenese/, world/atlanta-lore.md); Esmeralda, Baca and Susana are
   owner canon. Everything here is a prototype choice (docs/game-direction.md).
   ============================================================ */
'use strict';
const Data = (() => {
  const CHARACTERS = {
    woman: { id: 'woman', name: 'Teresā Albukerkē', short: 'Teresā', title: 'the defeated candidate', pronoun: 'she',
             sibling: { id: 'sibling', name: 'Duartē Albukerkē', short: 'Duartē', rel: 'your brother' },
             blurb: "Former interior minister. Wealthy, well connected and defeated by four points." },
    man:   { id: 'man', name: 'Matēu Zanetī', short: 'Matēu', title: 'the defeated candidate', pronoun: 'he',
             sibling: { id: 'sibling', name: 'Līviā Zanetī', short: 'Līviā', rel: 'your sister' },
             blurb: "Former senator and shipping heir. Defeated by four points and watched since the count." },
  };

  // Allies. reliability: the die result a delegated job needs (lower is better). where: level index they act from.
  const PEOPLE = {
    sibling:  { role: 'arranging the aircraft from abroad', where: -1, reliability: 3 },
    aide:     { name: 'Gianlūka Moretī', role: 'party chief of staff', where: 0, reliability: 3,
                terms: 'He wants your public word that he leads the party in your absence.' },
    nando:    { name: 'Nando', role: 'your driver for eleven years', where: 0, reliability: 2 },
    sponsor:  { name: 'Bīr Amādū Salek', role: 'banker in Lāyūna, Atlanta; an old client of the family', where: -1, reliability: 4,
                terms: 'He will speak to the Atlantan ministry if you move the family accounts to his house.' },
    host:     { name: 'Nonā Rosa Trentinī', role: 'matriarch of the Nova Trentô colônia', where: 2, reliability: 2 },
    official: { name: 'Rosario Vélez', role: "aide to Esmeralda's interior minister", where: 4, reliability: 4,
                terms: 'She wants it understood that Esmeralda receives you as a guest, not as a government in exile.' },
    holt:     { name: 'Holt Greer', role: 'brakeman on the Huhūi freight', where: 3, reliability: 2 },
    theo:     { name: 'Theo Bascom', role: 'yard foreman in the Salta rail town', where: 3, reliability: 3 },
    pilot:    { name: 'Capitān Olsēn', role: 'charter pilot, Susana', where: 5, reliability: 3 },
    press:    { name: 'Rādiô Portô Venla', role: 'the station everyone in the capital has on', where: -1, reliability: 6 },
  };

  // The enemy. Inspector Valentīn Sosā, Interior Ministry. Each action is concrete and visible.
  const ENEMY = { name: 'Inspector Valentīn Sosā', role: 'Interior Ministry, head of the departure inquiry' };

  // Continuing arrangements: ordered stages. A stage is a promise until the ally delivers.
  const ARRANGEMENTS = {
    aircraft:   { name: 'Aircraft',    stages: ['none', 'charter found', 'crew confirmed', 'fueled at Susana', 'ready at Susana'],
                  what: 'Your sibling arranges the charter, crew, fuel and position at Susana.' },
    reception:  { name: 'Reception',   stages: ['none', 'Esmeralda expects you', 'minister informed', 'officials at the border'],
                  what: "Someone at the ministry in Baca has your name. Vélez arranges officials to meet you at the border." },
    permission: { name: 'Entry visa',  stages: ['none', 'sponsor engaged', 'Entry visa for Atlanta'],
                  what: 'Salek asks Atlanta’s ministry for a visa to land and stay.' },
  };

  // Cards: specific help from a specific person. A card is authority, and authority is local:
  // reach lists the levels where it counts. Outside its reach a card is in your hand and does nothing.
  // tag is what approaches and message options look for. works: plain words for the card face.
  const VALDORIA = ['residence', 'road', 'colonia', 'salta', 'border'], ESMERALDA = ['border', 'airfield'];
  const ALL = ['residence', 'road', 'colonia', 'salta', 'border', 'airfield'];
  const CARDS = {
    decoy_cars:   { name: 'Two more cars like yours', tag: 'decoy', from: 'nando', reach: ['residence', 'road'], works: 'Leaving the house. Driving on in your own car.',
                    text: "Two matching sedans and two friends who will drive them the wrong way." },
    aide_word:    { name: 'The party machine', tag: 'influence', from: 'aide', reach: VALDORIA, works: 'Officials in Valdória, up to the line. Nothing across it.',
                    text: "Gianlūka can put a mayor, a judge or a border post on the phone. Each call costs you with him." },
    truck:        { name: "The colônia's grape truck", tag: 'vehicle', from: 'host', reach: ['colonia', 'salta'], works: 'The road to Salta and the rail yard.',
                    text: "A farm truck nobody looks at twice, and a cousin who drives it to Salta every week." },
    passport:     { name: 'Your second passport', tag: 'document', from: 'self', reach: ESMERALDA, works: 'The border post and the airfield manifest.',
                    text: "You have held it for years. The travel ban lists your other one." },
    intro_vel:    { name: "Rosario Vélez's card", tag: 'introduction', from: 'official', reach: ESMERALDA, works: 'Esmeraldan officials: the post, the tower, the operator.',
                    text: "Vélez’s number and her word that the border post knows your name." },
    delay_report: { name: 'A report held one day', tag: 'delay', from: 'aide', reach: VALDORIA, works: 'Any Valdórian post reading the restriction.',
                    text: "Gianlūka’s contact holds the sighting report until tomorrow. The ban is not on the desk yet." },
    crate:        { name: "Holt's chalk-marked crate", tag: 'passage', from: 'holt', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "Third boxcar. Straw inside. Holt leaves at midnight and does not wait." },
    yard_walk:    { name: 'Theo walks you through', tag: 'passage', from: 'theo', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "Theo escorts you past the yard office to the train." },
    sponsor_line: { name: "Amādū Salek's line to the ministry", tag: 'permission', from: 'sponsor', reach: ALL, works: 'Anyone who banks. Vélez’s uncle. A nervous pilot.',
                    text: "Salek’s name opens doors money alone does not. He keeps count." },
    informant:    { name: 'A friend in the inquiry', tag: 'information', from: 'aide', reach: VALDORIA, works: 'Any move the inquiry could be watching, up to the line.',
                    text: "A clerk tells Gianlūka where Sosā is looking and who is on duty." },
  };

  // Levels. Each approach: needs (all must hold), dc (die needs dc or more after mods), mods (tag: bonus),
  // and what happens. hours: time spent attempting. Failure never ends the run by itself.
  const LEVELS = [
    { id: 'residence', name: 'The residence, Portô Venla', short: 'Residence', scene: 'residence',
      objective: "Get out of the house without the watch following. Before you can fly you need three things from three people: a jet (Duartē), someone waiting at the border (Vélez), and an entry visa for Atlanta (Salek). Start them now. They take hours.",
      arrive: "Two unmarked cars watch the house. The court has barred you from leaving and wants your passports by Monday. One of them is in your coat.",
      approaches: [
        { id: 'decoy', name: 'Decoy convoy', hours: 3, dc: 3, needs: [{ card: 'decoy' }],
          mods: { information: 2 }, text: "Send three cars in different directions. The watch must follow the wrong one.",
          success: { belief: 0, exposure: -1, say: "The watch follows a decoy. You leave by the service lane." },
          fail: { exposure: 2, say: 'The second car is stopped at the avenida. Nando talks his way out, but they know the cars now.' } },
        { id: 'service', name: 'The service door after dark', hours: 1, dc: 4, needs: [{ night: true }],
          mods: { information: 1 }, text: "Leave with the kitchen staff after 22:00.",
          success: { belief: 0, say: 'The night cook lends you an apron and a cigarette. Nobody looks at the help.' },
          fail: { exposure: 2, say: 'A flash from a parked car. Someone photographed the help tonight.' } },
        { id: 'partycar', name: "The party's official car", hours: 1, dc: 2, needs: [{ card: 'influence' }],
          mods: {}, text: "Use Gianlūka’s official car. He will expect your promised endorsement.",
          success: { belief: 0, commit: 'aide', say: 'The flags get you through. Gianlūka reminds you, gently, what he asked for.' },
          fail: { exposure: 1, commit: 'aide', say: 'The car is let through, but the inspector is told whose car it was.' } },
      ] },
    { id: 'road', name: 'The road south, Santa Laura', short: 'Santa Laura', scene: 'road',
      objective: "Change cars and keep moving. Every hour the inquiry looks in the right place, exposure climbs. Keep them looking at the coast.",
      arrive: "Santa Laura. The radio puts you on a yacht in Portô Venla. The posts have not received the travel ban yet.",
      approaches: [
        { id: 'second_driver', name: "Hire a driver and plain car", hours: 2, dc: 3, needs: [], pay: true,
          mods: { information: 1 }, text: "Nando’s cousin offers a taxi and his silence.",
          success: { say: "You leave by taxi. Nando drives your sedan north as a decoy." },
          fail: { exposure: 1, hours: 2, say: 'The cousin wants more, then wants nothing to do with it. Two hours lost.' } },
        { id: 'siblings_driver', name: "Leave with Duartē's driver", hours: 2, dc: 2, needs: [{ arr: 'aircraft', stage: 1 }],
          mods: { information: 1 }, text: 'Your sibling knows a man in Santa Laura. Once the charter is booked, he drives you to Nova Trentô.',
          success: { say: 'He asks nothing and drives the back roads. The radio stays off.' },
          fail: { exposure: 1, hours: 1, say: 'He is late, then nervous. An hour on a side street waiting for him to decide.' } },
        { id: 'known_car', name: 'Drive on in your own car', hours: 1, dc: 5, needs: [],
          mods: { delay: 2, decoy: 2 }, text: "Risk the posts in a car they recognize. Nando's spare sedans can run ahead of you.",
          success: { exposure: 1, say: 'You pass the first post before the fax does.' },
          fail: { exposure: 3, belief: 1, say: 'The post at the river has your plate. They let you through and pick up the phone.' } },
      ] },
    { id: 'colonia', name: 'The colônia, Nova Trentô', short: 'Nova Trentô', scene: 'colonia',
      objective: "A safe house for the night. Use it: call Duartē, Salek and Vélez. Do not take the road to the border until someone in Baca has your name.",
      arrive: "Nonā Rosa offers a room and a phone. Her cooperative’s truck was impounded this morning.",
      approaches: [
        { id: 'help_host', name: "Help Nonā Rosa free the truck", hours: 3, dc: 2, needs: [],
          mods: { influence: 2 }, text: "Free the cooperative’s truck instead of calling your own contacts.",
          success: { card: 'truck', trust: 'host', say: "The truck is released. Nonā Rosa offers it with a driver and keeps your visit quiet." },
          fail: { card: 'truck', hours: 1, say: 'The truck comes back at dawn, late and dented. She is grateful anyway.' } },
        { id: 'work_phone', name: "Call your contacts", hours: 3, dc: 1, needs: [],
          mods: {}, text: "Advance the aircraft, reception and permission arrangements.",
          success: { advance: ['aircraft', 'reception', 'permission'], say: 'By two in the morning three things have moved. Nonā Rosa eats alone.' }, fail: { say: '' } },
        { id: 'sleep', name: 'Sleep', hours: 6, dc: 1, needs: [],
          mods: {}, text: "Rest for six hours. Exposure drops, but the inquiry keeps working.",
          success: { exposure: -2, say: 'You wake before the roosters. The house is quiet and the radio still has you at sea.' }, fail: { say: '' } },
        { id: 'leave', name: 'Take the road to Salta', hours: 2, dc: 1, needs: [{ arr: 'reception', stage: 1 }],
          mods: {}, text: "Do not climb toward the border until someone in Baca has your name. Then go.",
          success: { say: 'Nonā Rosa’s cousin drives. The road climbs and the radio loses the station.' }, fail: { say: '' } },
      ] },
    { id: 'salta', name: 'The rail town, Salta', short: 'Salta', scene: 'salta',
      objective: "The midnight freight is the only way over the passes. Holt or Theo can get you on. The yardmaster will take your money and call Sosā.",
      arrive: "The midnight freight climbs to the border. Holt and Theo can get you aboard.",
      approaches: [
        { id: 'board', name: 'Board the midnight freight', hours: 1, dc: 3, needs: [{ card: 'passage' }, { night: true }],
          mods: { passage: 2 }, text: "The freight leaves at midnight. Holt or Theo gets you on; you still have to be there.",
          success: { say: 'The train pulls out at twelve past. Cold straw, then the sound of the grade.' },
          fail: { exposure: 1, say: 'A lamp swings down the cars. You miss the midnight and wait for the next.' } },
        { id: 'crate', name: "Pay Holt for a crate", hours: 2, dc: 3, needs: [], pay: true,
          mods: { vehicle: 1, information: 1 }, text: "Pay Holt to hide you in the third boxcar.",
          success: { card: 'crate', say: 'Holt pockets the notes without counting them. "Third car. Midnight. I don\'t wait."' },
          fail: { exposure: 1, say: 'Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide.' } },
        { id: 'foreman', name: "Theo's walk-through", hours: 2, dc: 4, needs: [],
          mods: { vehicle: 2, information: 1, influence: 1 }, text: "Theo escorts you through the yard. The colônia’s truck strengthens your case.",
          success: { card: 'yard_walk', trust: 'theo', say: 'Theo talks about switches the whole way across the yard. Nobody interrupts a foreman.' },
          fail: { exposure: 1, say: 'The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change.' } },
        { id: 'buy_seat', name: 'Pay the yardmaster', hours: 1, dc: 7, needs: [], pay: true,
          mods: {}, text: "He will pocket the money and report you. This cannot succeed.",
          success: { exposure: 2, say: "Three men watch the yardmaster take your money." },
          fail: { exposure: 2, say: 'He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here.' } },
      ] },
    { id: 'border', name: 'The line at the Huhūi passes', short: 'The line', scene: 'border',
      objective: "One crossing. Your party means nothing past this line. Your second passport, people waiting for you, or a guard who takes money. Choose before the travel ban reaches the desk.",
      arrive: "Two guards wait at the barrier. Across the line, the Esmeraldan post is lit. The travel ban may already be on the desk.",
      border: true,
      approaches: [
        { id: 'received', name: 'Walk to the people waiting for you', hours: 1, dc: 1, needs: [{ arr: 'reception', stage: 3 }],
          mods: {}, text: "Esmeraldan officials are at the line. The Valdórian side can watch you go.",
          success: { say: 'Rosario Vélez shakes your hand across the barrier. The guards on your side write nothing down.' }, fail: { say: '' } },
        { id: 'show_passport', name: 'Show your second passport', hours: 1, dc: 4, needs: [{ card: 'document' }],
          mods: { introduction: 2, influence: 1 }, text: "The ban lists your other passport. They may recognize your face.",
          success: { say: 'The guard turns the pages, looks at a sheet on the desk, and stamps it.' },
          fail: { exposure: 2, hours: 3, say: 'The guard reads the sheet first. Three hours in a cold room before Gianlūka\'s phone call gets you back outside, on the wrong side.' } },
        { id: 'pay_post', name: 'Pay the post', hours: 1, dc: 4, needs: [], pay: true,
          mods: { delay: 2, information: 2 }, text: "The older guard takes bribes. The younger one reports them. You do not know who is on duty.",
          success: { exposure: 1, say: 'The barrier goes up. Nobody says thank you.' },
          fail: { exposure: 2, hours: 2, say: 'The older guard takes the money and the younger one calls the ministry. Gianlūka\'s friend buys you two hours.' } },
        { id: 'own_passport', name: 'Show the passport on the ban', hours: 1, dc: 6, needs: [],
          mods: { delay: 3 }, text: "Risk the passport the court ordered you to hand in.",
          success: { say: 'The guard is nineteen and has never seen the ban. He stamps you through.' },
          fail: { exposure: 3, hours: 4, say: 'They hold you four hours and the inspector is on the radio. The party gets you released pending a hearing you will not attend.' } },
      ] },
    { id: 'airfield', name: 'Susana airfield', short: 'Susana', scene: 'airfield',
      objective: "Get the jet fueled and positioned, get Atlanta's yes, and take off before Esmeralda agrees to hold you. You win when the pilot says you have left Esmeraldan airspace.",
      arrive: "Susana airfield. Check the crew, fuel and landing permission. Sosā has asked Esmeralda to hold you.",
      final: true,
      approaches: [
        { id: 'depart', name: 'Board and depart', hours: 2, dc: 3, needs: [{ arr: 'aircraft', stage: 4 }, { arr: 'permission', stage: 2 }],
          mods: { introduction: 1, document: 1 }, text: "The jet is ready. You still need the tower to clear departure.",
          success: { win: true, say: "You take off. Forty minutes later, the pilot confirms you have left Esmeraldan airspace." },
          fail: { exposure: 1, hours: 2, say: 'The tower holds you on the apron for two hours while a request from Valdória is read, and reread.' } },
        { id: 'depart_nopermit', name: 'Depart without Atlanta\'s answer', hours: 2, dc: 5, needs: [{ arr: 'aircraft', stage: 4 }],
          mods: { introduction: 1, permission: 2 }, text: "Ask the pilot to leave before Atlanta grants landing permission. Salek’s name helps; the party’s does not.",
          success: { win: true, say: 'Capitān Olsēn files for Lāyūna and asks no questions. Amādū Salek answers his phone somewhere over the Atlantic.' },
          fail: { exposure: 2, hours: 3, say: 'The pilot will not go without a landing clearance. Three hours arguing in a hangar.' } },
        { id: 'fuel_now', name: 'Pay the fuel agent yourself', hours: 1, dc: 2, needs: [{ arr: 'aircraft', stage: 2 }], pay: true,
          mods: {}, text: "Pay in person to advance aircraft preparations. Exposure rises.",
          success: { advance: ['aircraft'], exposure: 1, say: "The fuel truck arrives. People on the apron recognize you." },
          fail: { exposure: 1, say: 'The agent wants the operator\'s account, not cash. An hour wasted.' } },
      ] },
  ];

  // Things people say when a stage is reached. who: speaker id.
  const STAGE_LINES = {
    aircraft:   ['', 'Charter found: a jet in Susana, twelve seats, no questions so far.', 'Crew confirmed. The operator needs a destination.', 'Fuel paid. The jet is being positioned.', 'The jet is ready at Susana.'],
    reception:  ['', 'Your sibling reached Rosario Vélez, the minister\'s aide in Baca. Esmeralda expects you. She has not answered since.', 'Vélez has spoken to her minister. Esmeralda will not turn you away at the line.', 'Esmeraldan officials will be at the Huhūi post when you arrive.'],
    permission: ['', 'Amādū Salek has taken your call. He will speak to the ministry in Lāyūna, on his terms.', 'Atlanta has issued your entry visa. A car will meet the aircraft at Lāyūna.'],
  };

  // Enemy actions. Picked by weight each enemy turn. Each is visible in the log and on the map.
  const ENEMY_ACTIONS = [
    { id: 'check_belief', w: 4, text: (lv) => `Sosā's people search ${lv}.` },
    { id: 'circulate',    w: 3, once: true, text: () => 'Sosā sends the travel ban to every provincial post and the Huhūi border.' },
    { id: 'lean_operator', w: 2, once: true, after: 12, text: () => 'The ministry warns the Susana charter operator that its Valdórian licence is under review.' },
    { id: 'press_ally',   w: 3, text: (who) => `Sosā calls ${who} in for a conversation.` },
    { id: 'ask_esmeralda',w: 2, once: true, after: 30, text: () => 'Valdória asks Esmeralda, through the embassy in Baca, to hold you if you appear.' },
    { id: 'press_story',  w: 2, text: () => 'The ministry briefs the papers that you have already left the country.' },
    { id: 'roadblock',    w: 2, after: 6, text: (lv) => `Police set a checkpoint on the road out of ${lv}. For the next six hours every move there is harder.` },
    { id: 'watch_sibling', w: 2, once: true, after: 9, text: (who) => `Sosā has ${who}'s calls monitored. The operator in Susana goes quiet for a while.` },
  ];

  // ---- The government role: a senior aide to the minister, coordinating the departure inquiry.
  const GOV = { id: 'gov', name: 'Sofīā Leōnī', title: 'senior aide, the winning party', pronoun: 'she',
                blurb: 'Stop the escape. Prevent the departure and bring the candidate to the hearing. Your ministry does not command every desk, and none across the line.' };
  // Government cards: specific cooperation, with the same local reach as the escape's cards.
  const GOV_CARDS = {
    watch:     { name: 'The watch team', tag: 'watch', from: 'Inspector Sosā', reach: ['residence', 'road'], works: 'The residence and the road out of the capital.', text: 'Two unmarked cars and four officers. They see what passes them and nothing else.' },
    desk:      { name: "The provincial desk's patrol", tag: 'patrol', from: 'The Santa Laura commander', reach: VALDORIA, works: 'Valdória, up to the line. A patrol can search one place at a time.', text: 'A commander who acts quickly for you once and then wants a better report.' },
    registry:  { name: 'Registry access', tag: 'records', from: 'The civil registry', reach: VALDORIA, works: 'Any Valdórian desk that checks a name.', text: 'Who asked for what, and when. It never says where anyone is now.' },
    rail:      { name: 'A railway contact', tag: 'rail', from: 'The Salta yardmaster', reach: ['salta'], works: 'The Salta yard and the midnight freight.', text: 'He takes money from anyone and tells you about it.' },
    operator:  { name: "The operator's licence", tag: 'operator', from: 'The aviation desk', reach: ['airfield'], works: 'The Susana charter operator, through his Valdórian licence.', text: 'A review can pause a booking. It cannot find the passenger.' },
    esm_intro: { name: 'An Esmeraldan introduction', tag: 'introduction', from: 'The embassy in Baca', reach: ESMERALDA, works: 'Esmeraldan officials: the post, the tower.', text: 'A name at the interior ministry who will take your call. Nothing is promised.' },
  };
  // Orders: what the government player can do where it is looking. who: who acts. act: the inquiry action it runs.
  const GOV_ORDERS = [
    { id: 'search', name: (lv) => `Search ${lv}`, hours: 2, dc: 3, who: 'the provincial patrol', mods: { patrol: 1, watch: 1 }, act: 'check_belief', text: 'Send people to the place you believe she is. If she is there, they get close. If not, you learn that.', fail: 'The patrol arrives late and finds a cold room.' },
    { id: 'watch_house', name: () => 'Keep watch on the house', hours: 1, dc: 1, who: 'the watch team', mods: {}, text: 'Certain. You learn whether anyone is still inside. You learn nothing new if she has gone.', where: [0, 1] },
    { id: 'follow', name: (lv, rep) => `Follow the latest report: ${rep}`, hours: 1, dc: 1, who: 'you', mods: {}, text: 'Move the search to where the newest report points.' },
    { id: 'circulate', name: () => 'Circulate the travel ban', hours: 3, dc: 4, who: 'the provincial desks', mods: { records: 1 }, act: 'circulate', text: 'Every post and the border get the ban. A sent message does not close the border until the post confirms.', fail: 'Half the desks file it. A clerk calls a friend of hers.' },
    { id: 'press', name: () => 'Call in one of her people', hours: 2, dc: 3, who: 'Inspector Sosā', mods: { records: 1 }, act: 'press_ally', text: 'Sosā questions someone who has helped her. Some hold. Some tell him where she was last seen.', fail: 'Nobody answers the summons today.' },
    { id: 'roadblock', name: (lv) => `Checkpoint on the road out of ${lv}`, hours: 2, dc: 3, who: 'the provincial patrol', mods: { patrol: 2 }, act: 'roadblock', text: 'For six hours every move out of that place is harder.', fail: 'The checkpoint stands on the wrong road.' },
    { id: 'story', name: () => 'Brief the papers that she has left', hours: 1, dc: 2, who: 'the ministry press office', mods: {}, act: 'press_story', text: 'A public claim. It can calm the minister and send your own offices after the wrong lead.' },
    { id: 'rail_ask', name: () => 'Ask the Salta yardmaster who is paying', hours: 2, dc: 3, who: 'the railway contact', mods: { rail: 2 }, text: 'He tells you who asked about the midnight freight.', where: [3], fail: 'He wants to see who else is asking first.' },
    { id: 'lean', name: () => "Review the charter operator's licence", hours: 3, dc: 3, who: 'the aviation desk', mods: { operator: 2 }, act: 'lean_operator', text: 'The operator withdraws the crew until she reassures him. It pauses the booking; it does not find her.', after: 12 },
  ];
  return { CHARACTERS, PEOPLE, ENEMY, ARRANGEMENTS, CARDS, LEVELS, STAGE_LINES, ENEMY_ACTIONS, VALDORIA, ESMERALDA, GOV, GOV_CARDS, GOV_ORDERS };
})();
if (typeof module !== 'undefined') module.exports = Data;
