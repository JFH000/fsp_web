-- Seed catalog reference data (same IDs as frontend mock)
-- Run in: Supabase Dashboard → SQL Editor

-- ── Product lines ─────────────────────────────────────────────────────────────
insert into product_lines (id, code, name, description, icon, slug, product_count) values
  (1, 'L01', 'Accesorios de Refrigeración', 'Conectores, tuberías y accesorios para instalaciones', 'Wrench',      'accesorios-refrigeracion', 210),
  (2, 'L06', 'Compresores',                 'Herméticos, semiherméticos y scroll para toda aplicación', 'Settings2', 'compresores',              98),
  (3, 'L10', 'Válvulas',                    'Expansión, solenoide, retención, 4 vías y más',            'Gauge',      'valvulas',                175),
  (4, 'L15', 'Filtros y Secadores',         'Filtros deshidratadores, de aceite y accesorios',           'Filter',     'filtros-secadores',        134),
  (5, 'L20', 'Refrigerantes',               'HFC, HFO y mezclas para todas las aplicaciones',            'Thermometer','refrigerantes',            42),
  (6, 'L25', 'Intercambiadores de Calor',   'Evaporadores, condensadores e intercambiadores de placas',  'Layers',     'intercambiadores-calor',   67),
  (7, 'L30', 'Controles y Electrónica',     'Presostatos, termostatos, controladores y sensores',        'Cpu',        'controles-electronica',    189)
on conflict (id) do nothing;

select setval('product_lines_id_seq', (select max(id) from product_lines));

-- ── Brands ────────────────────────────────────────────────────────────────────
insert into brands (id, name, slug, country) values
  (1, 'Danfoss',           'danfoss',  'Dinamarca'),
  (2, 'Tecumseh',          'tecumseh', 'EE.UU.'),
  (3, 'Copeland',          'copeland', 'EE.UU.'),
  (4, 'Sporlan',           'sporlan',  'EE.UU.'),
  (5, 'Parker',            'parker',   'EE.UU.'),
  (6, 'Emerson Climate',   'emerson',  'EE.UU.'),
  (7, 'Castel',            'castel',   'Italia'),
  (8, 'Henry Technologies','henry',    'EE.UU.')
on conflict (id) do nothing;

select setval('brands_id_seq', (select max(id) from brands));

-- ── Categories ────────────────────────────────────────────────────────────────
insert into categories (id, name, slug, product_line_id) values
  (1,  'Válvulas de Expansión Termostáticas', 'valvulas-expansion-termostaticas', 3),
  (2,  'Válvulas Solenoide',                  'valvulas-solenoide',               3),
  (3,  'Válvulas de 4 Vías',                  'valvulas-4-vias',                  3),
  (4,  'Compresores Herméticos',              'compresores-hermeticos',            2),
  (5,  'Compresores Scroll',                  'compresores-scroll',                2),
  (6,  'Filtros Deshidratadores',             'filtros-deshidratadores',           4),
  (7,  'Refrigerantes HFC',                   'refrigerantes-hfc',                5),
  (8,  'Intercambiadores de Placas',          'intercambiadores-placas',           6),
  (9,  'Presostatos',                         'presostatos',                       7),
  (10, 'Accesorios de Tubería',               'accesorios-tuberia',                1)
on conflict (id) do nothing;

select setval('categories_id_seq', (select max(id) from categories));
