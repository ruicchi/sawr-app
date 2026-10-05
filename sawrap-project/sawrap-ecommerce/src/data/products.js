// Ito ang SEED data lang — ginagamit kapag wala pang laman ang localStorage
// (ibig sabihin, unang beses pa lang bubukas ang storefront o admin portal).
// Pagkatapos ng unang load, ang "sawrap_products" sa localStorage na ang
// magiging source of truth, at ang Admin Portal ang gagamit para i-update ito.
export const PRODUCTS = [
  { id: 1, name: 'Classic / Sugar-Coated', category: 'Sakto', price: 30.00, stock: 25, description: 'Crispy fried banana wrap with sweet classic sugar coating.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 2, name: 'Chocowrap', category: 'Sarap', price: 40.00, stock: 20, description: 'Decadent chocolate glaze over crispy banana wrap.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 3, name: 'White Chocolatewrap', category: 'Sarap', price: 40.00, stock: 15, description: 'Creamy white chocolate drizzle.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 4, name: 'Strawbewrap', category: 'Sarap', price: 40.00, stock: 18, description: 'Sweet strawberry syrup and coating.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 5, name: 'Ubewrap', category: 'Sarap', price: 40.00, stock: 30, description: 'Authentic Pinoy ube flavor wrap.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 6, name: 'Condewrap', category: 'Sarap', price: 40.00, stock: 12, description: 'Sweet condensed milk drizzled wrap.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 7, name: 'Biscowrap', category: 'Sagad', price: 50.00, stock: 10, description: 'Crunchy Biscoff spread and cookie crumbs topping.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 8, name: 'Pistachiowrap', category: 'Sagad', price: 50.00, stock: 8, description: 'Rich pistachio spread. Add Knafeh crust as an optional add-on!', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 9, name: 'Matchawrap', category: 'Sagad', price: 50.00, stock: 14, description: 'Premium Japanese Matcha drizzle.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 10, name: "S’mowrap", category: 'Sagad', price: 50.00, stock: 22, description: 'Marshmallow and graham cracker choco delight.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 11, name: 'Cream chewrap', category: 'Sagad', price: 50.00, stock: 16, description: 'Loaded with rich cream cheese filling.', image: '', inStock: true, isDeleted: false, deletedAt: null },
];

export const INITIAL_BANNERS = [
  { id: 101, image: '', isDeleted: false, deletedAt: null }
];

export const INITIAL_ADDONS = [
  { id: 1, name: 'Marshmallow', price: 15.00, inStock: true, isDeleted: false, deletedAt: null },
  { id: 2, name: 'Chocolate chips', price: 10.00, inStock: true, isDeleted: false, deletedAt: null },
  { id: 3, name: 'Knafeh', price: 15.00, inStock: true, isDeleted: false, deletedAt: null },
];
