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
    woman: { id: 'woman', name: 'Teresa', short: 'Teresa', title: 'the defeated candidate', pronoun: 'she',
             sibling: { id: 'sibling', name: 'Duartē', short: 'Duartē', rel: 'your brother' },
             // Distinct runs: Teresa starts with a friend in the inquiry, but every officer knows her face.
             hand: ['passport', 'decoy_cars', 'aide_word', 'informant'], handAlt: ['delay_report'], exposure: 1, faceKnown: true,
             edge: 'A friend inside the police', flaw: 'Every officer knows your face' },
    man:   { id: 'man', name: 'Mateu', short: 'Mateu', title: 'the defeated candidate', pronoun: 'he',
             sibling: { id: 'sibling', name: 'Līviā', short: 'Līviā', rel: 'your sister' },
             // Mateu has the family barges, but he has been watched since the count.
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
  const ENEMY = { name: 'Police', role: 'the police inspector leading the search' };

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
    berth:        { name: "A berth on the night boat", tag: 'passage', from: 'self', reach: ['harbor'], works: 'Riding the night boat to Punta Marēa.',
                    text: "The skipper keeps a berth in his hold for you on pier four." },
    yard_walk:    { name: "Theo's walk through the yard", tag: 'passage', from: 'theo', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "Theo escorts you past the yard office to the train." },
    sponsor_line: { name: "Your sponsor's line to the ministry", tag: 'permission', from: 'sponsor', reach: ALL, works: "Reaching Vélez's uncle, calming the crew, and leaving without the visa.",
                    text: "Your sponsor's name opens doors that money alone does not." },
    barge:        { does: "You can take the river out of Pedra Branca.", name: 'Your family barges', tag: 'boat', from: 'self', reach: ['road', 'colonia'], works: 'The river south of Pedra Branca.',
                    text: "Your father's barges still run the river, and their captains owe him." },
    grandson:     { name: "Nonā Rosa's grandson", tag: 'passage', from: 'host', reach: ['salta'], works: 'Boarding the midnight freight.',
                    text: "He is 19, quick, and knows which boxcar the guards skip." },
    informant:    { does: "Helps you slip past the police.", name: 'A friend in the police', tag: 'information', from: 'aide', reach: VALDORIA, works: 'Any move the police could be watching, up to the line.',
                    text: "A clerk tells Gianlūka where the police are looking and who is on duty." },
    // Cards you choose before the run (owner, Nov. 1, 2026: "Add cards to help a user navigate, find support ... we don't
    // even have a way for them to eat for 72 hours"). Each uses a kind the game already has; `does` is the picker's sentence.
    supporters:   { does: "Your supporters can find you a way onto a train.", name: 'Your supporters along the route', tag: 'vehicle', from: 'self', reach: ['road', 'colonia', 'salta'], works: 'Getting help in the Salta rail yard.', pick: true,
                    text: 'People who voted for you lend you trucks and drivers.' },
    food:         { does: "You won't have to stop for food.", name: 'Food for three days', tag: 'supplies', from: 'self', reach: [], works: 'From the start of the run.', pick: true, startLower: 1,
                    text: 'You carry bread, cheese, and water, so you never stop at a store where people would see you.' },
    lawyer:       { does: "Your lawyer can tie up the travel ban.", name: "A lawyer's appeal", tag: 'delay', from: 'self', reach: VALDORIA, works: 'Valdórian posts checking the travel ban, including Pedra Branca and the line.', pick: true,
                    text: 'Your lawyer files an appeal that holds up police paperwork.' },
    rail_friend:  { does: "Your friend can get you onto the train.", name: 'A friend in the rail yard', tag: 'passage', from: 'self', reach: ['salta'], works: 'Boarding the midnight freight.', pick: true,
                    text: 'A rail worker in Salta who voted for you knows which boxcar the guards skip.' },
    broker:       { does: "The broker can smooth your way across the border.", name: "A customs broker's number", tag: 'introduction', from: 'self', reach: ESMERALDA, works: 'Paso Huhūi, Ālto Verdē, and the Portalba departure.', pick: true,
                    text: 'A broker who moves goods across the border knows the officers at the posts.' },
    pilot_owes:   { does: "Your old pilot can help you take off.", name: "Your campaign's pilot", tag: 'permission', from: 'self', reach: ['airfield'], works: 'Leaving Portalba without the visa.', pick: true,
                    text: 'The pilot who flew your campaign still owes you a favor.' },
    // companions (owner, Nov. 1, 2026: "an ally you travel with who is trustworthy throughout ... one specific thing
    // they're good at"). A companion never turns on you; the card is yours for the whole run.
    comp_bruno:   { does: "In Salta, paying Holt for a crate and asking Theo to walk you through the yard are both easier with him.", name: 'Bruno', tag: 'vehicle', from: 'self', reach: ['road', 'colonia', 'salta'], works: 'Getting help in the Salta rail yard.', companion: true,
                    text: 'Bruno drives trucks for a living and knows every back road.' },
    comp_clara:   { does: "Makes the border and the airfield easier.", name: 'Clara', tag: 'introduction', from: 'self', reach: ESMERALDA, works: 'Paso Huhūi, Ālto Verdē, and the Portalba departure.', companion: true,
                    text: 'Clara grew up in Costamar and still has family there.' },
    comp_rita:    { does: "Makes taking off without a visa easier.", name: 'Rita', tag: 'permission', from: 'self', reach: ['airfield'], works: 'Leaving Portalba without the visa.', companion: true,
                    text: 'Rita flies cargo planes out of the coast and knows the charter crews.' },
    // Eight more companions (owner, Nov. 2, 2026). Each card's tag is a kind no other card carries, so the help it
    // gives is the companion's own: the moves and news choices that look for that kind are listed under each.
    // mechanic: driving your own car out of Pedra Branca, the plain car, the decoy convoy, the flooded bridge.
    comp_marta:   { name: 'Marta', tag: 'mechanic', from: 'self', reach: ['residence', 'road', 'colonia', 'salta'], works: 'Cars and roads in Valdória.', companion: true,
                    text: 'Marta has kept campaign cars running for years and knows how to make a recognizable car look ordinary.' },
    // care: quiet hours (lying low, waiting for dark, sleeping, long waits in the news) never raise police attention; she buys
    // food without anyone seeing you, a night in the car is a full night's sleep, and she treats a sick child herself.
    comp_ines:    { name: 'Inês', tag: 'care', from: 'self', reach: ALL, works: 'Every wait and every night of rest.', companion: true,
                    text: 'Inês is a nurse who worked campaign events. She can keep you fed, rested, and out of places where strangers ask questions.' },
    // court: the travel ban reaches the posts 12 hours after it is sent; the summons and the hearing have a way around the ban.
    comp_paulo:   { name: 'Paulo', tag: 'court', from: 'self', reach: VALDORIA, works: 'Court orders and the travel ban in Valdória.', companion: true,
                    text: "Paulo worked in the court clerk's office for 18 years. He knows which orders move immediately and which ones sit in an outbox." },
    // media: the radio's yacht story, the kitchen photo, the hitchhiking reporter and your family's early story.
    comp_celina:  { name: 'Celina', tag: 'media', from: 'self', reach: VALDORIA, works: 'The radio and the papers in Valdória.', companion: true,
                    text: 'Celina produces the morning news at a regional radio station. She knows what gets repeated before anyone checks it.' },
    // border: every crossing at the line, which post is clean, the ban's lag at the booth and the ridge path.
    comp_tomas:   { name: 'Tomás', tag: 'border', from: 'self', reach: ['border'], works: 'The three crossings at the line.', companion: true,
                    text: 'Tomás spent 22 years working border posts. He knows when the paperwork reaches the booth and when the booth is pretending it has not.' },
    // phone: the police's call traces find nothing, and once a run the tap on your family's phone slows nothing.
    comp_nadia:   { name: 'Nadia', tag: 'phone', from: 'self', reach: ALL, works: 'Every call you make.', companion: true,
                    text: 'Nadia maintained the provincial telephone network. She knows which exchanges keep records and which calls disappear into old equipment.' },
    // lodging: Emilio's room under another name at Pedra Branca, Nova Trentô and Salta, in the food and sleep screen.
    comp_emilio:  { name: 'Emilio', tag: 'lodging', from: 'self', reach: ['road', 'colonia', 'salta'], works: 'Pedra Branca, Nova Trentô and Salta.', companion: true,
                    text: "Emilio manages small hotels along the south road. He can find a room under someone else's reservation." },
    // union: a train the crew holds in Salta, and the strike.
    comp_joana:   { name: 'Joana', tag: 'union', from: 'self', reach: ['salta'], works: 'The Salta rail yard and its workers.', companion: true,
                    text: 'Joana organizes railway and dock workers. She knows who is on shift, who is angry, and who can make a train wait.' },
    road_map:     { does: "The map can keep you out of the police's sight.", name: 'A map of the back roads', tag: 'information', from: 'self', reach: VALDORIA, works: 'Any move the police could be watching, up to the line.', pick: true,
                    text: 'Every checkpoint and back road between here and the line is marked.' },
  };

  // Levels. Each approach: needs (all must hold), dc (die needs dc or more after mods), mods (tag: bonus),
  // and what happens. hours: time spent attempting. Failure never ends the run by itself.
  const LEVELS = [
    { id: 'residence', name: 'The residence, Portô Venla', short: 'Residence', scene: 'residence',
      objective: "Get past the watch.",
      arrive: 'Two unmarked cars watch the house. The court has barred you from leaving the country. Your second passport is in your coat.',
      approaches: [
        { id: 'decoy', with: 'nando', name: 'Send out a decoy convoy', hours: 3, dc: 3, needs: [{ card: 'decoy' }],
          mods: { information: 2 }, text: "Nando, your driver, sends three cars out at once so the watch follows the wrong one.",
          success: { belief: 0, exposure: -1 },
          fail: { exposure: 2, say: 'The police stop the second car on the avenue. Nando talks his way out, and they are watching the house more closely now.' } },
        { id: 'service', name: 'Leave by the service door', hours: 1, dc: 4, needs: [{ night: true }],
          mods: { information: 1 }, text: "The kitchen staff go home after 10 p.m., and you leave with them.",
          success: { belief: 0, say: 'The night cook lends you an apron and a cigarette. Nobody looks at the help.' },
          fail: { exposure: 2, say: 'A flash goes off in a parked car. Someone photographed the help tonight.' } },
        { id: 'partycar', with: 'aide', name: "The party's official car", hours: 1, dc: 2, needs: [{ card: 'influence' }],
          mods: {}, text: "Gianlūka, the party's chief of staff, drives you out in his official car. In return, he wants you to say in public that he leads the party.",
          success: { belief: 0, commit: 'aide', say: 'The flags get you through. Gianlūka reminds you, gently, what he asked for.' },
          fail: { exposure: 1, commit: 'aide', say: 'The watch stops the car at the gate and reports whose car it is. You are still at the house.' } },
      ] },
    { id: 'road', name: 'The road south, Pedra Branca', short: 'Pedra Branca', scene: 'road',
      objective: 'Get from Pedra Branca to the colônia at Nova Trentô.',
      arrive: 'The radio says you are on a yacht in Portô Venla.',
      approaches: [
        { id: 'second_driver', with: 'nando', name: 'Hire a plain car and driver', hours: 2, dc: 3, needs: [], pay: true,
          mods: { information: 1, mechanic: 1 }, text: "Nando's cousin drives a taxi and keeps quiet for cash.",
          success: { say: 'You leave by taxi while Nando drives your sedan back north.' },
          fail: { exposure: 1, hours: 2, say: "Nando's cousin wants more money, then backs out. You lose four hours." } },
        { id: 'siblings_driver', with: 'sibling', name: "Leave with your sibling's driver", hours: 2, dc: 2, needs: [{ arr: 'aircraft', stage: 1 }],
          mods: { information: 1 }, text: "Your sibling knows a driver in Pedra Branca who takes you once the charter jet is booked.",
          success: { say: 'He asks nothing and drives the back roads. The radio stays off.' },
          fail: { exposure: 1, hours: 1, say: 'He is late, then nervous, and you wait an hour on a side street while he decides.' } },
        { id: 'barge', name: 'Take a family barge upriver', hours: 3, dc: 2, needs: [{ card: 'boat' }], with: 'self',
          mods: { information: 1 }, text: "A river captain who owes your father takes you up to Nova Trentô.",
          success: { exposure: -1, say: 'You sleep under a tarp that smells of soy. The river is quiet.' },
          fail: { exposure: 1, hours: 2, say: 'River police board at the lock. The captain talks for two hours.' } },
        { id: 'river', name: 'Take the river to the coast', hours: 4, dc: 3, needs: [],
          mods: { boat: 2, information: 1 }, text: "A sand barge runs down the river to the fishing port at Barra Velha, and its pilot takes passengers for cash.",
          success: { route: 'coast', say: "The barge slips past the lock and ties up at Barra Velha, where the river meets the sea. You skip Nova Trentô and Salta and go on to the line by sea." },
          fail: { exposure: 1, hours: 2, say: "River police search every barge at the lock, and the pilot keeps you in the hold for two more hours." } },
        { id: 'cover_road', name: 'Cover your tracks', hours: 2, dc: 3, stay: true, needs: [],
          mods: { information: 1 }, text: "You swap cars twice and leave the old one in a farmer's barn.",
          success: { exposure: -1, say: "You swap cars behind a grain store, and the police lose the trail." },
          fail: { exposure: 1, say: "A boy on a bicycle watches you swap the plates and rides off toward the police post." } },
        { id: 'known_car', name: 'Drive on in your own car', hours: 1, dc: 5, needs: [], plain: 'mechanic',
          mods: { delay: 2, decoy: 2, mechanic: 2 }, text: "You drive on in your own car, which the police know.",
          success: { exposure: 1, say: 'You pass the first post before the fax does.' },
          fail: { exposure: 3, belief: 1, say: "The post at the river has your plate. They turn you back and report you." } },
      ] },
    { id: 'colonia', name: 'The colônia, Nova Trentô', short: 'Nova Trentô', scene: 'colonia',
      objective: "Get to Salta. The road opens once Costamar expects you, or after you free Nonā Rosa's truck.",
      arrive: "Nonā Rosa offers a room and a phone. Her cooperative's truck was impounded this morning.",
      approaches: [
        { id: 'help_host', with: 'host', name: "Help Nonā Rosa free the truck", hours: 3, dc: 2, needs: [],
          mods: { influence: 2 }, text: "Nonā Rosa runs the colônia. Her truck was impounded this morning, and once it is free, her cousin can drive you to Salta.",
          success: { card: 'truck', trust: 'host' },
          fail: { card: 'truck', hours: 1 } },
        { id: 'work_phone', name: "Call your contacts", hours: 3, dc: 1, noRoll: true, once: true, needs: [],
          mods: {}, text: "You use Nonā Rosa's phone to push on the jet, your welcome in Costamar and your visa.",
          success: { advance: ['aircraft', 'reception', 'permission'], say: 'Three hours later, all three arrangements have moved one step. Nonā Rosa eats alone.' }, fail: { say: '' } },
        { id: 'cover_colonia', name: 'Cover your tracks', hours: 2, dc: 3, stay: true, needs: [],
          mods: { information: 1 }, text: "Nonā Rosa's cousins spread a story that you went north.",
          success: { exposure: -1, say: "The story spreads through the colônia, and the police hear you went north." },
          fail: { exposure: 1, say: "A neighbor tells the police the story is a lie." } },
        { id: 'leave', name: 'Take the road to Salta', hours: 2, dc: 1, noRoll: true, needs: [{ arr: 'reception', stage: 1 }],
          mods: {}, text: "Nonā Rosa's cousin drives you up to Salta.",
          success: { say: 'Nonā Rosa\'s cousin drives. The road climbs and the radio loses the station.' }, fail: { say: '' } },
      ] },
    { id: 'salta', name: 'The rail town, Salta', short: 'Salta', scene: 'salta',
      objective: 'Get on the midnight freight.',
      arrive: "The midnight freight climbs to the border. Holt and Theo can get you aboard.",
      approaches: [
        { id: 'board', name: 'Board the midnight freight', hours: 1, dc: 3, needs: [{ card: 'passage' }, { night: true }],
          mods: { passage: 2 }, text: "The freight to the border leaves at midnight.",
          success: { say: 'The train pulls out at 12 minutes past midnight. You lie in cold straw and listen to the train climb the grade.' },
          fail: { exposure: 1, say: 'A lamp swings down the cars, and you drop back into the shadows. You can try again while it is still dark.' } },
        { id: 'crate', with: 'holt', name: "Pay Holt for a crate", hours: 2, dc: 3, needs: [], pay: true,
          mods: { vehicle: 1, information: 1 }, text: "Holt, a brakeman on the freight, saves you a crate in the third boxcar for cash.",
          success: { card: 'crate', say: 'Holt pockets the notes without counting them. "Third car. Midnight. I don\'t wait."' },
          fail: { exposure: 1, say: 'Holt wants to see who else is asking. You spend two hours in a shed waiting for him to decide.' } },
        { id: 'foreman', with: 'theo', name: 'Ask Theo to walk you through', hours: 2, dc: 4, needs: [],
          mods: { vehicle: 2, information: 1, influence: 1 }, text: "Theo runs the rail yard and can walk you past the yard office to the train.",
          success: { card: 'yard_walk', trust: 'theo', say: 'Theo agrees to walk you across the yard tonight. Nobody interrupts a foreman.' },
          fail: { exposure: 1, say: 'The registry window is open late tonight. Theo shakes his head and tells you to come back at the shift change.' } },
        { id: 'cover_salta', name: 'Cover your tracks', hours: 2, dc: 3, stay: true, needs: [],
          mods: { information: 1 }, text: "You change clothes and move to a boarding house across the tracks.",
          success: { exposure: -1, say: "Nobody at the boarding house knows your face." },
          fail: { exposure: 1, say: "The landlady keeps the newspaper with your photo by the door." } },
        { id: 'buy_seat', name: 'Pay the yardmaster', hours: 1, dc: 7, needs: [], pay: true,
          mods: {}, text: "The yardmaster offers you a seat on the freight for cash.",
          success: { exposure: 2, say: "Three men watch the yardmaster take your money." },
          fail: { exposure: 2, say: 'He takes the envelope, thanks you by your real name, and walks to the telephone. The yard knows who is here.' } },
        { id: 'crew_train', mate: 'joana', name: 'Ride the train the crew holds', hours: 2, dc: 3, needs: [{ card: 'union' }],
          mods: {}, text: "Joana asks the yard crew to hold a freight car until you are aboard, at any hour.",
          success: { say: 'The crew holds the car at the end of the platform. Joana shakes hands with the driver, and the train leaves with you in it.' },
          fail: { exposure: 1, say: 'The yard boss walks the platform, and the crew cannot hold the car while he watches. Joana says to try again after he leaves.' } },
      ] },
    { id: 'border', name: 'The line at the Huhūi passes', short: 'The line', scene: 'border',
      objective: 'Cross into Costamar.',
      arrive: 'Three crossings lie within a day of each other: the rail post at Paso Huhūi, the road post at Ālto Verdē toward Cerro Alto, and the Punta Marēa crossing toward the coast. Valdória has paid the guards at one of them to stop you.',
      border: true,
      approaches: [
        { id: 'post_rail', post: 'rail', name: 'Cross at the Paso Huhūi post', hours: 1, dc: 4, needs: [{ card: 'document' }],
          mods: { introduction: 2, influence: 1, border: 1 }, text: "The freight's own crossing, where you show your second passport.",
          success: { say: 'The guard turns the pages, looks at a sheet on the desk, and stamps it.' },
          fail: { exposure: 2, hours: 3, say: 'The guard reads the sheet first. You spend three hours in a cold room and come out on the Valdórian side.' } },
        { id: 'post_high', post: 'high', name: 'Take the Ālto Verdē road post', hours: 3, dc: 3, needs: [],
          mods: { introduction: 2, border: 1 }, text: "A mountain road post toward Cerro Alto, three hours of switchbacks away.",
          success: { say: 'After a long climb, the sergeant at Ālto Verdē checks your passport and waves the car through.' },
          fail: { exposure: 1, hours: 2, say: 'The post has no list with your name on it, and you wait two hours while someone in Cerro Alto is woken up.' } },
        { id: 'mountain', name: 'Walk over the mountains', hours: 5, dc: 3, needs: [],
          mods: { border: 2, care: 1 }, text: "An old shepherds' path climbs over the ridge between the posts, where no guard checks a passport.",
          success: { exposure: -1, say: "You walk five hours through the snow and come down on the Costamaran side, where no post has your name." },
          fail: { exposure: 1, hours: 3, say: "The wind closes the path near the top, and you lose three more hours walking back down in the cold." } },
        { id: 'cover_border', name: 'Cover your tracks', hours: 2, dc: 3, stay: true, needs: [],
          mods: { information: 1 }, text: "You wait in a trucker's cab away from the posts.",
          success: { exposure: -1, say: "The trucks come and go, and nobody looks into the cab." },
          fail: { exposure: 1, say: "A guard on his break walks past the cab twice." } },
        { id: 'post_coast', post: 'coast', name: 'Pay the Punta Marēa crossing', hours: 2, dc: 4, needs: [], pay: true,
          mods: { delay: 2, information: 2, border: 2 }, text: "The merchants' crossing to the coast, where the guards take money.",
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
          mods: { introduction: 1, document: 1 }, text: "Capitān Olsēn flies you out once the jet is ready and your visa is in.",
          success: { win: true, say: "You take off. Forty minutes later, the pilot confirms you have left Costamaran airspace." },
          fail: { exposure: 1, hours: 2, say: 'The tower holds you on the apron for two hours while it reads a request from Valdória, then reads it again.' } },
        { id: 'depart_nopermit', with: 'pilot', name: 'Depart without the visa', hours: 2, dc: 5, needs: [{ arr: 'aircraft', stage: 4 }],
          mods: { introduction: 1, permission: 2 }, text: "You ask Capitān Olsēn to fly without the visa.",
          success: { win: true, say: 'Capitān Olsēn files the flight plan and asks no questions. Your sponsor\'s phone rings somewhere over the ocean.' },
          fail: { exposure: 2, hours: 3, say: 'The pilot will not go without a landing clearance, and you spend three hours arguing in a hangar.' } },
        { id: 'cover_airfield', name: 'Cover your tracks', hours: 2, dc: 3, stay: true, needs: [],
          mods: { information: 1 }, text: "You wait in a hangar office with the blinds down.",
          success: { exposure: -1, say: "The hangar crews go home, and nobody asks who is in the office." },
          fail: { exposure: 1, say: "A mechanic photographs the office window." } },
        { id: 'fuel_now', name: 'Pay the fuel agent yourself', hours: 1, dc: 2, needs: [{ arr: 'aircraft', stage: 2 }], pay: true,
          mods: {}, text: "You pay the fuel agent in cash to get the jet ready sooner.",
          success: { advance: ['aircraft'], exposure: 1, say: "The fuel truck arrives. People on the apron recognize you." },
          fail: { exposure: 1, say: "The agent will only take payment from the operator's account, and you lose an hour." } },
      ] },
  ];

  // The coast route (owner's issue #51): Pedra Branca down the river to Barra Velha, which takes the place of
  // Nova Trentô and Salta. It is the fourth stop on that route, so it sits at index 3 in place of Salta.
  const HARBOR = { id: 'harbor', name: 'The fishing port, Barra Velha', short: 'Barra Velha', scene: 'harbor',
      objective: 'Get on a boat to the Punta Marēa crossing.',
      arrive: "The fishing boats run down the coast to Punta Marēa every night. The harbor police check the piers after dark.",
      approaches: [
        { id: 'night_boat', name: 'Sail at night to Punta Marēa', hours: 4, dc: 3, needs: [{ night: true }],
          mods: { passage: 2, boat: 1, information: 1 }, text: "The night boats leave at dark and land on the beach below the Punta Marēa crossing.",
          success: { say: "The boat runs without lights, and four hours later the skipper puts you ashore below the Punta Marēa crossing." },
          fail: { exposure: 1, say: "A harbor police lamp sweeps the pier, and the skipper will not cast off. You can try again while it is still dark." } },
        { id: 'skipper', name: 'Pay a skipper for a berth', hours: 2, dc: 3, needs: [], pay: true,
          mods: { introduction: 1, information: 1, union: 1 }, text: "A skipper on pier four keeps a berth in his hold for anyone who pays.",
          success: { card: 'berth', say: "The skipper counts the money twice. \"Pier four, after dark. Bring nothing heavy.\"" },
          fail: { exposure: 1, say: "The skipper asks around the fish market about you, and two hours later he says no." } },
        { id: 'coast_ferry', name: 'Take the coast ferry', hours: 3, dc: 5, needs: [],
          mods: { information: 1 }, text: "The coast ferry runs to Punta Marēa in daylight, and the harbor police check papers at the gangway.",
          success: { exposure: 1, say: "The ferry is full of market traders. A deckhand looks at your face for too long, but the ferry docks at Punta Marēa." },
          fail: { exposure: 2, say: "An officer checks papers at the gangway, and you walk away before your turn." } },
        { id: 'cover_harbor', name: 'Cover your tracks', hours: 2, dc: 3, stay: true, needs: [],
          mods: { information: 1 }, text: "You rent a net loft above the fish market.",
          success: { exposure: -1, say: "Nobody looks up at the loft over the fish market." },
          fail: { exposure: 1, say: "The fish buyer downstairs recognizes you from the newspaper." } },
      ] };

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
                            asks: 'Salek, a banker who knows your family, can ask the ministry for your visa. He wants the family accounts in return, and agreeing makes him work harder for you.',
                            wants: 'the family accounts moved to his bank',
                            terms: 'He wants the family accounts moved to his bank.', slow: 0,
                            demand: { text: '"The transfer papers are with your brother-in-law. Sign them and the ministry hears from me tonight."', accept: 'Sign and move the accounts', effect: 'Salek takes the family accounts and works harder for you.', heat: 0 },
                            kept: 'Salek now holds the family accounts.' } },
    tarun:     { name: 'Ardésia', city: 'Almatau', lon: 76.9, lat: 43.2, hours: 14,
                 sponsor: { name: 'Dēvan Rāo', short: 'Rāo', pronoun: 'he', role: 'a magistrate in Almatau who has taken in exiles before',
                            asks: 'Rāo, a magistrate in Almatau, can write to the ministry for your visa. He is slow, and he wants your word that you will stay out of politics. Agreeing makes him work harder for you.',
                            wants: 'your word that you will stay out of politics',
                            terms: 'He wants your word that you will stay out of politics while you are his guest.', slow: 6,
                            demand: { text: '"I have drafted the letter. It says you will hold no office and give no interviews from Ardésia. I need your signature under mine."', accept: 'Sign and give your word', effect: 'Rāo has your word and works harder for you.', heat: 0 },
                            kept: 'Rāo has your word that you are out of politics.' } },
    zaryanova: { name: 'Nordavia', city: 'Krasnomor', lon: 131.9, lat: 43.1, hours: 8,
                 sponsor: { name: 'Mirēlā Vosk', short: 'Vosk', pronoun: 'she', role: 'a former trade envoy in Krasnomor with friends at the foreign ministry',
                            asks: 'Vosk, a former trade envoy, can take your visa request to the ministry. She wants mineral rights you do not control, and agreeing makes him work harder for you.',
                            wants: 'mineral rights you do not control',
                            terms: 'She wants mineral rights you do not control.', slow: 0,
                            demand: { text: '"The ministry wants the northern concessions in writing. Sign, and I take it to them tonight."', accept: 'Sign the concession', effect: 'Vosk takes the concession and works harder for you, so she works harder for you. Word reaches home, and your police attention rises by one.', heat: 1 },
                            kept: 'Your signature on the concessions is in Krasnomor.' } },
  };
  const PLACES = { valdoria: { name: 'Valdória', city: 'Portô Venla', lon: -77.0, lat: -12.0 }, susana: { name: 'Portalba', city: 'Costamar', lon: -79.9, lat: -2.2 } };
  const POSTS = { rail: 'Paso Huhūi rail post', high: 'Ālto Verdē road post', coast: 'Punta Marēa crossing' };
  // ---- The government role: a senior aide to the minister, coordinating the departure inquiry.
  const GOV = { id: 'gov', name: 'Sofia', title: 'special investigator for the incoming government', pronoun: 'she', };
  // Government cards: specific cooperation, with the same local reach as the escape's cards.
  const GOV_CARDS = {
    watch:     { does: "They watch the residence and Pedra Branca and send you reports.", name: 'The watch team', tag: 'watch', from: 'A police inspector', reach: ['residence', 'road'], works: 'The residence and Pedra Branca.', text: 'Two unmarked cars and four officers. They see what passes them and nothing else.' },
    desk:      { does: "Searches and checkpoints anywhere in Valdória get easier.", name: "The provincial desk's patrol", tag: 'patrol', from: 'The Pedra Branca commander', reach: VALDORIA, works: 'Any stop in Valdória, up to and including the line.', text: "The commander's patrol makes your searches and checkpoints easier." },
    rail:      { name: 'A railway contact', tag: 'rail', from: 'The Salta yardmaster', reach: ['salta'], works: 'The Salta yard and the midnight freight.', text: 'He takes money from anyone and tells you about it.' },
    operator:  { name: "The operator's license", tag: 'operator', from: 'The aviation desk', reach: ['airfield'], works: 'The Portalba charter operator, through his Valdórian license.', text: 'A review can pause a booking. It cannot find the passenger.' },
    // what each of the eight later companions gives Sofia (owner, Nov. 2, 2026): one bounded source each, never her live position
    plates:    { name: "Marta's vehicle records", tag: 'vehicles', from: 'Marta', companion: 'marta', reach: ['residence', 'road', 'colonia'], works: 'The residence, Pedra Branca and Nova Trentô.', text: 'Plates, repair shops and toll booths. They tell you about cars, not about who is in them.' },
    clinics:   { name: "Inês's clinic contacts", tag: 'medical', from: 'Inês', companion: 'ines', reach: VALDORIA, works: 'Every clinic in Valdória.', text: 'A clinic reports a visit a few hours late, and only where it happened.' },
    clerk:     { name: "Paulo's friends at the court", tag: 'court', from: 'Paulo', companion: 'paulo', reach: ALL, works: 'Court orders and the travel ban.', text: 'He knows which desk an order is sitting on and who can sign it tonight.' },
    newsroom:  { name: "Celina's newsroom", tag: 'media', from: 'Celina', companion: 'celina', reach: ALL, works: 'The radio, the papers and the press office.', text: 'She knows which reporter will run a story and which one will check it first.' },
    post_cmd:  { name: "Tomás's border command", tag: 'border', from: 'Tomás', companion: 'tomas', reach: ['border'], works: 'The Valdórian posts at the line.', text: 'The sergeants at the line served under him. They answer his calls.' },
    exchange:  { name: "Nadia's exchange records", tag: 'phone', from: 'Nadia', companion: 'nadia', reach: ALL, works: 'Calls on the provincial network.', text: 'An exchange logs which town a call came from, hours later. It never says who is holding the phone.' },
    registers: { name: "Emilio's guest registers", tag: 'lodging', from: 'Emilio', companion: 'emilio', reach: ['road', 'colonia', 'salta'], works: 'Hotels in Pedra Branca, Nova Trentô and Salta.', text: 'A register shows who checked in and when, under whatever name they gave.' },
    union:     { name: "Joana's union contacts", tag: 'union', from: 'Joana', companion: 'joana', reach: ['salta'], works: 'The Salta rail yard and its workers.', text: 'The yard crews talk to her, and they see every passenger the freight carries.' },
    esm_intro: { name: 'A Costamaran introduction', tag: 'introduction', from: 'The embassy in Cerro Alto', reach: ESMERALDA, works: 'Lets your search, checkpoint, and call-in orders work at Portalba.', text: 'A name at the interior ministry who will take your call. Nothing is promised.' },
  };
  // A companion on the government side: the same people, and what each gives Sofia
  const COMPANIONS = {
    bruno: { card: 'comp_bruno', sprite: 'bruno', gov: 'rail', govDoes: 'He knows the freight crews, so you start with a railway contact in Salta.' },
    clara: { card: 'comp_clara', sprite: 'clara', gov: 'esm_intro', govDoes: 'Your search, checkpoint and call-in orders work in Portalba.' },
    rita:  { card: 'comp_rita', sprite: 'rita', gov: 'operator', govDoes: 'She knows the charter operator, so you can lean on him from the start.' },
    // Nov. 2, 2026: eight more. Picker wording is in content/coalition/ui.json under mate.<id>.
    marta:  { card: 'comp_marta', sprite: 'marta', gov: 'plates' },
    ines:   { card: 'comp_ines', sprite: 'ines', gov: 'clinics' },
    paulo:  { card: 'comp_paulo', sprite: 'paulo', gov: 'clerk' },
    celina: { card: 'comp_celina', sprite: 'celina', gov: 'newsroom' },
    tomas:  { card: 'comp_tomas', sprite: 'tomas', gov: 'post_cmd' },
    nadia:  { card: 'comp_nadia', sprite: 'nadia', gov: 'exchange' },
    emilio: { card: 'comp_emilio', sprite: 'emilio', gov: 'registers' },
    joana:  { card: 'comp_joana', sprite: 'joana', gov: 'union' },
  };
  // Orders: what the government player can do where it is looking. who: who acts. act: the inquiry action it runs.
  const GOV_ORDERS = [
    { id: 'search', name: (lv) => `Search ${lv}`, hours: 3, dc: 4, who: 'the provincial patrol', mods: { patrol: 1, vehicles: 1, border: 2, rail: 1, lodging: 1 }, act: 'check_belief', text: 'The patrol searches the stop you are watching and you get a report. If she is there and her police attention is 7 or higher, they stop her. The police keep watching that stop afterward.', fail: 'The patrol never gets there, and you learn nothing.' },
    { id: 'watch_house', name: () => 'Keep watch on the house', hours: 1, dc: 1, who: 'the watch team', mods: {}, text: 'The watch team tells you whether anyone is still in the house.', where: [0, 1] },
    { id: 'follow', name: (lv, rep) => `Move your search to ${rep}`, hours: 1, dc: 1, who: 'you', mods: {}, text: 'Your next orders act at the stop the newest report names. The police stay where they last searched until you order a search or a checkpoint at the new stop.' },
    { id: 'circulate', name: () => 'Circulate the travel ban', hours: 3, dc: 4, who: 'the provincial desks', mods: { court: 2 }, act: 'circulate', text: 'Every post and the border get the ban, and it is in force as soon as it is sent. From then on, police who stop her take her straight to the station, and her crossings at the line are harder.', fail: 'A clerk tips off her side before the ban goes out. The police lose the stop they were watching.' },
    { id: 'press', name: () => 'Call in one of her people', hours: 2, dc: 3, who: 'the police', mods: { union: 2 }, act: 'press_ally', text: 'The police question one of her helpers. If the helper talks, the police go to where she is, her police attention rises by two, and she loses that helper, but you are not told the place.', fail: 'Nobody answers the summons today.' },
    { id: 'roadblock', name: (lv) => `Set a checkpoint at ${lv}`, hours: 2, dc: 3, who: 'the provincial patrol', mods: { patrol: 2, vehicles: 1, border: 2, rail: 1 }, act: 'roadblock', text: 'For the next six hours, every move she makes at that stop that can fail is harder. A new checkpoint replaces this one.', fail: 'The checkpoint stands on the wrong road.' },
    { id: 'story', name: () => 'Brief the papers that she has left', hours: 1, dc: 2, who: 'the ministry press office', mods: { media: 2 }, act: 'press_story', text: 'The police turn to a stop where she is not. Her police attention also falls by one.' },
    { id: 'rail_ask', name: () => 'Ask the yardmaster who is paying', hours: 2, dc: 3, who: 'the railway contact', mods: { rail: 2, union: 2 }, text: 'He names who took money for the midnight freight, and he becomes your railway contact.', where: [3], fail: 'He wants to see who else is asking first.' },
    // owner, Nov. 2, 2026 ("the options for this side are very boring"): two orders of its own at each stop
    { id: 'tap_phone', where: [0], name: () => 'Tap the house phone', hours: 2, dc: 3, who: 'the watch team', mods: { watch: 1 }, fx: { lead: 2, say: 'The tap catches a call from her side. You hear where it came from, two hours late.' }, text: 'A call on the house line places her, two hours late.', fail: 'The phone company wants a court order first.' },
    { id: 'staff', where: [0], name: () => 'Question the household staff', hours: 2, dc: 3, who: 'the police', mods: {}, fx: { press: 1, lead: 3, say: 'The cook says the family left in a hurry and names the road they took.' }, text: 'The staff know which way the family went.', fail: 'The staff say nothing and call her lawyer.' },
    { id: 'bridge', where: [1], name: () => 'Stop every car at the bridge', hours: 3, dc: 3, who: 'the provincial patrol', mods: { patrol: 1, vehicles: 1 }, act: 'roadblock', fx: { press: 1, say: 'Every car on the bridge is stopped and checked.' }, text: 'A checkpoint on the bridge out of Pedra Branca, and the drivers talk.', fail: 'The patrol is sent to the wrong bridge.' },
    { id: 'fuel_watch', where: [1], name: () => 'Watch the fuel stations', hours: 2, dc: 2, who: 'the provincial patrol', mods: { vehicles: 1 }, fx: { lead: 3, say: 'An attendant remembers a car that paid in cash.' }, text: 'Every car stops for fuel somewhere on the road south.', fail: 'Nobody at the pumps remembers anything.' },
    { id: 'cooperative', where: [2], name: () => 'Lean on the cooperative', hours: 2, dc: 3, who: 'the police', mods: {}, fx: { stall: 3, minister: -1, say: 'The cooperative\'s phone line is cut for "maintenance". Anyone calling out from the colônia waits.' }, text: 'The colônia shares one phone line, and the police can cut it.', fail: 'The cooperative\'s lawyer is the mayor\'s brother.' },
    { id: 'bishop', where: [2], name: () => "Ask the bishop's office", hours: 1, dc: 3, who: 'you', mods: {}, fx: { lead: 2, say: 'A priest says a family from the capital came to evening mass.' }, text: 'The parish knows every stranger in the colônia.', fail: 'The bishop\'s office does not take your call.' },
    { id: 'freight_search', where: [3], name: () => 'Search the freight cars', hours: 3, dc: 4, who: 'the railway police', mods: { rail: 2, union: 1 }, act: 'check_belief', fx: { press: 1, say: 'The railway police open every car on the sidings.' }, text: 'Every car on the sidings is opened before the midnight freight.', fail: 'The yard boss keeps the cars locked until morning.' },
    { id: 'floodlights', where: [3], name: () => 'Floodlight the rail yard', hours: 2, dc: 2, who: 'the railway police', mods: { rail: 1 }, act: 'roadblock', fx: { say: 'The yard is lit like noon, and anyone moving in it is seen.' }, text: 'Lights on the yard make every move there harder for her.', fail: 'The generator fails at the first switch.' },
    { id: 'double_guard', where: [4], name: () => 'Double the guards at the posts', hours: 2, dc: 3, who: 'the border command', mods: { border: 2 }, fx: { crossing: 6, say: 'Every Valdórian post has twice the guards tonight.' }, text: 'More guards at every post make the line harder to cross.', fail: 'There are no spare guards this side of the capital.' },
    { id: 'photo_posts', where: [4], name: () => 'Send her photo to every post', hours: 1, dc: 2, who: 'the border command', mods: {}, fx: { press: 1, say: 'Her photo is pinned up in every guardhouse.' }, text: 'Every guard at the line gets her face.', fail: 'The fax line to the posts is down.' },
    { id: 'tower_delay', where: [5], name: () => 'Ask the tower to delay her charter', hours: 2, dc: 4, who: 'the aviation desk', mods: { operator: 2 }, fx: { stall: 4, say: 'The tower finds a problem with the charter\'s paperwork, and her arrangements slip four hours.' }, text: 'The Portalba tower can slow any charter for four hours.', fail: 'The tower says Costamar runs its own airport.' },
    { id: 'lounge_reporter', where: [5], name: () => 'Send a reporter to the crew lounge', hours: 1, dc: 3, who: 'the ministry press office', mods: { media: 2 }, fx: { press: 1, lead: 1, say: 'The reporter talks to the crews and files from the airfield.' }, text: 'Crews talk, and a reporter at Portalba hears it.', fail: 'Airfield security turns the reporter away.' },
    // issue #49: the candidate's two traitors are Sofia's informants; one near her tells Sofia where, an hour late
    { id: 'informants', name: () => 'Ask your informants', hours: 1, dc: 3, who: 'your informants', mods: {}, text: 'Two of her helpers talk to the police. One who is near her can tell you where she is, an hour late.', fail: 'Your informants do not answer today.' },
    // the later companions' orders: needs is the government card that opens the order
    { id: 'clinics', needs: 'clinics', name: () => 'Ask the clinics about her family', hours: 1, dc: 3, who: 'Inês', mods: { medical: 2 }, text: 'Inês asks the clinics in Valdória whether anyone from her family has been seen. A clinic names the stop three hours later, and it names each stop once.', fail: 'The clinics will not talk without a court order.' },
    { id: 'exchange', needs: 'exchange', name: () => 'Pull the exchange records', hours: 1, dc: 3, who: 'Nadia', mods: { phone: 2 }, text: 'Nadia reads the exchange logs for calls to her family in the last four hours. A log names the town a call came from, not where she is now.', fail: 'The exchange supervisor wants the request in writing.' },
    { id: 'registers', needs: 'registers', where: [1, 2, 3], name: (lv) => `Check the guest registers at ${lv}`, hours: 1, dc: 3, who: 'Emilio', mods: { lodging: 2 }, text: 'Emilio reads the hotel registers at the stop you are watching for a guest who gave another name, and you hear two hours later. The police watch the hotels there afterward.', fail: 'The hotel owners close their books to you.' },
    { id: 'appeal', needs: 'newsroom', name: () => 'Put her photo on the morning news', hours: 2, dc: 3, who: 'Celina', mods: { media: 2 }, text: "Celina's station runs her photo and a number to call. Her police attention rises by one. Three hours later a caller says where he saw her, and not every caller is right.", fail: 'The station runs a story about the weather instead.' },
    { id: 'lean', name: () => 'Press the charter operator', hours: 3, dc: 3, who: 'the aviation desk', mods: { operator: 2 }, act: 'lean_operator', text: 'If her jet already has a crew, the operator pulls the crew until she reassures him.', after: 12 },
  ];

  // ---- Government dispatches: the Reports phase on Sofia's side. Invented, like the candidate's.
  // at: stop indexes where the search must be looking (null = anywhere). after: earliest hour. needs: a government card id.
  // fx: hours, lead (a true report of where she is now; delay in hours), false (a report that points elsewhere),
  // follow (move the search to the newest report), card / lose (government card ids), act (an inquiry action at the
  // search), press (her exposure up), warn (her side learns something: her exposure down), stall (her bookings slip,
  // hours), crossing (every move at the line is harder for n hours), ban (the ban is in force), unban (the post at the line lets it slide),
  // holdup (the Costamaran request moves forward), dc (orders easier or harder: [delta, hours]), minister (+1 pleased,
  // -1 angry), sooner (the minister's deadline moves up, hours), roll {need, win, lose}, say.
  const GOV_EVENTS = [
    // Sofia's food and sleep (owner, Nov. 2, 2026: the same distractions as the candidate's side). at: [-1] keeps it out of the
    // random draw; her "Stop to eat and sleep" opens it. Tired or starving makes every order that rolls harder.
    { id: 'desk_rest', at: [-1], title: 'Eat and sleep', text: 'The desk can run without you for a few hours.', choices: [
      { id: 'cot', label: 'Sleep on the office cot', fx: { hours: 4, sleep: 'full', say: 'You sleep four hours with the phone by your ear.' } },
      { id: 'go_home', label: 'Go home to eat and sleep', fx: { hours: 6, sleep: 'full', meal: true, say: 'You eat a real meal and sleep six hours in your own bed.' } },
      { id: 'canteen', label: 'Eat in the ministry canteen', fx: { hours: 1, meal: true, say: 'You eat at the canteen with the night shift.' } },
      { id: 'keep_working', label: 'Keep working', fx: {} } ] },
    { id: 'tipster', title: 'A caller wants money', text: 'A man says he drove her this morning. He wants cash before he says where.', choices: [
      { id: 'pay', label: 'Pay him', fx: { hours: 1, roll: { need: 4, win: { lead: 1, say: 'He names the road and the car. It checks out.' }, lose: { false: true, say: 'He names a town. He has never been there.' } } } },
      { id: 'hang_up', label: 'Hang up', fx: {} } ] },
    { id: 'leak', title: 'The minister leaks your lead', text: 'He told a columnist you are looking at {there}. It runs in the morning edition.', choices: [
      { id: 'confirm', label: 'Confirm it on the record', fx: { minister: 1, warn: 1, say: 'The minister likes the headline. So does she.' } },
      { id: 'deny', label: 'Deny it', fx: { minister: -1, say: 'The minister reads your denial in his own paper.' } },
      { id: 'celina_kill', label: 'Have Celina bury the story', needs: 'newsroom', fx: { hours: 1, say: 'Celina gives the columnist a better story for the morning edition. Your lead stays out of the paper, and the minister never hears of it.' } },
      { id: 'spin', label: 'Tell the paper she has crossed', fx: { hours: 1, roll: { need: 3, win: { press: 1, say: 'Her people relax. Someone gets careless on the phone.' }, lose: { minister: -1, say: 'The columnist checks with the border post and prints that too.' } } } } ] },
    { id: 'judge', after: 4, when: [{ ref: 'flag.restriction', op: 'eq', value: true }], title: 'Her lawyers go to the duty judge', text: 'Her lawyers ask the duty judge to suspend the travel ban at the line until a hearing. If he agrees, the post lets the ban slide.', choices: [
      { id: 'wait_judge', label: 'Let the judge decide', fx: { unban: true, say: 'The judge suspends the ban at the line until the hearing, and the post lets it slide.' } },
      { id: 'other_judge', label: 'Argue it before him tonight', fx: { hours: 2, roll: { need: 4, win: { say: 'The judge refuses the lawyers, and the ban stands at the line.' }, lose: { unban: true, say: 'The judge sides with her lawyers, and the post lets the ban slide.' } } } },
      { id: 'paulo_judge', label: 'Have Paulo answer the motion', needs: 'clerk', fx: { hours: 1, say: 'Paulo files the answer before the lawyers finish theirs. The judge refuses them, and the ban stands at the line.' } },
      { id: 'around', label: 'Have the minister call the judge', fx: { minister: -1, warn: 1, say: 'The judge drops the motion. Her lawyers call it irregular on the radio.' } } ] },
    { id: 'sightings', title: 'Three sightings at once', text: 'Callers place her in Pedra Branca, in Salta and on the coast road, all in the same hour.', choices: [
      { id: 'all_three', label: 'Send a patrol to each', fx: { hours: 2, dc: [1, 6], false: true, say: 'Three patrols go out at once, and the desk is stretched thin.' } },
      { id: 'plates', label: 'Check the one that gave plates', fx: { hours: 1, roll: { need: 4, win: { lead: 0, say: 'The plates match a car from her convoy.' }, lose: { false: true, say: 'The plates belong to a dentist.' } } } },
      { id: 'marta_plates', label: "Run the plates through Marta's records", needs: 'plates', fx: { hours: 1, lead: 2, say: 'Marta matches the plates to a car that left the capital on Saturday. The toll records place it, two hours late.' } },
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
      { id: 'break_strike', label: 'Get the trains running', fx: { hours: 2, card: 'rail', say: 'The yardmaster owes you for the overtime.' } },
      { id: 'joana_strike', label: 'Have Joana talk to the union', needs: 'union', fx: { hours: 1, card: 'rail', minister: 1, say: 'Joana settles the strike by supper. The yard crews go back to work and agree to tell you who rides the freight.' } } ] },
    { id: 'photo', title: 'A paper has a photo', text: 'A newspaper has a blurred photo of her at a gas station, and it wants to run it.', choices: [
      { id: 'buy_photo', label: 'Buy it and sit on it', fx: { hours: 1, lead: 4, say: 'The gas station has a sign with a town on it.' } },
      { id: 'run_it', label: 'Let them run it', fx: { press: 2, minister: 1, say: 'Her face is on every screen in the province.' } },
      { id: 'celina_photo', label: "Run it on Celina's station", needs: 'newsroom', fx: { hours: 1, press: 1, lead: 3, say: "Celina's station runs the photo with a number to call. A caller names the gas station's town." } } ] },
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
    { id: 'sergeant', after: 14, title: 'The sergeant is family', text: 'The desk says the sergeant on duty at the border post is married to her cousin. He can let the travel ban slide.', choices: [
      { id: 'replace', label: 'Replace him', fx: { hours: 3, ban: true, say: 'A sergeant from Salta takes the shift. He reads every name and holds to the ban.' } },
      { id: 'watch_him', label: 'Watch him', fx: { hours: 1, roll: { need: 4, win: { lead: 0, say: 'He makes a call from the guardhouse. You hear every word.' }, lose: { unban: true, say: 'He notices the watcher, and he lets the ban slide on his shift.' } } } },
      { id: 'leave_him', label: 'Leave him on duty', fx: { unban: true, say: 'He keeps the shift, and he lets the ban slide.' } },
      { id: 'tomas_shift', label: 'Have Tomás take the shift', needs: 'post_cmd', fx: { hours: 1, ban: true, crossing: 4, say: 'Tomás drives up and stands the shift himself. He holds to the ban and searches every car for four hours.' } } ] },
    { id: 'drone', after: 10, title: 'The air force offers a drone', text: 'A drone can watch from the air for eight hours. The general wants a signature.', choices: [
      { id: 'sign', label: 'Sign for it', fx: { dc: [-1, 8], minister: -1, say: 'The drone goes up. The minister reads about it in the morning.' } },
      { id: 'no_drone', label: 'Decline', fx: {} } ] },
    { id: 'presser', title: 'The minister wants a press conference', text: 'He wants you beside him at 6 p.m. to promise that she will be found by Monday.', choices: [
      { id: 'stand', label: 'Stand beside him', fx: { hours: 2, minister: 1, warn: 1, say: 'Her people watch it twice and change their plans.' } },
      { id: 'send_sosa', label: 'Send the inspector instead', fx: { dc: [1, 4], say: 'The inspector hates cameras. He takes it out on the desk.' } },
      { id: 'skip', label: 'Say you are busy', fx: { minister: -1 } },
      { id: 'celina_brief', label: 'Have Celina write his statement', needs: 'newsroom', fx: { hours: 1, minister: 1, say: 'Celina writes a statement that promises nothing and names no town. The minister reads it well.' } } ] },
    { id: 'tower', after: 6, title: 'A phone touched a tower', text: 'The carrier says one of her family\'s phone numbers pinged a tower an hour ago.', choices: [
      { id: 'tower_now', label: 'Demand the tower now', fx: { hours: 2, roll: { need: 4, win: { lead: 0, say: 'The carrier sends the tower and a map.' }, lose: { warn: 1, say: 'The carrier tells its lawyers, who tell hers.' } } } },
      { id: 'paperwork', label: 'File the paperwork', fx: { lead: 6, say: 'The answer will come through the proper channel.' } },
      { id: 'nadia_tower', label: 'Have Nadia read the tower log', needs: 'exchange', fx: { hours: 1, lead: 2, say: "Nadia reads the tower's log at the exchange. It names the town, two hours after the call." } } ] },
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
      { id: 'celina_beach', label: 'Have Celina run a beach photo', needs: [{ card: 'media' }], fx: { belief: 'away', exposure: -1, say: "Celina's station reads out a listener's sighting of you on the coast, and two papers repeat it." } },
      { id: 'let_it', label: 'Let it stand', fx: { exposure: 2 } } ] },
    { id: 'dog', at: ['residence'], title: 'The dog will not stay', text: 'Your youngest will not leave without the dog. The dog barks at strangers.', choices: [
      { id: 'bring_dog', label: 'Bring the dog', fx: { flag: { dog: true }, trust: { sibling: 1 }, say: 'The dog sleeps across your feet.' } },
      { id: 'leave_dog', label: 'Leave him with the cook', fx: { hours: 1, say: 'Your youngest cries in the back seat for an hour.' } } ] },
    { id: 'summons', at: ['residence'], when: [{ ref: 'flag.restriction', op: 'eq', value: false }], title: 'A court officer at the gate', text: 'He has a summons and orders to hand it to you in person.', choices: [
      { id: 'accept', label: 'Take the summons', fx: { ban: true, say: 'The court now has your signature, and it sends the travel ban to every post.' } },
      { id: 'lawyer', label: "Send Gianlūka's lawyer", needs: [{ card: 'influence' }], fx: { hours: 2, trust: { aide: -1 }, say: 'The lawyer argues at the gate for two hours.' } },
      { id: 'paulo_summons', label: 'Let Paulo take the summons', needs: [{ card: 'court' }], fx: { hours: 1, say: "Paulo signs for the summons and files a motion against it. The order waits in the clerk's office, and the travel ban does not go out." } },
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
      { id: 'drop', label: 'Drop her at the next town', fx: { hours: 1 } },
      { id: 'celina_reporter', label: 'Give her to Celina', needs: [{ card: 'media' }], fx: { belief: 'away', say: 'Celina offers the reporter a job and a better story. Her story puts you on the coast road, and your face is not in it.' } } ] },
    { id: 'flood', at: ['road'], title: 'Flash flood at the bridge', text: 'The river is over the road. Trucks are turning back.', choices: [
      { id: 'wait_water', label: 'Wait for the water', fx: { hours: 4, rest: true } },
      { id: 'ford', label: 'Drive through it', fx: { roll: { need: 4, win: { exposure: -1, say: 'The water comes up to the doors, and then the road is dry.' }, lose: { hours: 2, exposure: 1, lose: 'random', say: 'The engine floods. You leave something in the car.' } } } },
      { id: 'ferry', label: "Pay a smuggler's ferry", fx: { hours: 1, exposure: 1, say: 'The ferryman knows who you are and says nothing.' } },
      { id: 'marta_ford', label: 'Let Marta drive through', needs: [{ card: 'mechanic' }], fx: { hours: 1, say: 'Marta seals the engine with tape and drives through slowly. The car comes out the other side with everything in it.' } } ] },
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
      { id: 'cellar', label: 'Hide in the wine cellar', fx: { hours: 4, rest: true } },
      { id: 'slip', label: 'Lie low nearby for an hour', fx: { roll: { need: 3, win: { hours: 1 }, lose: { hold: 1 } } } } ] },
    // Salta
    { id: 'strike', at: ['salta'], title: 'The rail yard is on strike', text: 'The union has stopped work in the yard, and the strikers watch everyone who comes near the freight.', choices: [
      { id: 'wait_strike', label: 'Wait it out', fx: { hours: 8, rest: true } },
      { id: 'joana_strike', label: 'Have Joana talk to the strikers', needs: [{ card: 'union' }], fx: { hours: 1, say: 'Joana talks to the strike committee for an hour. The pickets let you through and tell nobody.' } },
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
      { id: 'next_shift', label: 'Wait for the next shift', fx: { hours: 3, rest: true } } ] },
    { id: 'pilgrims', at: ['border'], title: 'Pilgrims at the barrier', text: 'The post is full of 40 pilgrims and their luggage. The guards are tired.', choices: [
      { id: 'queue_pilgrims', label: 'Join the queue', fx: { mod: -1 } },
      { id: 'wait_pilgrims', label: 'Wait for them to clear', fx: { hours: 2, rest: true } } ] },
    { id: 'blizzard', at: ['border'], title: 'A blizzard over the pass', text: "Snow is piling up at the post, and a smugglers' path runs over the ridge.", choices: [
      { id: 'storm', label: 'Wait out the storm', fx: { hours: 6, skipEnemy: true, rest: true, say: 'You spend six hours in the snow, and the storm costs the police their next move.' } },
      { id: 'ridge', label: 'Walk the ridge path', fx: { roll: { need: 4, win: { advance: true, say: 'You come down into Costamar with no stamp at all.' }, lose: { hours: 3, exposure: 3, say: 'You turn back half frozen. The post saw your flashlight.' } } } },
      { id: 'tomas_ridge', label: 'Follow Tomás over the ridge', needs: [{ card: 'border' }], fx: { roll: { need: 3, win: { advance: true, say: 'Tomás walks the path the patrols use and knows when they turn back. You come down into Costamar with no stamp at all.' }, lose: { hours: 3, exposure: 2, say: 'The patrol is late tonight, and Tomás turns you back before it sees you.' } } } } ] },
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
      { id: 'other_pilot', label: 'Find another pilot', fx: { hours: 4, rest: true } } ] },
    { id: 'overflight', at: ['airfield'], title: 'No overflight permit', text: 'The refuel stop will not let the jet cross. The long route adds hours.', choices: [
      { id: 'long', label: 'Take the long route', fx: { hours: 3, rest: true } },
      { id: 'short', label: 'File the short route', fx: { mod: 1, say: 'The pilot files the short route anyway, so the tower will look harder when you try to leave.' } } ] },
    { id: 'goodbye_post', at: ['airfield'], title: 'A goodbye online', text: 'Your daughter posted a photo from the airfield lounge. It is everywhere.', choices: [
      { id: 'takedown', label: 'Get it taken down', fx: { roll: { need: 4, win: {}, lose: { exposure: 3 } } } },
      { id: 'stand', label: 'Let it stand', fx: { exposure: 2, flag: { asked: true }, say: "Valdória asks Costamar to hold you. The police here can now stop you, and your takeoff is harder until Costamar's minister knows you are coming." } } ] },
    { id: 'rival_deal', at: ['airfield', 'border'], title: 'The president calls', text: 'Concede on camera, come home, and the case quietly closes.', choices: [
      { id: 'take_deal', label: 'Take the deal', fx: { end: { kind: 'deal', reason: 'You concede on camera at noon. The case closes quietly. The party never forgives you.' } } },
      { id: 'hang_up', label: 'Hang up', fx: {} } ] },
    // owner, Nov. 2, 2026: things happen while you wait, and some open another way through
    { id: 'night_bus', at: ['road'], title: 'A night bus south', text: 'The night bus to Nova Trentô leaves in an hour, and the driver takes cash without looking up.', choices: [
      { id: 'take_bus', label: 'Take the bus', fx: { roll: { need: 3, win: { advance: true, say: 'You sleep against the window, and the bus drops you at the colônia gate at dawn.' }, lose: { exposure: 2, say: 'A passenger recognizes you and makes a call from the first stop.' } } } },
      { id: 'skip_bus', label: 'Let it go', fx: {} } ] },
    { id: 'wine_truck', at: ['colonia'], title: 'A wine truck to Salta', text: 'A wine truck leaves for Salta within the hour, and there is room under the tarp.', choices: [
      { id: 'ride_tarp', label: 'Ride under the tarp', fx: { roll: { need: 3, win: { advance: true, say: 'You ride three hours between the barrels and climb out in the Salta yard.' }, lose: { hours: 2, exposure: 1, say: 'The truck is stopped at a checkpoint, and you walk back to the colônia through the vines.' } } } },
      { id: 'stay_put', label: 'Stay at Nonā Rosa\'s', fx: {} } ] },
    { id: 'early_freight', at: ['salta'], title: 'The freight leaves early', text: 'The yard moved tonight\'s freight up, and it pulls out in 20 minutes.', choices: [
      { id: 'run_for_it', label: 'Run for the train', fx: { roll: { need: 4, win: { advance: true, say: 'You catch the last car as it clears the yard.' }, lose: { exposure: 2, say: 'A guard sees you running along the train, and the yard office rings the police.' } } } },
      { id: 'let_it_go', label: 'Wait for the next one', fx: {} } ] },
    { id: 'card_game', at: ['salta'], title: 'A card game in the shed', text: 'The night crew plays cards in the tool shed and talks about who rides the freight.', choices: [
      { id: 'join_game', label: 'Join the game', fx: { hours: 2, roll: { need: 3, win: { card: 'yard_walk', say: 'You lose a little money on purpose, and a brakeman offers to walk you past the yard office.' }, lose: { exposure: 1, say: 'One of the players knows your face from the news.' } } } },
      { id: 'stay_away', label: 'Stay away', fx: {} } ] },
    { id: 'smuggler_gap', at: ['border'], title: 'A smuggler knows a gap', text: 'A smuggler offers to walk you around the posts tonight for cash.', choices: [
      { id: 'pay_smuggler', label: 'Pay the smuggler', fx: { roll: { need: 4, win: { advance: true, say: 'You walk four hours through the brush and come out on the Costamaran road.' }, lose: { hours: 2, exposure: 3, say: 'A patrol catches the smuggler, and you run back to the car.' } } } },
      { id: 'no_smuggler', label: 'Say no', fx: {} } ] },
    { id: 'night_mechanic', at: ['airfield'], title: 'A mechanic offers a shortcut', text: 'A mechanic says he can have your jet ready tonight if you pay him in cash.', choices: [
      { id: 'pay_mechanic', label: 'Pay the mechanic', fx: { roll: { need: 4, win: { stage: { aircraft: 1 }, exposure: 1, say: 'He works through the night, and the jet is one step closer to ready.' }, lose: { exposure: 2, say: 'He takes the money and tells the tower who paid it.' } } } },
      { id: 'no_mechanic', label: 'Say no', fx: {} } ] },
    { id: 'consul', at: ['airfield'], title: 'A consul with a stamp', text: 'An honorary consul in Portalba can stamp an entry visa tonight for a fee.', choices: [
      { id: 'pay_consul', label: 'Pay the consul', fx: { hours: 1, roll: { need: 4, win: { stage: { permission: 1 }, say: 'The consul stamps your papers, and your visa is one step closer.' }, lose: { exposure: 1, say: 'The consul takes the fee and calls Valdória\'s embassy.' } } } },
      { id: 'no_consul', label: 'Say no', fx: {} } ] },
    { id: 'customs_sweep', at: ['airfield'], title: 'Customs searches the hangars', text: 'Two customs officers are checking every hangar on the apron.', choices: [
      { id: 'fuel_truck', label: 'Hide in the fuel truck', fx: { roll: { need: 3, win: { say: 'The officers walk past the truck twice.' }, lose: { exposure: 2, say: 'An officer opens the cab door and writes down your name.' } } } },
      { id: 'leave_field', label: 'Leave the airfield for two hours', fx: { hours: 2, rest: true, say: 'You wait in a café across the road until the officers leave.' } } ] },
    // companions' own moments (owner, Nov. 5, 2026, issue #50): each asks something of you once; saying no costs their help at that stop
    { id: 'harbor_storm', at: ['harbor'], title: 'A storm off the coast', text: 'The harbor master has closed the port, and no boat leaves until the wind drops.', choices: [
      { id: 'storm_wait', label: 'Wait out the storm', fx: { hours: 3, say: 'The wind drops after three hours, and the boats go back to work.' } },
      { id: 'storm_go', label: 'Pay a skipper to go anyway', fx: { roll: { need: 4, win: { advance: true, say: 'The boat rolls for hours, and you wade ashore below the Punta Marēa crossing.' }, lose: { exposure: 2, hours: 2, say: 'The boat turns back at the breakwater, and the whole pier watches you climb off.' } } } } ] },
    { id: 'harbor_check', at: ['harbor'], title: 'The harbor police check the piers', text: 'Two officers are walking the piers and asking every crew for papers.', choices: [
      { id: 'check_hide', label: 'Hide in the ice house', fx: { hours: 2, roll: { need: 3, win: { say: 'You wait two cold hours in the ice house, and the officers walk past the door.' }, lose: { exposure: 2, say: 'The ice house manager opens the door for the officers and points at you.' } } } },
      { id: 'check_walk', label: 'Walk into town', fx: { hours: 1, exposure: 1, say: 'You leave the waterfront, and a shopkeeper watches you go.' } } ] },
    { id: 'bruno_cousin', at: ['road', 'colonia'], when: [{ ref: 'companion', op: 'eq', value: 'bruno' }], title: "Bruno's cousin is stuck", text: "Bruno's cousin broke down an hour back with a load of melons, and Bruno wants to go and help.", choices: [
      { id: 'bruno_cousin_yes', label: "Go back with Bruno", fx: { hours: 2, exposure: -1, say: "You push the truck out of a ditch together, and the cousin promises to tell nobody he saw you." } },
      { id: 'bruno_cousin_no', label: "Ask Bruno to stay", fx: { mateoff: true, say: "Bruno stays, but he sulks, and he is no help to you here." } } ] },
    { id: 'clara_aunt', at: ['border'], when: [{ ref: 'companion', op: 'eq', value: 'clara' }], title: "Clara's aunt works the post", text: "Clara's aunt works at one of the posts and could vouch for you, but people will see Clara with you.", choices: [
      { id: 'clara_aunt_yes', label: "Let Clara bring her aunt", fx: { exposure: 1, mod: -1, say: "The aunt walks you to the barrier and talks to the guards by name." } },
      { id: 'clara_aunt_no', label: "Keep Clara out of sight", fx: { mateoff: true, say: "Clara stays in the car, and she can't help you at this stop." } } ] },
    { id: 'rita_crew', at: ['airfield'], when: [{ ref: 'companion', op: 'eq', value: 'rita' }], title: "Rita's old crew wants cash", text: "Rita's old crew can ready your jet tonight, but they want cash up front, and cash gets noticed.", choices: [
      { id: 'rita_crew_yes', label: "Pay Rita's crew", fx: { stage: { aircraft: 1 }, exposure: 1, say: "The crew works through the night. People on the apron see who paid them." } },
      { id: 'rita_crew_no', label: "Say no", fx: { mateoff: true, say: "Rita doesn't argue, but she stops asking the crews for favors here." } } ] },
    { id: 'marta_pump', at: ['road', 'colonia', 'salta'], when: [{ ref: 'companion', op: 'eq', value: 'marta' }], title: "The fuel pump is failing", text: "Marta says the car's fuel pump is going, and she wants two hours at a garage to fix it.", choices: [
      { id: 'marta_pump_yes', label: "Give Marta two hours", fx: { hours: 2, say: "Marta fixes the pump and changes the plates while she is at it." } },
      { id: 'marta_pump_no', label: "Drive on as it is", fx: { mateoff: true, say: "The car limps on, and Marta can't make it look ordinary here." } } ] },
    { id: 'ines_fever', at: null, when: [{ ref: 'companion', op: 'eq', value: 'ines' }], title: "A child with a fever", text: "A woman at the roadside has a child with a high fever, and Inês wants to stop.", choices: [
      { id: 'ines_fever_yes', label: "Let Inês help", fx: { hours: 2, exposure: -1, say: "Inês brings the fever down, and the family swears they never saw you." } },
      { id: 'ines_fever_no', label: "Keep going", fx: { mateoff: true, say: "Inês goes quiet and won't help you here." } } ] },
    { id: 'paulo_favor', at: ['residence', 'road', 'colonia'], when: [{ ref: 'companion', op: 'eq', value: 'paulo' }], title: "Paulo's old supervisor calls", text: "Paulo's old supervisor at the court will lose your file for a day if Paulo owes him a favor.", choices: [
      { id: 'paulo_favor_yes', label: "Let Paulo owe the favor", fx: { exposure: -1, say: "Your file goes to the bottom of the pile, and the supervisor knows Paulo is with you." } },
      { id: 'paulo_favor_no', label: "Tell Paulo to hang up", fx: { mateoff: true, say: "Paulo hangs up, and he won't work the court's phones for you here." } } ] },
    { id: 'celina_exclusive', at: null, when: [{ ref: 'companion', op: 'eq', value: 'celina' }], title: "Celina's station wants you", text: "Celina's station wants a short interview for the morning news, recorded tonight.", choices: [
      { id: 'celina_exclusive_yes', label: "Give a short interview", fx: { belief: 'away', exposure: 1, say: "Celina edits it to sound like you are already abroad." } },
      { id: 'celina_exclusive_no', label: "Refuse", fx: { mateoff: true, say: "Celina is hurt, and she won't call her station for you here." } } ] },
    { id: 'tomas_drink', at: ['border'], when: [{ ref: 'companion', op: 'eq', value: 'tomas' }], title: "Tomás meets an old colleague", text: "A sergeant who served under Tomás offers to wave you through, if Tomás stays an hour for a drink.", choices: [
      { id: 'tomas_drink_yes', label: "Let Tomás have his drink", fx: { hours: 1, mod: -1, say: "The sergeant tells the night shift to look the other way." } },
      { id: 'tomas_drink_no', label: "Keep moving", fx: { mateoff: true, say: "Tomás comes along, but the sergeant takes it badly, and Tomás is no help at this post." } } ] },
    { id: 'nadia_click', at: null, when: [{ ref: 'companion', op: 'eq', value: 'nadia' }], title: "Nadia hears a click", text: "Nadia hears a click on {sib}'s line and wants an hour to move the calls to another exchange.", choices: [
      { id: 'nadia_click_yes', label: "Give Nadia the hour", fx: { hours: 1, exposure: -1, say: "Nadia moves the line, and the click is gone." } },
      { id: 'nadia_click_no', label: "There is no time", fx: { mateoff: true, say: "Nadia leaves the line as it is, and she can't hide your calls here." } } ] },
    { id: 'emilio_booking', at: ['road', 'colonia', 'salta'], when: [{ ref: 'companion', op: 'eq', value: 'emilio' }], title: "Someone asked about the booking", text: "A hotel called Emilio, because someone asked who the guest under the other name really is.", choices: [
      { id: 'emilio_booking_yes', label: "Let Emilio move you", fx: { hours: 1, say: "Emilio moves you to a guesthouse his cousin runs before anyone comes back." } },
      { id: 'emilio_booking_no', label: "Ignore it", fx: { mateoff: true, say: "Emilio won't risk another booking at this stop." } } ] },
    { id: 'joana_meeting', at: ['salta'], when: [{ ref: 'companion', op: 'eq', value: 'joana' }], title: "The union meets tonight", text: "The union meets at the depot tonight, and Joana is expected to speak.", choices: [
      { id: 'joana_meeting_yes', label: "Let Joana go", fx: { hours: 2, mod: -1, say: "Joana comes back with a yard crew that owes her." } },
      { id: 'joana_meeting_no', label: "Keep Joana with you", fx: { mateoff: true, say: "Joana stays, but the crews hear she skipped the meeting and won't help here." } } ] },
    // anywhere
    { id: 'too_soon', at: null, title: 'Your family spoke too soon', text: '{sib} told reporters you already landed abroad. You are still at {here}.', choices: [
      { id: 'let_run', label: 'Let the story run', fx: { belief: 'away', exposure: -2, flag: { dark: true }, say: 'Your own people believe it too, and every reply you ask for now comes two hours later.' } },
      { id: 'correct', label: 'Correct it', fx: { exposure: 1 } },
      { id: 'celina_story', label: 'Have Celina keep the story going', needs: [{ card: 'media' }], fx: { belief: 'away', exposure: -1, say: "Celina's station reads the story every hour. Your own people know the truth, so their replies come on time." } } ] },
    { id: 'bodyguard', at: null, title: 'An old bodyguard wants money', text: 'He knows your route. He will sell it tonight unless you pay.', choices: [
      { id: 'pay_guard', label: 'Pay him', fx: { exposure: 1 } },
      { id: 'bluff', label: 'Call his bluff', fx: { roll: { need: 3, win: { say: 'He never calls anyone.' }, lose: { belief: 'here', exposure: 3, say: 'He calls the police, who now search where you are.' } } } },
      { id: 'gianluka', label: 'Have Gianlūka handle him', needs: [{ card: 'influence' }], fx: { trust: { aide: -1 } } } ] },
    { id: 'coffee', at: ['residence', 'road', 'colonia', 'salta'], title: 'A police car pulls in beside you', text: 'Two officers get out for coffee. One glances at your window.', choices: [
      { id: 'sit', label: 'Sit still', fx: { roll: { need: 4, win: {}, lose: { hold: 1 } } } },
      { id: 'drive', label: 'Drive away now', fx: { exposure: 1 } } ] },
    { id: 'hearing', at: null, when: [{ ref: 'clock.hoursLeft', op: 'gte', value: 43 } /* before hour 30 */, { ref: 'flag.restriction', op: 'eq', value: false }], title: 'The hearing moves up', text: 'The court moved your hearing forward, and it wants the travel ban at every post today.', choices: [
      { id: 'noted', label: 'Keep going', fx: { ban: true, say: 'The court sends the travel ban to every post.' } },
      { id: 'paulo_hearing', label: 'Have Paulo slow the order', needs: [{ card: 'court' }], fx: { hours: 1, say: "Paulo calls an old colleague in the clerk's office. The order goes into the outbox, and the travel ban does not go out." } },
      { id: 'stall', label: 'Have Gianlūka ask for a delay', needs: [{ card: 'influence' }], fx: { trust: { aide: -1 }, exposure: 1, say: 'The clerk holds the court\'s order back. Gianlūka adds it to what you owe him, and the court knows you are still in reach.' } } ] },
    { id: 'blackout', at: null, title: 'The power is out', text: "A storm knocks out the power, and the police can't reach each other.", choices: [
      { id: 'dark', label: 'Move before the power returns', fx: { exposure: -1, skipEnemy: true } },
      { id: 'sit', label: 'Wait until the power returns', fx: { hours: 2, exposure: -1, rest: true, say: 'You wait two hours in the dark. Nobody comes to the door.' } } ] },
  ];
  // ---- Food and sleep (owner, Nov. 2, 2026: build the lodging system). "Stop to eat and sleep" opens the screen for the
  // stop you are at. fx: hours, meal (everyone eats), sleep ('full' | 'car': a few hours in the car), stay ('room': a
  // register with your name in it | 'emilio': a room under another name), hide (a police search here finds nobody while
  // you stay), exposure, rest (hours out of sight: with Inês, no attention from a search here), say. A choice with no fx
  // closes the screen. needs: a card kind, as on news choices.
  const LODGING = [
    { id: 'lodge_residence', at: ['residence'], title: 'Eat and sleep at home', text: 'You are still in your own house, with the watch outside. The kitchen is full, and your bed is upstairs.', choices: [
      { id: 'home_sleep', label: 'Sleep in your own bed', fx: { hours: 6, sleep: 'full', meal: true, rest: true, say: 'You eat, and everyone sleeps six hours behind drawn curtains.' } },
      { id: 'home_meal', label: 'Eat in the kitchen', fx: { hours: 1, meal: true, rest: true, say: 'The cook feeds everyone before she goes home.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
    { id: 'lodge_road', at: ['road'], title: 'A place to stop in Pedra Branca', text: 'The motel by the river asks every guest for a name and a passport. The truck stop sells hot food to anyone who stands in line.', choices: [
      { id: 'emilio_room', label: "Take Emilio's room", needs: [{ card: 'lodging' }], fx: { hours: 6, sleep: 'full', meal: true, stay: 'emilio', hide: true, rest: true, exposure: -1, say: 'Emilio booked a room over a garage under another guest\'s name. Everyone eats and sleeps six hours, and nobody asks who you are.' } },
      { id: 'motel', label: 'Take a room at the motel', fx: { hours: 6, sleep: 'full', meal: true, stay: 'room', rest: true, exposure: 1, say: 'The clerk copies your passport into the register. Everyone eats and sleeps six hours.' } },
      { id: 'car_sleep', label: 'Sleep in the car', fx: { hours: 4, sleep: 'car', rest: true, say: 'You park behind a grain store and sleep four hours sitting up.' } },
      { id: 'ines_food', label: 'Have Inês buy food', needs: [{ card: 'care' }], fx: { hours: 1, meal: true, rest: true, say: 'Inês goes into the truck stop alone and comes back with food for everyone.' } },
      { id: 'truck_stop', label: 'Eat at the truck stop', fx: { hours: 1, meal: true, exposure: 1, say: 'You eat at the counter. The man beside you looks twice at your face.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
    { id: 'lodge_colonia', at: ['colonia'], title: "Nonā Rosa's house", text: 'Nonā Rosa has a spare room and a long table, and nobody in the colônia talks to the police.', choices: [
      { id: 'nona_room', label: "Sleep in Nonā Rosa's spare room", fx: { hours: 6, sleep: 'full', meal: true, rest: true, exposure: -2, say: 'Nonā Rosa feeds everyone, and nobody knocks for six hours.' } },
      { id: 'emilio_room', label: "Take Emilio's room at the inn", needs: [{ card: 'lodging' }], fx: { hours: 6, sleep: 'full', meal: true, stay: 'emilio', hide: true, rest: true, exposure: -1, say: 'Emilio booked a room at the inn under another guest\'s name. The innkeeper calls you by that name all night.' } },
      { id: 'nona_meal', label: "Eat at Nonā Rosa's table", fx: { hours: 1, meal: true, rest: true, say: 'Nonā Rosa serves soup and bread and asks nothing.' } },
      { id: 'car_sleep', label: 'Sleep in the car', fx: { hours: 4, sleep: 'car', rest: true, say: 'You sleep four hours in the car behind the cooperative shed.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
    { id: 'lodge_salta', at: ['salta'], title: 'A place to stop in Salta', text: 'The railway hotel takes cash and writes every name in its book. The yard canteen feeds the night shift.', choices: [
      { id: 'emilio_room', label: "Take Emilio's room", needs: [{ card: 'lodging' }], fx: { hours: 6, sleep: 'full', meal: true, stay: 'emilio', hide: true, rest: true, exposure: -1, say: 'Emilio booked a room at the railway hotel under another guest\'s name. The night clerk never asks to see a passport.' } },
      { id: 'rail_hotel', label: 'Take a railway hotel room', fx: { hours: 6, sleep: 'full', meal: true, stay: 'room', rest: true, exposure: 1, say: 'The clerk writes your name in the book. Everyone eats and sleeps six hours.' } },
      { id: 'car_sleep', label: 'Sleep in the car', fx: { hours: 4, sleep: 'car', rest: true, say: 'You sleep four hours in the car at the end of the freight sidings.' } },
      { id: 'ines_food', label: 'Have Inês buy food', needs: [{ card: 'care' }], fx: { hours: 1, meal: true, rest: true, say: 'Inês brings food back from the canteen in a cardboard box.' } },
      { id: 'canteen', label: 'Eat at the yard canteen', fx: { hours: 1, meal: true, exposure: 1, say: 'You eat with the night shift. One of the brakemen knows your face from the posters.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
    { id: 'lodge_harbor', at: ['harbor'], title: 'A place to stop in Barra Velha', text: 'The seamen\'s hostel takes a name and a passport. The fish market cooks for anyone who stands in line.', choices: [
      { id: 'emilio_room', label: "Take Emilio's room", needs: [{ card: 'lodging' }], fx: { hours: 6, sleep: 'full', meal: true, stay: 'emilio', hide: true, rest: true, exposure: -1, say: 'Emilio booked a room above a chandler\'s shop under another guest\'s name. Everyone eats and sleeps six hours.' } },
      { id: 'hostel_harbor', label: "Take a seamen's hostel bunk", fx: { hours: 6, sleep: 'full', meal: true, stay: 'room', rest: true, exposure: 1, say: 'The warden copies your passport into his book. Everyone eats and sleeps six hours.' } },
      { id: 'boat_sleep', label: 'Sleep in a moored boat', fx: { hours: 4, sleep: 'car', rest: true, say: 'A fisherman lets you sleep four hours under the nets in his boat.' } },
      { id: 'ines_food', label: 'Have Inês buy food', needs: [{ card: 'care' }], fx: { hours: 1, meal: true, rest: true, say: 'Inês buys fried fish at the market and brings it to the pier.' } },
      { id: 'fish_market', label: 'Eat at the fish market', fx: { hours: 1, meal: true, exposure: 1, say: 'You eat at a market stall. The cook stares at your face and then at the newspaper.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
    { id: 'lodge_border', at: ['border'], title: 'A place to stop at the line', text: 'The drivers\' hostel by the posts rents bunks to anyone with a name and a passport.', choices: [
      { id: 'hostel', label: "Sleep at the drivers' hostel", fx: { hours: 5, sleep: 'full', meal: true, stay: 'room', rest: true, exposure: 1, say: 'The warden copies your passport into his book. Everyone eats and sleeps five hours.' } },
      { id: 'car_sleep', label: 'Sleep in the car', fx: { hours: 4, sleep: 'car', rest: true, say: 'You sleep four hours in the car with the engine off and the windows white with frost.' } },
      { id: 'ines_food', label: 'Have Inês buy food', needs: [{ card: 'care' }], fx: { hours: 1, meal: true, rest: true, say: 'Inês buys bread and soup at the hostel kitchen and brings it to the car.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
    { id: 'lodge_airfield', at: ['airfield'], title: 'The crew lounge at Portalba', text: 'The charter crews have a lounge behind the hangar with bunks and a kitchen.', choices: [
      { id: 'lounge', label: 'Rest in the crew lounge', fx: { hours: 4, sleep: 'full', meal: true, rest: true, say: 'Everyone eats and sleeps four hours on the crew bunks.' } },
      { id: 'keep_going', label: 'Keep going', fx: {} } ] },
  ];
  // Too long without food or sleep makes the youngest sick, once at each stop. A clinic visit goes on a clinic's record.
  const SICK = { id: 'sick', title: 'Your youngest is sick', text: 'Too many hours without food or sleep have caught up with your youngest. She has a fever and cannot keep water down.', choices: [
    { id: 'ines_treat', label: 'Let Inês treat her', needs: [{ card: 'care' }], fx: { hours: 1, sleep: 'car', meal: true, say: 'Inês cools the fever, makes everyone eat, and keeps your youngest asleep across your lap.' } },
    { id: 'clinic', label: 'Take her to a clinic', fx: { hours: 2, clinic: true, meal: true, exposure: 1, say: 'A doctor sees her in 20 minutes and writes her name in the clinic book. The fever breaks by morning.' } },
    { id: 'push_on', label: 'Keep going with her sick', fx: { mod: 1, say: 'She cries in the back seat, and every move here is harder while you look after her.' } } ] };
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
      { id: 'climb', label: 'Climb out at the shift change', fx: { roll: { need: 5, decoy: 1, win: { hours: 2, exposure: 4, rung: 2, say: 'You go over the back wall and into a car that was not there yesterday.' }, lose: { end: { reason: 'The officers catch you climbing over the back wall, and your hearing is on Monday.' } } } } },
      { id: 'accept', label: 'Accept it', fx: { end: { reason: 'You stay inside with the officers at the door, and your hearing is on Monday.' } } } ] },
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
  return { HARBOR, LODGING, SICK, DICE, DESTS, PLACES, POSTS, EVENTS, HOLDS, RUMORS, CHARACTERS, PEOPLE, ENEMY, ARRANGEMENTS, CARDS, LEVELS, STAGE_LINES, ENEMY_ACTIONS, VALDORIA, ESMERALDA, GOV, GOV_CARDS, GOV_ORDERS, COMPANIONS, GOV_EVENTS };
})();
if (typeof module !== 'undefined') module.exports = Data;
