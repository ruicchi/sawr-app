-- Restore the original ZIP menu after the backend conversion.
-- Match by name and only insert missing rows; never overwrite staff edits.
-- Stock counts and prices are copied from the original bundled menu and should
-- be reviewed by the owner before removing Vercel Authentication.

insert into public.products
  (name, category, price_centavos, stock, description, is_available, sort_order)
select seed.name, seed.category, seed.price_centavos, seed.stock,
       seed.description, true, seed.sort_order
from (values
  ('Classic / Sugar-Coated', 'Sakto', 3000, 25, 'Crispy fried banana wrap with sweet classic sugar coating.', 1),
  ('Chocowrap', 'Sarap', 4000, 20, 'Decadent chocolate glaze over crispy banana wrap.', 2),
  ('White Chocolatewrap', 'Sarap', 4000, 15, 'Creamy white chocolate drizzle.', 3),
  ('Strawbewrap', 'Sarap', 4000, 18, 'Sweet strawberry syrup and coating.', 4),
  ('Ubewrap', 'Sarap', 4000, 30, 'Authentic Pinoy ube flavor wrap.', 5),
  ('Condewrap', 'Sarap', 4000, 12, 'Sweet condensed milk drizzled wrap.', 6),
  ('Biscowrap', 'Sagad', 5000, 10, 'Crunchy Biscoff spread and cookie crumbs topping.', 7),
  ('Pistachiowrap', 'Sagad', 5000, 8, 'Rich pistachio spread. Add Knafeh crust as an optional add-on!', 8),
  ('Matchawrap', 'Sagad', 5000, 14, 'Premium Japanese Matcha drizzle.', 9),
  ('S’mowrap', 'Sagad', 5000, 22, 'Marshmallow and graham cracker choco delight.', 10),
  ('Cream chewrap', 'Sagad', 5000, 16, 'Loaded with rich cream cheese filling.', 11)
) as seed(name, category, price_centavos, stock, description, sort_order)
where not exists (
  select 1 from public.products existing
  where lower(trim(existing.name)) = lower(trim(seed.name))
);

insert into public.addons (name, price_centavos, is_available)
select seed.name, seed.price_centavos, true
from (values
  ('Marshmallow', 1500),
  ('Chocolate chips', 1000),
  ('Knafeh', 1500)
) as seed(name, price_centavos)
where not exists (
  select 1 from public.addons existing
  where lower(trim(existing.name)) = lower(trim(seed.name))
);
