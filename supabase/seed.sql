-- ============================================
-- SEED DATA - Run AFTER schema.sql
-- ============================================

INSERT INTO categories (name, slug) VALUES
  ('iPhone',      'iphone'),
  ('iPad',        'ipad'),
  ('Mac',         'mac'),
  ('Apple Watch', 'apple-watch'),
  ('AirPods',     'airpods'),
  ('Accessories', 'accessories');

INSERT INTO products (name, slug, description, price, sale_price, category_id, image_url, stock, is_on_sale, is_featured) VALUES

('iPhone 17', 'iphone-17',
 $d$The latest iPhone 17 features a stunning A19 chip, advanced camera system, and all-day battery life. Available in multiple colors with industry-leading performance.$d$,
 26000, 25000, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-white?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1723845535674',
 50, true, true),

('iPhone 17 Pro', 'iphone-17-pro',
 $d$iPhone 17 Pro with titanium design, ProMotion display, and the most advanced Pro camera system ever in an iPhone.$d$,
 36000, NULL, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1723843755881',
 30, false, false),

('iPad Mini 7', 'ipad-mini-7',
 $d$iPad mini packs the A17 Pro chip into an ultra-portable design. Perfect for reading, gaming, and creativity on the go.$d$,
 18000, 17500, (SELECT id FROM categories WHERE slug='ipad'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-mini-finish-select-gallery-202410-purple-wifi?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1727386023127',
 40, true, false),

('iPad Air M3', 'ipad-air-m3',
 $d$iPad Air with M3 chip delivers extreme performance and a brilliant Liquid Retina display. Perfect for work and play.$d$,
 22000, NULL, (SELECT id FROM categories WHERE slug='ipad'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-select-gallery-202503-11inch-blue-wifi?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1739327295833',
 25, false, false),

('Macbook Air 13 M4', 'macbook-air-13-m4',
 $d$MacBook Air with the M4 chip is a thin, light powerhouse with all-day battery life and a stunning Liquid Retina display.$d$,
 35000, 33500, (SELECT id FROM categories WHERE slug='mac'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-skyblue-select-202503?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1739502867863',
 20, true, true),

('Macbook Pro 14 M4', 'macbook-pro-14-m4',
 $d$MacBook Pro 14 inch with M4 Pro delivers extreme performance for pros. Features a stunning Liquid Retina XDR display.$d$,
 65000, NULL, (SELECT id FROM categories WHERE slug='mac'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-select-202410?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1729264981617',
 15, false, false),

('Apple Watch Series 10', 'apple-watch-series-10',
 $d$Apple Watch Series 10 has a thinner design, larger display, and advanced health features to keep you connected.$d$,
 12500, 11500, (SELECT id FROM categories WHERE slug='apple-watch'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MXLY3ref_VW_34FR+watch-46-alum-jetblack-nc-s10_VW_34FR_WF_CO+watch-face-46-aluminum-jetblack-s10?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1725580056555',
 35, true, true),

('Apple Watch Ultra 2', 'apple-watch-ultra-2',
 $d$Apple Watch Ultra 2 - the most rugged and capable Apple Watch ever, designed for adventure and endurance.$d$,
 25000, NULL, (SELECT id FROM categories WHERE slug='apple-watch'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MX813ref_VW_34FR+watch-49-titanium-natural-ultra2_VW_34FR_WF_CO+watch-face-49-titanium-ultra2?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1724856474129',
 20, false, false),

('Airpods Pro 3', 'airpods-pro-3',
 $d$AirPods Pro with Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio for an immersive sound experience.$d$,
 6900, 6500, (SELECT id FROM categories WHERE slug='airpods'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1724041669458',
 100, true, true),

('AirPods Max', 'airpods-max',
 $d$AirPods Max - high-fidelity audio, Active Noise Cancellation, and Spatial Audio. Now in fresh new colors.$d$,
 18000, NULL, (SELECT id FROM categories WHERE slug='airpods'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-202409-midnight?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1724144643403',
 25, false, false);

INSERT INTO coupons (code, discount_percent, is_active, expires_at) VALUES
  ('WELCOME10', 10, true, NOW() + INTERVAL '90 days'),
  ('SAVE20',    20, true, NOW() + INTERVAL '30 days'),
  ('ELASOBI5',   5, true, NULL);
