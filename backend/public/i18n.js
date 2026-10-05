/* ============================================================
   RevUp — i18n (multi-language) layer
   Languages: Russian (ru), English (en), Kazakh (kk)

   HOW TO ADD NEW TEXT LATER:
     1. Add the same key under en, ru and kk in I18N below.
     2. In app.js write t('yourKey')  (or t('yourKey', { name: 'x' }) for
        placeholders written as {name} inside the text).
     If a key is missing in the active language it falls back to English,
     and if it's missing there too it shows the key itself (so nothing breaks).

   Server error messages (English, coming back from the API) are translated
   through the __server map + the ts() helper.
   ============================================================ */

const LANGS = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'kk', label: 'Қазақша', short: 'KK' },
];

const I18N = {
  /* ---------------------------------- ENGLISH ---------------------------------- */
  en: {
    // nav / shared
    signIn: 'Sign in',
    getStarted: 'Get started',
    startFree: 'Start free',
    haveAccount: 'I have an account',
    // landing
    heroTitle1: 'Order the right amount.',
    heroTitle2: 'Waste nothing.',
    heroSubtitle:
      "RevUp reads your store's sales, ranks what's really selling, and tells you exactly what to reorder — and what to stop ordering before it spoils.",
    pointFreeReport: 'First report free',
    pointCashRegister: 'Works with your cash register',
    pointBuiltKz: 'Built for retail in Kazakhstan',
    artRevenue30: 'Revenue (30 days)',
    artTopDemand: 'Top demand',
    artSalesTrend: 'Sales trend',
    // auth brand
    authBrandTitle: 'Smart reordering for your stores.',
    authBrandSub: 'Turn your sales into a clear plan: what to order, how much, and what to cut.',
    authPoint1: 'Best-sellers ranked by real demand',
    authPoint2: 'Reorder quantities for every product',
    authPoint3: 'Waste caught before it costs you',
    // auth card
    createAccountTitle: 'Create your account',
    welcomeBack: 'Welcome back',
    signupSub: 'Start with your first report free.',
    loginSub: 'Sign in to your stores and reports.',
    businessName: 'Business name',
    businessPlaceholder: 'e.g. Astana Market LLP',
    email: 'Email',
    password: 'Password',
    createAccountBtn: 'Create account',
    alreadyRegistered: 'Already registered?',
    newToRevup: 'New to RevUp?',
    createAccountLink: 'Create an account',
    backHome: '← Back to home',
    // client validation
    errBusiness: 'Please enter your business name.',
    errEmail: 'Please enter a valid email.',
    errPassword: 'Password must be at least 6 characters.',
    // sidebar
    dashboard: 'Dashboard',
    stores: 'Stores',
    logOut: 'Log out',
    language: 'Language',
    // dashboard
    dashSubtitle: 'Your business at a glance — last 30 days.',
    revenue: 'Revenue',
    unitsSold: 'Units sold',
    suggestedOrder: 'Suggested order',
    revenueTrend30: 'Revenue trend (30 days)',
    yourStores: 'Your stores',
    viewAll: 'View all',
    // stores
    storesSubtitle: 'Pick a store to see its statistics and reorder plan.',
    addStore: 'Add store',
    addStoreCard: 'Add a store',
    revenue30d: 'Revenue (30d)',
    statusApi: 'API · {provider}',
    statusFile: 'Sales file',
    statusNoData: 'No data yet',
    // add-store modal
    addStoreDesc:
      'The store starts empty. Upload a sales file or connect its cash register inside the store.',
    storeName: 'Store name',
    storeNamePlaceholder: 'e.g. Branch 2, Almaly',
    location: 'Location',
    locationPlaceholder: 'e.g. Almaty',
    // store detail
    allStores: 'All stores',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    takeReport: 'Take report',
    emptyHasData: 'Tap <b>Take report</b> to generate statistics and recommendations.',
    emptyNoData:
      'This store has no sales yet. <b>Upload a CSV</b> or <b>connect a cash register</b> above to begin.',
    // connection bar
    connectedTo: 'Connected to <b>{provider}</b> (automatic) · last synced {last}',
    syncSalesBtn: 'Sync sales',
    disconnect: 'Disconnect',
    fileLoaded: 'Sales file loaded · <b>{filename}</b> · {count} rows',
    replaceFile: 'Replace file',
    clear: 'Clear',
    loadSalesPrompt: "Load this store's sales — automatic or by file:",
    uploadCsv: 'Upload CSV (manual)',
    connectApi: 'Connect API (automatic)',
    lastSyncNotYet: 'not yet',
    // report history
    reportHistory: 'Report history',
    histSub: '{period} report · {rev} · {units} units',
    view: 'View',
    viewing: 'Viewing',
    // statistics
    revenuePeriod: 'Revenue ({period})',
    productsSold: 'Products sold',
    avgItemPrice: 'Avg item price',
    revenueTrend: 'Revenue trend',
    topGoods: 'Top goods by demand',
    searchProduct: 'Search product',
    statistics: 'Statistics',
    recommendations: 'Recommendations',
    revenueByProduct: 'Revenue by product',
    shareOfRevenue: 'Share',
    chartHint: 'Hover or tap a bar to see details',
    waHeader: 'RevUp — reorder list',
    waNothing: 'No products need reordering right now.',
    // recommendations
    suggestedOrderValue: 'Suggested order value',
    productsToOrder: '{n} products to order',
    wasteAtRisk: 'Waste at risk',
    flaggedToReduce: 'flagged to reduce',
    reorderRecs: 'Reorder recommendations',
    status_rising: 'Rising demand',
    status_falling: 'Falling — order less',
    status_slow: 'Slow mover',
    status_expiry: 'Overstocked — will expire',
    status_steady: 'Steady',
    trimmedNote: 'trimmed to avoid waste',
    orderLabel: 'order',
    // upload modal
    uploadTitle: 'Upload sales file (CSV)',
    uploadDesc:
      "Export a CSV from any cash system — <b>any column names work</b>. You'll confirm which column is which on the next step.",
    chooseCsv: 'Choose CSV file',
    fileEmpty: 'That file looks empty.',
    fileReadErr: 'Could not read that file.',
    matchColumns: 'Match your columns',
    matchDesc:
      'RevUp guessed these from <b>{filename}</b>. Fix any that are wrong — this is how it reads <b>any</b> format.',
    colProduct: 'Product name',
    colQuantity: 'Quantity sold',
    colPrice: 'Sale price (for revenue)',
    colDate: 'Sale date',
    colStock: 'Current stock',
    back: 'Back',
    loadRows: 'Load {n} rows',
    chooseProductQuantity: 'Please choose the Product and Quantity columns.',
    loadedRows: 'Loaded {n} rows — now tap Take report',
    // connect modal
    connectTitle: 'Connect cash register',
    connectDesc:
      'Enter the API details from your cash system so RevUp can read sales automatically.',
    cashSystem: 'Cash system',
    apiKey: 'API key',
    apiKeyPlaceholder: 'paste the API key from your POS',
    merchantId: 'Merchant / store ID (optional)',
    merchantPlaceholder: 'if your POS gives you one',
    connectNote:
      'Your key is sent to the RevUp server and stored encrypted — it never stays in the browser. (Sync currently returns sample data until a real POS provider is wired in.)',
    connectBtn: 'Connect',
    errApiKey: 'Please paste your API key.',
    // toasts
    connectedSynced: 'Connected & synced {n} rows',
    syncing: 'Syncing…',
    syncedRows: 'Synced {n} rows from {provider}',
    disconnectedCleared: 'Disconnected — store data cleared',
    clearedRemoved: 'Cleared — store data removed',
    allowPopups: 'Allow pop-ups to download the PDF',
    cannotReach: 'Cannot reach the server. Is the backend running?',
    couldNotReport: 'Could not generate report',
    couldNotOpenReport: 'Could not open that report',
    requestFailed: 'Request failed ({status})',
    // paywall
    freeReportUsed: 'Your free report is used',
    paywallDesc: 'Subscribe to generate unlimited reports for all your stores.',
    perYear: '/ year',
    proFeature1: 'Unlimited weekly, monthly & yearly reports',
    proFeature2: 'Reorder recommendations for every product',
    proFeature3: 'Waste & overstock alerts across all stores',
    subscribeBtn: 'Subscribe — ₸40 000 / year',
    paywallNote: 'Demo button. Real payment (Kaspi / card) connects with the backend.',
    // loading / error
    loading: 'Loading…',
    somethingWrong: 'Something went wrong',
    unknownError: 'Unknown error',
    reload: 'Reload',
    // PDF
    pdfReportTitle: 'RevUp report — {store}',
    pdfOrderThese: 'Order these',
    pdfProduct: 'Product',
    pdfOrder: 'Order',
    pdfValue: 'Value',
    pdfOrderLess: 'Order less / waste risk',
    pdfUnits: 'Units',
    pdfGeneratedBy: 'Generated by RevUp',
    __server: {},
  },

  /* ---------------------------------- RUSSIAN ---------------------------------- */
  ru: {
    signIn: 'Войти',
    getStarted: 'Начать',
    startFree: 'Начать бесплатно',
    haveAccount: 'У меня есть аккаунт',
    heroTitle1: 'Заказывайте ровно столько, сколько нужно.',
    heroTitle2: 'Ничего не выбрасывая.',
    heroSubtitle:
      'RevUp анализирует продажи вашего магазина, показывает, что действительно продаётся, и точно подсказывает, что дозаказать — и что перестать заказывать, пока оно не испортилось.',
    pointFreeReport: 'Первый отчёт бесплатно',
    pointCashRegister: 'Работает с вашей кассой',
    pointBuiltKz: 'Создано для розницы в Казахстане',
    artRevenue30: 'Выручка (30 дней)',
    artTopDemand: 'Топ спроса',
    artSalesTrend: 'Динамика продаж',
    authBrandTitle: 'Умные дозаказы для ваших магазинов.',
    authBrandSub: 'Превратите продажи в чёткий план: что заказать, сколько и что сократить.',
    authPoint1: 'Хиты продаж по реальному спросу',
    authPoint2: 'Объёмы дозаказа для каждого товара',
    authPoint3: 'Списания выявляются заранее',
    createAccountTitle: 'Создайте аккаунт',
    welcomeBack: 'С возвращением',
    signupSub: 'Начните с первого бесплатного отчёта.',
    loginSub: 'Войдите к своим магазинам и отчётам.',
    businessName: 'Название бизнеса',
    businessPlaceholder: 'напр. ТОО «Astana Market»',
    email: 'Эл. почта',
    password: 'Пароль',
    createAccountBtn: 'Создать аккаунт',
    alreadyRegistered: 'Уже зарегистрированы?',
    newToRevup: 'Впервые в RevUp?',
    createAccountLink: 'Создать аккаунт',
    backHome: '← На главную',
    errBusiness: 'Введите название бизнеса.',
    errEmail: 'Введите корректный email.',
    errPassword: 'Пароль должен быть не менее 6 символов.',
    dashboard: 'Панель',
    stores: 'Магазины',
    logOut: 'Выйти',
    language: 'Язык',
    dashSubtitle: 'Ваш бизнес с первого взгляда — за 30 дней.',
    revenue: 'Выручка',
    unitsSold: 'Продано единиц',
    suggestedOrder: 'Реком. заказ',
    revenueTrend30: 'Динамика выручки (30 дней)',
    yourStores: 'Ваши магазины',
    viewAll: 'Смотреть все',
    storesSubtitle: 'Выберите магазин, чтобы увидеть статистику и план дозаказа.',
    addStore: 'Добавить магазин',
    addStoreCard: 'Добавить магазин',
    revenue30d: 'Выручка (30д)',
    statusApi: 'API · {provider}',
    statusFile: 'Файл продаж',
    statusNoData: 'Пока нет данных',
    addStoreDesc:
      'Магазин создаётся пустым. Загрузите файл продаж или подключите кассу внутри магазина.',
    storeName: 'Название магазина',
    storeNamePlaceholder: 'напр. Филиал 2, Алмалы',
    location: 'Локация',
    locationPlaceholder: 'напр. Алматы',
    allStores: 'Все магазины',
    weekly: 'Неделя',
    monthly: 'Месяц',
    yearly: 'Год',
    takeReport: 'Сформировать отчёт',
    emptyHasData:
      'Нажмите <b>Сформировать отчёт</b>, чтобы получить статистику и рекомендации.',
    emptyNoData:
      'В этом магазине пока нет продаж. <b>Загрузите CSV</b> или <b>подключите кассу</b> выше, чтобы начать.',
    connectedTo:
      'Подключено к <b>{provider}</b> (автоматически) · последняя синхронизация {last}',
    syncSalesBtn: 'Синхронизировать',
    disconnect: 'Отключить',
    fileLoaded: 'Файл продаж загружен · <b>{filename}</b> · {count} строк',
    replaceFile: 'Заменить файл',
    clear: 'Очистить',
    loadSalesPrompt: 'Загрузите продажи этого магазина — автоматически или файлом:',
    uploadCsv: 'Загрузить CSV (вручную)',
    connectApi: 'Подключить API (авто)',
    lastSyncNotYet: 'ещё не было',
    reportHistory: 'История отчётов',
    histSub: '{period} · отчёт · {rev} · {units} ед.',
    view: 'Открыть',
    viewing: 'Открыт',
    revenuePeriod: 'Выручка ({period})',
    productsSold: 'Товаров продано',
    avgItemPrice: 'Средняя цена',
    revenueTrend: 'Динамика выручки',
    topGoods: 'Топ товаров по спросу',
    searchProduct: 'Поиск товара',
    statistics: 'Статистика',
    recommendations: 'Рекомендации',
    revenueByProduct: 'Выручка по товарам',
    shareOfRevenue: 'Доля',
    chartHint: 'Наведите или коснитесь столбца, чтобы увидеть детали',
    waHeader: 'RevUp — список дозаказа',
    waNothing: 'Сейчас ничего дозаказывать не нужно.',
    suggestedOrderValue: 'Сумма реком. заказа',
    productsToOrder: '{n} товаров к заказу',
    wasteAtRisk: 'Риск списания',
    flaggedToReduce: 'рекомендуется сократить',
    reorderRecs: 'Рекомендации по дозаказу',
    status_rising: 'Растущий спрос',
    status_falling: 'Падает — заказывайте меньше',
    status_slow: 'Медленно продаётся',
    status_expiry: 'Избыток — истечёт срок',
    status_steady: 'Стабильно',
    trimmedNote: 'уменьшено во избежание списания',
    orderLabel: 'заказ',
    uploadTitle: 'Загрузить файл продаж (CSV)',
    uploadDesc:
      'Выгрузите CSV из любой кассовой системы — <b>подойдут любые названия столбцов</b>. На следующем шаге вы подтвердите соответствие столбцов.',
    chooseCsv: 'Выбрать CSV-файл',
    fileEmpty: 'Похоже, файл пустой.',
    fileReadErr: 'Не удалось прочитать файл.',
    matchColumns: 'Сопоставьте столбцы',
    matchDesc:
      'RevUp определил их из <b>{filename}</b>. Исправьте неверные — так он читает <b>любой</b> формат.',
    colProduct: 'Название товара',
    colQuantity: 'Продано количество',
    colPrice: 'Цена продажи (для выручки)',
    colDate: 'Дата продажи',
    colStock: 'Текущий остаток',
    back: 'Назад',
    loadRows: 'Загрузить {n} строк',
    chooseProductQuantity: 'Выберите столбцы «Товар» и «Количество».',
    loadedRows: 'Загружено {n} строк — теперь нажмите «Сформировать отчёт»',
    connectTitle: 'Подключить кассу',
    connectDesc:
      'Введите данные API вашей кассовой системы, чтобы RevUp читал продажи автоматически.',
    cashSystem: 'Кассовая система',
    apiKey: 'API-ключ',
    apiKeyPlaceholder: 'вставьте API-ключ из вашей кассы',
    merchantId: 'ID продавца / магазина (необязательно)',
    merchantPlaceholder: 'если касса его выдаёт',
    connectNote:
      'Ключ отправляется на сервер RevUp и хранится в зашифрованном виде — он не остаётся в браузере. (Пока не подключён реальный поставщик кассы, синхронизация возвращает демо-данные.)',
    connectBtn: 'Подключить',
    errApiKey: 'Вставьте ваш API-ключ.',
    connectedSynced: 'Подключено, синхронизировано {n} строк',
    syncing: 'Синхронизация…',
    syncedRows: 'Синхронизировано {n} строк из {provider}',
    disconnectedCleared: 'Отключено — данные магазина очищены',
    clearedRemoved: 'Очищено — данные магазина удалены',
    allowPopups: 'Разрешите всплывающие окна для загрузки PDF',
    cannotReach: 'Не удаётся связаться с сервером. Бэкенд запущен?',
    couldNotReport: 'Не удалось сформировать отчёт',
    couldNotOpenReport: 'Не удалось открыть отчёт',
    requestFailed: 'Ошибка запроса ({status})',
    freeReportUsed: 'Бесплатный отчёт использован',
    paywallDesc: 'Оформите подписку для неограниченных отчётов по всем магазинам.',
    perYear: '/ год',
    proFeature1: 'Неограниченные отчёты: неделя, месяц и год',
    proFeature2: 'Рекомендации по дозаказу для каждого товара',
    proFeature3: 'Оповещения о списаниях и избытке по всем магазинам',
    subscribeBtn: 'Оформить — ₸40 000 / год',
    paywallNote: 'Демо-кнопка. Реальная оплата (Kaspi / карта) подключается на бэкенде.',
    loading: 'Загрузка…',
    somethingWrong: 'Что-то пошло не так',
    unknownError: 'Неизвестная ошибка',
    reload: 'Обновить',
    pdfReportTitle: 'Отчёт RevUp — {store}',
    pdfOrderThese: 'Заказать это',
    pdfProduct: 'Товар',
    pdfOrder: 'Заказ',
    pdfValue: 'Сумма',
    pdfOrderLess: 'Заказать меньше / риск списания',
    pdfUnits: 'Ед.',
    pdfGeneratedBy: 'Сформировано RevUp',
    __server: {
      'An account with this email already exists.': 'Аккаунт с таким email уже существует.',
      'Wrong email or password.': 'Неверный email или пароль.',
      'Please enter your business name.': 'Введите название бизнеса.',
      'Please enter a valid email.': 'Введите корректный email.',
      'Password must be at least 6 characters.': 'Пароль должен быть не менее 6 символов.',
      'Store name is required.': 'Укажите название магазина.',
      'Store name cannot be empty.': 'Название магазина не может быть пустым.',
      'Store not found.': 'Магазин не найден.',
      'Upload a file or connect a cash register first.':
        'Сначала загрузите файл или подключите кассу.',
      'Your free report is used. Subscribe to generate more.':
        'Бесплатный отчёт использован. Оформите подписку.',
      'This store is not connected to a cash register.':
        'Этот магазин не подключён к кассе.',
      'A Product column and a Quantity column are required.':
        'Нужны столбцы «Товар» и «Количество».',
      'That file looks empty.': 'Похоже, файл пустой.',
      'Please provide your POS API key.': 'Укажите API-ключ вашей кассы.',
      'User not found.': 'Пользователь не найден.',
    },
  },

  /* ---------------------------------- KAZAKH ---------------------------------- */
  kk: {
    signIn: 'Кіру',
    getStarted: 'Бастау',
    startFree: 'Тегін бастау',
    haveAccount: 'Аккаунтым бар',
    heroTitle1: 'Дәл қажет мөлшерде тапсырыс беріңіз.',
    heroTitle2: 'Ештеңені ысырап етпей.',
    heroSubtitle:
      'RevUp дүкеніңіздің сатылымын талдап, шын мәнінде не сатылып жатқанын көрсетеді және нені қайта тапсырыс беру керегін — және бүлінбей тұрып нені тоқтату керегін дәл айтады.',
    pointFreeReport: 'Алғашқы есеп тегін',
    pointCashRegister: 'Кассаңызбен жұмыс істейді',
    pointBuiltKz: 'Қазақстандағы бөлшек сауда үшін жасалған',
    artRevenue30: 'Түсім (30 күн)',
    artTopDemand: 'Ең сұранысты',
    artSalesTrend: 'Сатылым динамикасы',
    authBrandTitle: 'Дүкендеріңіз үшін ақылды қайта тапсырыс.',
    authBrandSub:
      'Сатылымыңызды нақты жоспарға айналдырыңыз: нені, қанша тапсырыс беру керек және нені азайту керек.',
    authPoint1: 'Нақты сұраныс бойынша топ-сатылымдар',
    authPoint2: 'Әр тауар үшін қайта тапсырыс көлемі',
    authPoint3: 'Ысырап шығынға айналмай тұрып анықталады',
    createAccountTitle: 'Аккаунт жасаңыз',
    welcomeBack: 'Қайта келуіңізбен',
    signupSub: 'Алғашқы тегін есептен бастаңыз.',
    loginSub: 'Дүкендеріңіз бен есептеріңізге кіріңіз.',
    businessName: 'Бизнес атауы',
    businessPlaceholder: 'мыс. «Astana Market» ЖШС',
    email: 'Эл. пошта',
    password: 'Құпиясөз',
    createAccountBtn: 'Аккаунт жасау',
    alreadyRegistered: 'Тіркелдіңіз бе?',
    newToRevup: 'RevUp-та алғаш ретсіз бе?',
    createAccountLink: 'Аккаунт жасау',
    backHome: '← Басты бетке',
    errBusiness: 'Бизнес атауын енгізіңіз.',
    errEmail: 'Жарамды email енгізіңіз.',
    errPassword: 'Құпиясөз кемінде 6 таңбадан тұруы керек.',
    dashboard: 'Басқару тақтасы',
    stores: 'Дүкендер',
    logOut: 'Шығу',
    language: 'Тіл',
    dashSubtitle: 'Бизнесіңізге жалпы шолу — соңғы 30 күн.',
    revenue: 'Түсім',
    unitsSold: 'Сатылған дана',
    suggestedOrder: 'Ұсынылған тапсырыс',
    revenueTrend30: 'Түсім динамикасы (30 күн)',
    yourStores: 'Сіздің дүкендер',
    viewAll: 'Барлығын көру',
    storesSubtitle: 'Статистика мен қайта тапсырыс жоспарын көру үшін дүкенді таңдаңыз.',
    addStore: 'Дүкен қосу',
    addStoreCard: 'Дүкен қосу',
    revenue30d: 'Түсім (30к)',
    statusApi: 'API · {provider}',
    statusFile: 'Сатылым файлы',
    statusNoData: 'Әзірге дерек жоқ',
    addStoreDesc:
      'Дүкен бос құрылады. Сатылым файлын жүктеңіз немесе дүкен ішінде кассаны қосыңыз.',
    storeName: 'Дүкен атауы',
    storeNamePlaceholder: 'мыс. 2-филиал, Алмалы',
    location: 'Орналасуы',
    locationPlaceholder: 'мыс. Алматы',
    allStores: 'Барлық дүкендер',
    weekly: 'Апта',
    monthly: 'Ай',
    yearly: 'Жыл',
    takeReport: 'Есеп жасау',
    emptyHasData:
      'Статистика мен ұсыныстарды алу үшін <b>Есеп жасау</b> түймесін басыңыз.',
    emptyNoData:
      'Бұл дүкенде әзірге сатылым жоқ. Бастау үшін жоғарыдан <b>CSV жүктеңіз</b> немесе <b>касса қосыңыз</b>.',
    connectedTo:
      '<b>{provider}</b>-ке қосылған (автоматты) · соңғы синхрондау {last}',
    syncSalesBtn: 'Синхрондау',
    disconnect: 'Ажырату',
    fileLoaded: 'Сатылым файлы жүктелді · <b>{filename}</b> · {count} жол',
    replaceFile: 'Файлды ауыстыру',
    clear: 'Тазалау',
    loadSalesPrompt: 'Осы дүкеннің сатылымын жүктеңіз — автоматты немесе файлмен:',
    uploadCsv: 'CSV жүктеу (қолмен)',
    connectApi: 'API қосу (авто)',
    lastSyncNotYet: 'әлі жоқ',
    reportHistory: 'Есептер тарихы',
    histSub: '{period} · есеп · {rev} · {units} дана',
    view: 'Ашу',
    viewing: 'Ашық',
    revenuePeriod: 'Түсім ({period})',
    productsSold: 'Сатылған тауар',
    avgItemPrice: 'Орташа баға',
    revenueTrend: 'Түсім динамикасы',
    topGoods: 'Сұраныс бойынша топ тауарлар',
    searchProduct: 'Тауар іздеу',
    statistics: 'Статистика',
    recommendations: 'Ұсыныстар',
    revenueByProduct: 'Тауар бойынша түсім',
    shareOfRevenue: 'Үлесі',
    chartHint: 'Мәліметтерді көру үшін бағанды меңзеңіз немесе түртіңіз',
    waHeader: 'RevUp — қайта тапсырыс тізімі',
    waNothing: 'Қазір ешнәрсеге қайта тапсырыс беру қажет емес.',
    suggestedOrderValue: 'Ұсынылған тапсырыс сомасы',
    productsToOrder: '{n} тауарға тапсырыс',
    wasteAtRisk: 'Ысырап қаупі',
    flaggedToReduce: 'азайту ұсынылады',
    reorderRecs: 'Қайта тапсырыс ұсыныстары',
    status_rising: 'Өсіп келе жатқан сұраныс',
    status_falling: 'Төмендеуде — азырақ тапсырыс беріңіз',
    status_slow: 'Баяу сатылады',
    status_expiry: 'Артық қор — мерзімі бітеді',
    status_steady: 'Тұрақты',
    trimmedNote: 'ысыраптың алдын алу үшін азайтылды',
    orderLabel: 'тапсырыс',
    uploadTitle: 'Сатылым файлын жүктеу (CSV)',
    uploadDesc:
      'Кез келген касса жүйесінен CSV шығарыңыз — <b>кез келген баған атаулары жарайды</b>. Келесі қадамда бағандарды растайсыз.',
    chooseCsv: 'CSV файлын таңдау',
    fileEmpty: 'Бұл файл бос сияқты.',
    fileReadErr: 'Файлды оқу мүмкін болмады.',
    matchColumns: 'Бағандарды сәйкестендіріңіз',
    matchDesc:
      'RevUp оларды <b>{filename}</b> файлынан анықтады. Қателерін түзетіңіз — ол <b>кез келген</b> форматты осылай оқиды.',
    colProduct: 'Тауар атауы',
    colQuantity: 'Сатылған саны',
    colPrice: 'Сату бағасы (түсім үшін)',
    colDate: 'Сату күні',
    colStock: 'Ағымдағы қалдық',
    back: 'Артқа',
    loadRows: '{n} жолды жүктеу',
    chooseProductQuantity: '«Тауар» және «Саны» бағандарын таңдаңыз.',
    loadedRows: '{n} жол жүктелді — енді «Есеп жасау» түймесін басыңыз',
    connectTitle: 'Касса қосу',
    connectDesc:
      'RevUp сатылымды автоматты оқуы үшін касса жүйеңіздің API деректерін енгізіңіз.',
    cashSystem: 'Касса жүйесі',
    apiKey: 'API кілті',
    apiKeyPlaceholder: 'кассаңыздың API кілтін қойыңыз',
    merchantId: 'Сатушы / дүкен ID (міндетті емес)',
    merchantPlaceholder: 'касса берсе',
    connectNote:
      'Кілт RevUp серверіне жіберіліп, шифрланған түрде сақталады — ол браузерде қалмайды. (Нақты касса провайдері қосылғанша синхрондау демо-деректер қайтарады.)',
    connectBtn: 'Қосу',
    errApiKey: 'API кілтіңізді қойыңыз.',
    connectedSynced: 'Қосылды, {n} жол синхрондалды',
    syncing: 'Синхрондау…',
    syncedRows: '{provider}-тен {n} жол синхрондалды',
    disconnectedCleared: 'Ажыратылды — дүкен деректері тазаланды',
    clearedRemoved: 'Тазаланды — дүкен деректері жойылды',
    allowPopups: 'PDF жүктеу үшін қалқымалы терезелерге рұқсат етіңіз',
    cannotReach: 'Серверге қосылу мүмкін болмады. Бэкенд іске қосылған ба?',
    couldNotReport: 'Есеп жасау мүмкін болмады',
    couldNotOpenReport: 'Есепті ашу мүмкін болмады',
    requestFailed: 'Сұраныс сәтсіз аяқталды ({status})',
    freeReportUsed: 'Тегін есеп қолданылды',
    paywallDesc: 'Барлық дүкендер бойынша шексіз есеп үшін жазылыңыз.',
    perYear: '/ жыл',
    proFeature1: 'Шексіз апталық, айлық және жылдық есептер',
    proFeature2: 'Әр тауар үшін қайта тапсырыс ұсыныстары',
    proFeature3: 'Барлық дүкендердегі ысырап пен артық қор туралы ескертулер',
    subscribeBtn: 'Жазылу — ₸40 000 / жыл',
    paywallNote: 'Демо түйме. Нақты төлем (Kaspi / карта) бэкендте қосылады.',
    loading: 'Жүктелуде…',
    somethingWrong: 'Бірдеңе дұрыс болмады',
    unknownError: 'Белгісіз қате',
    reload: 'Жаңарту',
    pdfReportTitle: 'RevUp есебі — {store}',
    pdfOrderThese: 'Мыналарды тапсырыс беріңіз',
    pdfProduct: 'Тауар',
    pdfOrder: 'Тапсырыс',
    pdfValue: 'Сома',
    pdfOrderLess: 'Азырақ тапсырыс / ысырап қаупі',
    pdfUnits: 'Дана',
    pdfGeneratedBy: 'RevUp жасаған',
    __server: {
      'An account with this email already exists.': 'Мұндай email-мен аккаунт бұрыннан бар.',
      'Wrong email or password.': 'Email не құпиясөз қате.',
      'Please enter your business name.': 'Бизнес атауын енгізіңіз.',
      'Please enter a valid email.': 'Жарамды email енгізіңіз.',
      'Password must be at least 6 characters.': 'Құпиясөз кемінде 6 таңбадан тұруы керек.',
      'Store name is required.': 'Дүкен атауын көрсетіңіз.',
      'Store name cannot be empty.': 'Дүкен атауы бос болмауы керек.',
      'Store not found.': 'Дүкен табылмады.',
      'Upload a file or connect a cash register first.':
        'Алдымен файл жүктеңіз немесе касса қосыңыз.',
      'Your free report is used. Subscribe to generate more.':
        'Тегін есеп қолданылды. Жазылыңыз.',
      'This store is not connected to a cash register.':
        'Бұл дүкен кассаға қосылмаған.',
      'A Product column and a Quantity column are required.':
        '«Тауар» және «Саны» бағандары қажет.',
      'That file looks empty.': 'Бұл файл бос сияқты.',
      'Please provide your POS API key.': 'Кассаңыздың API кілтін енгізіңіз.',
      'User not found.': 'Пайдаланушы табылмады.',
    },
  },
};

/* ---------- active language (persisted) ---------- */
let LANG = localStorage.getItem('revup_lang');
if (!LANG || !I18N[LANG]) LANG = 'en'; // default; change to 'ru' or 'kk' to change the default
document.documentElement.lang = LANG;

function getLang() {
  return LANG;
}
function setLang(code) {
  if (!I18N[code]) return;
  LANG = code;
  localStorage.setItem('revup_lang', code);
  document.documentElement.lang = code;
}

// t('key') or t('key', { name: 'x' }) — {name} placeholders are filled from vars.
function t(key, vars) {
  const table = I18N[LANG] || I18N.en;
  let s = table[key];
  if (s === undefined) s = I18N.en[key];
  if (s === undefined) s = key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}

// Translate an English server error message into the active language, if known.
function ts(msg) {
  if (!msg) return msg;
  const table = I18N[LANG] || I18N.en;
  const map = table.__server || {};
  return map[msg] || msg;
}

/* ---------- language switcher UI ---------- */
// Full-label switcher (landing + auth), styled with the existing .seg control.
function langSwitcher() {
  return `<div class="seg" style="padding:3px">${LANGS.map(
    (l) =>
      `<button data-lang="${l.code}" class="${getLang() === l.code ? 'active' : ''}" style="padding:7px 12px;font-size:12.5px">${l.label}</button>`
  ).join('')}</div>`;
}
// Compact switcher for the dark sidebar (short codes).
function langSwitcherSide() {
  return `<div style="display:flex;gap:4px;padding:4px 8px 10px">${LANGS.map(
    (l) =>
      `<button data-lang="${l.code}" style="flex:1;padding:6px 0;border-radius:8px;font-size:11.5px;font-weight:600;background:${
        getLang() === l.code ? 'rgba(255,255,255,.14)' : 'transparent'
      };color:${getLang() === l.code ? '#fff' : 'var(--side-text)'}">${l.short}</button>`
  ).join('')}</div>`;
}
// Wire every [data-lang] button on screen to switch + re-render the current view.
function wireLang() {
  document.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => switchLang(b.getAttribute('data-lang'))));
}
function switchLang(code) {
  setLang(code);
  if (typeof render === 'function') render();
}
