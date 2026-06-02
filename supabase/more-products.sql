-- ============================================
-- MORE PRODUCTS - Run AFTER seed.sql
-- Adds 30 additional products across all categories
-- ============================================

INSERT INTO products (name, slug, description, price, sale_price, category_id, image_url, stock, is_on_sale, is_featured) VALUES

-- ============ iPHONES ============

('iPhone 17 Plus', 'iphone-17-plus',
 $d$iPhone 17 Plus features a stunning 6.7-inch Super Retina XDR display, A19 chip, and an advanced dual-camera system with 48MP main lens. All-day battery life.$d$,
 30000, 28500, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-ultramarine?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1723845535674',
 40, true, true),

('iPhone 17 Pro Max', 'iphone-17-pro-max',
 $d$iPhone 17 Pro Max — the ultimate iPhone with a 6.9-inch ProMotion display, titanium design, and the most advanced Pro camera system with 5x optical zoom.$d$,
 42000, NULL, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-blacktitanium?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1723843755881',
 25, false, true),

('iPhone 16', 'iphone-16',
 $d$iPhone 16 with A18 chip, a new Camera Control, and a 48MP Fusion camera. Supports Apple Intelligence for a smarter, more personal iPhone experience.$d$,
 22000, NULL, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-teal?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1723845535674',
 60, false, false),

('iPhone 16 Pro', 'iphone-16-pro',
 $d$iPhone 16 Pro with A18 Pro chip, titanium design, 48MP Fusion camera, and Camera Control. Supports Apple Intelligence features.$d$,
 32000, 30000, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1723843755881',
 35, true, false),

('iPhone 15', 'iphone-15',
 $d$iPhone 15 with Dynamic Island, 48MP camera, USB-C connector, and A16 Bionic chip. A beautiful upgrade at an accessible price.$d$,
 18500, 16900, (SELECT id FROM categories WHERE slug='iphone'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 45, true, false),

-- ============ iPADS ============

('iPad Pro 11" M4', 'ipad-pro-11-m4',
 $d$iPad Pro 11 inch with M4 chip features the world's most advanced display — Ultra Retina XDR with tandem OLED. Thin, light, and incredibly powerful.$d$,
 32000, NULL, (SELECT id FROM categories WHERE slug='ipad'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-gallery-202405-11inch-silver-wifi?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 20, false, true),

('iPad Pro 13" M4', 'ipad-pro-13-m4',
 $d$iPad Pro 13 inch with M4 chip — the most powerful iPad ever. Stunning Ultra Retina XDR display with tandem OLED, ultra-thin design, and all-day battery.$d$,
 45000, NULL, (SELECT id FROM categories WHERE slug='ipad'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-gallery-202405-13inch-silver-wifi?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 15, false, false),

('iPad 10th Gen', 'ipad-10th-gen',
 $d$The 10th generation iPad features a 10.9-inch Liquid Retina display, A14 Bionic chip, USB-C, and a 12MP front camera. Perfect for everyday tasks.$d$,
 13500, 12900, (SELECT id FROM categories WHERE slug='ipad'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-10th-finish-select-gallery-202210-yellow-wifi?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 50, true, false),

('iPad Air 11" M3', 'ipad-air-11-m3',
 $d$iPad Air 11 inch with M3 chip. Powerful enough for your most demanding tasks, light enough to take anywhere. Available in five stunning colors.$d$,
 20000, NULL, (SELECT id FROM categories WHERE slug='ipad'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-select-gallery-202503-11inch-starlight-wifi?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1739327295833',
 30, false, false),

-- ============ MACS ============

('MacBook Air 15" M4', 'macbook-air-15-m4',
 $d$MacBook Air 15 inch with M4 chip — a big, beautiful display, all-day battery, and fanless design in a thin, light package. The world's best consumer laptop.$d$,
 42000, 40500, (SELECT id FROM categories WHERE slug='mac'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-skyblue-select-202503?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1739502867863',
 18, true, true),

('MacBook Pro 16" M4', 'macbook-pro-16-m4',
 $d$MacBook Pro 16 inch with M4 Pro or M4 Max chip. The ultimate pro laptop with a stunning Liquid Retina XDR display, up to 24 hours battery life.$d$,
 85000, NULL, (SELECT id FROM categories WHERE slug='mac'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202410?wid=1280&hei=720&fmt=p-jpg&qlt=80&.v=1729264981617',
 10, false, false),

('Mac mini M4', 'mac-mini-m4',
 $d$The new Mac mini with M4 chip is the most compact and affordable Mac desktop yet. Up to 3x faster than the M1 Mac mini, in an even smaller design.$d$,
 18500, 17500, (SELECT id FROM categories WHERE slug='mac'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-mini-hero-202411?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 22, true, false),

-- ============ APPLE WATCH ============

('Apple Watch SE (2nd Gen)', 'apple-watch-se-2',
 $d$Apple Watch SE is the best value Apple Watch with crash detection, heart rate monitoring, emergency SOS, and Apple Watch essentials — all in a lightweight design.$d$,
 8500, 7900, (SELECT id FROM categories WHERE slug='apple-watch'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-40-alum-silver-nc-se_VW_34FR_WF_CO?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 40, true, false),

('Apple Watch Nike Series 10', 'apple-watch-nike-s10',
 $d$Apple Watch Nike Series 10 pairs the sleek Series 10 design with exclusive Nike watch faces and Nike Sport Band. Built for runners and athletes.$d$,
 13500, NULL, (SELECT id FROM categories WHERE slug='apple-watch'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-46-alum-silver-nc-s10_VW_34FR_WF_CO?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 25, false, false),

('Apple Watch Hermès Series 10', 'apple-watch-hermes-s10',
 $d$Apple Watch Hermès Series 10 combines Swiss craftsmanship with Apple technology. Exclusive Hermès watch faces and premium leather bands hand-stitched in France.$d$,
 28000, NULL, (SELECT id FROM categories WHERE slug='apple-watch'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-46-ss-gold-nc-s10_VW_34FR_WF_CO?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 10, false, false),

-- ============ AIRPODS ============

('AirPods 4', 'airpods-4',
 $d$AirPods 4 — redesigned for an all-new fit. H2 chip powers machine learning for the best audio experience in open-ear AirPods. Now with USB-C.$d$,
 4200, NULL, (SELECT id FROM categories WHERE slug='airpods'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-4-hero-select-202409?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 80, false, false),

('AirPods 4 with ANC', 'airpods-4-anc',
 $d$AirPods 4 with Active Noise Cancellation — the first open-ear AirPods with ANC. H2 chip, Transparency mode, and personalized spatial audio.$d$,
 5500, 4900, (SELECT id FROM categories WHERE slug='airpods'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-4-anc-hero-select-202409?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 60, true, false),

-- ============ ACCESSORIES ============

('Apple Pencil Pro', 'apple-pencil-pro',
 $d$Apple Pencil Pro — a quantum leap for iPad. With a squeeze gesture, barrel roll, hover, and Find My support, it feels magical for sketching, designing, and note-taking.$d$,
 4500, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-pencil-pro-hero-202405?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 50, false, false),

('Apple Pencil USB-C', 'apple-pencil-usbc',
 $d$Apple Pencil USB-C offers pixel-perfect precision for sketching, annotating, and note-taking on iPad. Charges directly with USB-C at an accessible price.$d$,
 2500, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-pencil-usbc-hero-202312?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 70, false, false),

('Magic Keyboard with Touch ID', 'magic-keyboard-touch-id',
 $d$Magic Keyboard with Touch ID features a comfortable, compact design and is perfectly paired with Mac. Includes Touch ID for easy, secure login.$d$,
 4200, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MK2C3?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 35, false, false),

('Magic Keyboard with Touch ID & Num Pad', 'magic-keyboard-numpad',
 $d$Magic Keyboard with Touch ID and Numeric Keypad — the full-size wireless keyboard experience with number pad, Touch ID, and excellent key feel.$d$,
 5200, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMR3?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 25, false, false),

('Magic Mouse', 'magic-mouse',
 $d$Magic Mouse is completely wireless, rechargeable, and features a Multi-Touch surface that allows you to swipe, scroll, and navigate on your Mac with ease.$d$,
 2800, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MXK53?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 40, false, false),

('Magic Trackpad', 'magic-trackpad',
 $d$Magic Trackpad features Force Touch technology, a large glass surface, and works flawlessly with Multi-Touch gestures for a great Mac experience.$d$,
 4200, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MXK93?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 30, false, false),

('AirTag', 'airtag-1-pack',
 $d$AirTag is an easy way to keep track of your stuff. Attach it to your keys, wallet, or bag and find your things using Find My on iPhone.$d$,
 1200, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-double-select-202104?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 120, false, false),

('AirTag (4 Pack)', 'airtag-4-pack',
 $d$AirTag 4 Pack — keep track of four of your most important items. Attach an AirTag to each and find them all in the Find My app on iPhone.$d$,
 3900, 3500, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-4pack-select-202104?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 90, true, false),

('MagSafe Charger 15W', 'magsafe-charger',
 $d$The MagSafe Charger delivers fast, easy wireless charging up to 15W for iPhone 12 and later. Magnets snap into place perfectly every time.$d$,
 1500, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 100, false, false),

('35W Dual USB-C Port Adapter', 'adapter-35w-dual-usbc',
 $d$The 35W Dual USB-C Port Compact Power Adapter lets you simultaneously charge two USB-C devices. Compact enough to fit in your pocket.$d$,
 1300, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MNWP3?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 80, false, false),

('Apple TV 4K (3rd Gen)', 'apple-tv-4k',
 $d$Apple TV 4K with A15 Bionic chip delivers stunning 4K HDR video and Dolby Atmos audio. Stream, play games, and control your smart home — all from your TV.$d$,
 6900, NULL, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-tv-4k-hero-select-202210?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 30, false, false),

('HomePod mini', 'homepod-mini',
 $d$HomePod mini delivers rich 360-degree audio, works seamlessly with Apple Music, Siri, and Smart Home, and can be paired for stereo sound.$d$,
 3500, 3200, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/homepod-mini-select-yellow-202110?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 45, true, false),

('MagSafe Battery Pack', 'magsafe-battery-pack',
 $d$MagSafe Battery Pack magnetically snaps on iPhone 12 and later models, providing on-the-go charging. Charges your iPhone up to 15W when connected to power.$d$,
 3200, 2900, (SELECT id FROM categories WHERE slug='accessories'),
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MJWY3?wid=1280&hei=720&fmt=p-jpg&qlt=80',
 55, true, false);
