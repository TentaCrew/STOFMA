module.exports = {
    user_admin_01: {
      id:         99,
      firstname: 'The',
      name:      'ADMIN',
      email:     'the_admin@stofma.com',
      sex:       true,
      role:      'ADMINISTRATOR',
      credit:    1000000,
      password:  'admin'
    },
    user_manager_01: {
      id:         1,
      firstname: 'Michel',
      name:      'Mibash',
      email:     'michel.bash@manager.com',
      sex:       true,
      role:      'MANAGER',
      credit:    100,
      password:  'sale'
    },
    user_manager_02: {
      id:         2,
      firstname:  'Numerobis',
      name:       'Strong',
      email:      'number2@manager.com',
      sex:        true,
      role:       'MANAGER',
      password:   'safepwd'
    },
    user_customer_01: {
      id:         11,
      firstname:  'Lucie',
      name:       'Lampele',
      email:      'lucie_h@customer.fr',
      sex:        false,
      role:       'USER',
      credit:     100,
      password:   'catword'
    },
    user_customer_02: {
      id:         12,
      firstname:  'Coco',
      name:       'Rico',
      email:      'cocorico@customer.fr',
      sex:        false,
      role:       'USER',
      credit:     10,
      password:   'rico'
    },
    user_customer_03: {
      id:         13,
      firstname:  'Bill',
      name:       'Gates',
      email:      'bg@ubuntu.fr',
      sex:        true,
      role:       'USER',
      credit:     0,
      password:   'windows'
    },
    user_customer_04: {
      id:         14,
      firstname:  'Simple',
      name:       'Girl',
      email:      'simple@customer.fr',
      sex:        false,
      role:       'MANAGER',  //won't be considered during sign up
      credit:     1000,       //won't be considered during sign up
      password:   'simplegirl'
    },
    product_01: {
      id:         1,
      name:      'Kinder Bueno',
      shortName: 'BUENO',
      quantity:  10,
      price:     0.50,
      urlImage:  'https://farm3.staticflickr.com/2605/3674263209_c66b1c8228_o_d.jpg',
      minimum:   5,
      category:  'FOOD'
    },
    product_02: {
      id:         2,
      name:      'Coca Cola Zero',
      shortName: 'COCA0',
      quantity:  12,
      price:     0.50,
      urlImage:  'http://www.moes.com/public/images/food/beverages/coca-cola-zero.jpg',
      minimum:   5,
      category:  'DRINK'
    },
    product_03: {
      id:         3,
      name:      'T-Shirt Bleu',
      shortName: 'TSB',
      quantity:  8,
      price:     9.99,
      urlImage:  'http://slacks.com/wp-content/uploads/2013/04/divablue-essential-nobg.jpg',
      minimum:   15,
      category:  'OTHER'
    },
    product_04: {
      id:         4,
      name:      'Snickers',
      shortName: 'SNKR',
      quantity:  20,
      price:     0.10,
      urlImage:  'http://www.findthatlogo.com/wp-content/uploads/2011/10/snickers-logo-official.jpg',
      minimum:   10,
      category:  'FOOD'
    },
    product_05: {
      id:         5,
      name:      'Orangina',
      shortName: 'ORAN',
      quantity:  30,
      price:     0.50,
      urlImage:  'https://leafaitsapub.files.wordpress.com/2013/04/orangina-logo.jpg',
      minimum:   10,
      category:  'DRINK'
    },
    product_06: {
      id:         6,
      name:      'Skittles',
      shortName: 'SKIT',
      quantity:  20,
      price:     0.30,
      urlImage:  'http://www.mygermanmarket.com/media/aitmanufacturers/176.png',
      minimum:   10,
      category:  'FOOD'
    },
    product_07: {
      id:         7,
      name:      'Eau',
      shortName: 'H2O',
      quantity:  3,
      price:     0.40,
      urlImage:  'https://evianyoung.files.wordpress.com/2012/10/evian-logo11.jpg',
      minimum:   10,
      category:  'DRINK'
    },
    product_08: {
      id:         8,
      name:      'Coca Cola',
      shortName: 'COCA',
      quantity:  100,
      price:     0.50,
      urlImage:  'http://hotrodsubs.com/images/CokeLogo.jpg',
      minimum:   20,
      category:  'DRINK'
    },
    purchasePair_01: {
      id:       1,
      product:  1,
      quantity: 20
    },
    purchasePair_02: {
      id:       2,
      product:  2,
      quantity: 15
    },
    purchasePair_03: {
      id:       3,
      product:  3,
      quantity: 10
    },
    purchasePair_04: {
      id:       4,
      product:  2,
      quantity: 11
    },
    purchasePair_05: {
      id:       5,
      product:  3,
      quantity: 3
    },
    purchasePair_06: {
      id:       6,
      product:  4,
      quantity: 1
    },
    salePair_11: {
      id:       11,
      product:  3,
      quantity: 2
    },
    salePair_12: {
      id:       12,
      product:  2,
      quantity: 1
    },
    salePair_13: {
      id:       13,
      product:  2,
      quantity: 4
    },
    salePair_14: {
      id:       14,
      product:  4,
      quantity: 2
    },
    salePair_15: {
      id:       15,
      product:  1,
      quantity: 2
    },
    salePair_16: {
      id:       16,
      product:  4,
      quantity: 1
    },
    purchase_01: {
      id:           1,
      manager:      1,
      products:     [1,2,3],
      purchaseDate: '2015-08-18T21:38:52.750Z'
    },
    purchase_02: {
      id:           2,
      manager:      1,
      products:     [4,5],
      purchaseDate: '2015-08-18T21:38:52.750Z'
    },
    purchase_03: {
      id:           3,
      manager:      1,
      products:     [6],
      purchaseDate: '2015-08-18T21:38:52.750Z'
    },
    sale_01: {
      id:           1,
      manager:      1,
      customer:     1,
      products:     [11,13],
      saleDate:     '2015-08-18T21:38:52.750Z'
    },
    sale_02: {
      id:           2,
      manager:      1,
      customer:     11,
      products:     [14,15],
      saleDate:     '2015-08-18T21:38:52.750Z'
    },
    sale_03: {
      id:           3,
      manager:      1,
      customer:     12,
      products:     [12],
      saleDate:     '2015-08-18T21:38:52.750Z'
    },
    sale_04: {
      id:           4,
      manager:      1,
      customer:     13,
      products:     [16],
      saleDate:     '2015-08-18T21:38:52.750Z'
    }
};
