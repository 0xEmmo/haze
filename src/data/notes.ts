import type { Family, Note } from './types'

export const familyInfo: Record<Family, { label: string; colour: string; blurb: string }> = {
  citrus: { label: 'Citrus', colour: '#d99a2b', blurb: 'Peel, zest and juice. Bright, quick, the first thing you smell.' },
  floral: { label: 'Floral', colour: '#c97a86', blurb: 'Petals and blossom, from dewy and green to heavy and sweet.' },
  green: { label: 'Green', colour: '#6f8f5e', blurb: 'Crushed leaves, cut stems, tea and fig wood.' },
  aquatic: { label: 'Aquatic', colour: '#5f8ea3', blurb: 'Sea air, salt on skin, clean water and wet stone.' },
  woody: { label: 'Woody', colour: '#8a6a4c', blurb: 'Dry cedar, creamy sandalwood, earthy vetiver roots.' },
  amber: { label: 'Amber', colour: '#a8502c', blurb: 'Resins and warm spice. Glowing, slow, close to skin.' },
  gourmand: { label: 'Gourmand', colour: '#9b6b47', blurb: 'Things you could eat: vanilla, coffee, tonka, kola.' },
  smoky: { label: 'Smoky', colour: '#4f4846', blurb: 'Incense, birch tar, leather and the end of a fire.' },
}

export const notes: Note[] = [
  { id: 'bitter-orange', name: 'Bitter orange', family: 'citrus', photo: 'n-citrus', smells: 'Peel more than juice: sharp, a little bitter.' },
  { id: 'lemon', name: 'Lemon zest', family: 'citrus', photo: 'n-lemon', smells: 'The oil that sprays when you twist a lemon.' },
  { id: 'bergamot', name: 'Bergamot', family: 'citrus', smells: 'Earl Grey without the tea. Floral citrus.' },
  { id: 'rose', name: 'Rose', family: 'floral', photo: 'n-rose', smells: 'Deep red petals, slightly jammy.' },
  { id: 'jasmine', name: 'Jasmine', family: 'floral', photo: 'n-jasmine', smells: 'Night-blooming, rich, almost fruity.' },
  { id: 'hibiscus', name: 'Hibiscus', family: 'floral', smells: 'Zobo leaves: tart, red, a little sour.' },
  { id: 'neroli', name: 'Neroli', family: 'floral', smells: 'Orange blossom: soapy, clean, bright.' },
  { id: 'iris', name: 'Iris', family: 'floral', smells: 'Powdery and cool, like make-up or rain on dust.' },
  { id: 'lavender', name: 'Lavender', family: 'floral', photo: 'n-lavender', smells: 'Herbal and fresh, more barber than grandma.' },
  { id: 'fig', name: 'Fig', family: 'green', photo: 'n-fig', smells: 'Milky fruit and the green sap of the leaf.' },
  { id: 'green-tea', name: 'Green tea', family: 'green', photo: 'n-tea', smells: 'Fresh leaves just steeped. Calm.' },
  { id: 'oakmoss', name: 'Oakmoss', family: 'green', photo: 'n-moss', smells: 'Damp forest floor, inky and green.' },
  { id: 'sea-salt', name: 'Sea salt', family: 'aquatic', photo: 'n-sea', smells: 'Wind off the Atlantic. Salty skin.' },
  { id: 'musk', name: 'Clean musk', family: 'aquatic', smells: 'Fresh laundry, warm skin, soft.' },
  { id: 'sandalwood', name: 'Sandalwood', family: 'woody', photo: 'n-sandalwood', smells: 'Creamy, smooth, a little milky.' },
  { id: 'vetiver', name: 'Vetiver', family: 'woody', photo: 'n-vetiver', smells: 'Earthy roots and dry grass.' },
  { id: 'cedar', name: 'Cedar', family: 'woody', smells: 'Pencil shavings, dry and straight.' },
  { id: 'oud', name: 'Oud', family: 'woody', photo: 'n-oud', smells: 'Dark resinous wood: animalic, deep, long.' },
  { id: 'amber', name: 'Amber', family: 'amber', photo: 'n-amber', smells: 'Golden resin, warm and a little sweet.' },
  { id: 'frankincense', name: 'Frankincense', family: 'amber', photo: 'n-bakhoor', smells: 'Bright church incense, lemony smoke.' },
  { id: 'black-pepper', name: 'Black pepper', family: 'amber', photo: 'n-pepper', smells: 'Freshly cracked, more sparkle than heat.' },
  { id: 'cardamom', name: 'Cardamom', family: 'amber', smells: 'Cool, green spice. Think chai.' },
  { id: 'labdanum', name: 'Labdanum', family: 'amber', smells: 'Sticky resin, leathery and honeyed.' },
  { id: 'tobacco', name: 'Tobacco leaf', family: 'gourmand', photo: 'n-tobacco', smells: 'Dried leaf, honey and hay. Not ashtray.' },
  { id: 'vanilla', name: 'Vanilla', family: 'gourmand', photo: 'n-vanilla', smells: 'The pod, not the cake: smoky and dark.' },
  { id: 'coffee', name: 'Coffee', family: 'gourmand', photo: 'n-coffee', smells: 'Roasted beans, bitter and toasty.' },
  { id: 'tonka', name: 'Tonka', family: 'gourmand', smells: 'Almond, hay and vanilla together.' },
  { id: 'kola', name: 'Kola nut', family: 'gourmand', smells: 'Bitter, woody and faintly sweet.' },
  { id: 'shea', name: 'Shea', family: 'gourmand', smells: 'Nutty, buttery, warm skin.' },
  { id: 'birch-smoke', name: 'Birch smoke', family: 'smoky', photo: 'n-smoke', smells: 'Campfire and tar. A dark edge.' },
  { id: 'incense', name: 'Incense', family: 'smoky', photo: 'n-incense-coil', smells: 'A coil burning slowly in a quiet room.' },
  { id: 'leather', name: 'Leather', family: 'smoky', photo: 'n-leather', smells: 'A worn bag or a new pair of shoes.' },
]

const byId = new Map(notes.map((n) => [n.id, n]))

export function noteById(id: string): Note {
  const n = byId.get(id)
  if (!n) throw new Error(`Unknown note ${id}`)
  return n
}

export const notesByFamily = (f: Family) => notes.filter((n) => n.family === f)
