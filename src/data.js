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
             blurb: "A friend inside the inquiry warns her when the police move. Border guards know her face.",
             // Distinct runs: Teresā starts with a friend in the inquiry, but every officer knows her face.
             hand: ['passport', 'decoy_cars', 'aide_word', 'informant'], handAlt: ['delay_report'], exposure: 1, faceKnown: true,
             edge: 'A friend inside the inquiry', flaw: 'Every officer knows your face' },
    man:   { id: 'man', name: 'Matēu Zanetī', short: 'Matēu', title: 'the defeated candidate', pronoun: 'he',
             sibling: { id: 'sibling', name: 'Līviā Zanetī', short: 'Līviā', rel: 'your sister' },
             blurb: "The family barges can carry him down the river. Police have watched his house since the count.",
             // Matēu has the family barges, but he has been watched since the count.
             hand: ['passport', 'decoy_cars', 'aide_word', 'barge'], handAlt: ['delay_report'], exposure: 3, faceKnown: false,
             edge: 'Your family barges on the river', flaw: 'Watched since the count' },
  };

  // Allies. reliability: the die result a delegated job needs (lower is better). where: level index they act from.
  const PEOPLE = {
    sibling:  { role: 'arranging the aircraft from abroad', where: -1, reliability: 3 },
    aide:     { name: 'Gianlūka Moretī', role: 'party chief of staff', where: 0, reliability: 3,
                terms: 'He wants your public word that he leads the party in your absence.' },
    nando:    { name: 'Nando', role: 'your driver for 11 years', where: 0, reliability: 2 },
    sponsor:  { name: 'Your sponsor', role: 'the person asking a ministry to let you in; set by where you chose to go', where: -1, reliability: 4,
                terms: '' },
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
    permission: { name: 'Entry visa',  stages: ['none', 'sponsor engaged', 'Entry visa issued'],
                  what: 'Your sponsor asks the ministry of the country you chose for a visa to land and stay.' },
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
    sponsor_line: { name: "Your sponsor's line to the ministry", tag: 'permission', from: 'sponsor', reach: ALL, works: 'Anyone who banks. Vélez’s uncle. A nervous pilot.',
                    text: "A name that opens doors money alone does not. Your sponsor keeps count." },
    barge:        { name: 'Your family barges', tag: 'boat', from: 'self', reach: ['road', 'colonia'], works: 'The river south of Santa Laura.',
                    text: "The barges still run the river. The captains still owe your father." },
    grandson:     { name: "Nonā Rosa's grandson", tag: 'passage', from: 'host', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "He is 19, quick, and knows which boxcar the guards skip." },
    informant:    { name: 'A friend in the inquiry', tag: 'information', from: 'aide', reach: VALDORIA, works: 'Any move the inquiry could be watching, up to the line.',
                    text: "A clerk tells Gianlūka where Sosā is looking and who is on duty." },
  };

  // Levels. Each approach: needs (all must hold), dc (die needs dc or more after mods), mods (tag: bonus),
  // and what happens. hours: time spent attempting. Failure never ends the run by itself.
  const LEVELS = [
    { id: 'residence', name: 'The residence, Portô Venla', short: 'Residence', scene: 'residence',
      objective: "Get past the watch. Start your calls now: the jet, the border and the visa take hours.",
      arrive: "Two unmarked cars watch the house. The court has barred you from leaving and wants your passports by Monday. One of them is in your coat.",
      approaches: [
        { id: 'decoy', with: 'nando', name: 'Decoy convoy', hours: 3, dc: 3, needs: [{ card: 'decoy' }],
          mods: { information: 2 }, text: "Send three cars in different directions. The watch must follow the wrong one.",
          success: { belief: 0, exposure: -1, say: "The watch follows a decoy. You leave by the service lane." },
          fail: { exposure: 2, say: 'The second car is stopped at the avenida. Nando talks his way out, but they know the cars now.' } },
        { id: 'service', name: 'The service door after dark', hours: 1, dc: 4, needs: [{ night: true }],
          mods: { information: 1 }, text: "Leave with the kitchen staff after 22:00.",
          success: { belief: 0, say: 'The night cook lends you an apron and a cigarette. Nobody looks at the help.' },
          fail: { exposure: 2, say: 'A flash from a parked car. Someone photographed the help tonight.' } },
        { id: 'partycar', with: 'aide', name: "The party's official car", hours: 1, dc: 2, needs: [{ card: 'influence' }],
          mods: {}, text: "Use Gianlūka’s official car. He will expect your promised endorsement.",
          success: { belief: 0, commit: 'aide', say: 'The flags get you through. Gianlūka reminds you, gently, what he asked for.' },
          fail: { exposure: 1, commit: 'aide', say: 'The car is let through, but the inspector is told whose car it was.' } },
      ] },
    { id: 'road', name: 'The road south, Santa Laura', short: 'Santa Laura', scene: 'road',
      objective: "Change cars and keep the inquiry looking at the coast.",
      arrive: "Santa Laura. The radio puts you on a yacht in Portô Venla. The posts have not received the travel ban yet.",
      approaches: [
        { id: 'second_driver', with: 'nando', name: "Hire a driver and plain car", hours: 2, dc: 3, needs: [], pay: true,
          mods: { information: 1 }, text: "Nando’s cousin offers a taxi and his silence.",
          success: { say: "You leave by taxi. Nando drives your sedan north as a decoy." },
          fail: { exposure: 1, hours: 2, say: 'The cousin wants more, then wants nothing to do with it. Two hours lost.' } },
        { id: 'siblings_driver', with: 'sibling', name: "Leave with Duartē's driver", hours: 2, dc: 2, needs: [{ arr: 'aircraft', stage: 1 }],
          mods: { information: 1 }, text: 'Your sibling knows a man in Santa Laura. Once the charter is booked, he drives you to Nova Trentô.',
          success: { say: 'He asks nothing and drives the back roads. The radio stays off.' },
          fail: { exposure: 1, hours: 1, say: 'He is late, then nervous. An hour on a side street waiting for him to decide.' } },
        { id: 'barge', name: 'Take a family barge upriver', hours: 3, dc: 2, needs: [{ card: 'boat' }], with: 'self',
          mods: { information: 1 }, text: 'A captain who owes your father takes you up the river to the colônia. Nobody checks a barge.',
          success: { exposure: -1, say: 'You sleep under a tarp that smells of soy. The river is quiet.' },
          fail: { exposure: 1, hours: 2, say: 'River police board at the lock. The captain talks for two hours.' } },
        { id: 'known_car', name: 'Drive on in your own car', hours: 1, dc: 5, needs: [],
          mods: { delay: 2, decoy: 2 }, text: "Risk the posts in a car they recognize. Nando's spare sedans can run ahead of you.",
          success: { exposure: 1, say: 'You pass the first post before the fax does.' },
          fail: { exposure: 3, belief: 1, say: 'The post at the river has your plate. They let you through and pick up the phone.' } },
      ] },
    { id: 'colonia', name: 'The colônia, Nova Trentô', short: 'Nova Trentô', scene: 'colonia',
      objective: "Make your calls tonight. Leave for the border once Baca has your name.",
      arrive: "Nonā Rosa offers a room and a phone. Her cooperative’s truck was impounded this morning.",
      approaches: [
        { id: 'help_host', with: 'host', name: "Help Nonā Rosa free the truck", hours: 3, dc: 2, needs: [],
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
      objective: "Get on the midnight freight. The yardmaster will sell you out to Sosā.",
      arrive: "The midnight freight climbs to the border. Holt and Theo can get you aboard.",
      approaches: [
        { id: 'board', name: 'Board the midnight freight', hours: 1, dc: 3, needs: [{ card: 'passage' }, { night: true }],
          mods: { passage: 2 }, text: "The freight leaves at midnight. Holt or Theo gets you on; you still have to be there.",
          success: { say: 'The train pulls out at 12 past. Cold straw, then the sound of the grade.' },
          fail: { exposure: 1, say: 'A lamp swings down the cars. You miss the midnight and wait for the next.' } },
        { id: 'crate', with: 'holt', name: "Pay Holt for a crate", hours: 2, dc: 3, needs: [], pay: true,
          mods: { vehicle: 1, information: 1 }, text: "Pay Holt to hide you in the third boxcar.",
          success: { card: 'crate', say: 'Holt pockets the notes without counting them. "Third car. Midnight. I don\'t wait."' },
          fail: { exposure: 1, say: 'Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide.' } },
        { id: 'foreman', with: 'theo', name: "Theo's walk-through", hours: 2, dc: 4, needs: [],
          mods: { vehicle: 2, information: 1, influence: 1 }, text: "Theo escorts you through the yard. The colônia’s truck strengthens your case.",
          success: { card: 'yard_walk', trust: 'theo', say: 'Theo talks about switches the whole way across the yard. Nobody interrupts a foreman.' },
          fail: { exposure: 1, say: 'The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change.' } },
        { id: 'buy_seat', name: 'Pay the yardmaster', hours: 1, dc: 7, needs: [], pay: true,
          mods: {}, text: "He will pocket the money and report you. This cannot succeed.",
          success: { exposure: 2, say: "Three men watch the yardmaster take your money." },
          fail: { exposure: 2, say: 'He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here.' } },
      ] },
    { id: 'border', name: 'The line at the Huhūi passes', short: 'The line', scene: 'border',
      objective: "Three posts cross into Esmeralda. One has taken Valdória's money; choose, or wait for Vélez's people.",
      arrive: "The passes. Three crossings within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Baca, and the Punta Marēa crossing toward the coast. Somewhere among them, guards who have been paid from your side of the line.",
      border: true,
      approaches: [
        { id: 'post_rail', post: 'rail', name: 'Cross at the Paso Huhūi post', hours: 1, dc: 4, needs: [{ card: 'document' }],
          mods: { introduction: 2, influence: 1 }, text: "The freight's own crossing, and the one Sosā expects. Your second passport goes on the desk.",
          success: { say: 'The guard turns the pages, looks at a sheet on the desk, and stamps it.' },
          fail: { exposure: 2, hours: 3, say: 'The guard reads the sheet first. Three hours in a cold room before Gianlūka\'s phone call gets you back outside, on the wrong side.' } },
        { id: 'post_high', post: 'high', name: 'Take the Ālto Verdē road post', hours: 3, dc: 3, needs: [],
          mods: { introduction: 2, vehicle: 1 }, text: "Three hours of switchbacks toward Baca. The post answers to the interior ministry, where Vélez works.",
          success: { say: 'A long climb. The sergeant at Ālto Verdē reads your name off a list and waves the car through.' },
          fail: { exposure: 1, hours: 2, say: 'The post has no list with your name on it. Two hours while someone in Baca is woken up.' } },
        { id: 'post_coast', post: 'coast', name: 'Pay the Punta Marēa crossing', hours: 2, dc: 4, needs: [], pay: true,
          mods: { delay: 2, information: 2 }, text: "The merchants' road to the coast. The guards here answer to the port, and the port takes money.",
          success: { exposure: 1, say: 'The barrier goes up. Nobody says thank you.' },
          fail: { exposure: 2, hours: 2, say: 'The older guard takes the money and the younger one calls the ministry. Two hours in the salt wind.' } },
      ],
      received: { id: 'received', name: "Walk to the people waiting", hours: 1, say: 'Rosario Vélez shakes your hand across the barrier. The guards on your side write nothing down.' },
      bought: { say: 'The sergeant takes your passport, walks into the hut, and does not come back. Through the window you can see him on the telephone. 12 hours later a Valdórian liaison arrives to "assist". By then it is too late to matter which side of the line you are on.' } },
    { id: 'airfield', name: 'Susana airfield, Esmeralda', short: 'Susana', scene: 'airfield',
      objective: "Safe passage to fly, not to stay. Fuel the jet, get the visa and take off.",
      arrive: "Susana. The charter apron behind the port, Esmeraldan flags on the tower. They will let you leave from here and nothing more. Sosā has asked them to hold you.",
      final: true,
      approaches: [
        { id: 'depart', with: 'pilot', name: 'Board and depart', hours: 2, dc: 3, needs: [{ arr: 'aircraft', stage: 4 }, { arr: 'permission', stage: 2 }],
          mods: { introduction: 1, document: 1 }, text: "The jet is ready and the visa is on the manifest. You still need the tower to clear departure.",
          success: { win: true, say: "You take off. Forty minutes later, the pilot confirms you have left Esmeraldan airspace." },
          fail: { exposure: 1, hours: 2, say: 'The tower holds you on the apron for two hours while a request from Valdória is read, and reread.' } },
        { id: 'depart_nopermit', with: 'pilot', name: 'Depart without the visa', hours: 2, dc: 5, needs: [{ arr: 'aircraft', stage: 4 }],
          mods: { introduction: 1, permission: 2 }, text: "Ask the pilot to leave before the visa is issued. Your sponsor’s name helps; the party’s does not. Where you land decides what happens next.",
          success: { win: true, say: 'Capitān Olsēn files the flight plan and asks no questions. Your sponsor’s phone rings somewhere over the ocean.' },
          fail: { exposure: 2, hours: 3, say: 'The pilot will not go without a landing clearance. Three hours arguing in a hangar.' } },
        { id: 'fuel_now', name: 'Pay the fuel agent yourself', hours: 1, dc: 2, needs: [{ arr: 'aircraft', stage: 2 }], pay: true,
          mods: {}, text: "Pay in person to advance aircraft preparations. Exposure rises.",
          success: { advance: ['aircraft'], exposure: 1, say: "The fuel truck arrives. People on the apron recognize you." },
          fail: { exposure: 1, say: 'The agent wants the operator\'s account, not cash. An hour wasted.' } },
      ] },
  ];

  // Things people say when a stage is reached. who: speaker id.
  const STAGE_LINES = {
    aircraft:   ['', 'Charter found: a jet in Susana, 12 seats, no questions so far.', 'Crew confirmed. The operator needs a destination.', 'Fuel paid. The jet is being positioned.', 'The jet is ready at Susana.'],
    reception:  ['', 'Your sibling reached Rosario Vélez, the minister\'s aide in Baca. Esmeralda expects you. She has not answered since.', 'Vélez has spoken to her minister. Esmeralda will not turn you away at the line.', 'Esmeraldan officials will be at the {post} when you arrive. Not the others. Only that one.'],
    permission: ['', '{sponsor} has taken your call and will speak to the ministry, on {sponsor}’s terms.', 'The entry visa is issued. A car will meet the aircraft at {city}.'],
  };

  // Enemy actions. Picked by weight each enemy turn. Each is visible in the log and on the map.
  const ENEMY_ACTIONS = [
    { id: 'check_belief', w: 4, text: (lv) => `Sosā's people search ${lv}.` },
    { id: 'circulate',    w: 3, once: true, text: () => 'Sosā sends the travel ban to every provincial post and the Huhūi border.' },
    { id: 'lean_operator', w: 2, once: true, after: 12, text: () => 'The ministry warns the Susana charter operator that its Valdórian licence is under review.' },
    { id: 'press_ally',   w: 3, text: (who) => `Sosā calls ${who} in for a conversation.` },
    { id: 'ask_esmeralda',w: 2, once: true, after: 30, text: () => 'Valdória asks Esmeralda, through its embassy in Baca, to hold you if you appear.' },
    { id: 'press_story',  w: 2, text: () => 'The ministry briefs the papers that you have already left the country.' },
    { id: 'roadblock',    w: 2, after: 6, text: (lv) => `Police set a checkpoint on the road out of ${lv}. For the next six hours every move there is harder.` },
    { id: 'trace',        w: 3, after: 4, text: () => 'The ministry traces your recent calls.' },
    { id: 'watch_sibling', w: 2, once: true, after: 9, text: (who) => `Sosā has ${who}'s calls monitored. The operator in Susana goes quiet for a while.` },
  ];

  // ---- Where you could go. Three countries, one city each, from the kels canon (Lāyūna, Gannibal); Almatau is a
  // working name for Tarun's capital, which the canon leaves open. accepts: whether the country will take you.
  // The player never sees accepts; the only tell is whether the visa ever arrives. Susana, in Esmeralda, is where you fly from.
  const DESTS = {
    atlanta:   { name: 'Atlanta', city: 'Lāyūna', lon: -13.2, lat: 27.2, hours: 10, accepts: true,
                 sponsor: { name: 'Bīr Amādū Salek', short: 'Salek', pronoun: 'he', role: 'a banker abroad with ministries on his phone; an old client of the family',
                            asks: 'Amādū Salek, an old client of the family, will ask for you once the family accounts are moved to his bank.',
                            terms: 'He will speak to the ministry if you move the family accounts to his house.', slow: 0,
                            demand: { text: '"The transfer papers are with your brother-in-law. Sign them and the ministry hears from me tonight."', accept: 'Sign and move the accounts', effect: 'Salek keeps working. Your family will not forgive this quickly.', heat: 0 },
                            kept: 'Salek now holds the family accounts.', broke: 'Salek tells his clients you do not keep terms.' },
                 landing: '' },
    tarun:     { name: 'Tarun', city: 'Almatau', lon: 76.9, lat: 43.2, hours: 14, accepts: false,
                 sponsor: { name: 'Dēvan Rāo', short: 'Rāo', pronoun: 'he', role: 'a magistrate in Almatau who has taken in exiles before',
                            asks: 'Dēvan Rāo, a magistrate who has taken in exiles before, will ask for you by letter, and letters are slow.',
                            terms: 'He will write to the ministry if you give your word to keep out of politics while you are his guest.', slow: 6,
                            demand: { text: '"I have drafted the letter. It says you will hold no office and give no interviews from Tarun. I need your signature under mine."', accept: 'Sign and give your word', effect: 'Rāo writes tonight. Your party reads it as retirement.', heat: 0 },
                            kept: 'Rāo has your word that you are out of politics.', broke: 'Rāo tells the ministry you do not keep terms.' },
                 landing: 'You land at Almatau at dawn. The flight plan was accepted; you were not. Tarun never agreed to take you, and the men at the foot of the stairs are police. A Valdórian liaison arrives by evening.' },
    zaryanova: { name: 'Zaryanova', city: 'Gannibal', lon: 131.9, lat: 43.1, hours: 8, accepts: false,
                 sponsor: { name: 'Mirēlā Vosk', short: 'Vosk', pronoun: 'she', role: 'a former trade envoy in Gannibal with friends at the foreign ministry',
                            asks: 'Mirēlā Vosk, a former trade envoy, will ask for you once you have spoken on the record.',
                            terms: 'She will take it to the ministry if you give a statement, on the record, naming the men who forced the vote.', slow: 0,
                            demand: { text: '"A journalist I trust is holding the line. Give the statement now, with names, and the ministry has a reason to say yes."', accept: 'Give the statement', effect: 'Vosk takes it to the ministry. The inquiry reads it too, and your exposure rises by one.', heat: 1 },
                            kept: 'Your statement runs in Gannibal with the names in it.', broke: 'Vosk tells the ministry you do not keep terms.' },
                 landing: 'You land at Gannibal after eight hours. Officers wait on the apron. Zaryanova never agreed to take you. You are held at the airport until Valdória sends for you.' },
  };
  const PLACES = { valdoria: { name: 'Valdória', city: 'Portô Venla', lon: -77.0, lat: -12.0 }, susana: { name: 'Susana', city: 'Esmeralda', lon: -79.9, lat: -2.2 } };
  const POSTS = { rail: 'Paso Huhūi rail post', high: 'Ālto Verdē road post', coast: 'Punta Marēa crossing' };
  // ---- The government role: a senior aide to the minister, coordinating the departure inquiry.
  const GOV = { id: 'gov', name: 'Sofīā Leōnī', title: 'aide to the incoming government', pronoun: 'she',
                blurb: "Stop the candidate's flight before Tuesday afternoon. Your orders stop at the border." };
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
    { id: 'search', name: (lv) => `Search ${lv}`, hours: 3, dc: 4, who: 'the provincial patrol', mods: { patrol: 1 }, act: 'check_belief', text: 'Send people to the place you believe she is. If she is there, they get close. If not, you learn that.', fail: 'The patrol arrives late and finds a cold room.' },
    { id: 'watch_house', name: () => 'Keep watch on the house', hours: 1, dc: 1, who: 'the watch team', mods: {}, text: 'Certain. You learn whether anyone is still inside. You learn nothing new if she has gone.', where: [0, 1] },
    { id: 'follow', name: (lv, rep) => `Follow the latest report: ${rep}`, hours: 1, dc: 1, who: 'you', mods: {}, text: 'Move the search to where the newest report points.' },
    { id: 'circulate', name: () => 'Circulate the travel ban', hours: 3, dc: 4, who: 'the provincial desks', mods: { records: 1 }, act: 'circulate', text: 'Every post and the border get the ban. A sent message does not close the border until the post confirms.', fail: 'Half the desks file it. A clerk calls a friend of hers.' },
    { id: 'press', name: () => 'Call in one of her people', hours: 2, dc: 3, who: 'Inspector Sosā', mods: { records: 1 }, act: 'press_ally', text: 'Sosā questions someone who has helped her. Some hold. Some tell him where she was last seen.', fail: 'Nobody answers the summons today.' },
    { id: 'roadblock', name: (lv) => `Checkpoint on the road out of ${lv}`, hours: 2, dc: 3, who: 'the provincial patrol', mods: { patrol: 2 }, act: 'roadblock', text: 'For six hours every move out of that place is harder.', fail: 'The checkpoint stands on the wrong road.' },
    { id: 'story', name: () => 'Brief the papers that she has left', hours: 1, dc: 2, who: 'the ministry press office', mods: {}, act: 'press_story', text: 'A public claim. It can calm the minister and send your own offices after the wrong lead.' },
    { id: 'rail_ask', name: () => 'Ask the Salta yardmaster who is paying', hours: 2, dc: 3, who: 'the railway contact', mods: { rail: 2 }, text: 'He tells you who asked about the midnight freight.', where: [3], fail: 'He wants to see who else is asking first.' },
    { id: 'lean', name: () => "Review the charter operator's licence", hours: 3, dc: 3, who: 'the aviation desk', mods: { operator: 2 }, act: 'lean_operator', text: 'The operator withdraws the crew until she reassures him. It pauses the booking; it does not find her.', after: 12 },
  ];

  // ---- Government dispatches: the Reports phase on Sofīā's side. Invented, like the candidate's.
  // at: stop indexes where the search must be looking (null = anywhere). after: earliest hour. needs: a government card id.
  // fx: hours, lead (a true report of where she is now; delay in hours), false (a report that points elsewhere),
  // follow (move the search to the newest report), card / lose (government card ids), act (an inquiry action at the
  // search), press (her exposure up), warn (her side learns something: her exposure down), stall (her bookings slip,
  // hours), crossing (the line is closed for n hours), ban (the ban is confirmed at the post), unban (the post loses it),
  // holdup (the Esmeraldan request moves forward), dc (orders easier or harder: [delta, hours]), minister (+1 pleased,
  // -1 angry), sooner (the minister's deadline moves up, hours), roll {need, win, lose}, say.
  const GOV_EVENTS = [
    { id: 'tipster', title: 'A caller wants money', text: 'A man says he drove her this morning. He wants cash before he says where.', choices: [
      { id: 'pay', label: 'Pay him', fx: { hours: 1, roll: { need: 4, win: { lead: 1, say: 'He names the road and the car. It checks out.' }, lose: { false: true, say: 'He names a town. He has never been there.' } } } },
      { id: 'trace', label: 'Trace the call instead', needs: 'registry', fx: { hours: 2, lead: 3, say: 'The registry finds the number. The number finds the car.' } },
      { id: 'hang_up', label: 'Hang up', fx: {} } ] },
    { id: 'leak', title: 'The minister leaks your lead', text: 'He told a columnist you are looking at {there}. It runs in the morning edition.', choices: [
      { id: 'confirm', label: 'Confirm it on the record', fx: { minister: 1, warn: 1, say: 'The minister likes the headline. So does she.' } },
      { id: 'deny', label: 'Deny it', fx: { minister: -1, say: 'The minister reads your denial in his own paper.' } },
      { id: 'spin', label: 'Tell the paper she has crossed', fx: { hours: 1, roll: { need: 3, win: { press: 1, say: 'Her people relax. Someone gets careless on the phone.' }, lose: { minister: -1, say: 'The columnist checks with the border post and prints that too.' } } } } ] },
    { id: 'judge', after: 4, title: 'The duty judge wants a hearing', text: 'He will not sign the order for the border post until a hearing tomorrow.', choices: [
      { id: 'wait_judge', label: 'Wait for the hearing', fx: { unban: true, say: 'The post keeps the old list for one more night.' } },
      { id: 'other_judge', label: 'Find another judge', fx: { hours: 2, roll: { need: 4, win: { ban: true, say: 'A judge in Santa Laura signs at his kitchen table.' }, lose: { hours: 2, say: 'Every judge you call has heard from the first one.' } } } },
      { id: 'around', label: 'Have the minister call the post', fx: { ban: true, minister: -1, warn: 1, say: 'The post confirms. Her lawyers call it irregular on the radio.' } } ] },
    { id: 'sightings', title: 'Three sightings at once', text: 'Callers place her in Santa Laura, in Salta and on the coast road, all in the same hour.', choices: [
      { id: 'all_three', label: 'Send a patrol to each', fx: { hours: 2, dc: [1, 6], false: true, say: 'Three patrols, three empty rooms. The desk is stretched thin.' } },
      { id: 'plates', label: 'Check the one that gave plates', fx: { hours: 1, roll: { need: 4, win: { lead: 0, say: 'The plates match a car from her convoy.' }, lose: { false: true, say: 'The plates belong to a dentist.' } } } },
      { id: 'ignore', label: 'Ignore all three', fx: {} } ] },
    { id: 'sosa_alone', title: 'Sosā wants to drive out himself', text: 'He wants to take two officers to {there} tonight without telling the desk.', choices: [
      { id: 'let_him', label: 'Let him go', fx: { act: 'check_belief', hours: 2, say: 'Sosā takes the unmarked car.' } },
      { id: 'keep_him', label: 'Keep him on the desk', fx: { dc: [-1, 6], say: 'He sulks, then works the phones harder than anyone.' } } ] },
    { id: 'driver', after: 6, title: 'One of her drivers calls', text: 'A driver from her convoy wants a promise that he will not be charged.', choices: [
      { id: 'immunity', label: 'Promise him', fx: { minister: -1, lead: 3, say: 'He talks for an hour. The minister did not want promises made.' } },
      { id: 'bargain', label: 'Bargain', fx: { hours: 1, roll: { need: 4, win: { lead: 1, say: 'He settles for a lawyer and a lift home.' }, lose: { warn: 1, say: 'He hangs up and calls her instead.' } } } },
      { id: 'refuse_driver', label: 'Refuse', fx: {} } ] },
    { id: 'strike', after: 8, title: 'The rail union walks out', text: 'Salta yard workers strike at midnight. The freight may not run.', choices: [
      { id: 'let_strike', label: 'Let the strike stand', fx: { stall: 4, minister: -1, say: 'Nothing leaves Salta. The minister hates strikes.' } },
      { id: 'break_strike', label: 'Get the trains running', fx: { hours: 2, card: 'rail', say: 'The yardmaster owes you for the overtime.' } } ] },
    { id: 'photo', title: 'A paper has a photo', text: 'Rādiô Portô Venla has a blurred photo of her at a petrol station. They want to run it.', choices: [
      { id: 'buy_photo', label: 'Buy it and sit on it', fx: { hours: 1, lead: 4, say: 'The station has a sign. The sign has a town on it.' } },
      { id: 'run_it', label: 'Let them run it', fx: { press: 2, minister: 1, say: 'Her face is on every screen in the province.' } } ] },
    { id: 'dinner', after: 6, title: 'Dinner at the Esmeraldan embassy', text: 'The ambassador invites you tonight. Three hours, and he likes to talk.', choices: [
      { id: 'go', label: 'Go to dinner', fx: { hours: 3, holdup: true, say: 'Somewhere after the fish he writes a name on a card.' } },
      { id: 'deputy', label: 'Send your deputy', fx: { roll: { need: 5, win: { holdup: true, say: 'Your deputy is a better guest than you.' }, lose: { say: 'The ambassador talks about horses all night.' } } } },
      { id: 'decline', label: 'Decline', fx: {} } ] },
    { id: 'storm', after: 10, title: 'Snow at the Huhūi passes', text: 'The road service is closing the passes for the night.', choices: [
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
    { id: 'sergeant', after: 14, title: 'The sergeant is her cousin', text: "The desk says tonight's sergeant at the border post is married to her cousin.", choices: [
      { id: 'replace', label: 'Replace him', fx: { hours: 3, ban: true, say: 'A sergeant from Salta takes the shift. He reads every name.' } },
      { id: 'watch_him', label: 'Watch him', fx: { hours: 1, roll: { need: 4, win: { lead: 0, say: 'He makes a call from the guardhouse. You hear every word.' }, lose: { unban: true, say: 'He notices the watcher and loses the list.' } } } },
      { id: 'leave_him', label: 'Leave it', fx: { unban: true } } ] },
    { id: 'drone', after: 10, title: 'The air force offers a drone', text: 'A drone can watch one road all night. The general wants a signature.', choices: [
      { id: 'sign', label: 'Sign for it', fx: { dc: [-1, 8], minister: -1, say: 'The drone goes up. The minister reads about it in the morning.' } },
      { id: 'no_drone', label: 'Decline', fx: {} } ] },
    { id: 'presser', title: 'The minister wants a press conference', text: 'He wants you beside him at six, promising she will be found by Monday.', choices: [
      { id: 'stand', label: 'Stand beside him', fx: { hours: 2, minister: 1, warn: 1, say: 'Her people watch it twice and change their plans.' } },
      { id: 'send_sosa', label: 'Send Sosā instead', fx: { dc: [1, 4], say: 'Sosā hates cameras. He takes it out on the desk.' } },
      { id: 'skip', label: 'Say you are busy', fx: { minister: -1 } } ] },
    { id: 'tower', after: 6, title: 'A phone touched a tower', text: 'The carrier says a number tied to her family pinged a tower an hour ago.', choices: [
      { id: 'tower_now', label: 'Demand the tower now', fx: { hours: 2, roll: { need: 4, win: { lead: 0, say: 'The carrier sends the tower and a map.' }, lose: { warn: 1, say: 'The carrier tells its lawyers, who tell hers.' } } } },
      { id: 'paperwork', label: 'File the paperwork', fx: { lead: 6, say: 'The answer will come through the proper channel.' } } ] },
  ];

  // ---- Dispatches: the News phase. Counterfactuals, not the record: each one bends the run somewhere new.
  // at: level ids where it can be drawn (null = anywhere). when: declarative conditions on facts in content/coalition/facts.json. Text placeholders: {sib}, {here}.
  // Choice fx: hours, exposure, belief ('away' | 'here'), card (gain), lose (card id | 'random' | 'best'), trust {who: +n},
  // doubt, cut, test (person ids), stage {arr: +n}, flag {k: v}, deadline (hours, negative = sooner), skipEnemy, mod (roll
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
      { id: 'leave_dog', label: 'Leave him with the cook', fx: { hours: 1, say: 'An hour of crying in the back seat.' } } ] },
    { id: 'summons', at: ['residence'], title: 'A court officer at the gate', text: 'He has a summons and orders to hand it to you in person.', choices: [
      { id: 'accept', label: 'Take the summons', fx: { deadline: -12, say: 'The court now has your signature. The deadline moves up 12 hours.' } },
      { id: 'lawyer', label: "Send Gianlūka's lawyer", needs: [{ card: 'influence' }], fx: { hours: 2, trust: { aide: -1 }, say: 'The lawyer argues at the gate for two hours.' } },
      { id: 'ignore', label: 'Keep the gate shut', fx: { exposure: 1 } } ] },
    { id: 'cameras', at: ['residence'], title: 'Gianlūka wants cameras', text: 'He wants you on the steps tonight, calling the election stolen.', choices: [
      { id: 'speak', label: 'Speak on the steps', fx: { exposure: 3, trust: { aide: 1 }, card: 'delay_report', say: 'The party loves it. So does Sosā.' } },
      { id: 'refuse', label: 'Refuse', fx: { trust: { aide: -1 }, say: 'Gianlūka goes quiet on the phone.' } } ] },
    // Santa Laura
    { id: 'fuel', at: ['road'], title: 'Fuel is rationed', text: 'Every pump in Santa Laura has a line and a police officer.', choices: [
      { id: 'queue', label: 'Wait in line', fx: { hours: 2, exposure: 1 } },
      { id: 'farmer', label: 'Buy from a farmer', fx: { roll: { need: 3, win: { hours: 1, say: 'Twenty liters from a tractor shed.' }, lose: { hours: 2, exposure: 2, say: 'The farmer calls his nephew, who calls the radio.' } } } },
      { id: 'river', label: 'Leave the car, take the river', needs: [{ card: 'boat' }], fx: { mod: -1, say: 'The river has no pumps and no police.' } } ] },
    { id: 'hitchhiker', at: ['road'], title: 'A hitchhiker knows your face', text: 'A young reporter flags you down. She recognizes you before the door closes.', choices: [
      { id: 'interview', label: 'Give her the interview', fx: { exposure: 2, belief: 'away', say: 'Her story puts you on the coast road.' } },
      { id: 'silence', label: 'Buy her silence', fx: { roll: { need: 4, win: { say: 'She keeps the money and the story.' }, lose: { exposure: 3, say: 'She takes the money and files anyway.' } } } },
      { id: 'drop', label: 'Drop her at the next town', fx: { hours: 1 } } ] },
    { id: 'flood', at: ['road'], title: 'Flash flood at the bridge', text: 'The river is over the road. Trucks are turning back.', choices: [
      { id: 'wait_water', label: 'Wait for the water', fx: { hours: 4 } },
      { id: 'ford', label: 'Drive through it', fx: { roll: { need: 4, win: { exposure: -1, say: 'Water to the doors, then dry road.' }, lose: { hours: 2, exposure: 1, lose: 'random', say: 'The engine floods. You leave something in the car.' } } } },
      { id: 'ferry', label: "Pay a smuggler's ferry", fx: { hours: 1, exposure: 1, say: 'The ferryman knows who you are and says nothing. For now.' } } ] },
    { id: 'decoy_ditch', at: ['road'], when: [{ ref: 'hand.decoy_cars', op: 'eq', value: true }], title: 'A decoy on the evening news', text: 'One of your spare sedans rolled into a ditch on camera. The plates are yours.', choices: [
      { id: 'claim', label: 'Say it was you', fx: { belief: 'away', exposure: -2, lose: 'decoy_cars', say: 'For one evening you are in a ditch two hundred kilometers away.' } },
      { id: 'quiet', label: 'Say nothing', fx: { exposure: 1 } } ] },
    // the colônia
    { id: 'bishop', at: ['colonia'], title: 'The bishop offers a blessing', text: 'A public blessing at evening mass. The whole colônia would see you.', choices: [
      { id: 'blessing', label: 'Accept the blessing', fx: { exposure: 2, trust: { host: 1 } } },
      { id: 'decline', label: 'Decline', fx: { trust: { host: -1 } } } ] },
    { id: 'wedding', at: ['colonia'], title: 'A wedding for three hundred', text: "A cousin's wedding fills every street tonight. Nobody counts faces at a wedding.", choices: [
      { id: 'dance', label: 'Hide among the guests', fx: { hours: 3, exposure: -3, say: 'You dance with a great aunt who never asks your name.' } },
      { id: 'skip', label: 'Stay inside', fx: {} } ] },
    { id: 'grandson', at: ['colonia'], title: 'The grandson wants out', text: "Nonā Rosa's grandson is 19, knows the rail yard and wants to come.", choices: [
      { id: 'take', label: 'Take him with you', fx: { card: 'grandson' } },
      { id: 'no', label: 'Say no', fx: { trust: { host: -1 } } } ] },
    { id: 'raid', at: ['colonia'], title: 'Police raid the next farm', text: 'Federal police are searching the neighbor for contraband. Not for you. Yet.', choices: [
      { id: 'cellar', label: 'Hide in the wine cellar', fx: { hours: 4 } },
      { id: 'slip', label: 'Slip out now', fx: { roll: { need: 3, win: { hours: 1 }, lose: { hold: 1 } } } } ] },
    // Salta
    { id: 'strike', at: ['salta'], title: 'Rail strike tonight', text: 'The union stopped the yard. No freight moves unless someone breaks the strike.', choices: [
      { id: 'wait_strike', label: 'Wait it out', fx: { hours: 8 } },
      { id: 'union', label: 'Pay the union boss', fx: { exposure: 2, say: 'The strike ends for one train.' } },
      { id: 'scabs', label: 'Ride with the strikebreakers', fx: { roll: { need: 4, win: { say: 'Nobody looks at a scab twice.' }, lose: { hold: 1 } } } } ] },
    { id: 'tourbus', at: ['salta'], title: 'A tour bus to the waterfalls', text: 'A bus of tourists leaves for the falls at the border at dawn. One seat is empty.', choices: [
      { id: 'bus', label: 'Take the seat in a hat', fx: { roll: { need: 4, win: { advance: true, belief: 'away', say: 'You sleep through the checkpoint. The guide counts you twice.' }, lose: { hold: 1 } } } },
      { id: 'pass', label: 'Let it go', fx: {} } ] },
    { id: 'holt_drunk', at: ['salta'], title: 'Holt has been drinking', text: 'He is loud at the bar about a passenger worth a lot of money.', choices: [
      { id: 'trust_holt', label: 'Trust him anyway', fx: { doubt: 'holt' } },
      { id: 'sober', label: 'Sober him up', fx: { hours: 2, trust: { holt: 1 } } },
      { id: 'cut_holt', label: 'Go to Theo instead', fx: { cut: 'holt' } } ] },
    { id: 'yard_debt', at: ['salta'], title: 'The yardmaster owes your family', text: "His wife's father once worked for your father. He might remember.", choices: [
      { id: 'favor', label: 'Ask the favor', fx: { roll: { need: 3, win: { card: 'yard_walk', say: 'He remembers. He walks you to the train himself.' }, lose: { exposure: 2, say: 'He remembers differently.' } } } },
      { id: 'leave_it', label: 'Do not risk it', fx: {} } ] },
    // the line
    { id: 'old_guard', at: ['border'], title: 'A guard you know', text: 'The night guard once worked for your family. He is staring at you.', choices: [
      { id: 'loyalty', label: 'Appeal to old loyalty', fx: { roll: { need: 3, win: { mod: -2, say: 'He looks at his boots and waves the queue on.' }, lose: { hold: 1 } } } },
      { id: 'next_shift', label: 'Wait for the next shift', fx: { hours: 3 } } ] },
    { id: 'pilgrims', at: ['border'], title: 'Pilgrims at the barrier', text: 'Forty pilgrims and their luggage are at the post. The guards are tired.', choices: [
      { id: 'queue_pilgrims', label: 'Join the queue', fx: { mod: -1 } },
      { id: 'wait_pilgrims', label: 'Wait for them to clear', fx: { hours: 2 } } ] },
    { id: 'blizzard', at: ['border'], title: 'A blizzard closes the pass', text: "The post is shut. A smugglers' path runs over the ridge.", choices: [
      { id: 'storm', label: 'Wait out the storm', fx: { hours: 6, skipEnemy: true, say: 'Nobody moves. Not you, not Sosā.' } },
      { id: 'ridge', label: 'Walk the ridge path', fx: { roll: { need: 4, win: { advance: true, say: 'You come down into Esmeralda with no stamp at all.' }, lose: { hours: 3, exposure: 3, say: 'You turn back half frozen. The post saw your flashlight.' } } } } ] },
    { id: 'dog_bark', at: ['border'], when: [{ ref: 'flag.dog', op: 'eq', value: true }], title: 'The dog barks at the post', text: 'The guards look up. A dog in your car was on the news.', choices: [
      { id: 'calm', label: 'Let your daughter calm him', fx: { roll: { need: 3, win: {}, lose: { exposure: 3 } } } },
      { id: 'give_dog', label: 'Give the dog to a trucker', fx: { trust: { sibling: -1 }, say: 'Your daughter does not speak to you until Esmeralda.' } } ] },
    { id: 'esm_press', at: ['border'], title: 'Cameras across the line', text: 'Someone told the press in Baca. Cameras wait on the far side.', choices: [
      { id: 'speak_esm', label: 'Speak to them', fx: { exposure: 2, stage: { reception: 1 }, say: 'Esmeralda sees you. So does Valdória.' } },
      { id: 'cover', label: 'Cover your face', fx: {} } ] },
    // Susana
    { id: 'crew_double', at: ['airfield'], title: 'The crew wants double', text: "The operator's insurer called. The pilot wants twice the fee or a guarantee.", choices: [
      { id: 'pay_double', label: 'Pay double', fx: { exposure: 1 } },
      { id: 'guarantee', label: 'Have your sponsor guarantee it', needs: [{ card: 'permission' }], fx: { trust: { sponsor: -1 }, say: 'It goes on what you owe your sponsor.' } },
      { id: 'other_pilot', label: 'Find another pilot', fx: { hours: 4 } } ] },
    { id: 'overflight', at: ['airfield'], title: 'No overflight permit', text: 'The refuel stop will not let the jet cross. The long route adds hours.', choices: [
      { id: 'long', label: 'Take the long route', fx: { hours: 3 } },
      { id: 'short', label: 'Risk the short route', fx: { mod: 1, say: 'The pilot files it anyway. The tower will look twice.' } } ] },
    { id: 'goodbye_post', at: ['airfield'], title: 'A goodbye online', text: 'Your daughter posted a photo from the airfield lounge. It is everywhere.', choices: [
      { id: 'takedown', label: 'Get it taken down', fx: { roll: { need: 4, win: {}, lose: { exposure: 3 } } } },
      { id: 'stand', label: 'Let it stand', fx: { exposure: 2, flag: { asked: true }, say: 'Valdória asks Esmeralda to hold you within the hour.' } } ] },
    { id: 'rival_deal', at: ['airfield', 'border'], title: 'The president calls', text: 'Concede on camera, come home, and the case quietly closes.', choices: [
      { id: 'take_deal', label: 'Take the deal', fx: { end: { kind: 'deal', reason: 'You concede on camera at noon. The case closes quietly. The party never forgives you.' } } },
      { id: 'hang_up', label: 'Hang up', fx: {} } ] },
    // anywhere
    { id: 'too_soon', at: null, title: 'Your family spoke too soon', text: '{sib} told reporters you already landed abroad. You are still in {here}.', choices: [
      { id: 'let_run', label: 'Let the story run', fx: { belief: 'away', exposure: -2, flag: { dark: true }, say: 'Even your own people stop calling back. They think you have landed.' } },
      { id: 'correct', label: 'Correct it', fx: { exposure: 1 } } ] },
    { id: 'bodyguard', at: null, title: 'An old bodyguard wants money', text: 'He knows your route. He will sell it tonight unless you pay.', choices: [
      { id: 'pay_guard', label: 'Pay him', fx: { exposure: 1 } },
      { id: 'bluff', label: 'Call his bluff', fx: { roll: { need: 3, win: { say: 'He never calls anyone.' }, lose: { belief: 'here', exposure: 3, say: 'He calls Sosā before midnight.' } } } },
      { id: 'gianluka', label: 'Have Gianlūka handle him', needs: [{ card: 'influence' }], fx: { trust: { aide: -1 } } } ] },
    { id: 'coffee', at: ['residence', 'road', 'colonia', 'salta'], title: 'A police car pulls in beside you', text: 'Two officers get out for coffee. One glances at your window.', choices: [
      { id: 'sit', label: 'Sit still', fx: { roll: { need: 4, win: {}, lose: { hold: 1 } } } },
      { id: 'drive', label: 'Drive away now', fx: { exposure: 1 } } ] },
    { id: 'hearing', at: null, when: [{ ref: 'clock.hoursLeft', op: 'gte', value: 43 }] /* before hour 30 */, title: 'The hearing moves up', text: 'The court moved your hearing forward. The passport deadline is sooner.', choices: [
      { id: 'noted', label: 'Keep going', fx: { deadline: -10 } },
      { id: 'stall', label: 'Have Gianlūka ask for a delay', needs: [{ card: 'aide_word' }], fx: { deadline: -4, trust: { aide: -1 }, exposure: 1, say: 'The clerk grants two days. Gianlūka adds it to what you owe him, and the court knows you are still in reach.' } } ] },
    { id: 'blackout', at: null, title: 'The province goes dark', text: 'A storm took down the grid. Phones, radios and the inquiry go quiet.', choices: [
      { id: 'dark', label: 'Move while they are blind', fx: { exposure: -1, skipEnemy: true } },
      { id: 'sit', label: 'Sit tight till the lights return', fx: { hours: 2, exposure: -1, say: 'Two hours in the dark. Nobody comes to the door.' } } ] },
  ];
  // Holds: what happens when the inquiry catches up. Each rung is worse than the last.
  const HOLDS = {
    1: { title: 'Stopped and questioned', text: 'A patrol stops you at {here}. An officer wants to know where you are going.', choices: [
      { id: 'calm', label: 'Answer calmly', fx: { roll: { need: 3, face: 1, win: { hours: 1, say: 'He writes down a name that is not yours.' }, lose: { hours: 3, lose: 'random', exposure: 1, say: 'Three hours on a bench. They keep something of yours.' } } } },
      { id: 'lawyer', label: "Call the party's lawyer", needs: [{ card: 'influence' }], fx: { hours: 2, trust: { aide: -1 }, say: 'The lawyer arrives shouting. They let you go.' } },
      { id: 'bribe', label: 'Pay the officer', fx: { hours: 1, exposure: 2, say: 'The money disappears. So does the report, maybe.' } } ] },
    2: { title: 'Held at the station', text: 'They take you to the nearest station. Your phone goes in a plastic bag.', choices: [
      { id: 'wait_lawyer', label: 'Wait for a lawyer', fx: { hours: 8, lose: 'best', say: 'Eight hours. They keep what they found on you.' } },
      { id: 'embassy', label: '{sib} calls an embassy', fx: { roll: { need: 4, win: { hours: 4, say: 'A diplomat calls the station chief. You are released.' }, lose: { hours: 10, lose: 'best', say: 'Nobody important answers until morning.' } } } },
      { id: 'walk_out', label: 'Walk out at shift change', fx: { roll: { need: 5, win: { hours: 1, exposure: 3, say: 'Nobody stops a person walking like they belong.' }, lose: { hold: 1 } } } } ] },
    3: { title: 'House arrest', text: 'The court placed you under house arrest. Two officers sit outside the door.', choices: [
      { id: 'climb', label: 'Climb out at the shift change', fx: { roll: { need: 5, decoy: 1, win: { hours: 2, exposure: 8, rung: 2, say: 'Over the back wall, into a car that was not there yesterday.' }, lose: { end: { reason: 'The officers catch you on the wall. The hearing is Monday. You will be there.' } } } } },
      { id: 'accept', label: 'Accept it', fx: { end: { reason: 'You sit by the window and watch the officers change shifts. The hearing is Monday.' } } } ] },
  };
  // Rumors: a hint about who might be selling you out. Sometimes it is wrong.
  const RUMORS = [
    (n) => `Someone saw ${n} talking to a police car.`,
    (n) => `${n} asked twice which car you will take.`,
    (n) => `${n} paid off a debt this morning, in cash.`,
  ];
  return { DESTS, PLACES, POSTS, EVENTS, HOLDS, RUMORS, CHARACTERS, PEOPLE, ENEMY, ARRANGEMENTS, CARDS, LEVELS, STAGE_LINES, ENEMY_ACTIONS, VALDORIA, ESMERALDA, GOV, GOV_CARDS, GOV_ORDERS, GOV_EVENTS };
})();
if (typeof module !== 'undefined') module.exports = Data;
