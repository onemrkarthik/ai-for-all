/**
 * Kitchen Style Guides
 *
 * AI-generated educational content for each kitchen design style.
 * Each guide covers all major facets of a kitchen remodel.
 */

export interface StyleFacet {
  title: string;
  description: string;
  tips: string[];
}

export interface StyleGuide {
  name: string;
  slug: string;
  tagline: string;
  overview: string;
  heroImage?: string;
  facets: {
    layout: StyleFacet;
    cabinetFinish: StyleFacet;
    countertop: StyleFacet;
    backsplash: StyleFacet;
    flooring: StyleFacet;
    appliances: StyleFacet;
    colorPalette: StyleFacet;
    lighting: StyleFacet;
  };
}

export const STYLE_GUIDES: Record<string, StyleGuide> = {
  modern: {
    name: 'Modern',
    slug: 'modern',
    tagline: 'Clean lines, minimal ornamentation, and functional beauty',
    overview: `Modern kitchen design emerged in the early 20th century, emphasizing simplicity, clean lines, and the honest use of materials. A modern kitchen strips away unnecessary ornamentation to create a sleek, uncluttered space where form follows function. This style celebrates technological innovation, geometric shapes, and a harmonious balance between aesthetics and practicality. The result is a kitchen that feels fresh, sophisticated, and effortlessly elegant.`,
    facets: {
      layout: {
        title: 'Layout',
        description: 'Modern kitchens favor open, flowing layouts that maximize efficiency and create visual continuity with adjacent living spaces.',
        tips: [
          'Consider an open concept design that connects the kitchen to living and dining areas',
          'Prioritize the work triangle (sink, stove, refrigerator) for optimal workflow',
          'Include a large island for prep work, casual dining, and social interaction',
          'Minimize upper cabinets to create an airy, open feel',
          'Incorporate hidden storage solutions to maintain clean sightlines'
        ]
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Flat-panel and slab door styles define modern cabinetry, featuring handleless designs and high-gloss or matte finishes.',
        tips: [
          'Choose flat-panel (slab) cabinet doors for the quintessential modern look',
          'Opt for handleless cabinets with push-to-open mechanisms or integrated pulls',
          'Consider high-gloss lacquer finishes for a sleek, reflective surface',
          'Matte finishes offer a softer modern aesthetic and hide fingerprints better',
          'Two-tone cabinets (upper and lower in contrasting colors) add visual interest'
        ]
      },
      countertop: {
        title: 'Countertop Material',
        description: 'Modern countertops emphasize seamless surfaces and engineered materials that combine beauty with durability.',
        tips: [
          'Quartz is ideal for its consistency, durability, and low maintenance',
          'Consider ultra-compact surfaces like Dekton for a cutting-edge look',
          'Waterfall edges (countertop continuing down cabinet sides) are distinctly modern',
          'Choose minimal or no visible seams for a continuous appearance',
          'Neutral tones (white, gray, black) maintain the modern aesthetic'
        ]
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Modern backsplashes favor large-format tiles or continuous surfaces that minimize grout lines and visual clutter.',
        tips: [
          'Large-format porcelain tiles create fewer grout lines and a cleaner look',
          'Consider extending the countertop material up the wall for seamless design',
          'Glass backsplashes offer a sleek, easy-to-clean surface',
          'Geometric patterns in neutral tones add subtle visual interest',
          'Full-height backsplashes (counter to ceiling) make a dramatic statement'
        ]
      },
      flooring: {
        title: 'Flooring',
        description: 'Modern flooring choices emphasize clean lines, large formats, and materials that flow seamlessly throughout open floor plans.',
        tips: [
          'Large-format tiles (24x24 or larger) reduce grout lines and create continuity',
          'Polished concrete is authentically modern and incredibly durable',
          'Wide-plank hardwood in gray or natural tones complements modern design',
          'Consider the same flooring throughout open living areas for visual flow',
          'Matte finishes are preferred over high-gloss for a sophisticated look'
        ]
      },
      appliances: {
        title: 'Appliances',
        description: 'Modern kitchens integrate appliances seamlessly into the cabinetry or feature them as sculptural design elements.',
        tips: [
          'Panel-ready appliances disappear into cabinetry for a seamless look',
          'Stainless steel remains a modern classic for a professional appearance',
          'Consider built-in coffee systems and speed ovens for modern functionality',
          'Induction cooktops offer sleek flat surfaces and precise temperature control',
          'Smart appliances with clean interfaces align with modern sensibilities'
        ]
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Modern kitchens typically feature a restrained palette of neutrals with strategic accent colors.',
        tips: [
          'White and gray form the foundation of most modern kitchen palettes',
          'Black accents add drama and define architectural elements',
          'Introduce warmth through natural wood tones in limited applications',
          'A single bold accent color can create a focal point without overwhelming',
          'Maintain consistency—limit your palette to 2-3 main colors'
        ]
      },
      lighting: {
        title: 'Lighting',
        description: 'Modern lighting serves as both functional illumination and sculptural art, featuring geometric shapes and innovative fixtures.',
        tips: [
          'Recessed lighting provides clean, unobtrusive ambient illumination',
          'Geometric pendant lights over islands become sculptural focal points',
          'LED strip lighting under cabinets and in toe kicks creates floating effects',
          'Consider linear suspension lights for a contemporary statement',
          'Dimmer controls allow you to adjust mood and functionality'
        ]
      }
    }
  },

  contemporary: {
    name: 'Contemporary',
    slug: 'contemporary',
    tagline: 'Current trends, fluid design, and ever-evolving sophistication',
    overview: `Contemporary kitchen design is fluid and ever-changing, reflecting the current moment in design. Unlike modern design (which refers to a specific historical period), contemporary style borrows from various eras and movements, creating eclectic spaces that feel fresh and of-the-moment. Contemporary kitchens often feature curved lines, bold artistic statements, and a mix of textures that create visual warmth while maintaining sophistication.`,
    facets: {
      layout: {
        title: 'Layout',
        description: 'Contemporary layouts embrace flexibility and social cooking, with multi-functional spaces that adapt to changing needs.',
        tips: [
          'Design for flexibility—spaces that work for cooking, working, and entertaining',
          'Consider multiple prep zones for collaborative cooking experiences',
          'Incorporate a beverage station or coffee bar as a secondary focal point',
          'Open shelving mixed with closed storage creates visual rhythm',
          'Include comfortable seating integrated into the kitchen design'
        ]
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Contemporary cabinets mix materials and finishes, often combining wood with lacquer, metal, or glass for textural interest.',
        tips: [
          'Mix matte and gloss finishes for depth and visual interest',
          'Textured wood veneers add organic warmth to sleek designs',
          'Consider asymmetrical cabinet arrangements for artistic impact',
          'Glass-front upper cabinets with interior lighting showcase curated items',
          'Integrated handles in contrasting metals add subtle detail'
        ]
      },
      countertop: {
        title: 'Countertop Material',
        description: 'Contemporary countertops explore diverse materials, from engineered surfaces to natural stone with dramatic veining.',
        tips: [
          'Dramatic marble with bold veining makes an artistic statement',
          'Concrete countertops offer industrial edge with custom coloring options',
          'Recycled glass surfaces align with eco-conscious contemporary values',
          'Consider mixing materials—stone for perimeter, butcher block for island',
          'Leather or honed finishes offer alternatives to traditional polished surfaces'
        ]
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Contemporary backsplashes often serve as the kitchen\'s artistic centerpiece, featuring bold patterns, textures, or materials.',
        tips: [
          'Zellige or handmade tiles add artisanal character and texture',
          'Bold geometric patterns in contrasting colors create focal points',
          'Metallic tiles or sheets add glamour and light reflection',
          'Consider artistic murals or custom tile installations as statement pieces',
          'Textured 3D tiles add dimension and visual interest'
        ]
      },
      flooring: {
        title: 'Flooring',
        description: 'Contemporary flooring embraces both innovation and natural materials, often featuring unexpected textures or patterns.',
        tips: [
          'Patterned cement tiles add artisanal character underfoot',
          'Wide-plank oak with wire-brushed texture shows natural grain',
          'Terrazzo is experiencing a contemporary revival with modern colorways',
          'Consider herringbone or chevron patterns for geometric interest',
          'Luxury vinyl plank offers contemporary looks with practical benefits'
        ]
      },
      appliances: {
        title: 'Appliances',
        description: 'Contemporary kitchens feature the latest in appliance technology, often incorporating unique colors or finishes.',
        tips: [
          'Colored appliances (navy, forest green, matte black) make bold statements',
          'Smart appliances with touchscreens and connectivity feel current',
          'Consider column refrigeration for a built-in, customized look',
          'Steam ovens and combination appliances reflect modern cooking trends',
          'Integrated ventilation (downdraft or ceiling) maintains clean lines'
        ]
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Contemporary palettes are more adventurous, incorporating trending colors alongside timeless neutrals.',
        tips: [
          'Navy blue, forest green, and deep plum are popular contemporary choices',
          'Warm neutrals (greige, taupe, warm white) replace stark cool whites',
          'Terracotta and rust tones add organic warmth',
          'Mix cool and warm tones for a balanced, layered palette',
          'Don\'t be afraid to incorporate current color trends in replaceable elements'
        ]
      },
      lighting: {
        title: 'Lighting',
        description: 'Contemporary lighting makes bold artistic statements, featuring unique fixtures that serve as functional sculptures.',
        tips: [
          'Oversized statement pendants create dramatic focal points',
          'Asymmetrical arrangements of multiple pendants add visual interest',
          'Natural materials (rattan, paper, wood) in light fixtures add texture',
          'Consider integrated lighting in unexpected places—inside cabinets, in shelving',
          'Tunable LED lighting allows color temperature adjustment throughout the day'
        ]
      }
    }
  },

  transitional: {
    name: 'Transitional',
    slug: 'transitional',
    tagline: 'The perfect balance between traditional warmth and modern simplicity',
    overview: `Transitional kitchen design bridges the gap between traditional and contemporary styles, creating spaces that feel both timeless and current. This approach takes the warmth and familiarity of traditional design while incorporating the clean lines and uncluttered aesthetic of modern spaces. The result is a kitchen that appeals to those who appreciate classic elegance but prefer a more streamlined, less ornate interpretation.`,
    facets: {
      layout: {
        title: 'Layout',
        description: 'Transitional layouts balance efficient modern workflows with the comfortable, welcoming feel of traditional kitchens.',
        tips: [
          'Maintain the work triangle while incorporating an island for gathering',
          'Include a mix of open and closed storage for flexibility',
          'Consider a semi-open layout that defines the kitchen while connecting to living spaces',
          'A butler\'s pantry or prep kitchen adds functionality without cluttering the main space',
          'Ensure clear traffic flow that doesn\'t interrupt cooking zones'
        ]
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Transitional cabinets typically feature Shaker-style doors—a perfect blend of traditional craftsmanship and modern simplicity.',
        tips: [
          'Shaker-style cabinets are the quintessential transitional choice',
          'Painted finishes in white, gray, or soft colors feel fresh yet classic',
          'Simple hardware in brushed nickel or oil-rubbed bronze complements the style',
          'Consider furniture-style details on islands (feet, varied heights) for character',
          'Mix painted perimeter cabinets with a stained wood island for warmth'
        ]
      },
      countertop: {
        title: 'Countertop Material',
        description: 'Transitional countertops favor classic materials in clean applications, avoiding overly ornate edge profiles.',
        tips: [
          'Quartz in marble-look patterns offers timeless appeal with modern performance',
          'Natural marble remains a classic choice for transitional elegance',
          'Simple edge profiles (eased, small bevel) suit the understated aesthetic',
          'White, cream, and soft gray tones are most versatile',
          'Consider a contrasting island countertop (butcher block, dark stone) for definition'
        ]
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Transitional backsplashes feature classic patterns in refined, updated applications.',
        tips: [
          'Subway tile remains a transitional staple—consider oversized or beveled versions',
          'Herringbone or chevron patterns add interest while staying classic',
          'Carrara marble in subway or slab form bridges traditional and modern',
          'Soft gray or white tiles maintain a timeless foundation',
          'Extend to the ceiling for modern impact while using traditional materials'
        ]
      },
      flooring: {
        title: 'Flooring',
        description: 'Transitional floors favor classic materials in updated formats, balancing warmth with clean presentation.',
        tips: [
          'Medium-width hardwood planks (4-6 inches) strike the right balance',
          'Oak in medium to light stains offers timeless versatility',
          'Large-format stone-look porcelain provides traditional aesthetics with modern performance',
          'Avoid busy patterns—let the flooring be a neutral backdrop',
          'Consider subtle texture (wire-brushed, hand-scraped) for character without excess'
        ]
      },
      appliances: {
        title: 'Appliances',
        description: 'Transitional kitchens integrate appliances thoughtfully, balancing visible professional-style units with concealed options.',
        tips: [
          'Stainless steel appliances remain the transitional standard',
          'Consider panel-ready refrigerators for a more integrated look',
          'A professional-style range can serve as a focal point without overwhelming',
          'Simple hood designs complement rather than dominate the space',
          'Smart features are welcome but shouldn\'t be the appliance\'s defining characteristic'
        ]
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Transitional palettes favor soft, sophisticated neutrals that create a calm, timeless atmosphere.',
        tips: [
          'White, cream, and warm gray form the foundation of transitional palettes',
          'Navy blue and soft sage green work as sophisticated accent colors',
          'Natural wood tones provide warmth against painted surfaces',
          'Avoid stark contrasts—transitional style favors subtle tonal variations',
          'Metallics in warm tones (brass, gold) add traditional warmth; cool tones (nickel, chrome) lean modern'
        ]
      },
      lighting: {
        title: 'Lighting',
        description: 'Transitional lighting features updated classics—traditional shapes with cleaner lines and modern sensibilities.',
        tips: [
          'Lantern-style pendants with simple frames offer transitional elegance',
          'Glass globe fixtures bridge traditional and modern aesthetics',
          'Recessed lighting provides ambient illumination without visual clutter',
          'Under-cabinet lighting is essential for task areas',
          'A mix of finishes (matte black frames with brass accents) adds depth'
        ]
      }
    }
  },

  farmhouse: {
    name: 'Farmhouse',
    slug: 'farmhouse',
    tagline: 'Rustic charm meets modern comfort in welcoming, lived-in spaces',
    overview: `Farmhouse kitchen design celebrates the warm, unpretentious character of rural American homes. This style embraces natural materials, vintage-inspired elements, and a collected-over-time aesthetic that feels authentic and welcoming. Modern farmhouse kitchens update these traditional elements with contemporary conveniences, creating spaces that are as functional as they are charming. The key is balancing rustic character with refined execution.`,
    facets: {
      layout: {
        title: 'Layout',
        description: 'Farmhouse layouts emphasize gathering and comfort, with spacious work areas and room for family and friends.',
        tips: [
          'Include a large farmhouse table or island as the heart of the kitchen',
          'Consider a connected breakfast nook or banquette for casual dining',
          'Open shelving showcases collected dishware and adds character',
          'A mudroom or utility area near the kitchen suits farmhouse living',
          'Allow space for a statement piece like an antique hutch or pie safe'
        ]
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Farmhouse cabinets feature painted finishes, often in white or soft colors, with traditional details like beadboard and furniture-style elements.',
        tips: [
          'Shaker or recessed-panel doors suit the simple farmhouse aesthetic',
          'White, cream, and soft sage green are classic farmhouse colors',
          'Consider beadboard panels on cabinet backs or island ends',
          'Furniture-style details (turned legs, corbels) add authenticity',
          'A distressed or lightly antiqued finish adds character (use sparingly)'
        ]
      },
      countertop: {
        title: 'Countertop Material',
        description: 'Farmhouse countertops favor natural, unpretentious materials that develop character over time.',
        tips: [
          'Butcher block adds warmth and is perfect for farmhouse islands',
          'Soapstone offers authentic farmhouse appeal with natural patina over time',
          'White or gray quartz provides practicality with a clean farmhouse look',
          'Honed finishes feel more appropriate than polished for this style',
          'Consider mixing materials—butcher block island with stone perimeter'
        ]
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Farmhouse backsplashes often feature classic tiles or natural materials with handmade character.',
        tips: [
          'White subway tile is the farmhouse classic—consider handmade for texture',
          'Beadboard or shiplap as backsplash adds distinctive farmhouse character',
          'Brick veneer creates authentic vintage farmhouse appeal',
          'Zellige or terracotta tiles add artisanal warmth',
          'Consider open shelving instead of upper cabinets above a simple tile backsplash'
        ]
      },
      flooring: {
        title: 'Flooring',
        description: 'Farmhouse floors celebrate natural wood and rustic materials that tell a story of use and time.',
        tips: [
          'Wide-plank pine or oak with natural character suits farmhouse style',
          'Hand-scraped or distressed finishes add authentic character',
          'Reclaimed wood flooring offers genuine history and patina',
          'Terracotta or encaustic tiles work in Mediterranean-influenced farmhouse',
          'Consider painted or whitewashed wood for cottage farmhouse appeal'
        ]
      },
      appliances: {
        title: 'Appliances',
        description: 'Farmhouse kitchens often feature vintage-inspired appliances or discreetly integrated modern units.',
        tips: [
          'Retro-style ranges (like Big Chill or SMEG) capture farmhouse charm',
          'A prominent farmhouse sink (apron-front) is essential',
          'White or panel-ready appliances blend quietly into the design',
          'Consider a pot filler above the range for both function and style',
          'Antique or reproduction ice boxes can serve as unique statement pieces'
        ]
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Farmhouse palettes are soft and natural, inspired by the surrounding landscape and vintage interiors.',
        tips: [
          'White and cream create the light, airy farmhouse foundation',
          'Soft sage green, dusty blue, and barn red are classic accent colors',
          'Natural wood tones in honey, walnut, or whitewashed finishes',
          'Black accents (hardware, fixtures) add contrast and definition',
          'Warm metals (brass, copper) complement the vintage aesthetic'
        ]
      },
      lighting: {
        title: 'Lighting',
        description: 'Farmhouse lighting features vintage-inspired fixtures with industrial or rustic character.',
        tips: [
          'Schoolhouse pendants and barn lights are farmhouse classics',
          'Wrought iron chandeliers add rustic elegance over islands',
          'Edison bulbs visible in cage or simple fixtures suit the aesthetic',
          'Consider vintage or reproduction fixtures for authentic character',
          'Wall sconces with fabric shades add soft, welcoming light'
        ]
      }
    }
  },

  traditional: {
    name: 'Traditional',
    slug: 'traditional',
    tagline: 'Timeless elegance with rich details and classical proportions',
    overview: `Traditional kitchen design draws inspiration from European and American classical design traditions, emphasizing symmetry, rich wood tones, and decorative details. These kitchens feel established and substantial, with craftsmanship evident in every element. Traditional style values quality materials, ornate moldings, and a sense of permanence. The result is a kitchen that feels like a curated collection of fine furnishings rather than a utilitarian workspace.`,
    facets: {
      layout: {
        title: 'Layout',
        description: 'Traditional layouts emphasize symmetry and defined zones, with clear separation between cooking, prep, and gathering areas.',
        tips: [
          'Symmetry is key—consider matching cabinet runs flanking a range or window',
          'A central island or work table anchors the space while maintaining formality',
          'Include a designated baking or prep area with specialized storage',
          'Consider a butler\'s pantry for formal entertaining support',
          'Maintain clear zones for cooking, cleanup, and socializing'
        ]
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Traditional cabinets feature raised-panel doors, ornate moldings, and rich wood stains or painted finishes with glazing.',
        tips: [
          'Raised-panel doors with detailed profiles are quintessentially traditional',
          'Rich wood stains (cherry, mahogany, walnut) create warmth and elegance',
          'Painted cabinets with glaze highlighting add depth and age',
          'Elaborate crown molding connects cabinets to ceiling with grandeur',
          'Glass-front doors with mullion patterns showcase fine dishware'
        ]
      },
      countertop: {
        title: 'Countertop Material',
        description: 'Traditional countertops favor natural stone with decorative edge profiles that echo architectural moldings.',
        tips: [
          'Granite in rich patterns offers traditional elegance and durability',
          'Marble, particularly Carrara or Calacatta, is timelessly traditional',
          'Decorative edge profiles (ogee, dupont) add refined detail',
          'Coordinate countertop with cabinet color for cohesive design',
          'Consider honed finishes for a more subtle, classic appearance'
        ]
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Traditional backsplashes feature classic tile patterns, natural stone, or decorative elements that add visual richness.',
        tips: [
          'Tumbled marble or travertine subway tiles offer old-world appeal',
          'Decorative tile murals above the range create focal points',
          'Mosaic medallions or borders add artistic detail',
          'Natural stone in brick or herringbone patterns provides texture',
          'Consider pot filler and decorative tile framing behind the range'
        ]
      },
      flooring: {
        title: 'Flooring',
        description: 'Traditional floors feature rich hardwoods in classic patterns or natural stone that grounds the formal design.',
        tips: [
          'Medium to dark hardwood stains (walnut, mahogany tones) feel substantial',
          'Parquet or herringbone patterns add classical refinement',
          'Natural stone (limestone, travertine, marble) suits formal traditional kitchens',
          'Area rugs with traditional patterns add warmth and color',
          'Borders or inlays create definition and visual interest'
        ]
      },
      appliances: {
        title: 'Appliances',
        description: 'Traditional kitchens feature professional-style or paneled appliances that integrate with the cabinetry\'s crafted appearance.',
        tips: [
          'Professional-style ranges with decorative details serve as focal points',
          'Ornate range hoods with corbels and molding crown the cooking area',
          'Panel-ready refrigerators maintain the furniture-like cabinet appearance',
          'Consider warming drawers and built-in espresso machines for luxury',
          'Pot fillers with traditional styling add both function and detail'
        ]
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Traditional palettes feature rich, warm tones that create a sense of history and substance.',
        tips: [
          'Cream and antique white provide warm alternatives to stark white',
          'Rich wood tones (cherry, mahogany, walnut) anchor the space',
          'Deep greens, burgundy, and navy work as sophisticated accents',
          'Gold and brass add warmth and luxury',
          'Layer colors through fabrics, accessories, and decorative elements'
        ]
      },
      lighting: {
        title: 'Lighting',
        description: 'Traditional lighting features ornate fixtures that serve as jewelry for the kitchen, adding sparkle and visual richness.',
        tips: [
          'Crystal chandeliers or ornate pendants add elegance over islands',
          'Lantern-style fixtures with decorative metalwork suit the style',
          'Wall sconces flanking windows or focal points add formal symmetry',
          'Under-cabinet lighting should be discreet, highlighting the space not the fixture',
          'Consider candle-style bulbs for authentic traditional ambiance'
        ]
      }
    }
  },

  scandinavian: {
    name: 'Scandinavian',
    slug: 'scandinavian',
    tagline: 'Light-filled simplicity with warm minimalism and natural beauty',
    overview: `Scandinavian kitchen design emerged from the Nordic countries' response to long, dark winters—bright, light-filled spaces that maximize natural light and create warmth through natural materials and thoughtful design. This style embraces hygge (the Danish concept of cozy contentment) through clean lines, functional simplicity, and organic textures. The result is a kitchen that feels serene, welcoming, and effortlessly stylish.`,
    facets: {
      layout: {
        title: 'Layout',
        description: 'Scandinavian layouts maximize light and functionality with efficient, uncluttered arrangements that flow naturally.',
        tips: [
          'Position the kitchen to maximize natural light from windows',
          'Open layouts connect kitchen with living areas for social cooking',
          'Keep counters clear—everything should have a designated storage place',
          'Include a cozy dining nook or window seat for hygge moments',
          'Consider the flow between indoors and outdoor spaces'
        ]
      },
      cabinetFinish: {
        title: 'Cabinet Finish',
        description: 'Scandinavian cabinets feature simple flat-panel doors in white or pale wood, with minimal hardware and clean profiles.',
        tips: [
          'Flat-panel (slab) doors in white are the Scandinavian standard',
          'Light wood cabinets (ash, birch, whitewashed oak) add warmth',
          'Handleless cabinets with push-to-open or integrated pulls maintain clean lines',
          'Open shelving in natural wood balances closed storage',
          'Two-tone designs (white upper, wood lower) are authentically Nordic'
        ]
      },
      countertop: {
        title: 'Countertop Material',
        description: 'Scandinavian countertops favor natural materials with subtle texture that complement the light, minimal aesthetic.',
        tips: [
          'Light-colored wood countertops (beech, birch, ash) add natural warmth',
          'White or light gray quartz maintains the bright, clean aesthetic',
          'Solid surface materials in white provide seamless simplicity',
          'Consider integrated sinks for a continuous, minimal look',
          'Matte finishes are preferred over high-gloss for gentle light reflection'
        ]
      },
      backsplash: {
        title: 'Backsplash',
        description: 'Scandinavian backsplashes are simple and bright, often featuring white tile or continuing the wall color for a seamless look.',
        tips: [
          'White subway tile (particularly square format) suits Nordic style',
          'Paint the wall behind open shelving instead of tile for minimal look',
          'Handmade tiles with subtle variation add organic warmth',
          'Consider full-height tile behind the range only, open shelving elsewhere',
          'Light grout matching the tile maintains the seamless aesthetic'
        ]
      },
      flooring: {
        title: 'Flooring',
        description: 'Scandinavian floors feature light-colored natural wood that reflects light and creates warmth underfoot.',
        tips: [
          'Wide-plank white oak is quintessentially Scandinavian',
          'Whitewashed or light-stained pine offers budget-friendly options',
          'Matte or satin finishes feel more natural than high-gloss',
          'Consider radiant heating for true Nordic comfort',
          'Light gray or blonde wood tones maximize the bright, airy feeling'
        ]
      },
      appliances: {
        title: 'Appliances',
        description: 'Scandinavian kitchens feature integrated appliances that disappear into the cabinetry, maintaining visual calm.',
        tips: [
          'Panel-ready refrigerators and dishwashers integrate seamlessly',
          'White appliances blend with white cabinets for a cohesive look',
          'Induction cooktops with minimal profiles suit the aesthetic',
          'Consider integrated range hoods that hide when not in use',
          'Simple controls and clean interfaces align with Nordic design values'
        ]
      },
      colorPalette: {
        title: 'Color Palette',
        description: 'Scandinavian palettes center on white and natural wood, with soft muted accents inspired by nature.',
        tips: [
          'White is fundamental—use various white tones for depth',
          'Natural light wood (oak, ash, birch) provides essential warmth',
          'Soft gray, pale blue, and muted sage work as accent colors',
          'Black accents (hardware, fixtures) add definition without heaviness',
          'Bring color through plants, textiles, and ceramic accessories'
        ]
      },
      lighting: {
        title: 'Lighting',
        description: 'Scandinavian lighting maximizes natural light and features simple, sculptural fixtures that add warmth without visual clutter.',
        tips: [
          'Maximize natural light—consider skylights or larger windows',
          'Simple pendant lights in natural materials (wood, paper, rattan)',
          'Clustered bulbs or minimal wire pendants have iconic Nordic appeal',
          'Warm-toned LED bulbs (2700K) create cozy ambient light',
          'Candles are essential for authentic Scandinavian hygge'
        ]
      }
    }
  }
};

/**
 * Get all available style slugs
 */
export const STYLE_SLUGS = Object.keys(STYLE_GUIDES);

/**
 * Get style guide by slug
 */
export function getStyleGuide(slug: string): StyleGuide | undefined {
  return STYLE_GUIDES[slug.toLowerCase()];
}

/**
 * Check if a slug is a valid style
 */
export function isValidStyle(slug: string): boolean {
  return slug.toLowerCase() in STYLE_GUIDES;
}
