/* ============================================================
   COALITION data: levels, people, arrangements, cards, enemy actions.
   Plain tables. Names from quarterback/kels (world/names.md,
   verdenese/, world/atlanta-lore.md). Place names were renamed by the owner on
   Oct. 31, 2026 so every place sounds like a place and none is named after a
   person: Costamar, Cerro Alto, Portalba, Pedra Branca, Altamira, Ardésia,
   Nordavia, Krasnomor. The game, not the canon, decides names now.
   Everything here is a prototype choice (docs/game-direction.md).
   ============================================================ */
'use strict';
const Data = (() => {
  const CHARACTERS = {
    woman: { id: 'woman', name: 'Teresā Albukerkē', short: 'Teresā', title: 'the defeated candidate', pronoun: 'she',
             sibling: { id: 'sibling', name: 'Duartē Albukerkē', short: 'Duartē', rel: 'your brother' },
             blurb: 'A friend inside the inquiry helps her slip past the police. Border guards and police officers know her face.',
             // Distinct runs: Teresā starts with a friend in the inquiry, but every officer knows her face.
             hand: ['passport', 'decoy_cars', 'aide_word', 'informant'], handAlt: ['delay_report'], exposure: 1, faceKnown: true,
             edge: 'A friend inside the inquiry', flaw: 'Every officer knows your face' },
    man:   { id: 'man', name: 'Matēu Zanetī', short: 'Matēu', title: 'the defeated candidate', pronoun: 'he',
             sibling: { id: 'sibling', name: 'Līviā Zanetī', short: 'Līviā', rel: 'your sister' },
             blurb: 'The family barges can carry him up the river. The police have watched his house since the count.',
             // Matēu has the family barges, but he has been watched since the count.
             hand: ['passport', 'decoy_cars', 'aide_word', 'barge'], handAlt: ['delay_report'], exposure: 3, faceKnown: false,
             edge: 'Your family barges on the river', flaw: 'Watched since the count' },
  };

  // Allies. reliability: the die result a delegated job needs (lower is better). where: level index they act from.
  const PEOPLE = {
    sibling:  { role: 'arranging the jet and your welcome in Costamar from abroad', where: -1, reliability: 3 },
    aide:     { name: 'Gianlūka Moretī', role: 'party chief of staff', where: 0, reliability: 3,
                terms: 'He wants your public word that he leads the party in your absence.' },
    nando:    { name: 'Nando', role: 'your driver for 11 years', where: 0, reliability: 2 },
    sponsor:  { name: 'Your sponsor', role: 'the person asking a foreign ministry for your visa', where: -1, reliability: 4,
                terms: '' },
    host:     { name: 'Nonā Rosa Trentinī', short: 'Nonā Rosa', role: 'matriarch of the Nova Trentô colônia', where: 2, reliability: 2 },
    official: { name: 'Rosario Vélez', role: "aide to Costamar's interior minister", where: 4, reliability: 4,
                terms: 'She wants it understood that Costamar receives you as a guest, not as a government in exile.' },
    holt:     { name: 'Holt Greer', role: 'brakeman on the Huhūi freight', where: 3, reliability: 2 },
    theo:     { name: 'Theo Bascom', role: 'yard foreman in the Salta rail town', where: 3, reliability: 3 },
    pilot:    { name: 'Capitān Olsēn', short: 'Capitān Olsēn', role: 'charter pilot at Portalba', where: 5, reliability: 3 },
    press:    { name: 'Rādiô Portô Venla', short: 'Rādiô Portô Venla', role: 'the station everyone in the capital has on', where: -1, reliability: 6 },
  };

  // The enemy. Inspector Valentīn Sosā, Interior Ministry. Each action is concrete and visible.
  const ENEMY = { name: 'Police', role: "head of the Interior Ministry's departure inquiry" };

  // Continuing arrangements: ordered stages. A stage is a promise until the ally delivers.
  const ARRANGEMENTS = {
    aircraft:   { name: 'Jet',    stages: ['none', 'charter jet booked', 'crew hired', 'jet fueled at Portalba', 'jet ready to fly at Portalba'],
                  what: 'Call your sibling to find a charter, a crew, fuel, and a place at Portalba.' },
    reception:  { name: 'Welcome in Costamar',   stages: ['none', 'Costamar expects you', "Costamar's minister knows you are coming", 'Costamaran officials waiting at a border post'],
                  what: "Cerro Alto has your name, and Vélez puts officials at the post to meet you." },
    permission: { name: 'Entry visa',  stages: ['none', 'your sponsor has agreed to ask for your visa', 'entry visa issued'],
                  what: 'Your sponsor asks the ministry in the country you chose for a visa.' },
  };

  // Cards: specific help from a specific person. A card is authority, and authority is local:
  // reach lists the levels where it counts. Outside its reach a card is in your hand and does nothing.
  // tag is what approaches and message options look for. works: plain words for the card face.
  const VALDORIA = ['residence', 'road', 'colonia', 'salta', 'border'], ESMERALDA = ['border', 'airfield'];
  const ALL = ['residence', 'road', 'colonia', 'salta', 'border', 'airfield'];
  const CARDS = {
    decoy_cars:   { name: 'Two more cars like yours', tag: 'decoy', from: 'nando', reach: ['residence', 'road'], works: 'At the residence and on the road at Pedra Branca.',
                    text: "Nando has two matching sedans and two friends who will drive them the wrong way." },
    aide_word:    { name: 'The party machine', tag: 'influence', from: 'aide', reach: VALDORIA, works: 'Valdórian officials, up to and at the line.',
                    text: 'Gianlūka can get a mayor, a judge, or a border post on the phone for you.' },
    truck:        { name: "The colônia's grape truck", tag: 'vehicle', from: 'host', reach: ['colonia', 'salta'], works: 'Getting help in the Salta rail yard.',
                    text: "Nobody looks twice at this farm truck. Nonā Rosa's cousin drives it to Salta every week." },
    passport:     { name: 'Your second passport', tag: 'document', from: 'self', reach: ESMERALDA, works: 'The Paso Huhūi post and the Portalba departure.',
                    text: 'You have held it for years, and the travel ban lists only your other passport. You need it at the Paso Huhūi post, and it helps your takeoff at Portalba.' },
    intro_vel:    { name: "Rosario Vélez's card", tag: 'introduction', from: 'official', reach: ESMERALDA, works: 'Paso Huhūi, Ālto Verdē, the Portalba tower, and the charter operator.',
                    text: "You have Vélez's number and her word that the border post knows your name." },
    delay_report: { name: 'A report held one day', tag: 'delay', from: 'aide', reach: VALDORIA, works: 'Valdórian posts checking the travel ban, including Pedra Branca and the line.',
                    text: "Gianlūka's contact keeps the travel ban off the desk at Valdórian posts." },
    crate:        { name: "Holt's chalk-marked crate", tag: 'passage', from: 'holt', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "The crate is in the third boxcar, with straw inside. Holt leaves at midnight and does not wait." },
    yard_walk:    { name: "Theo's walk through the yard", tag: 'passage', from: 'theo', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "Theo escorts you past the yard office to the train." },
    sponsor_line: { name: "Your sponsor's line to the ministry", tag: 'permission', from: 'sponsor', reach: ALL, works: "Reaching Vélez's uncle, calming the crew, and leaving without the visa.",
                    text: "Your sponsor's name opens doors that money alone does not." },
    barge:        { name: 'Your family barges', tag: 'boat', from: 'self', reach: ['road', 'colonia'], works: 'The river south of Pedra Branca.',
                    text: "Your father's barges still run the river, and their captains owe him." },
    grandson:     { name: "Nonā Rosa's grandson", tag: 'passage', from: 'host', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "He is 19, quick, and knows which boxcar the guards skip." },
    informant:    { name: 'A friend in the inquiry', tag: 'information', from: 'aide', reach: VALDORIA, works: 'Any move the inquiry could be watching, up to the line.',
                    text: "A clerk tells Gianlūka where the police are looking and who is on duty." },
  };

  // Levels. Each approach: needs (all must hold), dc (die needs dc or more after mods), mods (tag: bonus),
  // and what happens. hours: time spent attempting. Failure never ends the run by itself.
  const LEVELS = [
    { id: 'residence', name: 'The residence, Portô Venla', short: 'Residence', scene: 'residence',
      objective: "Get past the watch.",
      arrive: 'Two unmarked cars watch the house. The court has barred you from leaving the country. Your second passport is in your coat.',
      approaches: [
        { id: 'decoy', with: 'nando', name: 'Send out a decoy convoy', hours: 3, dc: 3, needs: [{ card: 'decoy' }],
          mods: { information: 2 }, text: 'Send three cars out in different directions so the watch follows the wrong one.',
          success: { belief: 0, exposure: -1 },
          fail: { exposure: 2, say: 'The police stop the second car on the avenue. Nando talks his way out, and they are watching the house more closely now.' } },
        { id: 'service', name: 'Leave by the service door', hours: 1, dc: 4, needs: [{ night: true }],
          mods: { information: 1 }, text: 'Leave with the kitchen staff between 10 p.m. and 5 a.m.',
          success: { belief: 0, say: 'The night cook lends you an apron and a cigarette. Nobody looks at the help.' },
          fail: { exposure: 2, say: 'A flash goes off in a parked car. Someone photographed the help tonight.' } },
        { id: 'partycar', with: 'aide', name: "The party's official car", hours: 1, dc: 2, needs: [{ card: 'influence' }],
          mods: {}, text: "Ride out in Gianlūka's official car. In return he wants your public word that he leads the party while you are gone.",
          success: { belief: 0, commit: 'aide', say: 'The flags get you through. Gianlūka reminds you, gently, what he asked for.' },
          fail: { exposure: 1, commit: 'aide', say: 'The watch stops the car at the gate and reports whose car it is. You are still at the house.' } },
      ] },
    { id: 'road', name: 'The road south, Pedra Branca', short: 'Pedra Branca', scene: 'road',
      objective: 'Get from Pedra Branca to the colônia at Nova Trentô.',
      arrive: 'The radio says you are on a yacht in Portô Venla.',
      approaches: [
        { id: 'second_driver', with: 'nando', name: 'Hire a plain car and driver', hours: 2, dc: 3, needs: [], pay: true,
          mods: { information: 1 }, text: "Nando's cousin offers a taxi and his silence.",
          success: { say: 'You leave by taxi while Nando drives your sedan back north.' },
          fail: { exposure: 1, hours: 2, say: 'The cousin wants more money, then wants nothing to do with it. The attempt costs you four hours.' } },
        { id: 'siblings_driver', with: 'sibling', name: "Leave with your sibling's driver", hours: 2, dc: 2, needs: [{ arr: 'aircraft', stage: 1 }],
          mods: { information: 1 }, text: 'Your sibling knows a man in Pedra Branca. Once the charter is booked, he drives you to Nova Trentô.',
          success: { say: 'He asks nothing and drives the back roads. The radio stays off.' },
          fail: { exposure: 1, hours: 1, say: 'He is late, then nervous, and you wait an hour on a side street while he decides.' } },
        { id: 'barge', name: 'Take a family barge upriver', hours: 3, dc: 2, needs: [{ card: 'boat' }], with: 'self',
          mods: { information: 1 }, text: 'A captain who owes your father takes you up the river to the colônia.',
          success: { exposure: -1, say: 'You sleep under a tarp that smells of soy. The river is quiet.' },
          fail: { exposure: 1, hours: 2, say: 'River police board at the lock. The captain talks for two hours.' } },
        { id: 'known_car', name: 'Drive on in your own car', hours: 1, dc: 5, needs: [],
          mods: { delay: 2, decoy: 2 }, text: "Risk the posts in a car they know. Nando's spare sedans or a held report make it easier.",
          success: { exposure: 1, say: 'You pass the first post before the fax does.' },
          fail: { exposure: 3, belief: 1, say: "The post at the river has your plate. They turn you back and report you." } },
      ] },
    { id: 'colonia', name: 'The colônia, Nova Trentô', short: 'Nova Trentô', scene: 'colonia',
      objective: "Get to Salta. The road opens once Costamar expects you, or after you free Nonā Rosa's truck.",
      arrive: "Nonā Rosa offers a room and a phone. Her cooperative's truck was impounded this morning.",
      approaches: [
        { id: 'help_host', with: 'host', name: "Help Nonā Rosa free the truck", hours: 3, dc: 2, needs: [],
          mods: { influence: 2 }, text: "Spend three hours getting the cooperative's truck released. If it works, her cousin drives you to Salta in it.",
          success: { card: 'truck', trust: 'host' },
          fail: { card: 'truck', hours: 1 } },
        { id: 'work_phone', name: "Call your contacts", hours: 3, dc: 1, noRoll: true, once: true, needs: [],
          mods: {}, text: "Spend three hours on Nonā Rosa's phone. The jet, your welcome in Costamar and your visa each move one step. You can only do this once.",
          success: { advance: ['aircraft', 'reception', 'permission'], say: 'Three hours later, all three arrangements have moved one step. Nonā Rosa eats alone.' }, fail: { say: '' } },
        { id: 'sleep', name: 'Sleep', hours: 6, dc: 1, noRoll: true, needs: [],
          mods: {}, text: 'Rest for six hours. Your police attention drops by two, and the police keep searching while you sleep.',
          success: { exposure: -2, say: 'Nobody knocks for six hours, and you wake to a quiet house.' }, fail: { say: '' } },
        { id: 'leave', name: 'Take the road to Salta', hours: 2, dc: 1, noRoll: true, needs: [{ arr: 'reception', stage: 1 }],
          mods: {}, text: "Once Costamar expects you, Nonā Rosa's cousin drives you up to Salta.",
          success: { say: 'Nonā Rosa\'s cousin drives. The road climbs and the radio loses the station.' }, fail: { say: '' } },
      ] },
    { id: 'salta', name: 'The rail town, Salta', short: 'Salta', scene: 'salta',
      objective: 'Get on the midnight freight. The yardmaster will sell you to the police.',
      arrive: "The midnight freight climbs to the border. Holt and Theo can get you aboard.",
      approaches: [
        { id: 'board', name: 'Board the midnight freight', hours: 1, dc: 3, needs: [{ card: 'passage' }, { night: true }],
          mods: { passage: 2 }, text: "Board between 10 p.m. and 5 a.m. with Holt's crate, Theo's walk through the yard, or Nonā Rosa's grandson.",
          success: { say: 'The train pulls out at 12 minutes past midnight. You lie in cold straw and listen to the train climb the grade.' },
          fail: { exposure: 1, say: 'A lamp swings down the cars, and you drop back into the shadows. You can try again while it is still dark.' } },
        { id: 'crate', with: 'holt', name: "Pay Holt for a crate", hours: 2, dc: 3, needs: [], pay: true,
          mods: { vehicle: 1, information: 1 }, text: 'Pay Holt to save you a crate in the third boxcar. You still have to board at night.',
          success: { card: 'crate', say: 'Holt pockets the notes without counting them. "Third car. Midnight. I don\'t wait."' },
          fail: { exposure: 1, say: 'Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide.' } },
        { id: 'foreman', with: 'theo', name: 'Ask Theo to walk you through', hours: 2, dc: 4, needs: [],
          mods: { vehicle: 2, information: 1, influence: 1 }, text: "Ask Theo to walk you through the yard at train time. The colônia's truck helps convince him.",
          success: { card: 'yard_walk', trust: 'theo', say: 'Theo agrees to walk you across the yard tonight. Nobody interrupts a foreman.' },
          fail: { exposure: 1, say: 'The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change.' } },
        { id: 'buy_seat', name: 'Pay the yardmaster', hours: 1, dc: 7, needs: [], pay: true,
          mods: {}, text: 'He will pocket the money and report you.',
          success: { exposure: 2, say: "Three men watch the yardmaster take your money." },
          fail: { exposure: 2, say: 'He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here.' } },
      ] },
    { id: 'border', name: 'The line at the Huhūi passes', short: 'The line', scene: 'border',
      objective: 'Cross into Costamar. One of the three posts works for Valdória.',
      arrive: 'Three crossings lie within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Cerro Alto, and the Punta Marēa crossing toward the coast. Valdória has paid the guards at one of them to stop you.',
      border: true,
      approaches: [
        { id: 'post_rail', post: 'rail', name: 'Cross at the Paso Huhūi post', hours: 1, dc: 4, needs: [{ card: 'document' }],
          mods: { introduction: 2, influence: 1 }, text: "This is the freight's own crossing. You show your second passport at the desk.",
          success: { say: 'The guard turns the pages, looks at a sheet on the desk, and stamps it.' },
          fail: { exposure: 2, hours: 3, say: 'The guard reads the sheet first. You spend three hours in a cold room and come out on the Valdórian side.' } },
        { id: 'post_high', post: 'high', name: 'Take the Ālto Verdē road post', hours: 3, dc: 3, needs: [],
          mods: { introduction: 2 }, text: "The drive to the post takes three hours on switchbacks toward Cerro Alto. The post answers to the interior ministry, where Vélez works.",
          success: { say: 'After a long climb, the sergeant at Ālto Verdē checks your passport and waves the car through.' },
          fail: { exposure: 1, hours: 2, say: 'The post has no list with your name on it, and you wait two hours while someone in Cerro Alto is woken up.' } },
        { id: 'post_coast', post: 'coast', name: 'Pay the Punta Marēa crossing', hours: 2, dc: 4, needs: [], pay: true,
          mods: { delay: 2, information: 2 }, text: "This is the merchants' road to the coast. The guards here answer to the port, and the port takes money.",
          success: { exposure: 1, say: 'The barrier goes up. Nobody says thank you.' },
          fail: { exposure: 2, hours: 2, say: 'The older guard takes the money and the younger one calls the ministry. You wait two hours in the salt wind.' } },
      ],
      received: { id: 'received', name: "Walk to the people waiting", hours: 1, say: 'Rosario Vélez shakes your hand across the barrier. The guards on your side write nothing down.' },
      bought: { say: 'The sergeant reads your passport, walks into the hut and picks up the telephone. He keeps you waiting 12 hours, until a Valdórian liaison arrives. You are still on the Valdórian side of the line.' } },
    { id: 'airfield', name: 'Portalba airfield, Costamar', short: 'Portalba', scene: 'airfield',
      objective: "Board the jet.",
      arrive: "The charter apron is behind the port, and Costamaran flags fly on the tower. Costamar will let you leave from here and nothing more.",
      final: true,
      approaches: [
        { id: 'depart', with: 'pilot', name: 'Board and depart', hours: 2, dc: 3, needs: [{ arr: 'aircraft', stage: 4 }, { arr: 'permission', stage: 2 }],
          mods: { introduction: 1, document: 1 }, text: 'Leave once the jet is ready and your visa is issued. The tower still has to clear you.',
          success: { win: true, say: "You take off. Forty minutes later, the pilot confirms you have left Costamaran airspace." },
          fail: { exposure: 1, hours: 2, say: 'The tower holds you on the apron for two hours while it reads a request from Valdória, then reads it again.' } },
        { id: 'depart_nopermit', with: 'pilot', name: 'Depart without the visa', hours: 2, dc: 5, needs: [{ arr: 'aircraft', stage: 4 }],
          mods: { introduction: 1, permission: 2 }, text: "Ask the pilot to leave without the visa. Your sponsor's line helps persuade him. The country you picked takes you when you land.",
          success: { win: true, say: 'Capitān Olsēn files the flight plan and asks no questions. Your sponsor\'s phone rings somewhere over the ocean.' },
          fail: { exposure: 2, hours: 3, say: 'The pilot will not go without a landing clearance, and you spend three hours arguing in a hangar.' } },
        { id: 'fuel_now', name: 'Pay the fuel agent yourself', hours: 1, dc: 2, needs: [{ arr: 'aircraft', stage: 2 }], pay: true,
          mods: {}, text: 'Pay the fuel agent in cash to move the jet one step closer to ready. People on the apron will see you.',
          success: { advance: ['aircraft'], exposure: 1, say: "The fuel truck arrives. People on the apron recognize you." },
          fail: { exposure: 1, say: "The agent will only take payment from the operator's account, and you lose an hour." } },
      ] },
  ];

  // Things people say when a stage is reached. who: speaker id.
  const STAGE_LINES = {
    aircraft:   ['', 'I found a jet in Portalba with 12 seats, and nobody has asked questions yet.', 'The crew is confirmed.', 'The fuel is paid, and the jet is moving into place.', 'The jet is ready at Portalba.'],
    reception:  ['', "I reached Rosario Vélez, the minister's aide in Cerro Alto. Costamar expects you, but Vélez has not answered since.", 'Vélez has spoken to her minister, and she has sent you her card for the Costamaran posts and the tower.', 'Costamaran officials will meet you at the {post}, and only there.'],
    permission: ['', '{sponsor} has taken your call and will speak to the ministry.', 'The entry visa is issued. A car will meet the jet at {city}.'],
  };

  // Enemy actions. Picked by weight each enemy turn. Each is visible in the log and on the map.
  // gtext: the same action told to the government player, who never sees her side in the second person
  const ENEMY_ACTIONS = [
    { id: 'check_belief', w: 4, text: (lv) => `The police search ${lv}.` },
    { id: 'circulate',    w: 3, once: true, gtext: () => 'The police send the travel ban to every post. From now on, police who stop her take her straight to the station, and every crossing she tries at the line is harder unless someone on her side has held the report back.', text: () => 'The police send the travel ban to every post. From now on, if they stop you, they take you straight to the station. Crossings at the line are also harder unless you hold "A report held one day."' },
    { id: 'lean_operator', w: 2, once: true, after: 12, text: () => 'The ministry warns the Portalba charter operator that its Valdórian license is under review.' },
    { id: 'press_ally',   w: 3, text: (who) => `The police call ${who} in for a conversation.` },
    { id: 'ask_esmeralda',w: 2, once: true, after: 30, gtext: () => "Valdória asks Costamar, through its embassy in Cerro Alto, to hold her if she appears. Unless Costamar's minister knows she is coming, her takeoff from Portalba is now harder, and the police at Portalba can stop her for questioning.", text: () => "Valdória asks Costamar, through its embassy in Cerro Alto, to hold you if you appear. Unless Costamar's minister knows you are coming, takeoff from Portalba is now harder. The police at Portalba can also stop you now." },
    { id: 'press_story',  w: 2, gtext: () => 'The ministry briefs the papers that she has already left the country.', text: () => 'The ministry briefs the papers that you have already left the country.' },
    { id: 'roadblock',    w: 2, after: 6, text: (lv) => `The police set a checkpoint on the road out of ${lv}. For the next six hours, every move there that can fail is harder.` },
    { id: 'trace',        w: 3, after: 4, gtext: () => 'The ministry traces her recent calls.', text: () => 'The ministry traces your recent calls.' },
    { id: 'watch_sibling', w: 2, once: true, after: 9, gtext: (who) => `The police monitor ${who}'s calls, and everything ${who} is arranging for her now takes four hours longer.`, text: (who) => `The police monitor ${who}'s calls. The operator in Portalba goes quiet, and everything ${who} is arranging for you now takes four hours longer.` },
  ];

  // ---- Where you could go. Three countries, one city each, from the kels canon (Lagoa Funda, Krasnomor); Almatau is a
  // working name for Ardésia's capital, which the canon leaves open.
  // Owner, November 1, 2026: the country the player picks is the right one for that run; every country takes you.
  // The choice is between sponsors: Salek wants the accounts, Rāo is six hours slower, Vosk's deal raises police attention.
  // A sponsor's demand is optional (owner, November 1, 2026): agreeing improves the visa odds, refusing keeps the usual odds.
  // Portalba, in Costamar, is where you fly from.
  const DESTS = {
    atlanta:   { name: 'Altamira', city: 'Lagoa Funda', lon: -13.2, lat: 27.2, hours: 10,
                 sponsor: { name: 'Bīr Amādū Salek', short: 'Salek', pronoun: 'he', role: 'a banker abroad and an old client of your family',
                            asks: 'Salek, a banker who knows your family, can ask the ministry for your visa. He wants the family accounts in return, and agreeing makes the visa more likely.',
                            wants: 'the family accounts moved to his bank',
                            terms: 'He wants the family accounts moved to his bank.', slow: 0,
                            demand: { text: '"The transfer papers are with your brother-in-law. Sign them and the ministry hears from me tonight."', accept: 'Sign and move the accounts', effect: 'Salek takes the family accounts and works harder for you. His visa answer is now more likely to come through.', heat: 0 },
                            kept: 'Salek now holds the family accounts.' } },
    tarun:     { name: 'Ardésia', city: 'Almatau', lon: 76.9, lat: 43.2, hours: 14,
                 sponsor: { name: 'Dēvan Rāo', short: 'Rāo', pronoun: 'he', role: 'a magistrate in Almatau who has taken in exiles before',
                            asks: 'Rāo, a magistrate in Almatau, can write to the ministry for your visa. He is slow, and he wants your word that you will stay out of politics. Agreeing makes the visa more likely.',
                            wants: 'your word that you will stay out of politics',
                            terms: 'He wants your word that you will stay out of politics while you are his guest.', slow: 6,
                            demand: { text: '"I have drafted the letter. It says you will hold no office and give no interviews from Ardésia. I need your signature under mine."', accept: 'Sign and give your word', effect: 'Rāo has your word and works harder for you. His visa answer is now more likely to come through.', heat: 0 },
                            kept: 'Rāo has your word that you are out of politics.' } },
    zaryanova: { name: 'Nordavia', city: 'Krasnomor', lon: 131.9, lat: 43.1, hours: 8,
                 sponsor: { name: 'Mirēlā Vosk', short: 'Vosk', pronoun: 'she', role: 'a former trade envoy in Krasnomor with friends at the foreign ministry',
                            asks: 'Vosk, a former trade envoy, can take your visa request to the ministry. She wants mineral rights you do not control, and agreeing makes the visa more likely.',
                            wants: 'mineral rights you do not control',
                            terms: 'She wants mineral rights you do not control.', slow: 0,
                            demand: { text: '"The ministry wants the northern concessions in writing. Sign, and I take it to them tonight."', accept: 'Sign the concession', effect: 'Vosk takes the concession and works harder for you, so her visa answer is now more likely to come through. Word reaches home, and your police attention rises by one.', heat: 1 },
                            kept: 'Your signature on the concessions is in Krasnomor.' } },
  };
  const PLACES = { valdoria: { name: 'Valdória', city: 'Portô Venla', lon: -77.0, lat: -12.0 }, susana: { name: 'Portalba', city: 'Costamar', lon: -79.9, lat: -2.2 } };
  const POSTS = { rail: 'Paso Huhūi rail post', high: 'Ālto Verdē road post', coast: 'Punta Marēa crossing' };
  // ---- The government role: a senior aide to the minister, coordinating the departure inquiry.
  const GOV = { id: 'gov', name: 'Sofīā Leōnī', title: 'aide to the incoming government', pronoun: 'she',
                blurb: "Keep the candidate from flying out before Tuesday at 2 p.m. Past the border, your patrols need Costamar's agreement." };
  // Government cards: specific cooperation, with the same local reach as the escape's cards.
  const GOV_CARDS = {
    watch:     { name: 'The watch team', tag: 'watch', from: 'A police inspector', reach: ['residence', 'road'], works: 'The residence and Pedra Branca.', text: 'Two unmarked cars and four officers. They see what passes them and nothing else.' },
    desk:      { name: "The provincial desk's patrol", tag: 'patrol', from: 'The Pedra Branca commander', reach: VALDORIA, works: 'Any stop in Valdória, up to and including the line.', text: "The commander's patrol makes your searches and checkpoints easier." },
    rail:      { name: 'A railway contact', tag: 'rail', from: 'The Salta yardmaster', reach: ['salta'], works: 'The Salta yard and the midnight freight.', text: 'He takes money from anyone and tells you about it.' },
    operator:  { name: "The operator's license", tag: 'operator', from: 'The aviation desk', reach: ['airfield'], works: 'The Portalba charter operator, through his Valdórian license.', text: 'A review can pause a booking. It cannot find the passenger.' },
    esm_intro: { name: 'An Costamaran introduction', tag: 'introduction', from: 'The embassy in Cerro Alto', reach: ESMERALDA, works: 'Lets your search, checkpoint, and call-in orders work at Portalba.', text: 'A name at the interior ministry who will take your call. Nothing is promised.' },
  };
  // Orders: what the government player can do where it is looking. who: who acts. act: the inquiry action it runs.
  const GOV_ORDERS = [
    { id: 'search', name: (lv) => `Search ${lv}`, hours: 3, dc: 4, who: 'the provincial patrol', mods: { patrol: 1 }, act: 'check_belief', text: 'The patrol searches the stop you are watching and you get a report. If she is there and her police attention is 7 or higher, they stop her. The police keep watching that stop afterward.', fail: 'The patrol never gets there, and you learn nothing.' },
    { id: 'watch_house', name: () => 'Keep watch on the house', hours: 1, dc: 1, who: 'the watch team', mods: {}, text: 'The watch team tells you whether anyone is still in the house.', where: [0, 1] },
    { id: 'follow', name: (lv, rep) => `Move your search to ${rep}`, hours: 1, dc: 1, who: 'you', mods: {}, text: 'Your next orders act at the stop the newest report names. The police stay where they last searched until you order a search or a checkpoint at the new stop.' },
    { id: 'circulate', name: () => 'Circulate the travel ban', hours: 3, dc: 4, who: 'the provincial desks', mods: {}, act: 'circulate', text: 'Every post and the border get the ban. From then on, police who stop her take her straight to the station. A sent message does not close the border until the post confirms.', fail: 'A clerk tips off her side before the ban goes out. The police lose the stop they were watching.' },
    { id: 'press', name: () => 'Call in one of her people', hours: 2, dc: 3, who: 'the police', mods: {}, act: 'press_ally', text: 'The police question one of her helpers. If the helper talks, the police go to where she is, her police attention rises by two, and she loses that helper, but you are not told the place.', fail: 'Nobody answers the summons today.' },
    { id: 'roadblock', name: (lv) => `Set a checkpoint at ${lv}`, hours: 2, dc: 3, who: 'the provincial patrol', mods: { patrol: 2 }, act: 'roadblock', text: 'For the next six hours, every move she makes at that stop that can fail is harder. A new checkpoint replaces this one.', fail: 'The checkpoint stands on the wrong road.' },
    { id: 'story', name: () => 'Brief the papers that she has left', hours: 1, dc: 2, who: 'the ministry press office', mods: {}, act: 'press_story', text: 'The police turn to a stop where she is not. Her police attention also falls by one.' },
    { id: 'rail_ask', name: () => 'Ask the yardmaster who is paying', hours: 2, dc: 3, who: 'the railway contact', mods: { rail: 2 }, text: 'He names who took money for the midnight freight, and he becomes your railway contact.', where: [3], fail: 'He wants to see who else is asking first.' },
    { id: 'lean', name: () => 'Press the charter operator', hours: 3, dc: 3, who: 'the aviation desk', mods: { operator: 2 }, act: 'lean_operator', text: 'If her jet already has a crew, the operator pulls the crew until she reassures him.', after: 12 },
  ];

  // ---- Government dispatches: the Reports phase on Sofīā's side. Invented, like the candidate's.
  // at: stop indexes where the search must be looking (null = anywhere). after: earliest hour. needs: a government card id.
  // fx: hours, lead (a true report of where she is now; delay in hours), false (a report that points elsewhere),
  // follow (move the search to the newest report), card / lose (government card ids), act (an inquiry action at the
  // search), press (her exposure up), warn (her side learns something: her exposure down), stall (her bookings slip,
  // hours), crossing (the line is closed for n hours), ban (the ban is confirmed at the post), unban (the post loses it),
  // holdup (the Costamaran request moves forward), dc (orders easier or harder: [delta, hours]), minister (+1 pleased,
  // -1 angry), sooner (the minister's deadline moves up, hours), roll {need, win, lose}, say.
  const GOV_EVENTS = [
    { id: 'tipster', title: 'A caller wants money', text: 'A man says he drove her this morning. He wants cash before he says where.', choices: [
      { id: 'pay', label: 'Pay him', fx: { hours: 1, roll: { need: 4, win: { lead: 1, say: 'He names the road and the car. It checks out.' }, lose: { false: true, say: 'He names a town. He has never been there.' } } } },
      { id: 'hang_up', label: 'Hang up', fx: {} } ] },
    { id: 'leak', title: 'The minister leaks your lead', text: 'He told a columnist you are looking at {there}. It runs in the morning edition.', choices: [
      { id: 'confirm', label: 'Confirm it on the record', fx: { minister: 1, warn: 1, say: 'The minister likes the headline. So does she.' } },
      { id: 'deny', label: 'Deny it', fx: { minister: -1, say: 'The minister reads your denial in his own paper.' } },
      { id: 'spin', label: 'Tell the paper she has crossed', fx: { hours: 1, roll: { need: 3, win: { press: 1, say: 'Her people relax. Someone gets careless on the phone.' }, lose: { minister: -1, say: 'The columnist checks with the border post and prints that too.' } } } } ] },
    { id: 'judge', after: 4, title: 'The duty judge wants a hearing', text: 'He will not sign the order that has the border post confirm the travel ban until a hearing. The ban is in force either way.', choices: [
      { id: 'wait_judge', label: 'Wait for the hearing', fx: { unban: true, say: 'The post has not confirmed the ban, and it will wait for the hearing.' } },
      { id: 'other_judge', label: 'Find another judge', fx: { hours: 2, roll: { need: 4, win: { ban: true, say: 'A judge in Pedra Branca signs at his kitchen table.' }, lose: { hours: 2, say: 'Every judge you call has heard from the first one.' } } } },
      { id: 'around', label: 'Have the minister call the post', fx: { ban: true, minister: -1, warn: 1, say: 'The post confirms the ban. Her lawyers call it irregular on the radio.' } } ] },
    { id: 'sightings', title: 'Three sightings at once', text: 'Callers place her in Pedra Branca, in Salta and on the coast road, all in the same hour.', choices: [
      { id: 'all_three', label: 'Send a patrol to each', fx: { hours: 2, dc: [1, 6], false: true, say: 'Three patrols go out at once, and the desk is stretched thin.' } },
      { id: 'plates', label: 'Check the one that gave plates', fx: { hours: 1, roll: { need: 4, win: { lead: 0, say: 'The plates match a car from her convoy.' }, lose: { false: true, say: 'The plates belong to a dentist.' } } } },
      { id: 'ignore', label: 'Ignore all three', fx: {} } ] },
    { id: 'sosa_alone', title: 'Your police inspector wants to drive out himself', text: 'He wants to take two officers to {there} without telling the desk.', choices: [
      { id: 'let_him', label: 'Let him go', fx: { act: 'check_belief', hours: 2, say: 'The inspector takes the unmarked car.' } },
      { id: 'keep_him', label: 'Keep him on the desk', fx: { dc: [-1, 6], say: 'He works the phones harder than anyone, in a sulk.' } } ] },
    { id: 'driver', after: 6, title: 'One of her drivers calls', text: 'A driver from her convoy wants a promise that he will not be charged.', choices: [
      { id: 'immunity', label: 'Promise him', fx: { minister: -1, lead: 3, say: 'He talks. The minister did not want promises made.' } },
      { id: 'bargain', label: 'Bargain', fx: { hours: 1, roll: { need: 4, win: { lead: 1, say: 'He settles for a lawyer and a ride home.' }, lose: { warn: 1, say: 'He hangs up and calls her instead.' } } } },
      { id: 'refuse_driver', label: 'Refuse', fx: {} } ] },
    { id: 'strike', after: 8, title: 'The rail union walks out', text: 'Salta yard workers go on strike.', choices: [
      { id: 'let_strike', label: 'Let the strike stand', fx: { stall: 4, minister: -1, say: "Her helpers' answers come four hours late. The minister hates strikes." } },
      { id: 'break_strike', label: 'Get the trains running', fx: { hours: 2, card: 'rail', say: 'The yardmaster owes you for the overtime.' } } ] },
    { id: 'photo', title: 'A paper has a photo', text: 'A newspaper has a blurred photo of her at a gas station, and it wants to run it.', choices: [
      { id: 'buy_photo', label: 'Buy it and sit on it', fx: { hours: 1, lead: 4, say: 'The gas station has a sign with a town on it.' } },
      { id: 'run_it', label: 'Let them run it', fx: { press: 2, minister: 1, say: 'Her face is on every screen in the province.' } } ] },
    { id: 'dinner', after: 6, title: 'Dinner at the Costamaran embassy', text: 'The ambassador invites you to dinner tonight. Dinner takes three hours, and he likes to talk.', choices: [
      { id: 'go', label: 'Go to dinner', fx: { hours: 3, holdup: true, say: "Somewhere after the fish he promises to hurry Cerro Alto's answer." } },
      { id: 'deputy', label: 'Send your deputy', fx: { roll: { need: 5, win: { holdup: true, say: 'Your deputy is a better guest than you.' }, lose: { say: 'The ambassador talks about horses all night.' } } } },
      { id: 'decline', label: 'Decline', fx: {} } ] },
    { id: 'storm', after: 10, title: 'Snow at the Huhūi passes', text: 'Snow is falling on the Huhūi passes, and the road service is warning drivers off for the night.', choices: [
      { id: 'hold_post', label: 'Keep your patrol at the post', fx: { hours: 1, crossing: 5, say: 'Your patrol sleeps in the guardhouse and searches every car that tries.' } },
      { id: 'pull_back', label: 'Pull the patrol back', fx: { dc: [-1, 4], say: 'The patrol comes home warm and in a better mood.' } } ] },
    { id: 'rival', title: 'A rival aide wants your file', text: 'Another aide tells the minister he can find her faster. He wants your reports.', choices: [
      { id: 'share', label: 'Share the file', fx: { minister: 1, warn: 1, say: 'He leaks half of it by dinner.' } },
      { id: 'refuse_rival', label: 'Refuse', fx: { sooner: 2, say: 'The minister wants your answer two hours sooner.' } },
      { id: 'doctor', label: 'Share a doctored file', fx: { hours: 1, roll: { need: 3, win: { minister: 1, say: 'He chases a lead you made up.' }, lose: { minister: -1, say: 'He spots the fake and shows the minister.' } } } } ] },
    { id: 'bribe', after: 4, title: 'Her family asks your price', text: 'A lawyer for her family asks what it would take to look away for one day.', choices: [
      { id: 'report_it', label: 'Report the offer', fx: { press: 1, minister: 1, say: 'A bribery file opens. Her lawyers stop answering their phones.' } },
      { id: 'play_along', label: 'Pretend to accept', fx: { hours: 1, roll: { need: 4, win: { lead: 1, say: 'The lawyer tells you where to send the money.' }, lose: { warn: 2, say: 'The lawyer knows a trap when he hears one.' } } } },
      { id: 'hang_up_bribe', label: 'Hang up', fx: {} } ] },
    { id: 'sergeant', after: 14, title: 'The sergeant is family', text: 'The desk says the sergeant on duty at the border post is married to her cousin.', choices: [
      { id: 'replace', label: 'Replace him', fx: { hours: 3, ban: true, say: 'A sergeant from Salta takes the shift. He reads every name.' } },
      { id: 'watch_him', label: 'Watch him', fx: { hours: 1, roll: { need: 4, win: { lead: 0, say: 'He makes a call from the guardhouse. You hear every word.' }, lose: { unban: true, say: 'He notices the watcher, and the post no longer confirms the ban.' } } } },
      { id: 'leave_him', label: 'Leave him on duty', fx: { unban: true } } ] },
    { id: 'drone', after: 10, title: 'The air force offers a drone', text: 'A drone can watch from the air for eight hours. The general wants a signature.', choices: [
      { id: 'sign', label: 'Sign for it', fx: { dc: [-1, 8], minister: -1, say: 'The drone goes up. The minister reads about it in the morning.' } },
      { id: 'no_drone', label: 'Decline', fx: {} } ] },
    { id: 'presser', title: 'The minister wants a press conference', text: 'He wants you beside him at 6 p.m. to promise that she will be found by Monday.', choices: [
      { id: 'stand', label: 'Stand beside him', fx: { hours: 2, minister: 1, warn: 1, say: 'Her people watch it twice and change their plans.' } },
      { id: 'send_sosa', label: 'Send the inspector instead', fx: { dc: [1, 4], say: 'The inspector hates cameras. He takes it out on the desk.' } },
      { id: 'skip', label: 'Say you are busy', fx: { minister: -1 } } ] },
    { id: 'tower', after: 6, title: 'A phone touched a tower', text: 'The carrier says one of her family\'s phone numbers pinged a tower an hour ago.', choices: [
      { id: 'tower_now', label: 'Demand the tower now', fx: { hours: 2, roll: { need: 4, win: { lead: 0, say: 'The carrier sends the tower and a map.' }, lose: { warn: 1, say: 'The carrier tells its lawyers, who tell hers.' } } } },
      { id: 'paperwork', label: 'File the paperwork', fx: { lead: 6, say: 'The answer will come through the proper channel.' } } ] },
  ];

  // ---- Dispatches: the News phase. Counterfactuals, not the record: each one bends the run somewhere new.
  // at: level ids where it can be drawn (null = anywhere). when: declarative conditions on facts in content/coalition/facts.json. Text placeholders: {sib}, {here}.
  // Choice fx: hours, exposure, belief ('away' | 'here'), card (gain), lose (card id | 'random' | 'best'), trust {who: +n},
  // doubt, cut, test (person ids), stage {arr: +n}, flag {k: v}, ban (the travel ban goes out now), skipEnemy, mod (roll
  // change at this stop), hold (climb a rung), advance (reach the next stop), end {reason}, roll {need, win: fx, lose: fx}, say.
  // needs: like approach needs ({ card: tag }).
  const EVENTS = [
    // the residence
    { id: 'selfie', at: ['residence'], title: 'A photo from the kitchen', text: "The cook's nephew posted a photo. You are in the window behind him.", choices: [
      { id: 'buy_phone', label: "Buy the nephew's phone", fx: { hours: 1, exposure: -1, say: 'Nando pays twice what the phone is worth.' } },
      { id: 'beach', label: 'Post an old beach photo', needs: [{ card: 'influence' }], fx: { belief: 'away', exposure: -1, flag: { lied: true }, say: "Gianlūka's people post you on the coast." } },
      { id: 'let_it', label: 'Let it stand', fx: { exposure: 2 } } ] },
    { id: 'dog', at: ['residence'], title: 'The dog will not stay', text: 'Your youngest will not leave without the dog. The dog barks at strangers.', choices: [
      { id: 'bring_dog', label: 'Bring the dog', fx: { flag: { dog: true }, trust: { sibling: 1 }, say: 'The dog sleeps across your feet.' } },
      { id: 'leave_dog', label: 'Leave him with the cook', fx: { hours: 1, say: 'Your youngest cries in the back seat for an hour.' } } ] },
    { id: 'summons', at: ['residence'], when: [{ ref: 'flag.restriction', op: 'eq', value: false }], title: 'A court officer at the gate', text: 'He has a summons and orders to hand it to you in person.', choices: [
      { id: 'accept', label: 'Take the summons', fx: { ban: true, say: 'The court now has your signature, and it sends the travel ban to every post.' } },
      { id: 'lawyer', label: "Send Gianlūka's lawyer", needs: [{ card: 'influence' }], fx: { hours: 2, trust: { aide: -1 }, say: 'The lawyer argues at the gate for two hours.' } },
      { id: 'ignore', label: 'Keep the gate shut', fx: { exposure: 1 } } ] },
    { id: 'cameras', at: ['residence'], title: 'Gianlūka wants cameras', text: 'He wants you on the steps tonight, calling the election stolen.', choices: [
      { id: 'speak', label: 'Speak on the steps', fx: { exposure: 3, trust: { aide: 1 }, card: 'delay_report', say: "The party loves the speech, and the police watch every minute of it." } },
      { id: 'refuse', label: 'Refuse', fx: { trust: { aide: -1 }, say: 'Gianlūka goes quiet on the phone.' } } ] },
    // Pedra Branca
    { id: 'fuel', at: ['road'], title: 'Fuel is rationed', text: 'Every pump in Pedra Branca has a line and a police officer.', choices: [
      { id: 'queue', label: 'Wait in line', fx: { hours: 2, exposure: 1 } },
      { id: 'farmer', label: 'Buy from a farmer', fx: { roll: { need: 3, win: { hours: 1, say: 'You get 20 liters of fuel from a tractor shed.' }, lose: { hours: 2, exposure: 2, say: 'The farmer calls his nephew, who calls the radio.' } } } },
      { id: 'river', label: 'Plan the rest by river', needs: [{ card: 'boat' }], fx: { mod: -1, say: 'The river has no pumps and no police.' } } ] },
    { id: 'hitchhiker', at: ['road'], title: 'A hitchhiker knows your face', text: 'A young reporter flags you down. She recognizes you before the door closes.', choices: [
      { id: 'interview', label: 'Give her the interview', fx: { exposure: 2, belief: 'away', say: 'Her story puts you on the coast road.' } },
      { id: 'silence', label: 'Buy her silence', fx: { roll: { need: 4, win: { say: 'She keeps the money and the story.' }, lose: { exposure: 3, say: 'She takes the money and files anyway.' } } } },
      { id: 'drop', label: 'Drop her at the next town', fx: { hours: 1 } } ] },
    { id: 'flood', at: ['road'], title: 'Flash flood at the bridge', text: 'The river is over the road. Trucks are turning back.', choices: [
      { id: 'wait_water', label: 'Wait for the water', fx: { hours: 4 } },
      { id: 'ford', label: 'Drive through it', fx: { roll: { need: 4, win: { exposure: -1, say: 'The water comes up to the doors, and then the road is dry.' }, lose: { hours: 2, exposure: 1, lose: 'random', say: 'The engine floods. You leave something in the car.' } } } },
      { id: 'ferry', label: "Pay a smuggler's ferry", fx: { hours: 1, exposure: 1, say: 'The ferryman knows who you are and says nothing.' } } ] },
    { id: 'decoy_ditch', at: ['road'], when: [{ ref: 'hand.decoy_cars', op: 'eq', value: true }], title: 'A decoy on the evening news', text: 'One of your spare sedans rolled into a ditch on camera. The plates are yours.', choices: [
      { id: 'claim', label: 'Say it was you', fx: { belief: 'away', exposure: -2, lose: 'decoy_cars', say: 'For one evening you are in a ditch 200 kilometers away.' } },
      { id: 'quiet', label: 'Say nothing', fx: { exposure: 1 } } ] },
    // the colônia
    { id: 'bishop', at: ['colonia'], title: 'The bishop offers a blessing', text: 'The bishop will bless you in public at evening mass. The whole colônia would see you.', choices: [
      { id: 'blessing', label: 'Accept the blessing', fx: { exposure: 2, trust: { host: 1 } } },
      { id: 'decline', label: 'Decline', fx: { trust: { host: -1 } } } ] },
    { id: 'wedding', at: ['colonia'], title: 'A wedding for 300', text: "A cousin's wedding fills every street tonight. Nobody counts faces at a wedding.", choices: [
      { id: 'dance', label: 'Hide among the guests', fx: { hours: 3, exposure: -3, say: 'You dance with a great-aunt who never asks your name.' } },
      { id: 'skip', label: 'Stay inside', fx: {} } ] },
    { id: 'grandson', at: ['colonia'], title: 'The grandson wants out', text: "Nonā Rosa's grandson is 19, knows the rail yard, and wants to come.", choices: [
      { id: 'take', label: 'Take him with you', fx: { card: 'grandson' } },
      { id: 'no', label: 'Say no', fx: { trust: { host: -1 } } } ] },
    { id: 'raid', at: ['colonia'], title: 'Police raid the next farm', text: 'Police are searching the neighbor\'s farm for contraband. They are not looking for you yet.', choices: [
      { id: 'cellar', label: 'Hide in the wine cellar', fx: { hours: 4 } },
      { id: 'slip', label: 'Lie low nearby for an hour', fx: { roll: { need: 3, win: { hours: 1 }, lose: { hold: 1 } } } } ] },
    // Salta
    { id: 'strike', at: ['salta'], title: 'The rail yard is on strike', text: 'The union has stopped work in the yard, and the strikers watch everyone who comes near the freight.', choices: [
      { id: 'wait_strike', label: 'Wait it out', fx: { hours: 8 } },
      { id: 'union', label: 'Pay the union boss', fx: { exposure: 2, say: 'The union boss takes the money, and the strikers let you pass.' } },
      { id: 'scabs', label: 'Walk in with the strikebreakers', fx: { roll: { need: 4, win: { say: 'Nobody looks at a scab twice.' }, lose: { hold: 1 } } } } ] },
    { id: 'tourbus', at: ['salta'], title: 'A tour bus to the waterfalls', text: 'A bus of tourists leaves for the falls at the border at dawn. One seat is empty.', choices: [
      { id: 'bus', label: 'Take the seat in a hat', fx: { roll: { need: 4, win: { advance: true, belief: 'away', say: 'You sleep through the checkpoint. The guide counts you twice.' }, lose: { hold: 1 } } } },
      { id: 'pass', label: 'Let it go', fx: {} } ] },
    { id: 'holt_drunk', at: ['salta'], title: 'Holt has been drinking', text: 'He is loud at the bar about a passenger worth a lot of money.', choices: [
      { id: 'trust_holt', label: 'Trust him anyway', fx: { doubt: 'holt' } },
      { id: 'sober', label: 'Sober him up', fx: { hours: 2, trust: { holt: 1 } } },
      { id: 'cut_holt', label: 'Stop working with Holt', fx: { cut: 'holt' } } ] },
    { id: 'yard_debt', at: ['salta'], title: 'The yardmaster owes your family', text: "His wife's father once worked for your father. He might remember.", choices: [
      { id: 'favor', label: 'Ask the favor', fx: { roll: { need: 3, win: { card: 'yard_walk', say: 'He remembers, and he has Theo walk you through the yard at train time.' }, lose: { exposure: 2, say: 'He remembers differently.' } } } },
      { id: 'leave_it', label: 'Do not risk it', fx: {} } ] },
    // the line
    { id: 'old_guard', at: ['border'], title: 'A guard you know', text: 'The night guard once worked for your family. He is staring at you.', choices: [
      { id: 'loyalty', label: 'Appeal to old loyalty', fx: { roll: { need: 3, win: { mod: -2, say: 'He looks at his boots and lets the queue move faster, so crossing here gets easier.' }, lose: { hold: 1 } } } },
      { id: 'next_shift', label: 'Wait for the next shift', fx: { hours: 3 } } ] },
    { id: 'pilgrims', at: ['border'], title: 'Pilgrims at the barrier', text: 'The post is full of 40 pilgrims and their luggage. The guards are tired.', choices: [
      { id: 'queue_pilgrims', label: 'Join the queue', fx: { mod: -1 } },
      { id: 'wait_pilgrims', label: 'Wait for them to clear', fx: { hours: 2 } } ] },
    { id: 'blizzard', at: ['border'], title: 'A blizzard over the pass', text: "Snow is piling up at the post, and a smugglers' path runs over the ridge.", choices: [
      { id: 'storm', label: 'Wait out the storm', fx: { hours: 6, skipEnemy: true, say: 'You spend six hours in the snow, and the storm costs the police their next move.' } },
      { id: 'ridge', label: 'Walk the ridge path', fx: { roll: { need: 4, win: { advance: true, say: 'You come down into Costamar with no stamp at all.' }, lose: { hours: 3, exposure: 3, say: 'You turn back half frozen. The post saw your flashlight.' } } } } ] },
    { id: 'dog_bark', at: ['border'], when: [{ ref: 'flag.dog', op: 'eq', value: true }], title: 'The dog barks at the post', text: 'The guards look up at the dog barking in your car.', choices: [
      { id: 'calm', label: 'Let your daughter calm him', fx: { roll: { need: 3, win: {}, lose: { exposure: 3 } } } },
      { id: 'give_dog', label: 'Give the dog to a trucker', fx: { trust: { sibling: -1 }, say: 'Your daughter does not speak to you until Costamar.' } } ] },
    { id: 'esm_press', at: ['border'], title: 'Cameras across the line', text: 'Someone told the press in Cerro Alto. Cameras wait on the far side.', choices: [
      { id: 'speak_esm', label: 'Speak to them', fx: { exposure: 2, stage: { reception: 1 }, say: 'Costamar sees you on the news, and so does Valdória.' } },
      { id: 'cover', label: 'Cover your face', fx: {} } ] },
    // Portalba
    { id: 'crew_double', at: ['airfield'], title: 'The crew wants double', text: "The operator's insurer called. The pilot wants twice the fee or a guarantee.", choices: [
      { id: 'pay_double', label: 'Pay double', fx: { exposure: 1 } },
      { id: 'guarantee', label: 'Have your sponsor guarantee it', needs: [{ card: 'permission' }], fx: { trust: { sponsor: -1 }, say: 'It goes on what you owe your sponsor.' } },
      { id: 'other_pilot', label: 'Find another pilot', fx: { hours: 4 } } ] },
    { id: 'overflight', at: ['airfield'], title: 'No overflight permit', text: 'The refuel stop will not let the jet cross. The long route adds hours.', choices: [
      { id: 'long', label: 'Take the long route', fx: { hours: 3 } },
      { id: 'short', label: 'File the short route', fx: { mod: 1, say: 'The pilot files the short route anyway, so the tower will look harder when you try to leave.' } } ] },
    { id: 'goodbye_post', at: ['airfield'], title: 'A goodbye online', text: 'Your daughter posted a photo from the airfield lounge. It is everywhere.', choices: [
      { id: 'takedown', label: 'Get it taken down', fx: { roll: { need: 4, win: {}, lose: { exposure: 3 } } } },
      { id: 'stand', label: 'Let it stand', fx: { exposure: 2, flag: { asked: true }, say: "Valdória asks Costamar to hold you. The police here can now stop you, and your takeoff is harder until Costamar's minister knows you are coming." } } ] },
    { id: 'rival_deal', at: ['airfield', 'border'], title: 'The president calls', text: 'Concede on camera, come home, and the case quietly closes.', choices: [
      { id: 'take_deal', label: 'Take the deal', fx: { end: { kind: 'deal', reason: 'You concede on camera at noon. The case closes quietly. The party never forgives you.' } } },
      { id: 'hang_up', label: 'Hang up', fx: {} } ] },
    // anywhere
    { id: 'too_soon', at: null, title: 'Your family spoke too soon', text: '{sib} told reporters you already landed abroad. You are still at {here}.', choices: [
      { id: 'let_run', label: 'Let the story run', fx: { belief: 'away', exposure: -2, flag: { dark: true }, say: 'Your own people believe it too, and every reply you ask for now comes two hours later.' } },
      { id: 'correct', label: 'Correct it', fx: { exposure: 1 } } ] },
    { id: 'bodyguard', at: null, title: 'An old bodyguard wants money', text: 'He knows your route. He will sell it tonight unless you pay.', choices: [
      { id: 'pay_guard', label: 'Pay him', fx: { exposure: 1 } },
      { id: 'bluff', label: 'Call his bluff', fx: { roll: { need: 3, win: { say: 'He never calls anyone.' }, lose: { belief: 'here', exposure: 3, say: 'He calls the police, who now search where you are.' } } } },
      { id: 'gianluka', label: 'Have Gianlūka handle him', needs: [{ card: 'influence' }], fx: { trust: { aide: -1 } } } ] },
    { id: 'coffee', at: ['residence', 'road', 'colonia', 'salta'], title: 'A police car pulls in beside you', text: 'Two officers get out for coffee. One glances at your window.', choices: [
      { id: 'sit', label: 'Sit still', fx: { roll: { need: 4, win: {}, lose: { hold: 1 } } } },
      { id: 'drive', label: 'Drive away now', fx: { exposure: 1 } } ] },
    { id: 'hearing', at: null, when: [{ ref: 'clock.hoursLeft', op: 'gte', value: 43 } /* before hour 30 */, { ref: 'flag.restriction', op: 'eq', value: false }], title: 'The hearing moves up', text: 'The court moved your hearing forward, and it wants the travel ban at every post today.', choices: [
      { id: 'noted', label: 'Keep going', fx: { ban: true, say: 'The court sends the travel ban to every post.' } },
      { id: 'stall', label: 'Have Gianlūka ask for a delay', needs: [{ card: 'influence' }], fx: { trust: { aide: -1 }, exposure: 1, say: 'The clerk holds the court\'s order back. Gianlūka adds it to what you owe him, and the court knows you are still in reach.' } } ] },
    { id: 'blackout', at: null, title: 'The province goes dark', text: 'A storm took down the grid. Phones, radios, and the inquiry go quiet.', choices: [
      { id: 'dark', label: 'Move while they are blind', fx: { exposure: -1, skipEnemy: true } },
      { id: 'sit', label: 'Sit tight until the lights return', fx: { hours: 2, exposure: -1, say: 'You wait two hours in the dark. Nobody comes to the door.' } } ] },
  ];
  // Holds: what happens when the inquiry catches up. Each rung is worse than the last.
  const HOLDS = {
    1: { title: 'Stopped and questioned', text: 'A patrol stops you at {here}. An officer wants to know where you are going.', choices: [
      { id: 'calm', label: 'Answer calmly', fx: { roll: { need: 3, face: 1, win: { hours: 1, say: 'He writes down a name that is not yours.' }, lose: { hours: 3, lose: 'random', exposure: 1, say: 'You spend three hours on a bench. The police keep something of yours.' } } } },
      { id: 'lawyer', label: "Call the party's lawyer", needs: [{ card: 'influence' }], fx: { hours: 2, trust: { aide: -1 }, say: 'The lawyer arrives shouting. They let you go.' } },
      { id: 'bribe', label: 'Pay the officer', fx: { hours: 1, exposure: 2, say: 'The officer takes the money and lets you go.' } } ] },
    2: { title: 'Held at the station', text: 'They take you to the nearest station. Your phone goes in a plastic bag.', choices: [
      { id: 'wait_lawyer', label: 'Wait for a lawyer', fx: { hours: 8, lose: 'best', say: 'You wait eight hours for the lawyer. The police keep your second passport, or another card if you no longer have it.' } },
      { id: 'embassy', label: '{sib} calls an embassy', fx: { roll: { need: 4, win: { hours: 4, say: 'A diplomat calls the station chief. You are released.' }, lose: { hours: 10, lose: 'best', say: 'Nobody important answers for 10 hours, and they keep your second passport, or another card if you no longer have it.' } } } },
      { id: 'walk_out', label: 'Walk out at shift change', fx: { roll: { need: 5, win: { hours: 1, exposure: 3, say: 'Nobody stops a person walking like they belong.' }, lose: { hold: 1 } } } } ] },
    3: { title: 'House arrest', text: 'The court placed you under house arrest. Two officers sit outside the door.', choices: [
      // a stop resets police attention to 4, so +4 leaves her at 8, two below the next stop (owner bug report, Nov. 1, 2026: +8 hit 10 and re-arrested her within the hour)
      { id: 'climb', label: 'Climb out at the shift change', fx: { roll: { need: 5, decoy: 1, win: { hours: 2, exposure: 4, rung: 2, say: 'You go over the back wall and into a car that was not there yesterday.' }, lose: { end: { reason: 'The officers catch you on the wall. The hearing is Monday. You will be there.' } } } } },
      { id: 'accept', label: 'Accept it', fx: { end: { reason: 'You sit by the window and watch the officers change shifts. The hearing is Monday.' } } } ] },
  };
  // Rumors: a hint about who might be selling you out. Sometimes it is wrong.
  const RUMORS = [
    (n) => `Someone saw ${n} talking to a police car.`,
    (n) => `${n} asked twice which car you will take.`,
    (n) => `${n} paid off a debt this morning, in cash.`,
  ];
  // Moves marked once can be made one time per run (owner decision, Nov. 1, 2026: four unrolled
  // "Call your contacts" finished almost every arrangement and kept claiming progress after).
  // A move that advances arrangements is only offered while one of them can still move.
  // Moves marked noRoll (resting, phoning from a safe house, a ride already arranged) have no
  // failure written for them, so they are choices, not chances: they are never rolled.
  // One 20-sided die for every other roll (owner decision, Nov. 1, 2026: "20 sided").
  // Difficulties stay written on the old six-sided scale and are converted to the
  // 20-sided target with the same chance: 2→4, 3→8, 4→11, 5→14, 6→18. A 1 always
  // fails and a 20 always succeeds; a difficulty above 6 (a cancelled passport) cannot be won.
  const DICE = {
    sides: 20,
    target: (n6) => n6 > 6 ? 21 : Math.min(20, Math.max(2, Math.round(21 - 20 * (7 - n6) / 6))),
    wins: (d, t) => t <= 20 && (d === 20 || (d !== 1 && d >= t)),
    chance: (t) => (21 - Math.min(20, Math.max(2, t))) * 5, // percent, as the player sees it
    shown: (t) => Math.min(20, t), // what the player is told. A target of 21 (a move that cannot be won) is shown as 20 and looks like any hard move; the die decides it on the table (owner, Nov. 1, 2026: never tell the player an outcome in advance)
  };
  return { DICE, DESTS, PLACES, POSTS, EVENTS, HOLDS, RUMORS, CHARACTERS, PEOPLE, ENEMY, ARRANGEMENTS, CARDS, LEVELS, STAGE_LINES, ENEMY_ACTIONS, VALDORIA, ESMERALDA, GOV, GOV_CARDS, GOV_ORDERS, GOV_EVENTS };
})();
if (typeof module !== 'undefined') module.exports = Data;
