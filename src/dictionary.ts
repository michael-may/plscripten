// EN: The heart of plscripten: a complete English -> Polish lexicon for the
// JavaScript + TypeScript language surface. Every entry is a single lexical
// token (no spaces) so it round-trips cleanly through the scanner.
// PL: Serce plscripten: kompletny słownik angielsko-polski dla powierzchni
// języka JavaScript + TypeScript. Każdy wpis to pojedynczy token leksykalny
// (bez spacji), dzięki czemu przechodzi przez skaner w obie strony bez strat.
//
// EN: Direction of truth is English -> Polish. The reverse map (Polish ->
// English) is derived and used by the preprocessor to turn .pls source back
// into standard TypeScript before transpilation.
// PL: Kierunkiem źródłowym jest angielski -> polski. Mapa odwrotna (polski ->
// angielski) jest wyprowadzana i używana przez preprocesor, aby zamienić kod
// .pls z powrotem na standardowy TypeScript przed transpilacją.

// EN: Which way a translation runs.
// PL: W którą stronę biegnie tłumaczenie.
export enum TranslationDirection {
	// EN: Polish source -> English TypeScript (what the runtime does).
	// PL: Polski kod -> angielski TypeScript (to robi środowisko uruchomieniowe).
	ToEnglish = 'to-english',
	// EN: English TypeScript -> Polish source (the `polonizuj` command).
	// PL: Angielski TypeScript -> polski kod (komenda `polonizuj`).
	ToPolish = 'to-polish',
}

// EN: A named group of translations, purely for documentation / tooling.
// PL: Nazwana grupa tłumaczeń, wyłącznie dla dokumentacji / narzędzi.
export class LexiconGroup {
	public readonly title: string;
	public readonly entries: Readonly<Record<string, string>>;

	constructor(title: string, entries: Record<string, string>) {
		this.title = title;
		this.entries = entries;
	}
}

// EN: Reserved words, declarations and control flow.
// PL: Słowa zastrzeżone, deklaracje i sterowanie przepływem.
const KEYWORDS: Record<string, string> = {
	// Declarations
	var: 'zmienna',
	let: 'niech',
	const: 'stała',
	function: 'funkcja',
	class: 'klasa',
	// Control flow
	if: 'jeżeli',
	else: 'inaczej',
	for: 'dla',
	while: 'dopóki',
	do: 'rób',
	switch: 'przełącz',
	case: 'przypadek',
	default: 'domyślne',
	break: 'przerwij',
	continue: 'kontynuuj',
	return: 'zwróć',
	throw: 'rzuć',
	try: 'spróbuj',
	catch: 'złap',
	finally: 'wreszcie',
	// Operators that are words
	new: 'nowy',
	delete: 'usuń',
	typeof: 'rodzaj',
	instanceof: 'instancją',
	in: 'w',
	of: 'spośród',
	void: 'pustka',
	yield: 'wydaj',
	await: 'czekaj',
	// Object oriented
	this: 'to',
	super: 'nadrzędny',
	extends: 'rozszerza',
	implements: 'implementuje',
	constructor: 'konstruktor',
	// Modules
	import: 'importuj',
	export: 'eksportuj',
	from: 'z',
	as: 'jako',
	require: 'wymagaj',
	exports: 'eksporty',
	with: 'ze',
	// Async
	async: 'asynchroniczna',
	// Misc statements
	debugger: 'odpluskwiacz',
	// Literals
	true: 'prawda',
	false: 'fałsz',
	null: 'nic',
	undefined: 'nieokreślone',
};

// EN: TypeScript-only keywords.
// PL: Słowa kluczowe wyłącznie TypeScript.
const TS_KEYWORDS: Record<string, string> = {
	interface: 'interfejs',
	type: 'typ',
	enum: 'wyliczenie',
	namespace: 'przestrzeń',
	module: 'moduł',
	declare: 'zadeklaruj',
	abstract: 'abstrakcyjna',
	readonly: 'tylkoodczyt',
	public: 'publiczna',
	private: 'prywatna',
	protected: 'chroniona',
	static: 'statyczna',
	get: 'pobierz',
	set: 'ustaw',
	keyof: 'kluczy',
	infer: 'wywnioskuj',
	is: 'jest',
	satisfies: 'spełnia',
	override: 'nadpisuje',
	accessor: 'akcesor',
	asserts: 'zapewnia',
	global: 'globalny',
	unique: 'unikalny',
};

// EN: Primitive & special type keywords.
// PL: Słowa kluczowe typów prostych i specjalnych.
const PRIMITIVE_TYPES: Record<string, string> = {
	boolean: 'logiczna',
	number: 'liczba',
	string: 'napis',
	object: 'obiekt',
	bigint: 'wielkaliczba',
	any: 'dowolny',
	unknown: 'nieznane',
	never: 'nigdy',
};

// EN: TypeScript utility types.
// PL: Typy narzędziowe TypeScript.
const UTILITY_TYPES: Record<string, string> = {
	Partial: 'Częściowy',
	Required: 'Wymagany',
	Readonly: 'TylkoDoOdczytu',
	Record: 'Rekord',
	Pick: 'Wybierz',
	Omit: 'Pomiń',
	Exclude: 'Wyklucz',
	Extract: 'Wyodrębnij',
	NonNullable: 'Niepusty',
	Parameters: 'Parametry',
	ConstructorParameters: 'ParametryKonstruktora',
	ReturnType: 'TypZwracany',
	InstanceType: 'TypInstancji',
	Awaited: 'Oczekiwany',
	ThisParameterType: 'TypParametruThis',
	OmitThisParameter: 'PomińParametrThis',
	ThisType: 'TypThis',
	Uppercase: 'WielkieLitery',
	Lowercase: 'MałeLitery',
	Capitalize: 'ZDużejLitery',
	Uncapitalize: 'ZMałejLitery',
	ReadonlyArray: 'TablicaTylkoOdczytu',
};

// EN: Global constructors, namespaces and values.
// PL: Globalne konstruktory, przestrzenie nazw i wartości.
const GLOBALS: Record<string, string> = {
	Object: 'Obiekt',
	Array: 'Tablica',
	String: 'Napis',
	Number: 'Liczba',
	Boolean: 'Logiczna',
	Function: 'Funkcja',
	BigInt: 'WielkaLiczba',
	Promise: 'Obietnica',
	Map: 'Mapa',
	Set: 'Zbiór',
	WeakMap: 'SłabaMapa',
	WeakSet: 'SłabyZbiór',
	Date: 'Data',
	Math: 'Matematyka',
	RegExp: 'WyrażenieRegularne',
	Proxy: 'Pełnomocnik',
	Reflect: 'Refleksja',
	Error: 'Błąd',
	TypeError: 'BłądTypu',
	RangeError: 'BłądZakresu',
	SyntaxError: 'BłądSkładni',
	ReferenceError: 'BłądReferencji',
	EvalError: 'BłądEval',
	URIError: 'BłądURI',
	NaN: 'NieLiczba',
	Infinity: 'Nieskończoność',
	globalThis: 'globalneTo',
	console: 'konsola',
	process: 'proces',
	Buffer: 'Bufor',
	__dirname: '__katalog',
	__filename: '__plik',
};

// EN: Global functions.
// PL: Funkcje globalne.
const GLOBAL_FUNCTIONS: Record<string, string> = {
	parseInt: 'parsujCałkowitą',
	parseFloat: 'parsujZmiennoprzecinkową',
	isNaN: 'czyNieLiczba',
	isFinite: 'czySkończona',
	encodeURIComponent: 'zakodujKomponentURI',
	decodeURIComponent: 'odkodujKomponentURI',
	encodeURI: 'zakodujURI',
	decodeURI: 'odkodujURI',
	setTimeout: 'ustawLimitCzasu',
	clearTimeout: 'wyczyśćLimitCzasu',
	setInterval: 'ustawInterwał',
	clearInterval: 'wyczyśćInterwał',
	setImmediate: 'ustawNatychmiast',
	queueMicrotask: 'kolejkujMikrozadanie',
	structuredClone: 'klonStrukturalny',
	fetch: 'sprowadź',
};

// EN: Common built-in members (methods & properties). These are matched
// anywhere an identifier of the same name appears, including after a dot, so
// `tablica.mapuj(...)` becomes `array.map(...)`.
// PL: Popularne wbudowane składowe (metody i pola). Dopasowywane wszędzie tam,
// gdzie pojawia się identyfikator o tej samej nazwie, także po kropce, więc
// `tablica.mapuj(...)` staje się `array.map(...)`.
const MEMBERS: Record<string, string> = {
	// console
	log: 'dziennik',
	warn: 'ostrzeż',
	info: 'informacja',
	debug: 'debuguj',
	trace: 'ślad',
	table: 'tabela',
	// Array / iterable
	length: 'długość',
	push: 'wepchnij',
	pop: 'zdejmij',
	shift: 'przesuńZLewej',
	unshift: 'dodajZLewej',
	slice: 'wycinek',
	splice: 'wstawUsuń',
	concat: 'połącz',
	join: 'złącz',
	map: 'mapuj',
	filter: 'filtruj',
	reduce: 'zredukuj',
	reduceRight: 'zredukujOdPrawej',
	forEach: 'dlaKażdego',
	find: 'znajdź',
	findIndex: 'znajdźIndeks',
	findLast: 'znajdźOstatni',
	includes: 'zawiera',
	indexOf: 'indeksElementu',
	lastIndexOf: 'ostatniIndeksElementu',
	some: 'niektóre',
	every: 'każdy',
	sort: 'sortuj',
	reverse: 'odwróć',
	flat: 'spłaszcz',
	flatMap: 'spłaszczMapuj',
	fill: 'wypełnij',
	at: 'na',
	// Map / Set
	keys: 'klucze',
	values: 'wartości',
	entries: 'wpisy',
	has: 'ma',
	add: 'dodajElement',
	clear: 'wyczyść',
	size: 'rozmiar',
	// String
	toString: 'naNapis',
	valueOf: 'doWartości',
	toUpperCase: 'naWielkie',
	toLowerCase: 'naMałe',
	trim: 'przytnij',
	trimStart: 'przytnijZPrzodu',
	trimEnd: 'przytnijZTyłu',
	split: 'podziel',
	replace: 'zamień',
	replaceAll: 'zamieńWszystko',
	match: 'dopasuj',
	matchAll: 'dopasujWszystko',
	padStart: 'wypełnijZPrzodu',
	padEnd: 'wypełnijZTyłu',
	startsWith: 'zaczynaSię',
	endsWith: 'kończySię',
	charAt: 'znakNa',
	charCodeAt: 'kodZnakuNa',
	codePointAt: 'punktKoduNa',
	repeat: 'powtórz',
	substring: 'podnapis',
	// Number
	toFixed: 'doStałej',
	toPrecision: 'doPrecyzji',
	// Promise
	then: 'wtedy',
	resolve: 'rozwiąż',
	reject: 'odrzuć',
	all: 'wszystkie',
	race: 'wyścig',
	allSettled: 'wszystkieUstalone',
	// JSON
	stringify: 'doTekstuJSON',
	parse: 'sparsuj',
	// Date
	now: 'teraz',
	getTime: 'pobierzCzas',
	toISOString: 'naISO',
	// Math
	floor: 'podłoga',
	ceil: 'sufit',
	round: 'zaokrąglij',
	abs: 'wartośćBezwzględna',
	min: 'minimum',
	max: 'maksimum',
	random: 'losowa',
	pow: 'potęga',
	sqrt: 'pierwiastek',
	// Object / Reflect / Function
	freeze: 'zamroź',
	assign: 'przypisz',
	create: 'utwórz',
	call: 'wywołaj',
	apply: 'zastosuj',
	bind: 'powiąż',
	// Error / common fields
	message: 'wiadomość',
	stack: 'stos',
	name: 'nazwa',
};

// EN: The catalogue, grouped for documentation and the `słownik` command.
// PL: Katalog, pogrupowany dla dokumentacji i komendy `słownik`.
export const LEXICON: readonly LexiconGroup[] = [
	new LexiconGroup('Słowa kluczowe (keywords)', KEYWORDS),
	new LexiconGroup('Słowa kluczowe TypeScript', TS_KEYWORDS),
	new LexiconGroup('Typy proste (primitive types)', PRIMITIVE_TYPES),
	new LexiconGroup('Typy narzędziowe (utility types)', UTILITY_TYPES),
	new LexiconGroup('Obiekty globalne (globals)', GLOBALS),
	new LexiconGroup('Funkcje globalne (global functions)', GLOBAL_FUNCTIONS),
	new LexiconGroup('Metody i pola (members)', MEMBERS),
];

// EN: Flatten every group into one English -> Polish map.
// PL: Spłaszcza każdą grupę do jednej mapy angielsko-polskiej.
function buildEnglishToPolish(): Map<string, string> {
	const map = new Map<string, string>();

	for(const group of LEXICON) {
		for(const [english, polish] of Object.entries(group.entries)) {
			if(map.has(english)) {
				throw new Error(`Duplicate English key in lexicon: '${english}' (group: ${group.title})`);
			}

			map.set(english, polish);
		}
	}

	return map;
}

// EN: Invert the map, guarding against ambiguous reverse translations. If two
// distinct English words share a Polish translation, Polish -> English can no
// longer be deterministic, so we fail loudly at load time.
// PL: Odwraca mapę, chroniąc przed niejednoznacznym tłumaczeniem wstecznym.
// Jeśli dwa różne angielskie słowa mają to samo polskie tłumaczenie, kierunek
// polski -> angielski przestaje być deterministyczny, więc zgłaszamy błąd już
// przy ładowaniu.
function buildPolishToEnglish(englishToPolish: Map<string, string>): Map<string, string> {
	const map = new Map<string, string>();

	for(const [english, polish] of englishToPolish.entries()) {
		const existing = map.get(polish);

		if(existing !== undefined && existing !== english) {
			throw new Error(`Ambiguous Polish token '${polish}' maps to both '${existing}' and '${english}'.`);
		}

		map.set(polish, english);
	}

	return map;
}

export const ENGLISH_TO_POLISH: ReadonlyMap<string, string> = buildEnglishToPolish();
export const POLISH_TO_ENGLISH: ReadonlyMap<string, string> = buildPolishToEnglish(ENGLISH_TO_POLISH as Map<string, string>);

// EN: Total number of translated tokens, handy for the CLI banner.
// PL: Łączna liczba przetłumaczonych tokenów, przydatna w nagłówku CLI.
export const LEXICON_SIZE = ENGLISH_TO_POLISH.size;
