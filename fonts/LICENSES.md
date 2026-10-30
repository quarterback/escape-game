# Fonts in this repository

All are the owner's licensed webfont purchases, embedded into `index.html` at build time as base64 `@font-face` rules so the game makes no network requests.

## Kurdis Regular and Kurdis Condensed (That That, via YouWorkForThem)

The kits' CSS headers, which the licence requires to remain visible in the CSS (the build emits them beside the `@font-face` rules):

```
/*
Font: 		Kurdis
Style: 		Regular
URL: 		https://youworkforthem.com/font/T20147/kurdis-font-family
Foundry: 	That That
Foundry: 	https://youworkforthem.com/designer/1514/that-that
Copyright:	
Version: 	18
Created:	April 07, 2026
License: 	https://www.youworkforthem.com/font-license 
License: 	The WebFont(s) listed in this document must follow the YouWorkForThem
			WebFont license rules. All other parties are strictly restricted 
			from using the WebFonts(s) listed without a purchased license. 
			All details above must always remain unaltered and visible in your CSS.
*/

/*
Font: 		Kurdis Condensed
Style: 		Regular
URL: 		https://youworkforthem.com/font/T20147/kurdis-font-family
Foundry: 	That That
Foundry: 	https://youworkforthem.com/designer/1514/that-that
Copyright:	
Version: 	18
Created:	April 07, 2026
License: 	https://www.youworkforthem.com/font-license 
License: 	The WebFont(s) listed in this document must follow the YouWorkForThem
			WebFont license rules. All other parties are strictly restricted 
			from using the WebFonts(s) listed without a purchased license. 
			All details above must always remain unaltered and visible in your CSS.
*/
```

## Little Grandad Fat, Embro Regular, Embro Bold

Webfont kits purchased by the owner (`*-webfont-full`). Embedded in WOFF as supplied.

## Active typography

The owner selected Little Grandad Fat for the Coalition title and GC North Sans
Regular/SemiBold for headings, reading and controls. Overbit Regular is limited
to the clock and compact numeric action details.
GC North Sans lacks some macrons; Arial/sans-serif supplies missing characters.

The GC North Sans and Overbit WOFF2 files come from the owner's supplied webfont
kits. Their original headers are stored in the matching `*.license.css` files
and emitted unaltered beside the embedded font-face rules.

The earlier faces remain stored here, but the build only embeds active faces.
