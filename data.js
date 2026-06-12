// Data structures and mappings for EcoSort waste classification

export const WASTE_CATEGORIES = {
    wet: {
        name: "Wet / Organic Waste",
        binColor: "Green",
        binHex: "#2ecc71",
        textColor: "#ffffff",
        instructions: "Dispose of in the GREEN bin. These are biodegradable materials that will be composted into organic fertilizer.",
        indiaStandard: "Green Bin - For biodegradable organic waste (food scraps, fruit peels, vegetable parts, garden waste, tea leaves)."
    },
    dry: {
        name: "Dry / Recyclable Waste",
        binColor: "Blue",
        binHex: "#3498db",
        textColor: "#ffffff",
        instructions: "Dispose of in the BLUE bin. Ensure items are clean, dry, and emptied of liquids before discarding to facilitate clean recycling.",
        indiaStandard: "Blue Bin - For dry recyclables (plastics, paper, clean cardboard, metals, glass bottles, tins)."
    },
    hazardous: {
        name: "Domestic Hazardous Waste",
        binColor: "Red",
        binHex: "#e74c3c",
        textColor: "#ffffff",
        instructions: "Dispose of in the RED bin. Keep these separate to prevent environmental contamination or hazard to sanitation workers.",
        indiaStandard: "Red Bin - For toxic/hazardous materials (batteries, bulb/tube lights, paint, spray cans, medicines, chemical bottles)."
    },
    ewaste: {
        name: "Electronic Waste (E-waste)",
        binColor: "Black/Yellow",
        binHex: "#2c3e50",
        textColor: "#f1c40f",
        instructions: "Dispose of in designated E-waste bins or drop off at certified electronic recycling hubs. (Varies by local municipal corporations).",
        indiaStandard: "Black/Yellow Bin - For discarded electronics (phones, chargers, cables, keyboards, motherboards, calculators)."
    },
    reject: {
        name: "Reject / Sanitary Waste",
        binColor: "Red",
        binHex: "#d35400",
        textColor: "#ffffff",
        instructions: "Dispose of in the RED bin. Always wrap sanitary items securely in newspapers or bags (ideally marked with a red dot) before binning.",
        indiaStandard: "Red Bin / Marked Wrapping - For personal hygiene waste (soiled diapers, sanitary napkins, bandages, used masks, syringes, dirty cotton)."
    }
};

// Keyword map to evaluate MobileNet labels
export const KEYWORD_MAP = {
    // Wet / Organic
    "banana": "wet",
    "apple": "wet",
    "orange": "wet",
    "pear": "wet",
    "lemon": "wet",
    "fruit": "wet",
    "vegetable": "wet",
    "peel": "wet",
    "cabbage": "wet",
    "broccoli": "wet",
    "potato": "wet",
    "onion": "wet",
    "garlic": "wet",
    "carrot": "wet",
    "corn": "wet",
    "bread": "wet",
    "pastry": "wet",
    "cake": "wet",
    "food": "wet",
    "meat": "wet",
    "fish": "wet",
    "egg": "wet",
    "rice": "wet",
    "plant": "wet",
    "flower": "wet",
    "leaf": "wet",
    "coconuts": "wet",
    "pomegranate": "wet",
    "pineapple": "wet",
    "strawberry": "wet",

    // Dry / Recyclable
    "bottle": "dry",
    "plastic": "dry",
    "can": "dry",
    "tin": "dry",
    "aluminum": "dry",
    "paper": "dry",
    "cardboard": "dry",
    "box": "dry",
    "carton": "dry",
    "glass": "dry",
    "jar": "dry",
    "cup": "dry",
    "mug": "dry",
    "plate": "dry",
    "bowl": "dry",
    "spoon": "dry",
    "fork": "dry",
    "knife": "dry",
    "newspaper": "dry",
    "magazine": "dry",
    "envelope": "dry",
    "book": "dry",
    "bag": "dry",
    "wrapper": "dry",
    "tub": "dry",
    "tray": "dry",
    "foil": "dry",
    "packet": "dry",

    // Hazardous
    "battery": "hazardous",
    "accumulator": "hazardous",
    "bulb": "hazardous",
    "lamp": "hazardous",
    "light": "hazardous",
    "paint": "hazardous",
    "chemical": "hazardous",
    "poison": "hazardous",
    "pesticide": "hazardous",
    "spray": "hazardous",
    "aerosol": "hazardous",
    "thermometer": "hazardous",
    "medicine": "hazardous",
    "syringe": "hazardous",
    "needle": "hazardous",

    // E-waste
    "phone": "ewaste",
    "smartphone": "ewaste",
    "mobile": "ewaste",
    "cellphone": "ewaste",
    "laptop": "ewaste",
    "computer": "ewaste",
    "keyboard": "ewaste",
    "mouse": "ewaste",
    "monitor": "ewaste",
    "screen": "ewaste",
    "television": "ewaste",
    "tv": "ewaste",
    "tablet": "ewaste",
    "ipad": "ewaste",
    "watch": "ewaste",
    "smartwatch": "ewaste",
    "charger": "ewaste",
    "wire": "ewaste",
    "cable": "ewaste",
    "plug": "ewaste",
    "remote": "ewaste",
    "speaker": "ewaste",
    "headphone": "ewaste",
    "earphone": "ewaste",

    // Reject / Sanitary
    "diaper": "reject",
    "napkin": "reject",
    "tissue": "reject",
    "wipe": "reject",
    "bandage": "reject",
    "mask": "reject",
    "glove": "reject",
    "toothbrush": "reject",
    "razor": "reject",
    "cigarette": "reject",
    "ash": "reject",
    "dirt": "reject",
    "ceramic": "reject",
    "porcelain": "reject",
    "mirror": "reject",
    "band-aid": "reject"
};

// Static lookup table for Upcycling Ideas
export const UPCYCLING_IDEAS = {
    bottle: [
        { 
            title: "Self-Watering Planter", 
            description: "Cut a plastic bottle in half. Flip the top part upside down, insert a cotton wick from the neck down to the bottom half containing water, and plant your herbs in the top half." 
        },
        { 
            title: "Cute Desk Pen Stand", 
            description: "Cut off the bottom portion of a plastic bottle. Smooth the edges with a warm iron face, paint it with eco-friendly colors, draw animal ears, and organize your desk!" 
        }
    ],
    plastic: [
        { 
            title: "Eco-Bricks", 
            description: "Compress clean, dry, soft single-use plastics tightly into empty plastic bottles using a stick to make highly dense bricks for building micro-gardens." 
        }
    ],
    cardboard: [
        { 
            title: "Smart Desk Organizer", 
            description: "Cut cardboard tubes or small boxes to different heights, glue them together on a sturdy cardboard base, wrap in colored paper, and store your stationery." 
        },
        { 
            title: "Custom Drawer Dividers", 
            description: "Measure your drawer, cut cardboard strips to fit, notch them half-way to create a slot-in grid, and organize socks, accessories, or craft items." 
        }
    ],
    box: [
        { 
            title: "Stylish storage bins", 
            description: "Wrap shoe boxes or packing cartons with old clothes or rope to make robust, premium-looking baskets for shelves." 
        }
    ],
    paper: [
        { 
            title: "Plantable Seed Paper", 
            description: "Shred old paper, soak it, and blend into pulp. Stir in flower or vegetable seeds, strain the mix flat on a screen, press out moisture, dry, and plant later!" 
        },
        { 
            title: "DIY Paper Beads", 
            description: "Cut colorful flyers or magazine pages into long, thin triangles. Roll them tightly from base to tip around a toothpick, glue the end, and string into beads." 
        }
    ],
    can: [
        { 
            title: "Hanging Herb Planters", 
            description: "Clean a metal tin can, poke three drainage holes in the bottom, paint it, wrap a twine cord around the neck, and hang it on your balcony with soil and seeds." 
        },
        { 
            title: "Ambient Pattern Lantern", 
            description: "Fill a can with water and freeze it (prevents denting). Hammer nail holes in a pattern, let the ice melt, place a candle inside, and enjoy the glowing patterns." 
        }
    ],
    glass: [
        { 
            title: "Pantry Ingredient Jars", 
            description: "Soak and peel off labels from glass jars. Paint the metal lids in a matte black finish, write names with chalk markers, and store pulses, coffee, or spices." 
        },
        { 
            title: "Rustic Vase / Candleholder", 
            description: "Wrap natural twine or jute rope around glass jars, secure with hot glue, and insert fresh flowers or a tealight candle for instant table aesthetics." 
        }
    ],
    // Fallback options per category
    wet: [
        { 
            title: "Kitchen Compost Pile", 
            description: "Mix your organic scraps with double the amount of dry carbon materials (leaves, paper shreds). Turn it once a week, keep it slightly moist, and gain rich black soil in 60 days." 
        },
        { 
            title: "Windowsill Regrowing", 
            description: "Keep root bases of celery, spring onion, or garlic cloves in a shallow bowl of fresh water. Watch fresh shoots grow in a few days before replanting in soil." 
        }
    ],
    dry: [
        { 
            title: "Eco Gift Wrapping", 
            description: "Wrap gifts in old newspaper comics, music sheets, or brown paper bags. Tie with jute thread and add a dry leaf for a vintage, zero-waste aesthetic." 
        }
    ],
    hazardous: [
        { 
            title: "Safe Segregation Box", 
            description: "Do NOT upcycle hazardous waste. Instead, create a dedicated plastic container in a dry spot to collect dead batteries and bulbs until you can drop them off safely." 
        }
    ],
    ewaste: [
        { 
            title: "E-Waste Bin Collection", 
            description: "E-waste cannot be upcycled at home due to toxic metals. Put old phones and chargers in a sealed box and take them to authorized electronic brand collection centers." 
        }
    ],
    reject: [
        { 
            title: "Secure Discarding Practice", 
            description: "Sanitary items must never be upcycled. Place them in paper pouches marked with a red marker or paint dot to protect sanitary workers from direct contact." 
        }
    ]
};
