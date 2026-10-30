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
             blurb: 'Former interior minister, twice elected in Rīu Grandē, lost the presidency by four points. Rich from the family estancias; many people owe her, and many want her finished.' },
    man:   { id: 'man', name: 'Matēu Zanetī', short: 'Matēu', title: 'the defeated candidate', pronoun: 'he',
             sibling: { id: 'sibling', name: 'Līviā Zanetī', short: 'Līviā', rel: 'your sister' },
             blurb: 'Former senator for Santa Katarīna and a shipping heir, lost the presidency by four points. Rich from the port, well connected in the colônias, and watched since the count.' },
  };

  // Allies. reliability: the die result a delegated job needs (lower is better). where: level index they act from.
  const PEOPLE = {
    sibling:  { role: 'arranging the aircraft from abroad', where: -1, reliability: 3 },
    aide:     { name: 'Gianlūka Moretī', role: 'party chief of staff', where: 0, reliability: 3,
                terms: 'He wants your public word that he leads the party in your absence.' },
    nando:    { name: 'Nando', role: 'your driver for eleven years', where: 0, reliability: 2 },
    sponsor:  { name: 'Bīr Amādū Salek', role: 'banker in Lāyūna, Atlanta; an old client of the family', where: -1, reliability: 4,
                terms: 'He will speak to the Atlantan ministry if you move the family accounts to his house.' },
    registry: { name: 'Mārtā Kovalskā', role: 'clerk at the Santa Laura civil registry', where: 1, reliability: 3 },
    host:     { name: 'Nonā Rosa Trentinī', role: 'matriarch of the Nova Trentô colônia', where: 2, reliability: 2 },
    official: { name: 'Rosario Vélez', role: "aide to Esmeralda's interior minister", where: 4, reliability: 4,
                terms: 'She wants it understood that Esmeralda receives you as a guest, not as a government in exile.' },
    holt:     { name: 'Holt Greer', role: 'brakeman on the Huhūi freight', where: 3, reliability: 2 },
    theo:     { name: 'Theo Bascom', role: 'yard foreman in the Salta rail town', where: 3, reliability: 3 },
    pilot:    { name: 'Capitān Olsēn', role: 'charter pilot, Susana', where: 5, reliability: 3 },
  };

  // The enemy. Inspector Valentīn Sosā, Interior Ministry. Each action is concrete and visible.
  const ENEMY = { name: 'Inspector Valentīn Sosā', role: 'Interior Ministry, head of the departure inquiry' };

  // Continuing arrangements: ordered stages. A stage is a promise until the ally delivers.
  const ARRANGEMENTS = {
    aircraft:   { name: 'Aircraft',    stages: ['none', 'charter found', 'crew confirmed', 'fueled at Susana', 'waiting on the apron'],
                  what: 'The jet that takes you out of Esmeralda. Found by your sibling; crewed, fueled and parked by the operator.' },
    reception:  { name: 'Reception',   stages: ['none', 'contact promised', 'minister informed', 'officials at the line'],
                  what: "Who meets you on Esmeralda's side of the border. Without it you are a foreigner with a bad passport." },
    document:   { name: 'Document',    stages: ['own passport, restricted', 'civil record requested', 'Nelôxian civil record in hand'],
                  what: 'Every Valdórian has a Nelôxian civil-name record on file. Issued fresh, it is a travel document the restriction does not name.' },
    permission: { name: 'Permission',  stages: ['none', 'sponsor engaged', 'Atlanta will receive you'],
                  what: 'Whether Atlanta lets the jet land and lets you stay. A banker can open the door; a ministry has to say yes.' },
  };

  // Cards: specific help. tag drives what approaches they feed. once: consumed on use.
  const CARDS = {
    decoy_cars:   { name: 'Two more cars like yours', tag: 'decoy', from: 'nando', once: true, text: 'Nando has two identical sedans and two friends who will drive them the wrong way.' },
    aide_word:    { name: 'The party machine', tag: 'influence', from: 'aide', once: false, text: 'Gianlūka can put a mayor, a judge or a border post on the phone. Each call costs you with him.' },
    truck:        { name: "The colônia's grape truck", tag: 'vehicle', from: 'host', once: true, text: 'A farm truck nobody looks at twice, and a cousin who drives it to Salta every week.' },
    civil_record: { name: 'Nelôxian civil record', tag: 'document', from: 'registry', once: false, text: 'Your full civil name, stamped yesterday. Not a passport, and not on the restriction.' },
    intro_vel:    { name: "Rosario Vélez's card", tag: 'introduction', from: 'official', once: false, text: 'Her number, and her word that the border post has been told a guest is coming.' },
    delay_report: { name: 'A report held one day', tag: 'delay', from: 'aide', once: true, text: 'The provincial police chief owes Gianlūka. The sighting from Santa Laura reaches the ministry tomorrow, not tonight.' },
    crate:        { name: "Holt's chalk-marked crate", tag: 'passage', from: 'holt', once: true, text: 'Third boxcar, straw inside, room for one. He does not wait.' },
    yard_walk:    { name: 'Theo walks you through', tag: 'passage', from: 'theo', once: true, text: 'The foreman takes you past the registry window talking loudly about the switches.' },
    sponsor_line: { name: "Amādū Salek's line to the ministry", tag: 'permission', from: 'sponsor', once: true, text: 'A banker in Lāyūna who has been asked for things before, and has delivered before.' },
    informant:    { name: 'A friend in the inquiry', tag: 'information', from: 'aide', once: false, text: 'A clerk in Sosā\'s office who tells Gianlūka where the inspector is looking.' },
  };

  // Levels. Each approach: needs (all must hold), dc (die needs dc or more after mods), mods (tag: bonus),
  // and what happens. hours: time spent attempting. Failure never ends the run by itself.
  const LEVELS = [
    { id: 'residence', name: 'The residence, Portô Venla', short: 'Residence', scene: 'residence',
      objective: 'Leave the house without the watch outside knowing you have gone.',
      arrive: 'Two unmarked cars have sat across the avenida since the count. The departure restriction was served at noon. Your passports are in a drawer the court expects to be emptied by Monday.',
      approaches: [
        { id: 'decoy', name: 'Decoy convoy', hours: 2, dc: 3, needs: [{ card: 'decoy' }],
          mods: { information: 2 }, text: 'Three cars leave at once. You are in none of the ones they follow.',
          success: { belief: 0, exposure: -1, say: 'The watch follows the first sedan toward the coast road. You are already in the service lane.' },
          fail: { exposure: 2, say: 'The second car is stopped at the avenida. Nando talks his way out, but they know the cars now.' } },
        { id: 'service', name: 'The service door after dark', hours: 1, dc: 4, needs: [{ night: true }],
          mods: { information: 1 }, text: 'Wait for the shift change at 22:00 and walk out with the kitchen staff.',
          success: { belief: 0, say: 'The night cook lends you an apron and a cigarette. Nobody looks at the help.' },
          fail: { exposure: 2, say: 'A flash from a parked car. Someone photographed the help tonight.' } },
        { id: 'partycar', name: "The party's official car", hours: 1, dc: 2, needs: [{ card: 'influence' }],
          mods: {}, text: 'Gianlūka sends the chief of staff\'s car with its flags. The watch is told it is a meeting about the transition.',
          success: { belief: 0, commit: 'aide', say: 'The flags get you through. Gianlūka reminds you, gently, what he asked for.' },
          fail: { exposure: 1, commit: 'aide', say: 'The car is let through, but the inspector is told whose car it was.' } },
      ] },
    { id: 'road', name: 'The road south, Santa Laura', short: 'Santa Laura', scene: 'road',
      objective: 'Change vehicles before the restriction reaches the provincial posts, and get a second document moving.',
      arrive: 'Santa Laura, where the Spanish zone begins. The radio says you were seen boarding a yacht in Portô Venla. The restriction has not reached the provincial posts yet. It will.',
      approaches: [
        { id: 'second_driver', name: 'Pay for a second driver and a plain car', hours: 2, dc: 3, needs: [], pay: true,
          mods: { information: 1 }, text: 'Nando finds a cousin with a taxi. Money buys the car and, you hope, his silence. The cousin is the kind who takes it.',
          success: { say: 'The taxi smells of mate and diesel. Nando drives your sedan north as a second decoy.' },
          fail: { exposure: 1, hours: 2, say: 'The cousin wants more, then wants nothing to do with it. Two hours lost.' } },
        { id: 'truck_ride', name: "Ride in the colônia's truck", hours: 1, dc: 1, needs: [{ card: 'vehicle' }],
          mods: {}, text: 'A grape truck to Nova Trentô. Nobody stops a farm truck.',
          success: { say: 'You ride between the crates. The driver sings.' }, fail: { say: '' } },
        { id: 'known_car', name: 'Drive on in your own car', hours: 1, dc: 5, needs: [],
          mods: { delay: 2 }, text: 'Keep moving. Speed against the paperwork.',
          success: { exposure: 1, say: 'You pass the first post before the fax does.' },
          fail: { exposure: 3, belief: 1, say: 'The post at the river has your plate. They let you through and pick up the phone.' } },
      ] },
    { id: 'colonia', name: 'The colônia, Nova Trentô', short: 'Nova Trentô', scene: 'colonia',
      objective: "A night under Nonā Rosa's roof. Decide what the evening is for.",
      arrive: 'Nova Trentô: vines, a church, forty families who voted for you twice. Nonā Rosa has a room, a telephone and a problem of her own: the cooperative\'s truck was impounded at the provincial line this morning.',
      approaches: [
        { id: 'help_host', name: "Spend the evening on Nonā Rosa's problem", hours: 3, dc: 2, needs: [],
          mods: { influence: 2 }, text: 'Make the calls that free the cooperative\'s truck. It costs you the evening on the phone to Susana.',
          success: { card: 'truck', trust: 'host', say: 'The truck is released by midnight. Nonā Rosa puts her cousin and the grape truck at your disposal, and tells the village nothing.' },
          fail: { card: 'truck', hours: 1, say: 'The truck comes back at dawn, late and dented. She is grateful anyway.' } },
        { id: 'work_phone', name: 'Work the phone all night', hours: 3, dc: 1, needs: [],
          mods: {}, text: 'Sibling, sponsor, Susana. Three calls that would otherwise wait.',
          success: { advance: ['aircraft', 'reception', 'permission'], say: 'By two in the morning three things have moved. Nonā Rosa eats alone.' }, fail: { say: '' } },
        { id: 'sleep', name: 'Sleep', hours: 6, dc: 1, needs: [],
          mods: {}, text: 'Six hours. The inquiry does not sleep.',
          success: { exposure: -2, say: 'You wake before the roosters. The house is quiet and the radio still has you at sea.' }, fail: { say: '' } },
      ] },
    { id: 'salta', name: 'The rail town, Salta', short: 'Salta', scene: 'salta',
      objective: 'Get onto the freight that climbs the Huhūi passes to the line.',
      arrive: 'A rail town on the edge of the Pearl. The midnight freight climbs to the passes and the customs post at the top. Two men can put you on it, and neither owes you anything yet.',
      approaches: [
        { id: 'crate', name: "Pay Holt for a crate", hours: 2, dc: 3, needs: [], pay: true,
          mods: { vehicle: 1, information: 1 }, text: 'Pay the brakeman. He hides you in a chalk-marked crate in the third boxcar. Holt takes money; he always has.',
          success: { card: 'crate', say: 'Holt pockets the notes without counting them. "Third car. Midnight. I don\'t wait."' },
          fail: { exposure: 1, say: 'Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide.' } },
        { id: 'foreman', name: "Theo's walk-through", hours: 2, dc: 4, needs: [],
          mods: { vehicle: 2, information: 1 }, text: 'The foreman owes the colônia a favor. He takes you past the registry window himself.',
          success: { card: 'yard_walk', trust: 'theo', say: 'Theo talks about switches the whole way across the yard. Nobody interrupts a foreman.' },
          fail: { exposure: 1, say: 'The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change.' } },
        { id: 'buy_seat', name: 'Pay the yardmaster', hours: 1, dc: 7, needs: [], pay: true,
          mods: {}, text: 'The yardmaster is a company man with a pension. He will take your money in front of everyone and give you nothing. You can try.',
          success: { card: 'crate', exposure: 2, say: 'The yardmaster takes it. Three men watch him take it.' },
          fail: { exposure: 2, say: 'He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here.' } },
      ] },
    { id: 'border', name: 'The line at the Huhūi passes', short: 'The line', scene: 'border',
      objective: 'Cross into Esmeralda. Documents, exposure, contacts and your earlier promises all count here.',
      arrive: 'The customs post at the top of the passes: a barrier, a stove, two Valdórian guards and, across the line, an Esmeraldan hut with its light on. Whatever reached this post before you did is on the desk inside.',
      border: true,
      approaches: [
        { id: 'received', name: 'Walk to the people waiting for you', hours: 1, dc: 1, needs: [{ arr: 'reception', stage: 3 }],
          mods: {}, text: "Esmeraldan officials are at the line. The Valdórian side can watch you go.",
          success: { say: 'Rosario Vélez shakes your hand across the barrier. The guards on your side write nothing down.' }, fail: { say: '' } },
        { id: 'civil_doc', name: 'Present the Nelôxian civil record', hours: 1, dc: 4, needs: [{ card: 'document' }],
          mods: { introduction: 2, influence: 1 }, text: 'A fresh document the restriction does not name, at a post that may already have your face.',
          success: { say: 'The guard reads the civil name twice, looks at a sheet on the desk, and stamps the record.' },
          fail: { exposure: 2, hours: 3, say: 'The guard reads the sheet first. Three hours in a cold room before Gianlūka\'s phone call gets you back outside, on the wrong side.' } },
        { id: 'pay_post', name: 'Pay the post', hours: 1, dc: 4, needs: [], pay: true,
          mods: { delay: 2 }, text: 'Money on the stove. The younger guard was posted here last month and has not learned to take it. The older one has. You do not know which one is on the barrier.',
          success: { exposure: 1, say: 'The barrier goes up. Nobody says thank you.' },
          fail: { exposure: 2, hours: 2, say: 'The older guard takes the money and the younger one calls the ministry. Gianlūka\'s friend buys you two hours.' } },
        { id: 'own_passport', name: 'Present your own passport', hours: 1, dc: 6, needs: [],
          mods: { delay: 3 }, text: 'The document the court told you to surrender, at a post that has the order.',
          success: { say: 'The guard is nineteen and has never seen the restriction. He stamps you through.' },
          fail: { exposure: 3, hours: 4, say: 'They hold you four hours and the inspector is on the radio. The party gets you released pending a hearing you will not attend.' } },
      ] },
    { id: 'airfield', name: 'Susana airfield', short: 'Susana', scene: 'airfield',
      objective: 'Reach the jet, get it crewed, fueled and cleared, and leave Esmeraldan airspace.',
      arrive: 'Susana. The Pacific is gray and the apron is wet. Your aircraft is somewhere between a phone call and a parking stand. The inspector has asked Esmeralda, politely, to hold you.',
      final: true,
      approaches: [
        { id: 'depart', name: 'Board and depart', hours: 2, dc: 3, needs: [{ arr: 'aircraft', stage: 4 }, { arr: 'permission', stage: 2 }],
          mods: { introduction: 1 }, text: 'Everything is in place. The tower still has to say go.',
          success: { win: true, say: 'The wheels leave the wet apron. Forty minutes later the pilot says you are out of Esmeraldan airspace, and you believe him.' },
          fail: { exposure: 1, hours: 2, say: 'The tower holds you on the apron for two hours while a request from Valdória is read, and reread.' } },
        { id: 'depart_nopermit', name: 'Depart without Atlanta\'s answer', hours: 2, dc: 5, needs: [{ arr: 'aircraft', stage: 4 }],
          mods: { introduction: 1 }, text: 'Take off and sort out the landing over the ocean. The pilot does not love it, and your party card means nothing to a tower in Esmeralda.',
          success: { win: true, say: 'Capitān Olsēn files for Lāyūna and asks no questions. Amādū Salek answers his phone somewhere over the Atlantic.' },
          fail: { exposure: 2, hours: 3, say: 'The pilot will not go without a landing clearance. Three hours arguing in a hangar.' } },
        { id: 'fuel_now', name: 'Pay the fuel agent yourself', hours: 1, dc: 2, needs: [{ arr: 'aircraft', stage: 2 }], pay: true,
          mods: {}, text: 'Pay the agent in person. Fuel agents take money everywhere on earth. Fast, and the apron learns your face.',
          success: { advance: ['aircraft'], exposure: 1, say: 'The bowser rolls out. The agent does not ask who you are, which means he knows.' },
          fail: { exposure: 1, say: 'The agent wants the operator\'s account, not cash. An hour wasted.' } },
      ] },
  ];

  // Things people say when a stage is reached. who: speaker id.
  const STAGE_LINES = {
    aircraft:   ['', 'Charter found: a jet in Susana, twelve seats, no questions so far.', 'Crew confirmed for midnight tomorrow. The operator wants the destination.', 'Fuel paid. The jet is being positioned.', 'The aircraft is on the apron at Susana, doors open.'],
    reception:  ['', 'Your sibling has a name in Baca: Rosario Vélez, the interior minister\'s aide. She has not answered yet.', 'Vélez has spoken to her minister. Esmeralda will not turn you away at the line.', 'Esmeraldan officials will be at the Huhūi post when you arrive.'],
    document:   ['', 'Mārtā Kovalskā has pulled your civil record. The stamp takes a day.', 'The Nelôxian civil record is ready for collection at Santa Laura.'],
    permission: ['', 'Amādū Salek has taken your call. He will speak to the ministry in Lāyūna, on his terms.', 'Atlanta will receive you. A car will meet the aircraft at Lāyūna.'],
  };

  // Enemy actions. Picked by weight each enemy turn. Each is visible in the log and on the map.
  const ENEMY_ACTIONS = [
    { id: 'check_belief', w: 4, text: (lv) => `Sosā's people search ${lv}.` },
    { id: 'circulate',    w: 3, once: true, text: () => 'The departure restriction is circulated to every provincial post and the Huhūi line.' },
    { id: 'lean_operator', w: 2, once: true, after: 12, text: () => 'The ministry warns the Susana charter operator that its Valdórian licence is under review.' },
    { id: 'press_ally',   w: 3, text: (who) => `Sosā calls ${who} in for a conversation.` },
    { id: 'ask_esmeralda',w: 2, once: true, after: 30, text: () => 'Valdória asks Esmeralda, through the embassy in Baca, to hold you if you appear.' },
    { id: 'press_story',  w: 2, text: () => 'The ministry briefs the papers that you have already left the country.' },
  ];

  return { CHARACTERS, PEOPLE, ENEMY, ARRANGEMENTS, CARDS, LEVELS, STAGE_LINES, ENEMY_ACTIONS };
})();
if (typeof module !== 'undefined') module.exports = Data;
