export const defaultProducts = [
  {
    slug: 'winix-ts-200s',
    name: 'WINIX TS-200S',
    type: 'Намхан загвар',
    image: '/ts200s.png',
    gallery: [
      '/winix/0.png', '/winix/1.png', '/winix/2.png', '/winix/3.png',
      '/winix/4.png', '/winix/5.png', '/winix/6.png', '/winix/7.png',
      '/winix/8.png',
    ],
    badge: 'ХЯМДРАЛ',
    category: 'winix',
    description: 'Ширээ болон тавцан дээр байрлуулахад тохиромжтой авсаархан загвар.',
    sortOrder: 1,
    active: true,
    options: [
      {
        id: 'winix-ts200s', name: 'WINIX TS-200S', shortName: 'Намхан загвар',
        oldPrice: '1,250,000₮', price: '1,080,000₮',
        description: 'Ширээ болон тавцан дээр байрлуулахад тохиромжтой авсаархан загвар.',
        recommended: true, items: [],
      },
    ],
  },
  {
    slug: 'aquablue-faucet',
    name: 'Цорготой ус цэвэршүүлэгч',
    type: '4 шатлалт систем',
    image: '/us.png',
    gallery: ['/tsorgo2.jpg', '/tsorgo-year.png'],
    badge: '2 СОНГОЛТТОЙ',
    category: 'faucet',
    description: 'AQUABLUE Солонгос 4 шатлалт цорготой ус цэвэршүүлэгч.',
    sortOrder: 2,
    active: true,
    options: [
      {
        id: 'basic-package', name: 'AQUABLUE үндсэн багц', shortName: 'Үндсэн багц',
        oldPrice: '230,000₮', price: '125,000₮', image: '/tsorgo2.jpg', badge: 'ХЯМДРАЛ',
        description: 'AQUABLUE Солонгос ус цэвэршүүлэгч нь усан дахь байгалийн эрдэс бодисыг хадгалж, эвгүй үнэр, амт, зэв болон бусад бохирдлыг шүүнэ.',
        recommended: false,
        items: ['4 үе шаттай ус цэвэршүүлэх шүүлтүүр', 'Зэвэрдэггүй ган цорго', 'Суурилуулах холбох хэрэгсэл', 'Хүргэлт, суурилуулалт үнэгүй'],
      },
      {
        id: 'annual-package', name: 'AQUABLUE бүтэн жилийн багц', shortName: 'Бүтэн жилийн багц',
        oldPrice: '316,500₮', price: '210,000₮', image: '/tsorgo-year.png', badge: 'ХАМГИЙН ЭРЭЛТТЭЙ',
        description: 'Нэг жилийн турш цэвэр ус хэрэглэхэд шаардлагатай шүүлтүүр, цорго, холбох хэрэгсэл болон хяналтын картыг багтаасан иж бүрэн багц.',
        recommended: true,
        items: ['8 ширхэг усны шүүлтүүр', 'Зэвэрдэггүй ган цорго', 'Шүүлтүүр солих хяналтын карт', 'Суурилуулах холбох хэрэгсэл', 'Хүргэлт, суурилуулалт үнэгүй'],
      },
    ],
  },
  {
    slug: 'winix-ts-200',
    name: 'WINIX TS-200',
    type: 'Өндөр загвар',
    image: '/winixts200.jpg',
    gallery: ['/winixts200.jpg'],
    badge: 'ХЯМДРАЛ',
    category: 'winix',
    description: 'Шалан дээр байрлуулах зориулалттай, зай бага эзлэх өндөр загвар.',
    sortOrder: 3,
    active: true,
    options: [
      {
        id: 'winix-ts200', name: 'WINIX TS-200', shortName: 'Өндөр загвар',
        oldPrice: '1,350,000₮', price: '1,190,000₮',
        description: 'Шалан дээр байрлуулах зориулалттай, зай бага эзлэх өндөр загвар.',
        recommended: false, items: [],
      },
    ],
  },
];

export const defaultFilters = [
  {
    stage: '01', name: 'ТУНАДАСТ ШҮҮР', englishName: 'SEDIMENT FILTER',
    image: '/filter/1.png',
    description: 'Усанд агуулагдах зэв, элс, шороо, тунадас болон бусад механик бохирдлыг шүүнэ. Дараагийн шатны шүүлтүүрүүдийг хамгаалж, ашиглалтын хугацааг уртасгана.',
    duration: '3 сар', price: '25,000₮', accent: 'rose', sortOrder: 1, active: true,
  },
  {
    stage: '02', name: 'НҮҮРСЭН ШҮҮР', englishName: 'PRE CARBON FILTER',
    image: '/filter/4.png',
    description: 'Усан дахь үлдэгдэл хлор, органик нэгдэл, эвгүй үнэр болон амтыг бууруулж, дараагийн шатны шүүлтүүрийн ажиллагааг хамгаална.',
    duration: '6 сар', price: '30,000₮', accent: 'green', sortOrder: 2, active: true,
  },
  {
    stage: '03', name: 'UF МЕМБРАН ШҮҮР', englishName: 'NANO MEMBRANE FILTER',
    image: '/filter/2.png',
    description: 'Усанд агуулагдах нян, бичил биет болон нарийн ширхэгтэй бохирдлыг шүүн, хүний биед хэрэгтэй байгалийн эрдэс бодисыг хадгална.',
    duration: '9 сар', price: '45,000₮', accent: 'blue', sortOrder: 3, active: true,
  },
  {
    stage: '04', name: 'ИДЭВХЖҮҮЛСЭН НҮҮРСЭН ШҮҮР', englishName: 'POST CARBON FILTER',
    image: '/filter/3.png',
    description: 'Цэвэршүүлэлтийн сүүлийн шатанд үлдэгдэл хлор, эвгүй үнэр болон амтыг бууруулж, усны амт чанарыг сайжруулна.',
    duration: '12 сар', price: '35,000₮', accent: 'orange', sortOrder: 4, active: true,
  },
];

export const defaultSettings = {
  key: 'main',
  siteName: 'ТӨГС ЦЭНГЭГ УС ХХК',
  logo: '/logo2.png',
  homeBadge: 'Цэвэр ус • Эрүүл хэрэглээ',
  homeTitle: 'ЗАХИАЛГА ӨГӨХ',
  homeSubtitle: 'Өөрт тохирох бүтээгдэхүүн болон үнийн багцаа сонгоорой.',
  phoneNumbers: ['7676-7576', '9007-7576', '9176-7576'],
  facebookUrl: 'https://www.facebook.com/ustsewershuulegch/',
  orderEmail: 'naagii0329@gmail.com',
};
